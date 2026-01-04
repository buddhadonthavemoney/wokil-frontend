import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LawyerProfile } from '@/types/lawyer';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/button';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useReactToPrint } from 'react-to-print';
import { BusinessCard, CardLayout, CardColor } from '@/components/BusinessCard';
import QRCode from "react-qr-code";
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
  Shield,
  IdCard,
  Printer,
  Rocket,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { profile as profileApi } from '@/lib/api';

import { toast as sonnerToast } from "sonner";
import { InfoModal } from '@/components/InfoModal';
import { useLocation } from 'react-router-dom';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [cardLayout, setCardLayout] = useState<CardLayout>('classic');
  const [cardColor, setCardColor] = useState<CardColor>('slate');

  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    description: '',
    type: 'info' as 'info' | 'success' | 'error',
  });

  const { analytics } = useAnalytics(profile);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const fetchProfile = async () => {
    try {
      const data = await profileApi.get();
      // Relaxed check: if data exists and has basic info, we treat it as valid.
      if (data && (data.id || data.basicInformation)) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for navigation state
    if (location.state?.showInfoModal) {
      setShowInfoModal(true);
      setModalContent({
        title: location.state.modalTitle || 'Info',
        description: location.state.modalDescription || '',
        type: location.state.modalType || 'info',
      });
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Handle Deployment Stream
  useEffect(() => {
    if (location.state?.deploying) {
      // Clear flag
      window.history.replaceState({}, document.title);

      const token = localStorage.getItem('token');
      const streamUrl = `${import.meta.env.VITE_API_BASE_URL}/sites/deploy/stream`;
      const abortController = new AbortController();
      let toastId: string | number = "deploy-toast";

      type DeployStatus = 'queued' | 'starting' | 'deploying' | 'success' | 'failed';

      interface DeployEvent {
        type: 'status' | 'log' | 'done';
        status?: DeployStatus;
        message?: string;
        progress?: number;
        timestamp: string;
      }

      const showToast = (variant: 'loading' | 'success' | 'error', message: string, detail?: string) => {
        sonnerToast.custom((t) => (
          <div className="w-[356px] bg-white rounded-2xl shadow-2xl border-2 border-primary/20 p-4 flex items-start gap-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className={`
              mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg
              ${variant === 'loading' ? 'bg-primary/10 text-primary' : ''}
              ${variant === 'success' ? 'bg-green-100 text-green-600' : ''}
              ${variant === 'error' ? 'bg-red-100 text-red-600' : ''}
            `}>
              {variant === 'loading' && <Loader2 className="w-5 h-5 animate-spin" />}
              {variant === 'success' && <Sparkles className="w-5 h-5" />}
              {variant === 'error' && <XCircle className="w-5 h-5" />}
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-heading font-bold text-sm text-foreground">
                {variant === 'loading' && 'Deploying Website'}
                {variant === 'success' && 'Deployment Complete'}
                {variant === 'error' && 'Deployment Failed'}
              </h3>
              <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                {message}
              </p>
              {detail && <p className="text-[10px] text-muted-foreground/70 uppercase tracking-widest">{detail}</p>}
            </div>
          </div>
        ), { id: toastId, duration: variant === 'loading' ? Infinity : 5000 });
      };

      const startStream = async () => {
        showToast('loading', 'Initializing deployment...', 'Preparing assets');

        try {
          const response = await fetch(streamUrl, {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: abortController.signal,
          });

          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          if (!reader) return;

          let buffer = '';
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              const trimmed = line.trim();
              if (!trimmed || !trimmed.startsWith('data: ')) continue;

              try {
                const event: DeployEvent = JSON.parse(trimmed.substring(6));
                console.log("Deployment Event:", event);

                switch (event.type) {
                  case 'status':
                    const statusMsg = event.progress !== undefined ? `${event.message} (${event.progress}%)` : event.message;
                    showToast('loading', statusMsg || 'Processing...', event.status?.toUpperCase() || 'DEPLOYING');
                    break;

                  case 'log':
                    if (event.message) {
                      console.log(`[DEPLOY LOG] ${event.message}`);
                    }
                    break;

                  case 'done':
                    if (event.status === 'success') {
                      showToast('success', event.message, "LIVE");
                      setShowInfoModal(true);
                      setModalContent({
                        title: 'Website is Live!',
                        description: event.message || 'Your professional profile has been successfully published.',
                        type: 'success',
                      });

                      await fetchProfile();
                    } else {
                      showToast('error', event.message, "FAILED");
                      setModalContent({
                        title: 'Deployment Failed',
                        description: event.message || 'An error occurred during the deployment process.',
                        type: 'error',
                      });
                      setShowInfoModal(true);
                    }
                    return; // Stop processing stream on 'done'
                }
              } catch (e) {
                console.error("Failed to parse SSE event:", e);
              }
            }
          }
        } catch (err: any) {
          if (err.name !== 'AbortError') {
            console.error("Deployment stream error:", err);
            showToast('error', "The connection to the deployment server was lost.", "CONNECTION LOST");
          }
        }
      };

      startStream();

      return () => {
        abortController.abort();
      };
    }
  }, [location]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const getPublicUrl = () => {
    if (!profile || !profile.siteUrl) return '';
    const url = profile.siteUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return `https://${url}`;
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Your Profile</h2>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all"
                    >
                      <IdCard className="w-4 h-4" />
                      Contact Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl">
                    <DialogHeader>
                      <DialogTitle>Professional Business Card</DialogTitle>
                      <DialogDescription>
                        Preview your professional business card. You can print this card to share your contact details.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-6">
                      <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                        {/* Layout Selector */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">Layout</label>
                          <div className="flex items-center justify-center gap-2">
                            {(['classic', 'minimal', 'modern'] as CardLayout[]).map((layout) => (
                              <button
                                key={layout}
                                onClick={() => setCardLayout(layout)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${cardLayout === layout ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
                              >
                                {layout.charAt(0).toUpperCase() + layout.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Selector */}
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider text-center">Color Theme</label>
                          <div className="flex items-center justify-center gap-2">
                            {(['slate', 'blue', 'emerald', 'indigo', 'amber'] as CardColor[]).map((color) => (
                              <button
                                key={color}
                                onClick={() => setCardColor(color)}
                                className={`w-8 h-8 rounded-full border-2 transition-all ${cardColor === color ? 'border-primary ring-2 ring-primary/20 scale-110' : 'border-transparent opacity-70 hover:opacity-100 hover:scale-105'}`}
                                style={{
                                  background: color === 'slate' ? '#0f172a' :
                                    color === 'blue' ? '#2563eb' :
                                      color === 'amber' ? '#d97706' :
                                        color === 'emerald' ? '#059669' :
                                          '#4338ca'
                                }}
                                title={color.charAt(0).toUpperCase() + color.slice(1)}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="w-full overflow-hidden pb-4">
                        <div className="flex items-center justify-center p-2 sm:p-4 md:p-8 bg-slate-50/50 rounded-xl border border-border/50">
                          <BusinessCard ref={componentRef} profile={profile} publicUrl={getPublicUrl()} layout={cardLayout} colorTheme={cardColor} />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button onClick={() => handlePrint()} className="gap-2">
                        <Printer className="w-4 h-4" />
                        Print Card
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <HoverCard openDelay={0} closeDelay={0}>
                  <HoverCardTrigger asChild>
                    <Button
                      onClick={() => window.open(getPublicUrl(), '_blank')}
                      size="sm"
                      className="gap-2 rounded-lg font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all"
                      disabled={(!profile.slug && !profile.id) || !profile.isPublished}
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Site
                      <QrCode className="w-4 h-4 opacity-70" />
                    </Button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-auto p-4 bg-white">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-2 bg-white rounded-lg">
                        <QRCode
                          value={getPublicUrl()}
                          size={128}
                          style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                          viewBox={`0 0 256 256`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">Scan to visit website</p>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>

            <Card className="border-none shadow-premium bg-white overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                  {/* Avatar */}
                  <div className="relative group shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl bg-primary/5 flex items-center justify-center p-1 border-2 border-primary/10 transition-colors group-hover:border-primary/20 shadow-inner">
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

                    <div className="flex flex-col md:flex-row flex-wrap gap-3 md:gap-4 pt-2 items-center md:items-start w-full">
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border/50 text-sm font-medium max-w-full">
                        <Globe className="w-4 h-4 text-primary shrink-0" />
                        <code className="text-foreground/80 truncate max-w-[200px] sm:max-w-xs md:max-w-md">{getPublicUrl().replace(/^https?:\/\//, '')}</code>
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
          {/* Analytics Overview */}
          <section className="space-y-6 relative">
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md border border-primary/20 px-8 py-4 rounded-3xl shadow-premium animate-in fade-in zoom-in duration-500 hover:scale-105 transition-transform pointer-events-auto cursor-default">
                <p className="text-base font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Coming Soon
                </p>
              </div>
            </div>

            {(() => {
              const displayAnalytics = analytics || {
                totalViews: 0,
                uniqueVisitors: 0,
                qrScans: 0,
                contactClicks: 0,
                viewsThisWeek: [0, 0, 0, 0, 0, 0, 0],
                topReferrers: []
              };
              const displayMaxViews = Math.max(...displayAnalytics.viewsThisWeek, 1);

              return (
                <div className="opacity-75 pointer-events-none space-y-6 select-none">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Insights</h2>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                      Live Activity
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <Card className="border-none shadow-premium bg-white group transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center transition-colors">
                            <Eye className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                          {displayAnalytics.totalViews.toLocaleString()}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Total Views</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-premium bg-white group transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center transition-colors">
                            <Users className="w-5 h-5 text-accent" />
                          </div>
                        </div>
                        <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                          {displayAnalytics.uniqueVisitors.toLocaleString()}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Visitors</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-premium bg-white group transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center transition-colors">
                            <QrCode className="w-5 h-5 text-emerald-600" />
                          </div>
                        </div>
                        <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                          {displayAnalytics.qrScans}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">QR Scans</p>
                      </CardContent>
                    </Card>

                    <Card className="border-none shadow-premium bg-white group transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center transition-colors">
                            <Phone className="w-5 h-5 text-amber-600" />
                          </div>
                        </div>
                        <p className="text-3xl font-heading font-bold text-foreground mb-1 tracking-tight">
                          {displayAnalytics.contactClicks}
                        </p>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Leads</p>
                      </CardContent>
                    </Card>
                  </div>

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
                          {displayAnalytics.viewsThisWeek.map((views, index) => (
                            <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
                              <div
                                className="w-full bg-primary/5 rounded-lg transition-all relative overflow-hidden"
                                style={{
                                  height: `${Math.max((views / displayMaxViews) * 100, 5)}%`,
                                }}
                              >
                                <div
                                  className="absolute bottom-0 left-0 w-full bg-primary/80 rounded-t-lg transition-all"
                                  style={{ height: '100%', opacity: 0.4 + (views / displayMaxViews) * 0.6 }}
                                />
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
                          {(() => {
                            let totalVisits = 0;
                            displayAnalytics.topReferrers.forEach(r => { totalVisits += r.visits; });

                            return displayAnalytics.topReferrers.map((referrer, index) => {
                              const percentage = totalVisits > 0 ? Math.round((referrer.visits / totalVisits) * 100) : 0;

                              return (
                                <div key={index} className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-foreground/80">{referrer.source}</span>
                                    <span className="text-xs font-bold text-primary">{percentage}%</span>
                                  </div>
                                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })
                          })()}
                          {displayAnalytics.topReferrers.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                              <Globe className="w-8 h-8 mb-2" />
                              <p className="text-xs font-bold uppercase tracking-widest">No traffic data yet</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              );
            })()}
          </section>   {/* Footer Metadata */}
          {profile.publishedAt && (
            <footer className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                <span>Established {new Date(profile.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}</span>
              </div>
              <div className="hidden sm:block w-1 h-1 rounded-full bg-muted-foreground/30" />
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-primary/60" />
                <span>Verified Professional</span>
              </div>
            </footer>
          )}
        </div>
      </main>
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        title={modalContent.title}
        description={modalContent.description}
        type={modalContent.type}
        actionLabel="Got it"
      />
    </div>
  );
}
