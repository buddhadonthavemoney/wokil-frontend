'use client';

import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMyFirmOptions, getProfileOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { toLawyerProfile } from '@/lib/lawyer-profile-adapter';
import { FirmProfile, toFirmProfile } from '@/types/firm';
import { LawyerProfile } from '@/types/lawyer';
import { rosterCardProfile, rosterCardUrl } from '@/lib/roster-card';
import { siteHref } from '@/lib/utils';
import { memberInitials } from '@/lib/firm-roster';
import { useReactToPrint } from 'react-to-print';
import { BusinessCard, CardLayout, CardColor } from '@/components/BusinessCard';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAccountType } from '@/hooks/useAccountType';
import {
  Printer, IdCard, Loader2, AlertCircle, ArrowRight, Nfc, Building2, Users,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

/**
 * Business cards, for both account types.
 *
 * An individual's card is their own profile. A firm has no profile of its own —
 * `getProfile` answers `{}` for a firm account — and its cards belong to the
 * lawyers on its roster, so the firm path picks one of them and maps them onto
 * the same LawyerProfile shape BusinessCard already renders.
 */
export default function BusinessCardPage() {
  const { accountType, isLoading } = useAccountType();

  if (isLoading) return <PageSpinner />;
  return accountType === 'firm' ? <FirmBusinessCards /> : <IndividualBusinessCards />;
}

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}

