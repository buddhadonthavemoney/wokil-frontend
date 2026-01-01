import { useState, useEffect, useRef } from 'react';
import { useProfileForm } from '@/hooks/useProfileForm';
import { ProgressIndicator } from '@/components/form/ProgressIndicator';
import { FormNavigation } from '@/components/form/FormNavigation';
import { BasicInfoStep } from '@/components/form/steps/BasicInfoStep';
import { PracticeDetailsStep } from '@/components/form/steps/PracticeDetailsStep';
import { ContactInfoStep } from '@/components/form/steps/ContactInfoStep';
import { ProfessionalProfileStep } from '@/components/form/steps/ProfessionalProfileStep';
import { OnlinePresenceStep } from '@/components/form/steps/OnlinePresenceStep';
import { ThemeSelectionStep } from '@/components/form/steps/ThemeSelectionStep';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { QRCodeCard } from '@/components/preview/QRCodeCard';
import { Button } from '@/components/ui/button';
import { Scale, Eye, ArrowLeft, Check, ExternalLink, Copy, LayoutDashboard, LogIn } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { auth } from '@/lib/api';

const STEP_NAMES = [
  'Basic Info',
  'Practice',
  'Contact',
  'Profile',
  'Online',
  'Theme',
];

export default function ProfileBuilder() {
  const {
    profile,
    currentStep,
    totalSteps,
    updateProfile,
    nextStep,
    prevStep,
    publishProfile,
  } = useProfileForm();

  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState('');
  const previewRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigate('/');
    }
  }, [navigate]);

  const handlePublish = () => {
    const htmlSnippet = previewRef.current?.innerHTML || '';
    const slug = publishProfile(htmlSnippet);
    setPublishedSlug(slug);
    setIsPublished(true);
    toast({
      title: "Profile Published!",
      description: "Your professional profile is now live.",
    });
  };

  const getPublicUrl = () => {
    return `${window.location.origin}/p/${publishedSlug}`;
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(getPublicUrl());
    toast({
      title: "URL Copied!",
      description: "The profile URL has been copied to your clipboard.",
    });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep profile={profile} onUpdate={updateProfile} />;
      case 2:
        return <PracticeDetailsStep profile={profile} onUpdate={updateProfile} />;
      case 3:
        return <ContactInfoStep profile={profile} onUpdate={updateProfile} />;
      case 4:
        return <ProfessionalProfileStep profile={profile} onUpdate={updateProfile} />;
      case 5:
        return <OnlinePresenceStep profile={profile} onUpdate={updateProfile} />;
      case 6:
        return <ThemeSelectionStep profile={profile} onUpdate={updateProfile} />;
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (currentStep === totalSteps) {
      setIsPreviewMode(true);
    } else {
      nextStep();
    }
  };

  // Published State
  if (isPublished) {
    return (
      <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 flex items-center justify-center p-6">
        <div className="max-w-xl w-full text-center space-y-10 animate-fade-in">
          <div className="relative inline-block">
            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center mx-auto shadow-2xl shadow-primary/40 relative z-10">
              <Check className="w-12 h-12 text-primary-foreground stroke-[3]" />
            </div>
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl animate-pulse" />
          </div>

          <div className="space-y-4">
            <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground">Congratulations!</h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Your professional digital identity is officially live and ready to attract clients.
            </p>
          </div>

          <div className="bg-white border-none shadow-premium rounded-2xl p-8 space-y-6">
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-primary/60">Your Public URL</p>
              <div className="flex items-center gap-2 bg-muted p-3 rounded-xl border border-border/50">
                <code className="flex-1 text-sm font-medium break-all text-primary/80">
                  {getPublicUrl()}
                </code>
                <button
                  onClick={copyUrl}
                  className="p-2 hover:bg-white rounded-lg transition-all shadow-sm active:scale-95"
                  title="Copy Link"
                >
                  <Copy className="w-4 h-4 text-primary" />
                </button>
              </div>
            </div>

            <div className="pt-2">
              <QRCodeCard profile={profile} />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto gap-2 px-8 py-6 rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open(`/p/${publishedSlug}`, '_blank')}
              className="w-full sm:w-auto gap-2 px-8 py-6 rounded-xl font-bold text-sm uppercase tracking-widest border-2 hover:bg-muted transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              View Website
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Preview Mode
  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-background">
        {/* Preview Header */}
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
              className="gap-2 font-bold text-xs uppercase tracking-widest px-6 shadow-lg shadow-primary/20"
            >
              <Check className="w-4 h-4" />
              Publish Now
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="pt-20" ref={previewRef}>
          <ProfilePreview profile={profile} />
        </div>

        {/* QR Code Overlay */}
        <div className="fixed bottom-6 right-6 z-40 scale-90 origin-bottom-right hover:scale-100 transition-transform">
          <QRCodeCard profile={profile} />
        </div>
      </div>
    );
  }

  // Form Mode
  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Scale className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg leading-tight text-foreground">Wokil</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Profile Architect</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('token');
                navigate('/');
              }}
              className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <div className="space-y-8">
          <ProgressIndicator
            currentStep={currentStep}
            totalSteps={totalSteps}
            steps={STEP_NAMES}
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
