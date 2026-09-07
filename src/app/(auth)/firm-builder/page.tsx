'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Building2, Monitor } from 'lucide-react';

import { useFirmForm } from '@/hooks/useFirmForm';
import { useRequireAccountType } from '@/hooks/useAccountType';
import { FIRM_STEPS } from '@/components/form/firmSteps';
import { WizardShell } from '@/components/form/WizardShell';
import { ThemeSelector } from '@/components/form/ThemeSelector';
import { BuilderPreview } from '@/components/preview/BuilderPreview';
import { FirmPreview } from '@/components/preview/FirmPreview';
import { Button } from '@/components/ui/button';
import { updateFirm } from '@/generated/wokil-api';
import { listThemesOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { useToast } from '@/hooks/use-toast';
import { FirmProfile } from '@/types/firm';

const SAMPLE_FIRM = {
  firmDetails: {
    name: 'Dewey, Cheatem & Howe',
    registrationNumber: 'NP-4471',
    foundedYear: '1978',
    tagline: 'Counsel you can rely on',
  },
  practiceDetails: {
    areasOfPractice: ['Corporate Law', 'Criminal Defense', 'Family Law'],
    // Must come from COURT_CATEGORIES — the Practice step only lets you pick
    // courts from that list, so free-text values would be unreachable state.
    jurisdictions: ['Supreme Court of Nepal', 'High Court Patan'],
  },
  contactInformation: {
    phoneNumber: '+977 1 503 4455',
    email: 'chambers@deweycheatem.example',
    officeAddress: '160 Kamaladi Marg, Kathmandu 44600',
  },
  firmProfile: {
    about:
      'A full-service chambers practising across corporate, criminal and family law, acting for individuals and businesses throughout Nepal since 1978.',
    officeHours: '9:00 AM - 5:00 PM, Sunday to Friday',
  },
  roster: [
    {
      fullName: 'Ann Ell',
      professionalTitle: 'Managing Partner',
      yearsOfExperience: 22,
      areasOfPractice: ['Corporate Law'],
      email: 'a.ell@deweycheatem.example',
      bio: 'Leads the corporate practice, advising on mergers, joint ventures and cross-border structuring.',
    },
    {
      fullName: 'Bo Bell',
      professionalTitle: 'Senior Associate',
      yearsOfExperience: 9,
      areasOfPractice: ['Criminal Defense'],
      bio: 'Appears regularly in the district and high courts on defence matters.',
    },
  ],
  onlinePresence: {
    website: 'https://deweycheatem.example',
    linkedIn: 'https://linkedin.com/company/deweycheatem',
  },
};

function FirmBuilderContent() {
  // An individual account here would be editing a firm it does not own.
  useRequireAccountType('firm', '/profile-builder');

  const searchParams = useSearchParams();
  // Read before the hook runs so it can open on the right step directly,
  // rather than jumping there after the fact.
  const requestedStep = Number(searchParams?.get('step'));

  const {
    firm,
    currentStep,
    lockedSteps,
    finishStep,
    updateNestedFirm,
    nextStep,
    prevStep,
    goToStep,
    saveFirmData,
    setFirm,
    resetCurrentStep,
  } = useFirmForm({
    initialStep: Number.isInteger(requestedStep) && requestedStep >= 1 ? requestedStep : undefined,
  });

  const { toast } = useToast();
  const router = useRouter();

  // Scoped to firm themes: the lawyer themes take a LawyerProfile and would
  // throw if a firm ever selected one.
  const { data: themesData } = useQuery({ ...listThemesOptions({ query: { category: 'firm' } }), staleTime: 5 * 60_000 });
  const themes = themesData ?? [];

  const handleFillSample = () => {
    const key = FIRM_STEPS[currentStep - 1]?.key;
    if (!key) return;

    const sample = SAMPLE_FIRM[key as keyof typeof SAMPLE_FIRM];
    if (sample === undefined) return;

    setFirm((prev) => ({ ...prev, [key]: sample }) as FirmProfile);
    toast({
      title: 'Step Filled',
      description: `Sample data for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} loaded.`,
    });
  };

  const handleNext = async () => {
    // `finishStep`, not the last step: after deployment the subdomain step is
    // locked, so the wizard ends one step earlier.
    if (currentStep >= finishStep) {
      await saveFirmData();
      router.push('/preview');
    } else {
      await nextStep();
    }
  };

  const hasFirmName = Boolean(firm.firmDetails.name);

  return (
    <WizardShell
      icon={<Building2 />}
      title="Firm Architect"
      description="Build your firm's presence. Changes update in real-time."
      steps={FIRM_STEPS}
      currentStep={currentStep}
      data={firm}
      onUpdate={(category, fields) => updateNestedFirm(category, fields)}
      onNext={handleNext}
      onPrev={prevStep}
      onStepClick={goToStep}
      onFillSample={handleFillSample}
      onClear={resetCurrentStep}
      lockedSteps={lockedSteps}
    >
      <BuilderPreview
        isEmpty={!hasFirmName}
        emptyTitle="Ready to build your firm's site?"
        emptyDescription="Add your firm name to see a real-time preview."
        toolbar={
          <>
            <ThemeSelector
              themes={themes}
              currentTheme={firm.themeSelection?.theme}
              onThemeSelect={(themeId) => {
                const updated: FirmProfile = { ...firm, themeSelection: { theme: themeId } };
                setFirm(updated);

                const payload = { ...updated };
                // Once deployed the subdomain is locked server-side; sending it
                // back turns an ordinary save into a 400.
                if (updated.firmProfile?.deploymentURL) {
                  delete (payload as Partial<FirmProfile>).subdomainSelection;
                }
                updateFirm({ body: payload as FirmProfile, throwOnError: true }).catch((err) => {
                  console.error('Theme switch failed to save:', err);
                });
              }}
            />

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-full text-[10px] label-caps text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
              onClick={() => router.push('/preview')}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop View
            </Button>
          </>
        }
      >
        {/*
          FirmPreview, not a bare <ClassicTheme>: the theme hides its
          [data-reveal] sections — the roster included — until an observer
          marks them visible, which only FirmPreview wires up.
        */}
        {(zoom) => <FirmPreview firm={firm} zoom={zoom} />}
      </BuilderPreview>
    </WizardShell>
  );
}

export default function FirmBuilder() {
  // useSearchParams needs a Suspense boundary to avoid opting the whole route
  // into client-side rendering, same as the Google callback page.
  return (
    <Suspense fallback={null}>
      <FirmBuilderContent />
    </Suspense>
  );
}
