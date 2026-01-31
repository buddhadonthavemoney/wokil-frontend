import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LawyerProfile } from '@/types/lawyer';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import QRCode from "react-qr-code";
import {
  Scale,
  User,
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
  Rocket,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
  ArrowLeft
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { toast as sonnerToast } from "sonner";
import { InfoModal } from '@/components/InfoModal';
import { useLocation, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { profile as profileApi, site as siteApi } from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const COLORS = ['#0f172a', '#d97706', '#2563eb', '#059669', '#4338ca']; // Navy, Amber, Blue, Emerald, Indigo

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Dashboard() {
  const [profile, setProfile] = useState<LawyerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [highlightViewSite, setHighlightViewSite] = useState(false);
  const [showGuideArrow, setShowGuideArrow] = useState(false);


  const [showInfoModal, setShowInfoModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    description: '',
    type: 'info' as 'info' | 'success' | 'error',
  });


  
  // Fetch Analytics Data (only if GA ID exists)
  const { data: analytics } = useQuery({
    queryKey: ['analytics'],
    queryFn: siteApi.getAnalytics,
    enabled: !!profile?.googleAnalyticsId,
    refetchInterval: 30000, // Refresh every 30s
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

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
          <div className="w-[380px] bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 p-5 flex items-start gap-4 animate-in slide-in-from-bottom-5 fade-in duration-500 ring-1 ring-black/5">
            <div className={`
              mt-0.5 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 hover:scale-105
              ${variant === 'loading' ? 'bg-primary/10 text-primary' : ''}
              ${variant === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
              ${variant === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : ''}
            `}>
              {variant === 'loading' && <Loader2 className="w-6 h-6 animate-spin" />}
              {variant === 'success' && <Sparkles className="w-6 h-6 animate-bounce" />}
              {variant === 'error' && <XCircle className="w-6 h-6" />}
            </div>
            <div className="flex-1 space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-[15px] text-foreground tracking-tight leading-none">
                  {variant === 'loading' && 'Deploying Website'}
                  {variant === 'success' && 'Deployment Complete'}
                  {variant === 'error' && 'Deployment Failed'}
                </h3>
                {variant === 'loading' && (
                  <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                )}
              </div>
              <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed font-body">
                {message}
              </p>
              {detail && (
                <div className="flex items-center gap-2 pt-1">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${
                    variant === 'success' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' : 
                    variant === 'error' ? 'bg-rose-100/50 text-rose-700 border-rose-200' : 
                    'bg-primary/5 text-primary/70 border-primary/10'
                  }`}>
                    {detail}
                  </span>
                </div>
              )}
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
                      
                      // Sequential animation: Arrow first, then Glow
                      setShowGuideArrow(true);
                      setTimeout(() => {
                        setShowGuideArrow(false);
                        setHighlightViewSite(true);
                        // Turn off highlight after 10 seconds
                        setTimeout(() => setHighlightViewSite(false), 10000);
                      }, 4000);

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



  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col gap-12">
          {/* Profile Section */}
          <section>
            <PageHeader 
              icon={<User />}
              title="Your Profile"
              description="Manage your professional presence and public details."
              className="mb-12"
              actions={
                <>
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
                  <HoverCard openDelay={0} closeDelay={0}>
                    <HoverCardTrigger asChild>
                      <div className="relative">
                        {showGuideArrow && (
                          <div className="absolute -right-12 top-1/2 -translate-y-1/2 animate-bounce-horizontal text-emerald-600 z-10">
                            <ArrowLeft className="w-8 h-8 fill-emerald-600/10" />
                          </div>
                        )}
                        <Button
                          onClick={() => window.open(getPublicUrl(), '_blank')}
                          size="sm"
                          className={cn(
                            "gap-2 rounded-lg font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all text-primary-foreground bg-primary hover:bg-primary/90 border-none relative overflow-visible",
                            highlightViewSite && "animate-highlight-glow ring-2 ring-emerald-500 ring-offset-2 ring-offset-background"
                          )}
                          disabled={(!profile.slug && !profile.id) || !profile.isPublished}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Site
                          <QrCode className="w-4 h-4 opacity-70" />
                        </Button>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto p-4 bg-white" align="end">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-2 bg-white rounded-lg border border-border">
                          <QRCode
                            value={getPublicUrl()}
                            size={128}
                            style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                            viewBox={`0 0 256 256`}
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center mt-1">Scan to Visit</p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </>
              }
            />

            <Card className="border-none shadow-premium bg-white overflow-hidden rounded-3xl">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
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
          <section className="space-y-6 relative">
             <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground">Insights</h2>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                  Live Activity
                </div>
              </div>

            {!analytics && !profile?.googleAnalyticsId ? (
                <div className="bg-white border-none rounded-3xl p-10 md:p-16 text-center shadow-premium">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">Enable Site Analytics</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Get detailed insights about your visitors, page views, and traffic sources by enabling Google Analytics integration in Settings.
                    </p>
                    <Button 
                        size="lg" 
                        onClick={() => navigate('/settings')}
                        className="px-8"
                    >
                        Go to Settings
                    </Button>
                </div>
            ) : (
                <div className="space-y-6 animate-fade-in">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white border-none rounded-3xl p-8 shadow-premium">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Total Views</span>
                                <EyeIcon className="w-4 h-4 text-blue-500" />
                            </div>
                            <div className="text-3xl font-bold">{analytics?.totalViews || 0}</div>
                        </div>
                         <div className="bg-white border-none rounded-3xl p-8 shadow-premium">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Unique Visitors</span>
                                <Users className="w-4 h-4 text-green-500" />
                            </div>
                            <div className="text-3xl font-bold">{analytics?.visitors || 0}</div>
                        </div>
                        {/* Placeholders for future stats */}
                        <div className="bg-white border-none rounded-3xl p-8 shadow-premium opacity-60">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground">QR Scans</span>
                                <QrCodeIcon className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="text-3xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground mt-2">Coming Soon</p>
                        </div>
                        <div className="bg-white border-none rounded-3xl p-8 shadow-premium opacity-60">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-medium text-muted-foreground">Avg. Time</span>
                                <ClockIcon className="w-4 h-4 text-orange-500" />
                            </div>
                            <div className="text-3xl font-bold">-</div>
                            <p className="text-xs text-muted-foreground mt-2">Coming Soon</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Views Chart */}
                        <div className="lg:col-span-2 bg-white border-none rounded-3xl p-8 shadow-premium">
                            <h3 className="font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-primary" />
                                Traffic History
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={analytics?.history || []}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis 
                                             dataKey="date" 
                                             axisLine={false} 
                                             tickLine={false} 
                                             tick={{fill: '#888', fontSize: 12}}
                                             dy={10}
                                        />
                                        <YAxis 
                                             axisLine={false} 
                                             tickLine={false} 
                                             tick={{fill: '#888', fontSize: 12}}
                                        />
                                        <Tooltip 
                                             contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                        />
                                        <Line 
                                             type="monotone" 
                                             dataKey="views" 
                                             stroke="#0f172a" 
                                             strokeWidth={3} 
                                             dot={false}
                                             activeDot={{r: 6, fill: '#0f172a', strokeWidth: 0}}
                                         />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Sources Chart */}
                        <div className="bg-white border-none rounded-3xl p-8 shadow-premium">
                            <h3 className="font-bold mb-6 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-primary" />
                                Traffic Sources
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(analytics?.sources || {}).map(([name, value]) => ({ name, value }))}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {Object.entries(analytics?.sources || {}).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 space-y-2">
                                    {Object.entries(analytics?.sources || {}).slice(0, 5).map(([name, value], index) => (
                                        <div key={name} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}} />
                                                <span className="text-muted-foreground truncate max-w-[120px]" title={name}>{name}</span>
                                            </div>
                                            <span className="font-medium">{value}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
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

// Helper Icons
function EyeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}

function ClockIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function QrCodeIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="5" height="5" x="3" y="3" rx="1" />
            <rect width="5" height="5" x="16" y="3" rx="1" />
            <rect width="5" height="5" x="3" y="16" rx="1" />
            <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
            <path d="M21 21v.01" />
            <path d="M12 7v3a2 2 0 0 1-2 2H7" />
            <path d="M3 12h.01" />
            <path d="M12 3h.01" />
            <path d="M12 16v.01" />
            <path d="M16 12h1" />
            <path d="M21 12v.01" />
            <path d="M12 21v-1" />
        </svg>
    )
}
