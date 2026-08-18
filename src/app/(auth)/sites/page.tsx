'use client';

import { Globe, ExternalLink, Edit, IdCard, Loader2, ShieldCheck, Plus, Trash2, Copy, AlertCircle, Mail, ShoppingCart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, listSites, createSite, deleteSite, verifyDns, getVerificationRecords, createVerificationRecords, createSiteZone, listDomainOrders } from '@/generated/wokil-api';
import type { VerificationRecords } from '@/generated/wokil-api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, siteHref, normalizeDomain, isValidDomain } from '@/lib/utils';
import { apiErrorMessage, copyToClipboard, VerifyRateLimitError, rateLimitError } from '@/lib/client-ui';
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
import { useDeployStream } from '@/hooks/useDeployStream';
import { DeployProgressModal } from '@/components/deploy/DeployProgressModal';

// The two rows the cname dialog renders. A view shape, not an API one — the
// wire type is generated, and the hand-written duplicates that used to shadow
// it in src/types/site.ts had already drifted (no `failed` status, no
// `dns_mode`), so they are gone.
type VerificationRecord = {
  type: 'TXT' | 'CNAME';
  name: string;
  value: string;
};

// The whole card is the hit target, but it stays a real radio underneath —
// arrow-key navigation and screen readers keep working, which a div+onClick
// would throw away. Radix puts data-state on the item; `has-*` reads it.
const dnsModeCardClass =
  'flex flex-col gap-2 items-start cursor-pointer rounded-xl border border-border/60 bg-card p-4 ' +
  'transition-colors hover:border-accent/50 ' +
  'has-[[data-state=checked]]:border-accent has-[[data-state=checked]]:bg-accent/5 ' +
  'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2';

