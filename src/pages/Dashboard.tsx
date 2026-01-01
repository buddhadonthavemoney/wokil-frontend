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
  Plus
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Scale className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-heading font-semibold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage your professional profile</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/');
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {profile.profilePhoto ? (
                  <img
                    src={profile.profilePhoto}
                    alt={profile.fullName}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-heading font-bold text-primary">
                    {profile.fullName.split(' ').map(n => n[0]).join('')}
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h2 className="text-xl font-heading font-semibold text-foreground mb-1">
                  {profile.fullName}
                </h2>
                <p className="text-muted-foreground mb-2">{profile.professionalTitle}</p>
                {profile.lawFirmName && (
                  <p className="text-sm text-muted-foreground">{profile.lawFirmName}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (profile?.slug) {
                      // Store profile slug for editing
                      sessionStorage.setItem('editingProfileSlug', profile.slug);
                    }
                    navigate('/profile-builder');
                  }}
                  className="gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" onClick={copyUrl} className="gap-2">
                  <Copy className="w-4 h-4" />
                  Copy URL
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`/p/${profile.slug || profile.id}`, '_blank')}
                  className="gap-2"
                  disabled={(!profile.slug && !profile.id) || !profile.isPublished}
                  title={(!profile.slug && !profile.id) ? "Set a slug in the builder to view site" : !profile.isPublished ? "Publish your profile to view site" : ""}
                >
                  <ExternalLink className="w-4 h-4" />
                  View Site
                </Button>
              </div>
            </div>

            {/* URL Display */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <code className="text-foreground break-all">{getPublicUrl()}</code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Grid */}
        {analytics && (
          <>
            <h3 className="font-heading font-semibold text-foreground mb-4">Analytics Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {analytics.totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Page Views</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-accent" />
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {analytics.uniqueVisitors.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <QrCode className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {analytics.qrScans}
                  </p>
                  <p className="text-sm text-muted-foreground">QR Code Scans</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-2xl font-heading font-bold text-foreground">
                    {analytics.contactClicks}
                  </p>
                  <p className="text-sm text-muted-foreground">Contact Clicks</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Weekly Views Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Views This Week
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between gap-2 h-40">
                    {analytics.viewsThisWeek.map((views, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full bg-primary/20 rounded-t transition-all hover:bg-primary/30"
                          style={{
                            height: `${(views / maxViews) * 100}%`,
                            minHeight: '8px'
                          }}
                        >
                          <div
                            className="w-full h-full bg-primary rounded-t"
                            style={{ opacity: 0.6 + (views / maxViews) * 0.4 }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {DAYS[(new Date().getDay() - 6 + index + 7) % 7]}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Referrers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-heading flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Traffic Sources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topReferrers.map((referrer, index) => {
                      const totalVisits = analytics.topReferrers.reduce((sum, r) => sum + r.visits, 0);
                      const percentage = Math.round((referrer.visits / totalVisits) * 100);

                      return (
                        <div key={index}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-foreground">{referrer.source}</span>
                            <span className="text-sm text-muted-foreground">{referrer.visits} visits</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Published Date */}
            {profile.publishedAt && (
              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>
                  Published on {new Date(profile.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
