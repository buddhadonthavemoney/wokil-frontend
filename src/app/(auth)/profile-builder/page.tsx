'use client';

import { useProfileForm } from '@/hooks/useProfileForm';
import { useRequireAccountType } from '@/hooks/useAccountType';

import { LawyerProfile } from '@/types/lawyer';
import { PROFILE_STEPS } from '@/components/form/steps';
import { WizardShell } from '@/components/form/WizardShell';
import { ThemeSelector } from '@/components/form/ThemeSelector';
import { BuilderPreview } from '@/components/preview/BuilderPreview';
import { ProfilePreview } from '@/components/preview/ProfilePreview';
import { saveProfile } from '@/generated/wokil-api';
import { useQuery } from '@tanstack/react-query';
import { listThemesOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { Scale, Monitor } from 'lucide-react';
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
  // A firm account belongs in the firm wizard; its data lives behind
  // getMyFirm, so this page would show it an empty lawyer profile.
  useRequireAccountType('individual', '/firm-builder');

  const {
    profile,
    currentStep,
    lockedSteps,
    finishStep,
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

  const { data: themesData } = useQuery(listThemesOptions({ query: { category: 'individual' } }));
  const themes = themesData ?? [];

  const hasBasicInfo = Boolean(
    profile.basicInformation.fullName &&
    profile.basicInformation.professionalTitle &&
    profile.basicInformation.yearsOfExperience !== undefined
  );

  const handleNext = async () => {
    // `finishStep`, not the last step: after deployment the subdomain step is
    // locked, so the wizard ends one step earlier.
    if (currentStep >= finishStep) {
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
      lockedSteps={lockedSteps}
    >
      <BuilderPreview
        isEmpty={!hasBasicInfo}
        emptyTitle="Ready to build your profile?"
        emptyDescription="Fill up the basic information to see a real-time preview of your professional site."
        toolbar={
          <>
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

            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
              onClick={() => router.push('/preview')}
            >
              <Monitor className="w-3.5 h-3.5" />
              Desktop View
            </Button>
          </>
        }
      >
        {(zoom) => <ProfilePreview profile={profile} zoom={zoom} />}
      </BuilderPreview>
    </WizardShell>
  );
}