export default function Sites() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSite, setNewSite] = useState<{ domain: string, dns_mode: 'cname' | 'nameserver' }>({
    domain: '',
    dns_mode: 'nameserver'
  });
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);
  const [siteTypeToDelete, setSiteTypeToDelete] = useState<'subdomain' | 'external' | null>(null);
  // Set only after a delete has been refused because the domain is still
  // delegated to us; holds the backend's explanation of what breaks.
  const [deleteConfirmMessage, setDeleteConfirmMessage] = useState<string | null>(null);
  // The domain the verification dialog is open for, with the mode read off the
  // site row rather than inferred from what came back — `nameservers.length > 0`
  // could not tell "cname site" apart from "nameserver site with no zone yet".
  const [verifyTarget, setVerifyTarget] = useState<{ domain: string; dns_mode: 'cname' | 'nameserver' } | null>(null);
  // Mirrors verifyTarget for the async read in openVerifyDialog: two rapid
  // opens race, and a stale response must not paint its records into a dialog
  // now headed for a different domain.
  const verifyTargetRef = useRef<{ domain: string; dns_mode: 'cname' | 'nameserver' } | null>(null);
  // null = step 2 (nothing provisioned yet). Non-null = step 3, with exactly
  // one of the two lists populated depending on dns_mode.
  const [records, setRecords] = useState<{ nameservers: string[]; rows: VerificationRecord[] } | null>(null);
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

  const siteToVerify = verifyTarget?.domain ?? null;
  const isNameserverMode = verifyTarget?.dns_mode === 'nameserver';

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

  // A domain someone paid for and then closed the tab on has to be findable
  // again, or it becomes a support ticket. Anything not yet registered is
  // still in flight and gets a row below.
  const { data: orders } = useQuery({
    queryKey: ['domain-orders'],
    queryFn: async () => (await listDomainOrders({ throwOnError: true })).data,
  });
  const openOrders = orders?.orders.filter((order) => order.status !== 'registered') ?? [];

  const createSiteMutation = useMutation({
    mutationFn: (body: { domain: string; status: 'link_pending'; dns_mode: 'cname' | 'nameserver' }) =>
      createSite({ body, throwOnError: true }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsCreateDialogOpen(false);
      setNewSite({ domain: '', dns_mode: 'nameserver' });
      toast.success("Site created successfully!");
      // Straight on to step 2 rather than making the user find the new card —
      // but this only opens the dialog and reads. Nothing is provisioned until
      // they press the button there.
      openVerifyDialog({ domain: variables.domain, dns_mode: variables.dns_mode });
    },
    onError: (error: unknown) => {
      // Carries the "nameserver mode is not enabled on this deployment" 400,
      // which is the only signal the user gets that the mode is unavailable.
      toast.error(apiErrorMessage(error, "Failed to create site"));
    }
  });

  const deleteSiteMutation = useMutation({
    // `confirm` is sent only on a retry. Sending it unconditionally would
    // silently defeat the backend's guard against black-holing a domain whose
    // delegation is still live.
    mutationFn: ({ domain, confirm }: { domain: string; confirm?: boolean }) =>
      deleteSite({ path: { domain }, query: confirm ? { confirm: true } : undefined, throwOnError: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      // siteUrl/deploymentURL/isPublished are derived from the sites table, so
      // deleting a site changes the profile response too — without this the
      // dashboard keeps showing the deleted site's URL from cache.
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSiteToDelete(null);
      setDeleteConfirmMessage(null);
      toast.success("Site deleted successfully");
    },
    onError: (error: unknown) => {
      const message = apiErrorMessage(error, "Failed to delete site");
      // ErrZoneDeleteNeedsConfirm — keep the dialog open and show what the
      // backend says breaks, rather than a toast the user dismisses blind.
      if (message.includes('confirm=true')) {
        setDeleteConfirmMessage(message);
        return;
      }
      toast.error(message);
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
      // Verification is throttled server-side to one attempt per domain per
      // minute — it queries the zone's authoritative nameservers, and retrying
      // sooner cannot return a different answer.
      if (response.status === 429) {
        throw rateLimitError(response, error);
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
      closeVerifyDialog();
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

  // applyRecords maps a verification response onto whichever of the two dialog
  // shapes it is. Shared by the read below and the generate step, so both land
  // on the same state.
  const applyRecords = (data: { mode: 'nameserver'; nameservers: Array<string> } | VerificationRecords) => {
    if (data.mode === 'nameserver') {
      setRecords({ nameservers: data.nameservers ?? [], rows: [] });
      return;
    }
    setRecords({
      nameservers: [],
      rows: [
        { type: 'TXT', name: '@ / ' + data.cname_host, value: data.txt_record },
        { type: 'CNAME', name: data.cname_host, value: data.cname_value },
      ],
    });
  };

  // Step 2 of onboarding, and the only place the dialog provisions anything:
  // the zone in nameserver mode, the verification token in cname mode. Both are
  // idempotent server-side, so a retry after a timeout is safe.
  const generateMutation = useMutation({
    mutationFn: async ({ domain, dns_mode }: { domain: string; dns_mode: 'cname' | 'nameserver' }) => {
      if (dns_mode === 'nameserver') {
        const { data } = await createSiteZone({ path: { domain }, throwOnError: true });
        // A 200 with no nameservers is reachable (a row that recorded a zone id
        // without them). Silently applying it would re-render the identical
        // "Get nameservers" button, and every retry burns the zone-create quota
        // on the way to a 429 — so fail loudly instead.
        if (!data.nameservers?.length) {
          throw new Error("The zone was created but no nameservers came back. Contact support before retrying.");
        }
        return { mode: 'nameserver' as const, nameservers: data.nameservers };
      }
      return (await createVerificationRecords({ path: { domain }, throwOnError: true })).data;
    },
    onSuccess: (data) => {
      applyRecords(data);
      // Creating the zone drops the site back to link_pending server-side.
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
    onError: (error: unknown) => {
      toast.error(apiErrorMessage(error, "Couldn't get your DNS settings. Please try again."));
    },
  });

  const closeVerifyDialog = () => {
    setVerifyTarget(null);
    verifyTargetRef.current = null;
    setRecords(null);
  };

  // Opens the verification dialog. A read and nothing else: a 404 just means
  // this domain is still on step 2, which the dialog renders as a button the
  // user has to press. Adding a domain and closing the dialog now provisions
  // nothing — it used to create a Cloudflare zone on the way past.
  const openVerifyDialog = async (site: { domain: string; dns_mode: 'cname' | 'nameserver' }) => {
    setVerifyTarget(site);
    verifyTargetRef.current = site;
    setRecords(null);
    setIsLoadingRecords(true);
    try {
      const { data, error, response } = await getVerificationRecords({ path: { domain: site.domain } });
      // A second open may have overtaken this one; painting A's TXT token into
      // a dialog headed "Verify B" would hand the user a token that can never
      // verify B.
      if (verifyTargetRef.current?.domain !== site.domain) return;
      if (data) {
        applyRecords(data);
      } else if (!response) {
        // fetch rejected (network drop / abort): no status to inspect, and
        // staying silent would render step 2 for a domain whose records exist.
        toast.error('Could not reach the server. Check your connection and try again.');
      } else if (response.status !== 404) {
        toast.error(apiErrorMessage(error, 'Failed to fetch verification records'));
      }
    } finally {
      // Same staleness guard: an overtaken read must not clear the spinner the
      // newer one is still showing.
      if (verifyTargetRef.current?.domain === site.domain) setIsLoadingRecords(false);
    }
  };

  const handleCreateSite = (e: React.FormEvent) => {
    e.preventDefault();
    // Normalize on submit rather than on change — rewriting the value mid-typing
    // fights the caret.
    const domain = normalizeDomain(newSite.domain);
    if (!isValidDomain(domain)) {
      toast.error("Enter a domain like example.com");
      return;
    }
    createSiteMutation.mutate({ ...newSite, domain, status: 'link_pending' });
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
    // Without this the card renders an empty status corner — the generated
    // Site['status'] has always included `failed`.
    failed: { label: 'Failed', dot: 'bg-destructive', className: 'bg-destructive/10 text-destructive border-destructive/30' },
  };

  // What an in-flight domain purchase is waiting on, in the customer's terms.
  const orderStatusCopy: Record<string, string> = {
    pending_payment: 'Waiting for your payment',
    paid: 'Payment confirmed — registering',
    registering: 'Registering with the registrar',
    failed: 'Registration failed',
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

          {openOrders.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Domain purchases in progress</h2>
              {openOrders.map((order) => (
                <Card
                  key={order.id}
                  className="border border-border/60 shadow-none bg-card rounded-xl"
                >
                  <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        {order.status === 'failed'
                          ? <AlertCircle className="w-4 h-4 text-destructive" />
                          : <Clock className="w-4 h-4 text-accent-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{order.domain}</p>
                        <p className="text-xs text-muted-foreground">
                          {orderStatusCopy[order.status] ?? order.status}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 shrink-0"
                      onClick={() => router.push(`/sites/buy?order=${order.id}`)}
                    >
                      {order.status === 'pending_payment' ? 'Pay for this domain' : 'View order'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {(!sites || sites.length === 0) ? (
            <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center shadow-none">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6 rounded-full">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">No sites found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                You haven&apos;t published any professional profile sites yet. Finish your profile, then put it on a
                domain — buy a new one through us, or connect one you already own.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button onClick={() => router.push('/profile-builder')} className="gap-2">
                  <Edit className="w-4 h-4" />
                  Finish Your Profile
                </Button>
                <Button variant="outline" onClick={() => router.push('/sites/buy')} className="gap-2">
                  <ShoppingCart className="w-4 h-4" />
                  Buy a domain
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Connect a domain you own
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {sites.map((site) => {
                const isDeletingThisSite = deleteSiteMutation.isPending && deleteSiteMutation.variables?.domain === site.domain;
                // Nothing on an unlinked domain works yet: it resolves nowhere
                // and owns no Cloudflare zone, so every action but verifying
                // and deleting is a dead end until the deploy completes.
                const isLive = site.status === 'deployed';
                const canVerify = site.status === 'link_pending' || site.status === 'requested' || site.status === 'failed';
                // Email routing needs us to hold the zone, which only nameserver
                // mode does — without this a CNAME domain offered an Email button
                // that failed after navigation.
                const canEmail = site.type === 'external' && site.dns_mode === 'nameserver' && isLive;
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
                                  disabled={!isLive}
                                  title={isLive ? 'Open site' : 'Available once the domain is verified'}
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

                      {/* Verify and Edit Page are mutually exclusive — one
                          needs a not-yet-linked site, the other a live one — so
                          the first cell is always filled and never orphans. */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                          {canVerify ? (
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2 rounded-lg text-xs"
                                onClick={() => openVerifyDialog({ domain: site.domain, dns_mode: site.dns_mode })}
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
                          {/* Third of three, so it takes the whole second row
                              rather than sitting half-width beside nothing. */}
                          {canEmail && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="col-span-2 gap-2 rounded-lg text-xs"
                                onClick={() => router.push(`/sites/${encodeURIComponent(site.domain)}/email`)}
                            >
                                <Mail className="w-3.5 h-3.5" />
                                Email
                            </Button>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })}

              {/* Add New Site Card */}
              {/* Two genuinely different jobs, so two buttons: buying a name we
                  register for you, and pointing a name you already own at us. */}
              <Card className="border-2 border-dashed border-border/60 bg-muted/2 shadow-none overflow-hidden rounded-xl hover:border-primary/30 hover:bg-muted/5 transition-all flex flex-col items-center justify-center p-8 gap-6 min-h-[440px]">
                <div className="w-20 h-20 rounded-xl bg-primary/5 flex items-center justify-center shadow-sm border border-primary/5">
                    <Plus className="w-10 h-10 text-primary/30" />
                </div>

                <div className="flex flex-col gap-3 w-full max-w-[240px]">
                    <Button className="gap-2 w-full" onClick={() => router.push('/sites/buy')}>
                        <ShoppingCart className="w-4 h-4" />
                        Buy a new domain
                    </Button>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        Search for a name and we register it for you.
                    </p>

                    <Button variant="outline" className="gap-2 w-full mt-2" onClick={() => setIsCreateDialogOpen(true)}>
                        <Globe className="w-4 h-4" />
                        Connect a domain you own
                    </Button>
                    <p className="text-xs text-muted-foreground text-center leading-relaxed">
                        Already have one? Point it at your site.
                    </p>
                </div>
              </Card>
            </div>
          )}


        </div>
      </main>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>Add a domain</DialogTitle>
            <DialogDescription>
              Connect a domain you own to your professional site.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSite}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Domain name</Label>
                <Input
                  id="domain"
                  placeholder="example.com"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  value={newSite.domain}
                  onChange={(e) => setNewSite({ ...newSite, domain: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  Just the domain — no <code className="font-mono">https://</code> or trailing path.
                </p>
              </div>

              <div className="grid gap-3">
                <Label>How should your domain point at us?</Label>
                <RadioGroup
                  value={newSite.dns_mode}
                  onValueChange={(val: 'cname' | 'nameserver') => setNewSite({ ...newSite, dns_mode: val })}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                >
                  <Label htmlFor="dns_nameserver" className={dnsModeCardClass}>
                    <span className="flex items-center gap-2">
                      <RadioGroupItem value="nameserver" id="dns_nameserver" />
                      <span className="font-semibold text-sm">Let us manage your DNS</span>
                    </span>
                    <Badge variant="outline" className="w-fit text-[10px] bg-accent/10 text-accent-foreground border-accent/30">
                      Recommended
                    </Badge>
                    <span className="text-xs font-normal text-muted-foreground leading-snug">
                      You&apos;ll paste two nameservers at your registrar. Also unlocks email forwarding
                      on your domain.
                    </span>
                  </Label>
                  <Label htmlFor="dns_cname" className={dnsModeCardClass}>
                    <span className="flex items-center gap-2">
                      <RadioGroupItem value="cname" id="dns_cname" />
                      <span className="font-semibold text-sm">Keep your current DNS provider</span>
                    </span>
                    <span className="text-xs font-normal text-muted-foreground leading-snug">
                      You&apos;ll add one CNAME record. Website only — no email forwarding.
                    </span>
                  </Label>
                </RadioGroup>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createSiteMutation.isPending || !isValidDomain(normalizeDomain(newSite.domain))}>
                {createSiteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add domain
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={siteToDelete !== null} onOpenChange={(open) => {
        if (!open) {
          setSiteToDelete(null);
          setSiteTypeToDelete(null);
          setDeleteConfirmMessage(null);
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
                After deleting this subdomain, you&apos;ll need to go to the Profile Builder and refill the subdomain field to create a new one.
              </AlertDescription>
            </Alert>
          )}
          {deleteConfirmMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">This domain is still delegated to us</AlertTitle>
              <AlertDescription className="text-xs">{deleteConfirmMessage}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              // Radix closes the dialog on action click; the first attempt may
              // need to come back and ask for confirmation, so keep it open.
              onClick={(e) => {
                e.preventDefault();
                if (siteToDelete) deleteSiteMutation.mutate({ domain: siteToDelete, confirm: deleteConfirmMessage !== null });
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteSiteMutation.isPending}
            >
              {deleteSiteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {deleteConfirmMessage ? 'Delete anyway' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={verifyTarget !== null} onOpenChange={(open) => { if (!open) closeVerifyDialog(); }}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isNameserverMode ? `Point ${siteToVerify} at us` : `Verify ${siteToVerify}`}
            </DialogTitle>
            <DialogDescription>
              {isNameserverMode
                ? 'The delegation itself proves you own the domain — there is nothing else to add.'
                : 'Add these two records at your DNS provider to verify and link your site.'}
            </DialogDescription>
          </DialogHeader>

          {isLoadingRecords ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : !records ? (
            /* Step 2. Nothing has been provisioned for this domain yet, and
               nothing will be until this button is pressed — which is the whole
               point of the ticket: opening this dialog is free. */
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <p className="text-xs text-muted-foreground max-w-sm">
                {isNameserverMode
                  ? 'Next we create a DNS zone for this domain and give you the two nameservers to set at your registrar.'
                  : 'Next we generate the two DNS records that prove you own this domain.'}
              </p>
              <Button
                onClick={() => verifyTarget && generateMutation.mutate(verifyTarget)}
                disabled={generateMutation.isPending}
              >
                {generateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isNameserverMode ? 'Get nameservers' : 'Get DNS records'}
              </Button>
            </div>
          ) : (
          <>
          <ol className="flex flex-col gap-2 text-xs text-muted-foreground list-decimal pl-4 marker:text-muted-foreground">
            {isNameserverMode ? (
              <>
                <li>Sign in to your <strong className="font-semibold text-foreground">registrar</strong> — where you bought the domain (GoDaddy, Namecheap, …).</li>
                <li>Open its Nameservers or Custom DNS settings for {siteToVerify}.</li>
                <li><strong className="font-semibold text-foreground">Replace all</strong> the existing nameservers with the two below.</li>
                <li>Save, then click Verify &amp; Link Site.</li>
              </>
            ) : (
              <>
                <li>Open the record editor at your <strong className="font-semibold text-foreground">DNS provider</strong> (Cloudflare, Namecheap, …).</li>
                <li>Add both records below exactly as shown.</li>
                <li>Save, then click Verify &amp; Link Site.</li>
              </>
            )}
          </ol>

          <Alert className="bg-primary/5 border-primary/20">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle className="text-sm font-bold">This takes a moment to take effect</AlertTitle>
            <AlertDescription className="text-xs">
              {isNameserverMode
                ? 'Nameserver changes usually go live in a few minutes, but can take up to 24 hours.'
                : 'DNS changes usually propagate within minutes, but can take up to 24 hours.'}
            </AlertDescription>
          </Alert>

          <div className="space-y-4 py-4">
            {records.nameservers.map((ns) => (
              <div key={ns} className="flex items-center gap-2">
                <code className="flex-1 p-2.5 bg-muted/30 rounded-lg border border-border/50 text-xs font-mono break-all">
                  {ns}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" aria-label={`Copy ${ns}`} onClick={() => copyToClipboard(ns)}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {records.rows.map((record, index) => (
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
          </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeVerifyDialog}>
              Configure Later
            </Button>
            <Button
                onClick={() => siteToVerify && verifyMutation.mutate(siteToVerify)}
                // The backend's 429 + Retry-After is the throttle, and the
                // cooldown above mirrors it — so let the user click and get a
                // real answer instead of pre-gating on a zone read.
                // Still gated on step 2 having run: there is nothing published
                // to verify against until then.
                disabled={!records || verifyMutation.isPending || cooldownSeconds > 0}
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