/** The shell every empty state on this page uses: icon, copy, one way forward. */
function EmptyState({
  icon,
  title,
  description,
  children,
  cta,
  onCta,
  backLabel,
  onBack,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children?: React.ReactNode;
  cta: string;
  onCta: () => void;
  backLabel: string;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-card rounded-xl shadow-premium p-10 text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-accent/12 rounded-2xl flex items-center justify-center mx-auto mb-2">
          {icon}
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {children}

        <Button
          onClick={onCta}
          className="w-full h-12 rounded-xl text-md font-semibold gap-2 shadow-sm transition-all hover:scale-[1.02]"
        >
          {cta}
          <ArrowRight className="w-4 h-4" />
        </Button>

        <button
          onClick={onBack}
          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}

/**
 * The studio itself: layout, colour, the card and the print button.
 *
 * Shared by both account types — only who the card is for differs, and that
 * arrives as a `LawyerProfile` either way. `controls` is where the firm path
 * puts its lawyer picker.
 */
function CardStudio({
  profile,
  publicUrl,
  description,
  controls,
}: {
  profile: LawyerProfile;
  publicUrl: string;
  description: string;
  controls?: React.ReactNode;
}) {
  const [cardLayout, setCardLayout] = useState<CardLayout>('classic');
  const [cardColor, setCardColor] = useState<CardColor>('slate');
  const componentRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ contentRef: componentRef });

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col gap-12">

          <PageHeader
            icon={<IdCard />}
            title="Professional Business Card"
            description={description}
            className="mb-12"
          />

          <div className="bg-card rounded-xl border-none shadow-premium p-8 md:p-10">
            <div className="flex flex-col gap-8">
              <div className="flex justify-center">
                <div className="inline-flex bg-muted/30 p-1 rounded-xl border border-border">
                  <div className="px-4 py-2 rounded-lg bg-card shadow-sm border border-border text-sm font-medium text-foreground text-center">
                    Standard Print
                  </div>
                  <div
                    title="Coming soon"
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-muted-foreground/40 cursor-not-allowed select-none"
                  >
                    <Nfc className="w-4 h-4" />
                    NFC Digital Card
                    <span className="text-[9px] label-caps text-muted-foreground/40 border border-border rounded px-1.5 py-0.5">
                      Soon
                    </span>
                  </div>
                </div>
              </div>

              {controls}

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center border-b border-border/50 pb-6">
                {/* Layout Selector */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs label-caps text-muted-foreground text-center">Layout Style</label>
                  <div className="flex items-center justify-center gap-2 bg-surface-low border border-border p-1 rounded-xl">
                    {(['classic', 'minimal', 'modern'] as CardLayout[]).map((layout) => (
                      <button
                        key={layout}
                        onClick={() => setCardLayout(layout)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${cardLayout === layout ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:bg-card/60 hover:text-primary'}`}
                      >
                        {layout.charAt(0).toUpperCase() + layout.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selector */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs label-caps text-muted-foreground text-center">Color Theme</label>
                  <div className="flex items-center justify-center gap-3">
                    {(['slate', 'blue', 'emerald', 'indigo', 'amber'] as CardColor[]).map((color) => (
                      <button
                        key={color}
                        onClick={() => setCardColor(color)}
                        className={`w-10 h-10 rounded-full border-4 transition-all ${cardColor === color ? 'border-accent scale-110' : 'border-transparent hover:scale-105'}`}
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

              <div className="w-full flex justify-center bg-surface-low rounded-xl border border-dashed border-border p-6">
                <div className="w-full max-w-4xl">
                  <BusinessCard ref={componentRef} profile={profile} publicUrl={publicUrl} layout={cardLayout} colorTheme={cardColor} />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button size="lg" onClick={() => handlePrint()} className="gap-2 px-8">
                  <Printer className="w-5 h-5" />
                  Print Business Card
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function IndividualBusinessCards() {
  const router = useRouter();

  const { data, isLoading } = useQuery(getProfileOptions());
  const profile = data ? toLawyerProfile(data) : undefined;

  if (isLoading) return <PageSpinner />;

  const isProfileComplete = profile &&
    profile.basicInformation?.fullName &&
    profile.basicInformation?.professionalTitle &&
    profile.basicInformation?.yearsOfExperience !== undefined;

  if (!profile || !isProfileComplete) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10 text-accent" />}
        title="Profile Incomplete"
        description="We need a bit more information before we can generate your professional business card."
        cta="Complete Profile"
        onCta={() => router.push('/profile-builder')}
        backLabel="Back to Dashboard"
        onBack={() => router.push('/dashboard')}
      >
        <RequiredFields profile={profile} />
      </EmptyState>
    );
  }

  const getPublicUrl = () => {
    if (!profile.siteUrl) return '';
    return siteHref(profile.siteUrl);
  };

  return (
    <CardStudio
      profile={profile}
      publicUrl={getPublicUrl()}
      description="Customize and print your physical business card."
    />
  );
}

/** The three fields a card cannot be printed without, ticked off as they land. */
function RequiredFields({ profile }: { profile?: LawyerProfile }) {
  const rows: [string, boolean][] = [
    ['Full Name', Boolean(profile?.basicInformation?.fullName)],
    ['Professional Title', Boolean(profile?.basicInformation?.professionalTitle)],
    ['Years of Experience', profile?.basicInformation?.yearsOfExperience !== undefined],
  ];

  return (
    <div className="bg-muted/50 rounded-xl p-4 text-left border border-border">
      <p className="text-[11px] label-caps text-muted-foreground mb-3">Required Fields</p>
      <ul className="space-y-2">
        {rows.map(([label, done]) => (
          <li key={label} className="flex items-center gap-2 text-sm text-foreground/80">
            <div className={`w-1.5 h-1.5 rounded-full ${done ? 'bg-success' : 'bg-muted-foreground/30'}`} />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FirmBusinessCards() {
  const router = useRouter();
  const [selected, setSelected] = useState(0);

  const { data, isLoading } = useQuery(getMyFirmOptions());
  const raw = data as Partial<FirmProfile> | undefined;
  const firm = toFirmProfile(raw);
  // getMyFirm answers {} when the caller has no firm, so an id is what
  // distinguishes "no firm yet" from "a firm with nothing filled in".
  const hasFirm = Boolean(raw?.id);
  const roster = firm.roster ?? [];

  if (isLoading) return <PageSpinner />;

  if (!hasFirm) {
    return (
      <EmptyState
        icon={<Building2 className="w-10 h-10 text-accent" />}
        title="No firm set up yet"
        description="Create your firm to manage its site and the lawyers who appear on it — their cards come from that roster."
        cta="Set up your firm"
        onCta={() => router.push('/firm-builder')}
        backLabel="Back to Dashboard"
        onBack={() => router.push('/firm-dashboard')}
      />
    );
  }

  if (roster.length === 0) {
    return (
      <EmptyState
        icon={<Users className="w-10 h-10 text-accent" />}
        title="No lawyers on your roster yet"
        description="Business cards are printed for the lawyers on your roster. Add one and their card is ready."
        cta="Add a lawyer"
        onCta={() => router.push('/firm-roster')}
        backLabel="Back to Dashboard"
        onBack={() => router.push('/firm-dashboard')}
      />
    );
  }

  // A removed lawyer can leave the selection past the end of the list.
  const index = Math.min(selected, roster.length - 1);
  const member = roster[index];

  if (!member.fullName || !member.professionalTitle) {
    return (
      <EmptyState
        icon={<AlertCircle className="w-10 h-10 text-accent" />}
        title="Lawyer Incomplete"
        description="This lawyer needs a name and a title before their card can be printed."
        cta="Edit this lawyer"
        onCta={() => router.push(`/firm-roster/${index}`)}
        backLabel="Back to Roster"
        onBack={() => router.push('/firm-roster')}
      />
    );
  }

  return (
    <CardStudio
      profile={rosterCardProfile(firm, member)}
      publicUrl={rosterCardUrl(firm, member, index)}
      description={`Cards for ${firm.firmDetails.name || 'your firm'}. Pick a lawyer, then print.`}
      controls={
        <div className="flex flex-col gap-3">
          <label className="text-xs label-caps text-muted-foreground text-center">
            Lawyer
          </label>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {roster.map((m, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                aria-pressed={i === index}
                className={`flex items-center gap-3 pl-1.5 pr-4 py-1.5 rounded-full border transition-all ${
                  i === index
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <Avatar className="h-8 w-8">
                  {m.photo && <AvatarImage src={m.photo} alt={m.fullName} />}
                  <AvatarFallback className="text-[11px]">{memberInitials(m.fullName)}</AvatarFallback>
                </Avatar>
                <span className="text-left leading-tight">
                  <span className="block text-sm font-medium">{m.fullName || 'Unnamed lawyer'}</span>
                  {m.professionalTitle && (
                    <span className="block text-xs text-muted-foreground">{m.professionalTitle}</span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      }
    />
  );
}
