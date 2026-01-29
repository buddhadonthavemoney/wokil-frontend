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
import { profile as profileApi, site as siteApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Scale, ArrowLeft, Trash2, Sparkles, Loader2, Monitor } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
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
    theme: "modern" as const,
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
    fetchPreview,
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
  const navigate = useNavigate();

  const [previewHtml, setPreviewHtml] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [themes, setThemes] = useState<string[]>([]);

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const data = await siteApi.getThemes();
        setThemes(data);
      } catch (err) {
        console.error("Failed to fetch themes", err);
      }
    };
    loadThemes();
  }, []);

  useEffect(() => {
    const loadPreview = async () => {
      // Only load if we have some basic info
      if (!profile.basicInformation.fullName) return;
      
      setIsLoadingPreview(true);
      try {
        const html = await fetchPreview();
        setPreviewHtml(html);
      } catch (err) {
        console.error("Failed to load live preview", err);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    // Debounce slightly to avoid rapid updates if user clicks fast
    const timer = setTimeout(loadPreview, 500);
    return () => clearTimeout(timer);
  }, [currentStep, fetchPreview, profile.basicInformation.fullName]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

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
      navigate('/preview');
    } else {
      await nextStep();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA') return;
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

            <div className="bg-white border-none rounded-3xl p-6 md:p-8 shadow-premium animate-fade-in relative overflow-hidden h-[600px] flex flex-col">
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
            <div className="relative overflow-y-auto flex-1 pr-2 -mr-2">
              {renderCurrentStep()}

              <div className="mt-8">
                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={handleNext}
                  onPrev={prevStep}
                />
              </div>
            </div>
          </div>

            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
              Step {currentStep} of {totalSteps} • Your progress is saved automatically
            </p>
          </div>

          <div className="lg:col-span-5 w-full sticky top-6 hidden lg:block">
            <div className="relative w-full flex justify-center items-center mb-6 px-2 gap-4">
              {/* Theme Selector Popover */}
              <ThemeSelector
                themes={themes}
                currentTheme={profile.themeSelection?.theme}
                isLoading={isLoadingPreview}
                onThemeSelect={async (themeId) => {
                  const updatedProfile = { ...profile, themeSelection: { theme: themeId as any } };
                  setProfile(updatedProfile);
                  await profileApi.save(updatedProfile);
                  setIsLoadingPreview(true);
                  try {
                      const html = await fetchPreview();
                      setPreviewHtml(html);
                  } finally {
                      setIsLoadingPreview(false);
                  }
                }}
              />

               {/* Desktop Preview Button */}
               <Button
                variant="ghost"
                size="sm"
                className="gap-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                onClick={() => navigate('/preview')}
              >
                <Monitor className="w-3.5 h-3.5" />
                Desktop View
              </Button>
            </div>

            {/* Phone Mockup Container */}
            <div className="relative mx-auto border-gray-800 dark:border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-xl">
              <div className="w-[148px] h-[18px] bg-gray-800 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-20"></div>
              <div className="h-[32px] w-[3px] bg-gray-800 absolute -start-[17px] top-[72px] rounded-s-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[124px] rounded-s-lg"></div>
              <div className="h-[46px] w-[3px] bg-gray-800 absolute -start-[17px] top-[178px] rounded-s-lg"></div>
              <div className="h-[64px] w-[3px] bg-gray-800 absolute -end-[17px] top-[142px] rounded-e-lg"></div>
              
              <div className="rounded-[2rem] overflow-hidden w-full h-full bg-white dark:bg-gray-800 relative z-10">
                 {isLoadingPreview && !previewHtml ? (
                   <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 text-muted-foreground gap-2">
                     <Loader2 className="w-8 h-8 animate-spin opacity-20" />
                     <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Rendering...</span>
                   </div>
                 ) : (
                   <ProfilePreview profile={profile} html={previewHtml} />
                 )}
                 
                 {/* Loading Overlay for updates */}
                 {isLoadingPreview && previewHtml && (
                   <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center z-30 animate-fade-in">
                     <Loader2 className="w-6 h-6 animate-spin text-primary" />
                   </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
