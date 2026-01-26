import { Globe, ExternalLink, Edit, IdCard, Loader2, CheckCircle2, ShieldCheck, Plus, Clock, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profile as profileApi, site as siteApi } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
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
import { toast } from "sonner";

export default function Sites() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSite, setNewSite] = useState<{ domain: string, status: 'requested' | 'link_pending' }>({
    domain: '',
    status: 'requested'
  });
  const [siteToDelete, setSiteToDelete] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  const { data: sites, isLoading: sitesLoading } = useQuery({
    queryKey: ['sites'],
    queryFn: siteApi.list,
  });

  const createSiteMutation = useMutation({
    mutationFn: siteApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setIsCreateDialogOpen(false);
      setNewSite({ domain: '', status: 'requested' });
      toast.success("Site created successfully!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create site");
    }
  });

  const deleteSiteMutation = useMutation({
    mutationFn: siteApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      setSiteToDelete(null);
      toast.success("Site deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete site");
    }
  });

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
    if (domain.startsWith('http://') || domain.startsWith('https://')) {
      return domain;
    }
    return `https://${domain}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return (
          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-100 flex items-center gap-1 py-1 px-3">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Live</span>
          </Badge>
        );
      case 'requested':
        return (
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 flex items-center gap-1 py-1 px-3">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Requested</span>
          </Badge>
        );
      case 'link_pending':
        return (
          <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-100 flex items-center gap-1 py-1 px-3">
            <LinkIcon className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Link Pending</span>
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="flex flex-col gap-10">
          
          <PageHeader 
            icon={<Globe />}
            title="Sites Management"
            description="Manage and monitor your professional published websites."
          />

          {(!sites || sites.length === 0) ? (
            <div className="bg-white border-2 border-dashed border-border rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-muted flex items-center justify-center mx-auto mb-6 rounded-full">
                <Globe className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3">No sites found</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-8">
                You haven't published any professional profile sites yet. Complete your profile to get started.
              </p>
              <Button onClick={() => navigate('/profile-builder')} className="gap-2">
                <Edit className="w-4 h-4" />
                Finish Your Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
              {sites.map((site) => (
                <Card key={site.reference} className="border-none shadow-premium bg-white overflow-hidden group">
                  <div className="aspect-video bg-muted relative overflow-hidden">
                    {/* Mock Site Preview Backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                      <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl scale-75 border border-primary/10 transition-transform group-hover:scale-[0.8]">
                          <div className="flex flex-col items-center gap-4 text-center">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                  <span className="text-xl font-bold text-primary">
                                      {profile?.basicInformation.fullName.split(' ').map(n => n[0]).join('') || '?'}
                                  </span>
                              </div>
                              <div>
                                  <h4 className="font-bold text-sm">{profile?.basicInformation.fullName || 'Professional'}</h4>
                                  <p className="text-[10px] text-muted-foreground">{profile?.basicInformation.professionalTitle || 'Wokil Member'}</p>
                              </div>
                          </div>
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
                                  className="h-8 w-8 hover:bg-white shadow-sm"
                                  onClick={() => window.open(getPublicUrl(site.domain), '_blank')}
                              >
                                  <ExternalLink className="w-3.5 h-3.5" />
                              </Button>
                              {(site.type === 'external' && (site.status === 'link_pending' || site.status === 'requested')) && (
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 hover:bg-red-50 text-muted-foreground hover:text-destructive shadow-sm"
                                    onClick={() => setSiteToDelete(site.domain)}
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                          <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 rounded-lg text-xs"
                              onClick={() => {
                                  sessionStorage.setItem('editingProfileSlug', profile?.slug || '');
                                  navigate('/profile-builder');
                              }}
                          >
                              <Edit className="w-3.5 h-3.5" />
                              Edit Page
                          </Button>
                          <Button 
                              variant="outline" 
                              size="sm" 
                              className="gap-2 rounded-lg text-xs"
                              onClick={() => navigate('/cards')}
                          >
                              <IdCard className="w-3.5 h-3.5" />
                              Business Card
                          </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add New Site Card */}
              <Card 
                className="border-2 border-dashed border-border/60 bg-muted/2 shadow-none overflow-hidden group hover:border-primary/30 hover:bg-muted/5 transition-all flex flex-col items-center justify-center p-8 gap-6 min-h-[440px] cursor-pointer"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110 shadow-sm border border-primary/5">
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

      <AlertDialog open={siteToDelete !== null} onOpenChange={(open) => !open && setSiteToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your site management record for this domain.
            </AlertDialogDescription>
          </AlertDialogHeader>
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
    </div>
  );
}
