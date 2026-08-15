'use client';

import { Globe, ExternalLink, Edit, IdCard, Loader2, ShieldCheck, Plus, Trash2, Copy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, listSites, createSite, deleteSite, verifyDns, getVerificationRecords } from '@/generated/wokil-api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, siteHref } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem
} from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Alert, 
  AlertDescription, 
  AlertTitle 
} from "@/components/ui/alert";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { VerificationRecord } from '@/types/site';
import { useDeployStream } from '@/hooks/useDeployStream';
import { DeployProgressModal } from '@/components/deploy/DeployProgressModal';

// Verification is throttled server-side to one attempt per domain per minute
// (it queries the zone's authoritative nameservers, and retrying sooner can't
// return a different answer).
class VerifyRateLimitError extends Error {
  readonly retryAfterSeconds: number;

  constructor(retryAfterSeconds: number, serverMessage?: string) {
    super(serverMessage || `Please wait ${retryAfterSeconds} seconds before verifying again.`);
    this.name = 'VerifyRateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export default function Sites() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSite, setNewSite] = useState<{ domain: string, status: 'requested' | 'link_pending' }>({
    domain: '',
    status: 'requested'
  });
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [siteTypeToDelete, setSiteTypeToDelete] = useState<'subdomain' | 'external' | null>(null);
  const [siteToVerify, setSiteToVerify] = useState<string | null>(null);
  const [verificationRecords, setVerificationRecords] = useState<VerificationRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [verifyCooldown, setVerifyCooldown] = useState<{ domain: string; until: number } | null>(null);
  // Set once VerifyDNS returns 200. That response only means verification
  // passed - Deploy() (R2 upload, custom hostname, worker route) then runs
  // async on the backend, so the sites/profile caches must stay stale until
  // the deploy stream reports it actually finished.
  const [activeDeployDomain, setActiveDeployDomain] = useState<string | null>(null);
  // useDeployStream clears activeDeployDomain the instant it hands back the
  // terminal state, which is exactly when the modal needs the domain to
  // build the "View Site" link for the success screen. A ref survives that
  // transition without forcing an extra render on every deploy start/stop.
  const lastDeployDomainRef = useRef<string | null>(null);
  // Drives the countdown label; only ticks while a cooldown is actually active.
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!verifyCooldown || verifyCooldown.until <= Date.now()) return;
    // Self-stopping: the guard above only runs when this effect
    // (re)mounts, so without clearing here on expiry the interval would
    // keep ticking every 500ms for the rest of the component's lifetime,
    // not just for the cooldown's duration.
    const id = setInterval(() => {
      const now = Date.now();
      setNowMs(now);
      if (now >= verifyCooldown.until) clearInterval(id);
    }, 500);
    return () => clearInterval(id);
  }, [verifyCooldown]);

  const cooldownSeconds =
    verifyCooldown && verifyCooldown.domain === siteToVerify
      ? Math.max(0, Math.ceil((verifyCooldown.until - nowMs) / 1000))
      : 0;

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => (await getProfile({ throwOnError: true })).data,
  });

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: async () => (await listSites({ throwOnError: true })).data,
  });

  const createSiteMutation = useMutation({
    mutationFn: (body: { domain: string; status: 'requested' | 'link_pending' }) =>
      createSite({ body, throwOnError: true }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsCreateDialogOpen(false);
      setNewSite({ domain: '', status: 'requested' });
      toast.success("Site created successfully!");
      // An onboarded domain is unusable until its DNS records are added, so go
      // straight to them rather than making the user find the new card and
      // click "Verify Domain" as a separate step.
      if (variables.status === 'link_pending') {
        handleFetchRecords(variables.domain);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create site");
    }
  });

  const deleteSiteMutation = useMutation({
    mutationFn: (domain: string) => deleteSite({ path: { domain }, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      // siteUrl/deploymentURL/isPublished are derived from the sites table, so
      // deleting a site changes the profile response too — without this the
      // dashboard keeps showing the deleted site's URL from cache.
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSiteToDelete(null);
      toast.success("Site deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete site");
    }
  });

  const verifyMutation = useMutation({
    // Not `throwOnError: true`: that discards the response, and a 429 carries
    // its cooldown in the Retry-After header. The API's error bodies are
    // text/plain (http.Error), so `error` is a plain string here — reading
    // `error.response.data.message` (the old axios shape) always came back
    // undefined, which is why every failure showed the same generic message.
    mutationFn: async (domain: string) => {
      const { error, response } = await verifyDns({ path: { domain } });
      if (!response) {
        throw new Error("Could not reach the server. Check your connection and try again.");
      }
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get('Retry-After')) || 60;
        throw new VerifyRateLimitError(retryAfter, typeof error === 'string' ? error : undefined);
      }
      if (!response.ok) {
        throw new Error(
          typeof error === 'string' && error
            ? error
            : "Verification failed. Please check your DNS records."
        );
      }
    },
    onSuccess: (_data, domain) => {
      setSiteToVerify(null);
      // No toast here: DeployProgressModal takes over the instant
      // activeDeployDomain is set below, showing its own progress state.
      lastDeployDomainRef.current = domain;
      setActiveDeployDomain(domain);
    },
    onError: (error: Error, domain: string) => {
      if (error instanceof VerifyRateLimitError) {
        // Mirror the server's window client-side so the button stays disabled
        // instead of re-enabling into a guaranteed second 429.
        setVerifyCooldown({ domain, until: Date.now() + error.retryAfterSeconds * 1000 });
      }
      toast.error(error.message);
    }
  });

  // Same progress modal the dashboard shows for a profile publish - a deploy
  // triggered from here shouldn't look like a different, lesser-featured
  // feature just because it started on this page.
  const deployStream = useDeployStream({
    active: activeDeployDomain !== null,
    onDeactivate: () => setActiveDeployDomain(null),
    // Without this, useDeployStream trusts ANY 400 from the initial stream
    // request as "already succeeded" (its default when no confirmation is
    // supplied) - an auth hiccup or backend restart would show "Deployment
    // complete!" with a View Site button for a domain that never actually
    // deployed. Check the sites list for this exact domain instead of
    // assuming, matching what the dashboard does via the profile.
    confirmAlreadyDone: async () => {
      const domain = lastDeployDomainRef.current;
      if (!domain) return false;
      const { data } = await listSites({ throwOnError: true });
      return !!data?.some((site) => site.domain === domain && site.status === 'deployed');
    },
    onDone: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      // Deploying can change which site the profile derives its URL from.
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const handleFetchRecords = async (domain: string) => {
    setIsLoadingRecords(true);
    try {
      const { data } = await getVerificationRecords({ path: { domain }, throwOnError: true });
      // Map API response to UI record structure
      const records: VerificationRecord[] = [
        {
          type: 'TXT',
          name: '@ / ' + domain,
          value: data.txt_record
        },
        {
          type: 'CNAME',
          name: data.cname_host,
          value: data.cname_value
        }
      ];
      setVerificationRecords(records);
      setSiteToVerify(domain);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch verification records");
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSite.domain) {
        toast.error("Please enter a domain");
        return;
    }
    createSiteMutation.mutate(newSite);
  };

  const isLoading = profileLoading || sitesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getPublicUrl = (domain: string) => {
    if (!domain) return '';
    return siteHref(domain);
  };

  const statusConfig: Record<string, { label: string; dot: string; className: string }> = {
    // Live is the only genuinely "good" state, so it gets --success; the two
    // in-flight states are informational and ride the neutral/gold chips.
    deployed: { label: 'Live', dot: 'bg-success', className: 'bg-success/10 text-success border-success/30' },
    requested: { label: 'Requested', dot: 'bg-muted-foreground', className: 'bg-surface text-muted-foreground border-border' },
    link_pending: { label: 'Link Pending', dot: 'bg-accent', className: 'bg-accent/10 text-accent-foreground border-accent/30' },
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status];
    if (!config) return null;
    return (
      <Badge
        variant="outline"
        className={cn(
          'gap-1.5 py-1 px-2.5 label-caps text-[10px] rounded-full',
          config.className,
        )}
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col gap-10">

          <PageHeader
            icon={<Globe />}
            title="Sites Management"
            description="Manage and monitor your professional published websites."
          />

          {(!sites || sites.length === 0) ? (
            <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center shadow-none">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6 rounded-full">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">No sites found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                You haven't published any professional profile sites yet. Complete your profile to get started.
              </p>
              <Button onClick={() => router.push('/profile-builder')} className="gap-2">
                <Edit className="w-4 h-4" />
                Finish Your Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {sites.map((site) => {
                const isDeletingThisSite = deleteSiteMutation.isPending && deleteSiteMutation.variables === site.domain;
                return (
                <Card key={site.reference} className="border-none shadow-premium bg-card overflow-hidden group rounded-xl relative">
                  {isDeletingThisSite && (
                    <div className="absolute inset-0 z-10 bg-card/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 animate-in fade-in duration-200">
                      <Loader2 className="w-7 h-7 animate-spin text-destructive" />
                      <span className="text-xs font-semibold text-muted-foreground">Deleting site...</span>
                    </div>
                  )}
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {/* Mock Site Preview Backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                      <div className="p-3 bg-card rounded-2xl shadow-xl transition-transform group-hover:scale-110 border border-primary/10">
                          <QRCode 
                            value={getPublicUrl(site.domain)} 
                            size={100}
                            className="w-24 h-24"
                          />
                      </div>
                    </div>
                    
                    {/* Status Overlay */}
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(site.status)}
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold mb-1 truncate max-w-[200px]">{site.domain}</h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                              <ShieldCheck className="w-3.5 h-3.5 text-primary/60" />
                              <span>{site.type === 'subdomain' ? 'Subdomain' : 'External Domain'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between gap-3">
                          <code className="text-[10px] font-bold text-muted-foreground tracking-wider truncate max-w-[180px]">
                              {site.domain}
                          </code>
                          <div className="flex items-center gap-1">
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 hover:bg-card shadow-sm"
                                  onClick={() => window.open(getPublicUrl(site.domain), '_blank')}
                              >
                                  <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => {
                                    setSiteToDelete(site.domain);
                                    setSiteTypeToDelete(site.type);
                                  }}
                              >
                                  <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                          {(site.status === 'link_pending' || site.status === 'requested') ? (
                            <Button 
                                variant="default" 
                                size="sm" 
                                className="gap-2 rounded-lg text-xs"
                                onClick={() => handleFetchRecords(site.domain)}
                                disabled={isLoadingRecords && siteToVerify === site.domain}
                            >
                                {isLoadingRecords && siteToVerify === site.domain ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                                Verify Domain
                            </Button>
                          ) : (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="gap-2 rounded-lg text-xs"
                                onClick={() => {
                                    sessionStorage.setItem('editingProfileSlug', profile?.slug || '');
                                    router.push('/profile-builder');
                                }}
                            >
                                <Edit className="w-3.5 h-3.5" />
                                Edit Page
                            </Button>
                          )}
                          <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 rounded-lg text-xs"
                              onClick={() => router.push('/business-cards')}
                          >
                              <IdCard className="w-3.5 h-3.5" />
                              Business Card
                          </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}

              {/* Add New Site Card */}
              <Card 
                className="border-2 border-dashed border-border/60 bg-muted/2 shadow-none overflow-hidden group rounded-xl hover:border-primary/30 hover:bg-muted/5 transition-all flex flex-col items-center justify-center p-8 gap-6 min-h-[440px] cursor-pointer"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110 shadow-sm border border-primary/5">
                        <Plus className="w-10 h-10 text-primary/30 group-hover:text-primary transition-colors" />
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed group-hover:text-foreground transition-colors">
                        Request a new domain or connect your own personal domain to your professional site.
                    </p>
                </div>
              </Card>
            </div>
          )}


        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Site</DialogTitle>
            <DialogDescription>
              Enter the domain details for your new site.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSite}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain Name</Label>
                <Input
                  id="domain"
                  placeholder="e.g. portfolio.yourname.com"
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                />
              </div>
              <div className="grid gap-4 py-2">
                <RadioGroup 
                    value={newSite.status} 
                    onValueChange={(val: 'requested' | 'link_pending') => setNewSite({ ...newSite, status: val })}
                    className="grid grid-cols-1 gap-4"
                >
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="requested" id="requested" className="border-primary text-primary" />
                    <Label htmlFor="requested" className="font-medium cursor-pointer">Request a new domain</Label>
                  </div>
                  <div className="flex items-center space-x-3 space-y-0">
                    <RadioGroupItem value="link_pending" id="link_pending" className="border-primary text-primary" />
                    <Label htmlFor="link_pending" className="font-medium cursor-pointer">Onboard your own domain</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={createSiteMutation.isPending}>
                {createSiteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Site
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={siteToDelete !== null} onOpenChange={(open) => {
        if (!open) {
          setSiteToDelete(null);
          setSiteTypeToDelete(null);
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your site management record for this domain.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {siteTypeToDelete === 'subdomain' && (
            <Alert variant="accent">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">Important Note</AlertTitle>
              <AlertDescription className="text-xs text-muted-foreground">
                After deleting this subdomain, you'll need to go to the Profile Builder and refill the subdomain field to create a new one.
              </AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => siteToDelete && deleteSiteMutation.mutate(siteToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSiteMutation.isPending}
            >
              {deleteSiteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={siteToVerify !== null} onOpenChange={(open) => !open && setSiteToVerify(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Verify Domain: {siteToVerify}</DialogTitle>
            <DialogDescription>
              Add the following DNS records to your domain provider (Cloudflare, Namecheap, etc.) to verify and link your site.
            </DialogDescription>
          </DialogHeader>

          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-bold">Important</AlertTitle>
            <AlertDescription className="text-xs">
              DNS changes can take up to 24 hours to propagate, but usually happen within minutes.
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-4">
            {verificationRecords?.map((record, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-card font-mono text-[10px] uppercase">{record.type}</Badge>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Host / Name</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-card rounded-lg border border-border/50 text-[10px] font-mono break-all">
                        {record.name}
                      </code>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(record.name)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[10px] uppercase text-muted-foreground font-bold">Value / Points to</Label>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 p-2 bg-card rounded-lg border border-border/50 text-[10px] font-mono break-all">
                        {record.value}
                      </code>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(record.value)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSiteToVerify(null)}>
              Configure Later
            </Button>
            <Button 
                onClick={() => siteToVerify && verifyMutation.mutate(siteToVerify)}
                disabled={verifyMutation.isPending || cooldownSeconds > 0}
            >
              {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {cooldownSeconds > 0 ? `Try again in ${cooldownSeconds}s` : 'Verify & Link Site'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <DeployProgressModal
        phase={deployStream.phase}
        steps={deployStream.steps}
        message={deployStream.message}
        onClose={deployStream.reset}
        siteUrl={lastDeployDomainRef.current ? getPublicUrl(lastDeployDomainRef.current) : undefined}
      />
    </div>
  );
}
