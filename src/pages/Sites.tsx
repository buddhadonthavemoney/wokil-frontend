import { Globe, ExternalLink, Edit, IdCard, Loader2, CheckCircle2, ShieldCheck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profile as profileApi } from '@/lib/api';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function Sites() {
  const navigate = useNavigate();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.get,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const getPublicUrl = () => {
    if (!profile?.siteUrl) return '';
    const url = profile.siteUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
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

          {!profile || (!profile.isPublished && !profile.siteUrl) ? (
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
              <Card className="border-none shadow-premium bg-white overflow-hidden group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {/* Mock Site Preview Backdrop */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 flex items-center justify-center">
                    <div className="p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl scale-75 border border-primary/10 transition-transform group-hover:scale-[0.8]">
                        <div className="flex flex-col items-center gap-4 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-xl font-bold text-primary">
                                    {profile.basicInformation.fullName.split(' ').map(n => n[0]).join('')}
                                </span>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">{profile.basicInformation.fullName}</h4>
                                <p className="text-[10px] text-muted-foreground">{profile.basicInformation.professionalTitle}</p>
                            </div>
                        </div>
                    </div>
                  </div>
                  
                  {/* Status Overlay */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/90 backdrop-blur shadow-sm border-none flex items-center gap-1 py-1 px-3">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">Live</span>
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-1">{profile.basicInformation.lawFirmName || "Professional Profile"}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                            <ShieldCheck className="w-3.5 h-3.5 text-primary/60" />
                            <span>Verified Domain</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between">
                        <code className="text-[10px] font-bold text-muted-foreground tracking-wider truncate max-w-[180px]">
                            {getPublicUrl().replace(/^https?:\/\//, '')}
                        </code>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 hover:bg-white shadow-sm"
                            onClick={() => window.open(getPublicUrl(), '_blank')}
                        >
                            <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 rounded-lg text-xs"
                            onClick={() => {
                                sessionStorage.setItem('editingProfileSlug', profile.slug || '');
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

              {/* Add New Site Card (Coming Soon) */}
              <Card className="border-2 border-dashed border-border/60 bg-muted/2 shadow-none overflow-hidden group hover:border-primary/30 transition-all flex flex-col items-center justify-center p-8 gap-6 min-h-[440px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-3xl bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all duration-500 group-hover:scale-110">
                        <Plus className="w-10 h-10 text-primary/30 group-hover:text-primary transition-colors" />
                    </div>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 text-[9px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full">
                        Coming Soon
                    </Badge>
                </div>

                <div className="text-center space-y-2">
                    <h3 className="font-bold text-foreground">Add Custom Domain</h3>
                    <p className="text-xs text-muted-foreground max-w-[200px] mx-auto leading-relaxed">
                        Connect your own personal domain (e.g. www.yourname.com) to your professional site.
                    </p>
                </div>

                <Button 
                    variant="outline" 
                    size="sm" 
                    disabled 
                    className="mt-2 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-white/50 border-dashed"
                >
                    Add Custom Site
                </Button>
              </Card>
            </div>
          )}


        </div>
      </main>
    </div>
  );
}
