'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toLawyerProfile } from '@/lib/lawyer-profile-adapter';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { cn, siteHref } from '@/lib/utils'
import QRCode from "react-qr-code";
import {
  Scale,
  User,
  QrCode,
  ExternalLink,
  Copy,
  Edit,
  Calendar,
  Globe,
  Plus,
  Shield,
  ArrowLeft,
  MapPin,
  Gavel
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { InfoModal } from '@/components/InfoModal';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/generated/wokil-api';
import { getProfileOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { useDeployHandoff } from '@/hooks/useDeployHandoff';
import { useRequireAccountType } from '@/hooks/useAccountType';
import { DeployProgressModal } from '@/components/deploy/DeployProgressModal';
import { InsightsSection } from '@/components/dashboard/InsightsSection';
import AuthGuard from '@/components/auth/AuthGuard';

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}

function DashboardContent() {
  // This whole page reads getProfile, which a firm account has no rows behind —
  // it would render an empty name, an empty avatar and empty stats rather than
  // an error. The firm's equivalent home is /firm-dashboard.
  const { redirecting } = useRequireAccountType('individual', '/firm-dashboard');

  const [highlightViewSite, setHighlightViewSite] = useState(false);
  const [showGuideArrow, setShowGuideArrow] = useState(false);

  const searchParams = useSearchParams();

  // Seeded from the query string the page was opened with — the effect below
  // then strips those params, so this is read once and never re-derived.
  const [showInfoModal, setShowInfoModal] = useState(() => !!searchParams?.get('showInfoModal'));
  const [modalContent] = useState(() => ({
    title: searchParams?.get('modalTitle') || 'Info',
    description: searchParams?.get('modalDescription') || '',
    type: (searchParams?.get('modalType') as 'info' | 'success' | 'error') || 'info',
  }));

  const router = useRouter();
  const { toast } = useToast();

  // Keyed in the query cache rather than local state so other pages can
  // invalidate it — deleting a site on /sites has to be able to tell the
  // dashboard its derived siteUrl/isPublished just changed. Routed through
  // toLawyerProfile (not a raw cast) because the generated API type has no
  // `id` and marks everything optional; existing cache data fills the gaps
  // the response omits.
  const { data, isLoading: loading, refetch: fetchProfile } = useQuery(getProfileOptions());

  // Mapped here rather than in the queryFn so the cache holds the raw API
  // response: it is the same entry every other page (and useProfileForm) reads,
  // and accountType rides on it — see useAccountType.
  const profile =
    data && (data.slug || data.basicInformation) ? toLawyerProfile(data) : null;

  // The modal's content is already in state; drop the params so a refresh (or
  // the back button) doesn't reopen it.
  useEffect(() => {
    if (searchParams?.get('showInfoModal')) {
      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete('showInfoModal');
      newParams.delete('modalTitle');
      newParams.delete('modalDescription');
      newParams.delete('modalType');
      router.replace(`/dashboard?${newParams.toString()}`, { scroll: false });
    }
  }, [searchParams, router]);

  const deployStream = useDeployHandoff({
    redirectTo: '/dashboard',
    // Disambiguates the stream's "no ongoing deployment" 400: only trust it
    // as a finished deploy if the profile itself confirms publish, so a
    // subscribe that raced a deploy which never actually ran doesn't get
    // reported as a success.
    confirmPublished: async () => {
      const data = (await getProfile({ throwOnError: true })).data;
      return !!(data && (data.isPublished || data.professionalProfile?.deploymentURL));
    },
    // Refetch regardless of outcome: a failed deploy can still have rolled
    // some state forward (or back) that the profile needs to reflect.
    onDone: async (status) => {
      await fetchProfile();
      if (status !== 'success') return;
      setShowGuideArrow(true);
      setTimeout(() => {
        setShowGuideArrow(false);
        setHighlightViewSite(true);
        setTimeout(() => setHighlightViewSite(false), 10000);
      }, 4000);
    },
  });

  const getPublicUrl = () => {
    if (!profile || !profile.siteUrl) return '';
    return siteHref(profile.siteUrl);
  };

  const copyUrl = () => {
    if (typeof window !== 'undefined') {
        navigator.clipboard.writeText(getPublicUrl());
        toast({
            title: "URL Copied!",
            description: "The profile URL has been copied to your clipboard.",
        });
    }
  };

  // `redirecting` holds the loading state for a firm account on its way to
  // /firm-dashboard, so it never flashes the empty lawyer dashboard first.
  if (loading || redirecting) {
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
          <Button onClick={() => router.push('/profile-builder')} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col gap-12">
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
                      router.push('/profile-builder');
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
                          <div className="absolute -right-10 top-1/2 animate-bounce-horizontal text-success z-10 pointer-events-none">
                            <ArrowLeft className="w-8 h-8 fill-success/10" />
                          </div>
                        )}
                        <Button
                          onClick={() => window.open(getPublicUrl(), '_blank')}
                          size="sm"
                          className={cn(
                            "gap-2 rounded-lg font-medium shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all text-primary-foreground bg-primary hover:bg-primary/90 border-none relative overflow-visible",
                            highlightViewSite && "animate-highlight-glow ring-2 ring-success ring-offset-2 ring-offset-background"
                          )}
                          disabled={(!profile.slug && !profile.id) || !profile.isPublished || !getPublicUrl()}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Site
                          <QrCode className="w-4 h-4 opacity-70" />
                        </Button>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-auto p-4 bg-card" align="end">
                      <div className="flex flex-col items-center gap-2">
                        {getPublicUrl() ? (
                          <>
                            <div className="p-2 bg-card rounded-lg border border-border">
                              <QRCode
                                value={getPublicUrl()}
                                size={128}
                                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                viewBox={`0 0 256 256`}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground label-caps text-center mt-1">Scan to Visit</p>
                          </>
                        ) : (
                          <p className="text-[10px] text-muted-foreground label-caps text-center max-w-[128px]">No live site yet</p>
                        )}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </>
              }
            />

            <Card className="relative border border-border shadow-sm bg-card overflow-hidden rounded-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-full pointer-events-none" />
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-10 items-center md:items-start text-center md:text-left">
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

                    {/* Credential chips — only ever rendered for fields that
                        actually exist on the profile, never fabricated. */}
                    {(profile.practiceDetails.jurisdictions.length > 0 ||
                      profile.basicInformation.yearsOfExperience > 0 ||
                      profile.contactInformation.officeAddress) && (
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        {profile.practiceDetails.jurisdictions.map((jurisdiction) => (
                          <Badge
                            key={jurisdiction}
                            variant="outline"
                            className="gap-1 rounded-md border-border bg-muted/30 px-3 py-1 text-[10px] label-caps text-muted-foreground"
                          >
                            <Gavel className="w-3 h-3" />
                            {jurisdiction}
                          </Badge>
                        ))}
                        {profile.basicInformation.yearsOfExperience > 0 && (
                          <Badge
                            variant="outline"
                            className="rounded-md border-border bg-muted/30 px-3 py-1 text-[10px] label-caps text-muted-foreground"
                          >
                            {profile.basicInformation.yearsOfExperience}+ Years Exp.
                          </Badge>
                        )}
                        {profile.contactInformation.officeAddress && (
                          <Badge
                            variant="outline"
                            className="gap-1 rounded-md border-border bg-muted/30 px-3 py-1 text-[10px] label-caps text-muted-foreground"
                          >
                            <MapPin className="w-3 h-3" />
                            {profile.contactInformation.officeAddress}
                          </Badge>
                        )}
                      </div>
                    )}

                    {/* Only rendered when a site is actually live. siteUrl is
                        derived from the sites table, so deleting a site clears
                        it and this chip disappears instead of showing a dead
                        link (or an empty pill with a copy button). */}
                    {getPublicUrl() && (
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
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <InsightsSection enabled={!!profile?.googleAnalyticsId} />

          {profile.publishedAt && (
            <footer className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-[10px] text-muted-foreground label-caps">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                <span>Established {new Date(profile.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
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
      <DeployProgressModal
        phase={deployStream.phase}
        steps={deployStream.steps}
        message={deployStream.message}
        onClose={deployStream.reset}
        siteUrl={getPublicUrl()}
      />
    </div>
  );
}
