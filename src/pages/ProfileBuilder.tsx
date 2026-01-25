import { useState, useEffect } from 'react';
import { useProfileForm } from '@/hooks/useProfileForm';
import { profile as profileApi } from '@/lib/api';
import { LawyerProfile } from '@/types/lawyer';
import { cn } from '@/lib/utils';
import { ProgressIndicator } from '@/components/form/ProgressIndicator';
import { FormNavigation } from '@/components/form/FormNavigation';
import { BasicInfoStep } from '@/components/form/steps/BasicInfoStep';
import { PracticeDetailsStep } from '@/components/form/steps/PracticeDetailsStep';
import { ContactInfoStep } from '@/components/form/steps/ContactInfoStep';
import { ProfessionalProfileStep } from '@/components/form/steps/ProfessionalProfileStep';
import { OnlinePresenceStep } from '@/components/form/steps/OnlinePresenceStep';
import { ThemeSelectionStep } from '@/components/form/steps/ThemeSelectionStep';
import { SubdomainSelectionStep } from '@/components/form/steps/SubdomainSelectionStep';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { QRCodeCard } from '@/components/preview/QRCodeCard';
import { Button } from '@/components/ui/button';
import { Scale, Eye, ArrowLeft, Check, ExternalLink, Copy, LayoutDashboard, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';

const STEP_NAMES = [
  'Basic Info',
  'Practice',
  'Contact',
  'Profile',
  'Online',
  'Theme',
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
  } = useProfileForm();



  const handleFillSample = () => {
    setProfile(prev => ({
      ...prev,
      ...SAUL_GOODMAN_DATA,
      id: prev.id, // Keep existing ID
    }));
    toast({
      title: "Sample Data Loaded",
      description: "Saul Goodman's profile has been loaded. Better call Saul!",
    });
  };

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState("Initializing...");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const loadPreviewData = async () => {
    setLoadingPreview(true);
    try {
      const html = await fetchPreview();
      setPreviewHtml(html);
    } catch (err) {
      console.error("Failed to load preview", err);
    } finally {
      setLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isPreviewMode) {
      loadPreviewData();
    }
  }, [isPreviewMode, fetchPreview]);

  const handleThemeChange = async (newTheme: LawyerProfile['themeSelection']['theme']) => {
    // Construct the updated profile immediately to avoid state closure issues
    const updatedProfile: LawyerProfile = {
      ...profile,
      themeSelection: { theme: newTheme }
    };

    // 1. Optimistically update local state
    setProfile(updatedProfile);
    
    setLoadingPreview(true);
    try {
      // 2. Persist to backend immediately
      await profileApi.save(updatedProfile);
      
      // 3. Add a small artificial delay so the transition doesn't feel jittery
      await new Promise(resolve => setTimeout(resolve, 400));

      // 4. Fetch new preview HTML
      const html = await fetchPreview();
      setPreviewHtml(html);

      toast({
        title: "Theme Updated",
        description: `Switched to ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} theme.`,
      });
    } catch (err) {
      console.error("Theme switch failed:", err);
      toast({
        title: "Update Failed",
        description: "Could not switch theme. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoadingPreview(false);
    }
  };

  const THEMES = [
    { id: 'classic', name: 'Classic' },
    { id: 'modern', name: 'Modern' },
    { id: 'minimal', name: 'Minimal' },
    { id: 'executive', name: 'Executive' },
    { id: 'legal-craft', name: 'Legal Craft' },
  ] as const;

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      // Trigger deployment initialization
      await publishProfile();

      // Navigate to dashboard immediately with deploying state
      navigate('/dashboard', {
        state: {
          deploying: true, // Signal to start tracking deployment
        }
      });

    } catch (err: any) {
      console.error("Publish failed:", err);
      toast({
        title: "Publish Failed",
        description: err.message || "There was an error initiating publication.",
        variant: "destructive",
      });
      setIsPublishing(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep 
            profile={profile} 
            onUpdate={(fields) => updateNestedProfile('basicInformation', fields)} 
            onFillSample={handleFillSample}
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
        return <ThemeSelectionStep profile={profile} onUpdate={(fields) => updateNestedProfile('themeSelection', fields)} />;
      case 7:
        return <SubdomainSelectionStep profile={profile} onUpdate={(fields) => updateNestedProfile('subdomainSelection', fields)} />;
      default:
        return null;
    }
  };

  const handleNext = async () => {
    if (currentStep === totalSteps) {
      await saveProfileData();
      setIsPreviewMode(true);
    } else {
      await nextStep();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isPreviewMode) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA') return;
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, isPreviewMode]);

  if (isPreviewMode) {
    return (
      <div className="fixed inset-0 z-[100] bg-background overflow-hidden">
        <div className="fixed top-0 left-0 right-0 z-[60] bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => setIsPreviewMode(false)}
              className="gap-2 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Editor
            </Button>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Live Preview</span>
            </div>
            <Button
              onClick={handlePublish}
              disabled={isPublishing}
              className="gap-2 font-bold text-xs uppercase tracking-widest px-6 shadow-lg shadow-primary/20"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Publish Now
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="pt-[73px] h-full">
          {loadingPreview ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Scale className="w-12 h-12 text-primary animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Generating Professional Site...</p>
            </div>
          ) : (
            <ProfilePreview profile={profile} html={previewHtml} />
          )}
        </div>

        {/* Theme Switcher Overlay */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70]">
          <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-2 flex items-center gap-1 shadow-primary/10">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id as any)}
                disabled={loadingPreview}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                  loadingPreview && "opacity-50 cursor-not-allowed",
                  profile.themeSelection?.theme === t.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <PageHeader 
          icon={<Scale />}
          title="Profile Architect"
          description="Craft your professional online presence step by step."
        />
        <div className="space-y-8">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={STEP_NAMES}
            onStepClick={goToStep}
          />

          <div className="bg-white border-none rounded-2xl p-8 md:p-10 shadow-premium animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-primary/10" />
            <div className="relative">
              {renderCurrentStep()}

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
      </main>
    </div>
  );
}
