import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LawyerProfile } from '@/types/lawyer';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Scale,
  Eye,
  Users,
  QrCode,
  Phone,
  ExternalLink,
  Copy,
  Edit,
  TrendingUp,
  Calendar,
  Globe,
  Plus,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profile as profileApi } from '@/lib/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { analytics } = useAnalytics(profile);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await profileApi.get();
        if (data && data.id) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Error handling if needed
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const getPublicUrl = () => {
    if (!profile) return '';
    if (profile.siteUrl) return profile.siteUrl;
    const identifier = profile.slug || profile.id;
    if (!identifier) return 'Profile identifier not set';
    return `${window.location.origin}/p/${identifier}`;
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getPublicUrl());
    toast({
      title: "URL Copied!",
      description: "The profile URL has been copied to your clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Scale className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="heading-section text-foreground mb-4">No Profile Yet</h1>
          <p className="text-muted-foreground mb-8">
            Create your professional lawyer profile to start attracting clients.
          </p>
          <Button onClick={() => navigate('/profile-builder')} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your Profile
          </Button>
        </div>
      </div>
    );
  }

  const maxViews = analytics ? Math.max(...analytics.viewsThisWeek) : 1;

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors">Wokil</h1>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Professional Dashboard</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/');
              }}
              className="text-muted-foreground hover:text-foreground hover:bg-muted font-medium"
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-10 max-w-6xl">
        <div className="flex flex-col gap-10">
          {/* Profile Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Your Profile</h2>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (profile?.slug) {
                      sessionStorage.setItem('editingProfileSlug', profile.slug);
                    }
                    navigate('/profile-builder');
                  }}
                  className="gap-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button
                  onClick={() => window.open(getPublicUrl(), '_blank')}
                  size="sm"
                  className="gap-2 rounded-lg font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                  disabled={(!profile.slug && !profile.id) || !profile.isPublished}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Site
                </Button>
              </div>
            </div>

            <Card className="border-none shadow-premium bg-white overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  {/* Avatar */}
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-2xl bg-primary/5 flex items-center justify-center p-1 border-2 border-primary/10 transition-colors group-hover:border-primary/20">
                      {profile.professionalProfile.profilePhoto ? (
                        <img
                          src={profile.professionalProfile.profilePhoto}
                          alt={profile.basicInformation.fullName}
                          className="w-full h-full rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-full h-full rounded-xl bg-primary/10 flex items-center justify-center">
                          <span className="text-3xl font-heading font-bold text-primary">
                            {profile.basicInformation.fullName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-heading font-bold text-foreground">
                        {profile.basicInformation.fullName}
                      </h3>
                      <p className="text-muted-foreground font-medium flex items-center gap-2">
                        {profile.basicInformation.professionalTitle}
                        {profile.basicInformation.lawFirmName && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>{profile.basicInformation.lawFirmName}</span>
                          </>
                        )}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm font-medium">
                        <Globe className="w-4 h-4 text-primary" />
                        <code className="text-foreground/80">{getPublicUrl()}</code>
                        <button
                          onClick={copyUrl}
                          className="ml-1 p-1 hover:bg-primary/10 rounded transition-colors"
                          title="Copy Link"
                        >
                          <Copy className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Analytics Overview */}
          {analytics && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Insights</h2>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  Live Activity
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-premium bg-white group hover:translate-y-[-2px] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Eye className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                      {analytics.totalViews.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Views</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-white group hover:translate-y-[-2px] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Users className="w-5 h-5 text-accent" />
                      </div>
                    </div>
                    <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                      {analytics.uniqueVisitors.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Visitors</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-white group hover:translate-y-[-2px] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <QrCode className="w-5 h-5 text-emerald-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                      {analytics.qrScans}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">QR Scans</p>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-white group hover:translate-y-[-2px] transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <Phone className="w-5 h-5 text-amber-600" />
                      </div>
                    </div>
                    <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                      {analytics.contactClicks}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Leads</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Charts */}
              <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-none shadow-premium bg-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      Profile Engagement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-end justify-between gap-3 h-48 pt-6">
                      {analytics.viewsThisWeek.map((views, index) => (
                        <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                          <div
                            className="w-full bg-primary/5 rounded-lg transition-all hover:bg-primary/10 relative overflow-hidden"
                            style={{
                              height: `${Math.max((views / maxViews) * 100, 5)}%`,
                            }}
                          >
                            <div
                              className="absolute bottom-0 left-0 w-full bg-primary/80 rounded-t-lg transition-all"
                              style={{ height: '100%', opacity: 0.4 + (views / maxViews) * 0.6 }}
                            />
                            {/* Value tooltip on hover */}
                            <div className="absolute top-[-24px] left-1/2 translate-x-[-50%] opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground text-[10px] py-1 px-1.5 rounded font-bold pointer-events-none">
                              {views}
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            {DAYS[(new Date().getDay() - 6 + index + 7) % 7]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-premium bg-white overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-heading font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-primary" />
                      Traffic Origins
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6 pt-4">
                      {analytics.topReferrers.map((referrer, index) => {
                        const totalVisits = analytics.topReferrers.reduce((sum, r) => sum + r.visits, 0);
                        const percentage = Math.round((referrer.visits / totalVisits) * 100);

                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-foreground/80">{referrer.source}</span>
                              <span className="text-xs font-bold text-primary">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                      {analytics.topReferrers.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                          <Globe className="w-8 h-8 mb-2" />
                          <p className="text-xs font-bold uppercase tracking-widest">No traffic data yet</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          )}

          {/* Footer Metadata */}
          {profile.publishedAt && (
            <footer className="pt-6 border-t border-border/50 flex items-center gap-4 text-xs text-muted-foreground font-medium uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5" />
                <span>Established {new Date(profile.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5" />
                <span>Verified Professional</span>
              </div>
            </footer>
          )}
        </div>
      </main>
    </div>
  );
}
