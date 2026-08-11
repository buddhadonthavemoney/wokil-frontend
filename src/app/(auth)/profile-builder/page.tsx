'use client';

import { useState } from 'react';
import { useProfileForm } from '@/hooks/useProfileForm';

import { LawyerProfile } from '@/types/lawyer';
import { PROFILE_STEPS } from '@/components/form/steps';
import { WizardShell } from '@/components/form/WizardShell';
import { ThemeSelector } from '@/components/form/ThemeSelector';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { saveProfile } from '@/generated/wokil-api';
import { useQuery } from '@tanstack/react-query';
import { listThemesOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Scale, Sparkles, Monitor, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

const SAUL_GOODMAN_DATA = {
  basicInformation: {
    fullName: "Saul Goodman",
    professionalTitle: "Attorney at Law",
    lawFirmName: "Goodman, Goodman & McGill",
    yearsOfExperience: 15,
  },
  practiceDetails: {
    areasOfPractice: ["Criminal Defense", "Personal Injury", "Bankruptcy"],
    // Must come from COURT_CATEGORIES — the Practice Details step only lets you
    // pick courts from that list, so free-text sample values were unreachable
    // state the user could never reproduce.
    jurisdictions: ["Supreme Court of Nepal", "High Court Patan", "Kathmandu District Court"],
  },
  contactInformation: {
    phoneNumber: "+977 1 503 4455",
    email: "saul@bettercallsaul.com",
    officeAddress: "160 Kamaladi Marg, Kathmandu 44600",
  },
  professionalProfile: {
    bio: "Did you know that you have rights? The Constitution says you do, and so do I. I believe that until proven guilty, every man, woman, and child in this country is innocent. Better call Saul!",
    officeHours: "9:00 AM - 5:00 PM",
    profilePhoto: "https://cdn.buddhag.com.np/4b16b113-d16b-4f16-982e-4db745aecbcf.png",
  },
  onlinePresence: {
    website: "https://bettercallsaul.com",
    linkedIn: "https://linkedin.com/in/saulgoodman",
  },
  timeline: {
    education: [
      {
        title: "Juris Doctor",
        organization: "University of American Samoa",
        startYear: "1993",
        endYear: "1996",
        description: "Correspondence programme, completed while working full time in the mailroom at HHM.",
      },
    ],
    experience: [
      {
        title: "Mailroom Clerk",
        organization: "Hamlin, Hamlin & McGill",
        startYear: "1992",
        endYear: "1996",
      },
      {
        title: "Solo Practitioner",
        organization: "James M. McGill, Esq.",
        startYear: "1997",
        endYear: "2002",
        description: "Elder law and public defence work, run out of the back of a nail salon.",
      },
      {
        title: "Name Partner",
        organization: "Goodman, Goodman & McGill",
        startYear: "2002",
        current: true,
        description: "Criminal defence, personal injury and bankruptcy for clients across Nepal.",
      },
    ],
  },
  themeSelection: {
    theme: "classic" as const,
  },
  isPublished: false,
};

export default function ProfileBuilder() {
  const {
    profile,
    currentStep,
    totalSteps,
    updateNestedProfile,
    nextStep,
    prevStep,
    saveProfileData,
    setProfile,
    goToStep,
    resetCurrentStep,
  } = useProfileForm();

  const { toast } = useToast();
  const router = useRouter();

  const handleFillSample = () => {
    const key = PROFILE_STEPS[currentStep - 1]?.key;
    if (!key) return;

    setProfile(prev => ({
      ...prev,
      [key]: SAUL_GOODMAN_DATA[key as keyof typeof SAUL_GOODMAN_DATA]
    }));

    toast({
      title: "Step Filled",
      description: `Sample data for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} loaded.`,
    });
  };

  const { data: themesData } = useQuery(listThemesOptions());
  const themes = themesData ?? [];
  const [zoom, setZoom] = useState([1.0]);

  const hasBasicInfo = Boolean(
    profile.basicInformation.fullName &&
    profile.basicInformation.professionalTitle &&
    profile.basicInformation.yearsOfExperience !== undefined
  );

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      await saveProfileData();
      router.push('/preview');
    } else {
      await nextStep();
    }
  };

  return (
    <WizardShell
      icon={<Scale />}
      title="Profile Architect"
      description="Craft your professional presence. Changes update in real-time."
      steps={PROFILE_STEPS}
      currentStep={currentStep}
      data={profile}
      onUpdate={(category, fields) => updateNestedProfile(category, fields)}
      onNext={handleNext}
      onPrev={prevStep}
      onStepClick={goToStep}
      onFillSample={handleFillSample}
      onClear={resetCurrentStep}
    >
      <div className="relative w-full flex justify-center items-center mb-4 px-2 gap-4">
        {/* Theme Selector Popover */}
        <ThemeSelector
          themes={themes}
          currentTheme={profile.themeSelection?.theme}
          onThemeSelect={(themeId) => {
            const updatedProfile: LawyerProfile = {
              ...profile,
              themeSelection: { theme: themeId as LawyerProfile['themeSelection']['theme'] },
            };
            setProfile(updatedProfile);
            saveProfile({ body: updatedProfile, throwOnError: true }).catch((err) => {
              console.error("Theme switch failed to save:", err);
            });
          }}
        />

        {/* Desktop Preview Button */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
          onClick={() => router.push('/preview')}
        >
          <Monitor className="w-3.5 h-3.5" />
          Desktop View
        </Button>
      </div>

      {/* Minimal Zoom Slider */}
      <div className="flex justify-center mb-8 px-4">
        <div className="w-full max-w-[200px] flex items-center gap-3">
          <ZoomOut className="w-3 h-3 text-muted-foreground/40" />
          <Slider
            value={zoom}
            onValueChange={setZoom}
            min={0.5}
            max={1.5}
            step={0.05}
            className="w-full cursor-pointer h-1"
          />
          <ZoomIn className="w-3 h-3 text-muted-foreground/40" />
          <span className="text-[9px] font-mono text-muted-foreground/60 w-8 text-right">{Math.round(zoom[0] * 100)}%</span>
        </div>
      </div>

      {/* Phone Mockup Container */}
      <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
        <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
        <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
        <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
        <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>

        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-card dark:bg-gray-800 relative z-10">
          {!hasBasicInfo ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-card p-8 text-center space-y-4 animate-fade-in">
              <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-2">
                <Sparkles className="w-8 h-8 text-primary opacity-40" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-tight">Ready to build your profile?</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Fill up the basic information to see a real-time preview of your professional site.
              </p>
              <div className="pt-4 flex flex-col gap-2 w-full">
                <div className="h-2 bg-slate-50 rounded-full w-3/4 mx-auto" />
                <div className="h-2 bg-slate-50 rounded-full w-1/2 mx-auto opacity-50" />
              </div>
            </div>
          ) : (
            <ProfilePreview profile={profile} zoom={zoom[0]} />
          )}
        </div>
      </div>
    </WizardShell>
  );
}
