import { useState, useEffect } from 'react';
import { useProfileForm } from '@/hooks/useProfileForm';
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

  useEffect(() => {
    let isMounted = true;
    if (isPreviewMode) {
      const loadPreview = async () => {
        setLoadingPreview(true);
        try {
          const html = await fetchPreview();
          if (isMounted) {
            setPreviewHtml(html);
          }
        } catch (err) {
          console.error("Failed to load preview", err);
        } finally {
          if (isMounted) {
            setLoadingPreview(false);
          }
        }
      };
      loadPreview();
    }
    return () => { isMounted = false; };
  }, [isPreviewMode, fetchPreview]);

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
      <div className="fixed inset-0 z-[100] bg-background overflow-auto">
        <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border shadow-sm">
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

        <div className="pt-20">
          {loadingPreview ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
              <Scale className="w-12 h-12 text-primary animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Generating Professional Site...</p>
            </div>
          ) : (
            <ProfilePreview profile={profile} html={previewHtml} />
          )}
        </div>

        {/* <div className="fixed bottom-6 right-6 z-40 scale-90 origin-bottom-right hover:scale-100 transition-transform">
          <QRCodeCard profile={profile} />
        </div> */}
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
