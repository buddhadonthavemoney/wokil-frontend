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
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h1 className="heading-section text-foreground mb-4">Your Profile is Live!</h1>
          <p className="text-muted-foreground mb-8">
            Share your professional profile with potential clients.
          </p>

          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground mb-2">Your profile URL:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted px-3 py-2 rounded text-sm break-all text-foreground">
                {getPublicUrl()}
              </code>
              <Button variant="outline" size="icon" onClick={copyUrl}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={() => navigate('/dashboard')} className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Button>
            <Button variant="outline" onClick={() => window.open(`/p/${publishedSlug}`, '_blank')} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              View Profile
            </Button>
          </div>

          <div className="mt-8">
            <QRCodeCard profile={profile} />
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
        <div className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => setIsPreviewMode(false)} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Edit Profile
            </Button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span className="text-sm font-medium">Preview Mode</span>
            </div>
            <Button onClick={handlePublish} className="gap-2">
              <Check className="w-4 h-4" />
              Publish Profile
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="pt-16" ref={previewRef}>
          <ProfilePreview profile={profile} />
        </div>

        {/* QR Code Overlay */}
        <div className="fixed bottom-6 right-6 z-40">
          <QRCodeCard profile={profile} />
        </div>
      </div>
    );
  }

  // Form Mode
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-foreground">LawyerProfile</h1>
              <p className="text-sm text-muted-foreground">Build your professional website</p>
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
              className="text-muted-foreground hover:text-foreground"
            >
              Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-2xl">
        <ProgressIndicator
          currentStep={currentStep}
          totalSteps={totalSteps}
          steps={STEP_NAMES}
        />

        <div className="bg-card border border-border rounded-xl p-8 shadow-card">
          {renderCurrentStep()}

          <FormNavigation
            currentStep={currentStep}
            totalSteps={totalSteps}
            onNext={handleNext}
            onPrev={prevStep}
          />
        </div>
      </main>
    </div>
  );
}
