'use client';

import { useState, useEffect } from 'react';
import { useProfileForm } from '@/hooks/useProfileForm';

import { LawyerProfile } from '@/types/lawyer';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from '@/components/form/ProgressIndicator';
import { FormNavigation } from '@/components/form/FormNavigation';
import { BasicInfoStep } from '@/components/form/steps/BasicInfoStep';
import { PracticeDetailsStep } from '@/components/form/steps/PracticeDetailsStep';
import { ContactInfoStep } from '@/components/form/steps/ContactInfoStep';
import { ProfessionalProfileStep } from '@/components/form/steps/ProfessionalProfileStep';
import { OnlinePresenceStep } from '@/components/form/steps/OnlinePresenceStep';
import { SubdomainSelectionStep } from '@/components/form/steps/SubdomainSelectionStep';
import { ThemeSelector } from '@/components/form/ThemeSelector';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { saveProfile } from '@/generated/wokil-api';
import { useQuery } from '@tanstack/react-query';
import { listThemesOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Scale, ArrowLeft, Trash2, Sparkles, Monitor, ZoomIn, ZoomOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/layout/PageHeader';

const STEP_NAMES = [
  'Basic Info',
  'Practice',
  'Contact',
  'Profile',
  'Online',
  'Subdomain',
];

const SAUL_GOODMAN_DATA = {
  basicInformation: {
    fullName: "Saul Goodman",
    professionalTitle: "Attorney at Law",
    lawFirmName: "Goodman, Goodman & McGill",
    yearsOfExperience: 15,
  },
  practiceDetails: {
    areasOfPractice: ["Criminal Defense", "Personal Injury", "Bankruptcy"],
    jurisdictions: ["New Mexico", "Federal Courts"],
  },
  contactInformation: {
    phoneNumber: "(505) 503-4455",
    email: "saul@bettercallsaul.com",
    officeAddress: "160 San Juan Blvd, Albuquerque, NM 87102",
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
    updateProfile,
    updateNestedProfile,
    nextStep,
    prevStep,
    publishProfile,
    saveProfileData,
    setProfile,
    goToStep,
    resetProfile,
    resetCurrentStep,
  } = useProfileForm();

  const handleFillSample = () => {
    const stepKeys: (keyof Omit<LawyerProfile, 'id' | 'slug' | 'isPublished' | 'publishedAt' | 'siteUrl'>)[] = [
      'basicInformation',
      'practiceDetails',
      'contactInformation',
      'professionalProfile',
      'onlinePresence',
      'subdomainSelection'
    ];
    
    const key = stepKeys[currentStep - 1];
    if (key) {
      setProfile(prev => ({
        ...prev,
        [key]: SAUL_GOODMAN_DATA[key as keyof typeof SAUL_GOODMAN_DATA]
      }));
      
      toast({
        title: "Step Filled",
        description: `Sample data for ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} loaded.`,
      });
    }
  };

  const { toast } = useToast();
  const router = useRouter();

  const { data: themesData } = useQuery(listThemesOptions());
  const themes = themesData ?? [];
  const [zoom, setZoom] = useState([1.0]);

  const hasBasicInfo = Boolean(
    profile.basicInformation.fullName &&
    profile.basicInformation.professionalTitle &&
    profile.basicInformation.yearsOfExperience !== undefined
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            profile={profile} 
            onUpdate={(fields) => updateNestedProfile('basicInformation', fields)} 
          />
        );
      case 2:
        return <PracticeDetailsStep profile={profile} onUpdate={(fields) => updateNestedProfile('practiceDetails', fields)} />;
      case 3:
        return <ContactInfoStep profile={profile} onUpdate={(fields) => updateNestedProfile('contactInformation', fields)} />;
      case 4:
        return <ProfessionalProfileStep profile={profile} onUpdate={(fields) => updateNestedProfile('professionalProfile', fields)} />;
      case 5:
        return <OnlinePresenceStep profile={profile} onUpdate={(fields) => updateNestedProfile('onlinePresence', fields)} />;
      case 6:
        return <SubdomainSelectionStep profile={profile} onUpdate={(fields) => updateNestedProfile('subdomainSelection', fields)} />;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      await saveProfileData();
      router.push('/preview');
    } else {
      await nextStep();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA' || target.hasAttribute('data-prevent-navigation')) return;
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext]);

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-10">
      <main className="container mx-auto px-6 py-6 max-w-7xl">
        <PageHeader 
          icon={<Scale />}
          title="Profile Architect"
          description="Craft your professional presence. Changes update in real-time."
          className="mb-8"
        />

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Form Builder */}
          <div className="lg:col-span-7 space-y-6">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={STEP_NAMES}
              onStepClick={goToStep}
            />

            <div className="bg-white border-none rounded-3xl p-6 md:p-8 shadow-premium animate-fade-in relative overflow-hidden min-h-[400px] max-h-[600px] flex flex-col">
              <div className="flex items-center justify-end gap-3 mb-4 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFillSample}
                disabled={currentStep === totalSteps}
                className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Fill Sample Data
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetCurrentStep}
                disabled={currentStep === totalSteps}
                className="h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
            <div className="relative overflow-y-auto flex-1 no-scrollbar px-1.5">
              {renderCurrentStep()}
            </div>

            <div className="mt-8 pt-6 border-t border-border/50 shrink-0">
              <FormNavigation
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                onPrev={prevStep}
              />
            </div>
          </div>

            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
              Step {currentStep} of {totalSteps} • Your progress is saved automatically
            </p>
          </div>

          <div className="lg:col-span-5 w-full sticky top-6 hidden lg:block">
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
              
              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800 relative z-10">
                 {!hasBasicInfo ? (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-white p-8 text-center space-y-4 animate-fade-in">
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
          </div>
        </div>
      </main>
    </div>
  );
}
