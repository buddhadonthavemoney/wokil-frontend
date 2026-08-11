'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

import { useFirmForm } from '@/hooks/useFirmForm';
import { FIRM_STEPS } from '@/components/form/firmSteps';
import { WizardShell } from '@/components/form/WizardShell';
import { FirmClassicTheme } from '@/components/preview/themes/FirmClassicTheme';
import { Slider } from '@/components/ui/slider';
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
  const {
    firm,
    currentStep,
    totalSteps,
    updateNestedFirm,
    nextStep,
    prevStep,
    goToStep,
    saveFirmData,
    setFirm,
    resetCurrentStep,
  } = useFirmForm();

  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [zoom, setZoom] = useState([0.5]);

  // The firm dashboard's "Edit roster" links straight to a step. Applied once
  // on mount: re-running it would yank the user back every time they advanced.
  const requestedStep = searchParams?.get('step');
  useEffect(() => {
    const step = Number(requestedStep);
    if (Number.isInteger(step) && step >= 1) goToStep(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestedStep]);

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
    if (currentStep === totalSteps) {
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
    >
      {/* Zoom */}
      <div className="flex justify-center mb-8 px-4">
        <div className="w-full max-w-[200px] flex items-center gap-3">
          <ZoomOut className="w-3 h-3 text-muted-foreground/40" />
          <Slider
            value={zoom}
            onValueChange={setZoom}
            min={0.25}
            max={1}
            step={0.05}
            className="w-full cursor-pointer h-1"
          />
          <ZoomIn className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[9px] font-mono text-muted-foreground/60 w-8 text-right">
            {Math.round(zoom[0] * 100)}%
          </span>
        </div>
      </div>

      {/*
        A desktop frame rather than the lawyer wizard's phone mockup: a firm
        page leads with a roster, which is a two-column layout that a 300px
        phone shell renders as an unreadable ribbon.
      */}
      <div className="relative mx-auto rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
        <div className="h-9 border-b border-border bg-muted/40 flex items-center gap-1.5 px-4">
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
          <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/20" />
          <span className="ml-3 text-[10px] font-mono text-muted-foreground/50 truncate">
            {firm.subdomainSelection.subdomain
              ? `${firm.subdomainSelection.subdomain}.wokil.com`
              : 'your-firm.wokil.com'}
          </span>
        </div>

        <div className="h-[560px] overflow-y-auto overflow-x-hidden bg-white">
          {!hasFirmName ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-primary opacity-40" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">
                Ready to build your firm&apos;s site?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium max-w-xs">
                Add your firm name to see a real-time preview.
              </p>
            </div>
          ) : (
            <div
              // @container is what the themes' @sm/@lg variants resolve
              // against, so the preview breaks at the frame's width rather
              // than the browser's.
              className="@container origin-top-left"
              style={{
                transform: `scale(${zoom[0]})`,
                width: `${100 / zoom[0]}%`,
                height: `${100 / zoom[0]}%`,
              }}
            >
              <FirmClassicTheme firm={firm} />
            </div>
          )}
        </div>
      </div>
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
