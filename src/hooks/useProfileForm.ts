import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LawyerProfile } from '@/types/lawyer';
import { saveProfile, deploySite } from '@/generated/wokil-api';
import { getProfileOptions } from '@/generated/wokil-api/@tanstack/react-query.gen';
import { useToast } from '@/hooks/use-toast';
import { createBlankLawyerProfile, toLawyerProfile } from '@/lib/lawyer-profile-adapter';
import { PROFILE_STEPS } from '@/components/form/steps';

/** Found by key so reordering the wizard cannot mislocate the locked step. */
const SUBDOMAIN_STEP = PROFILE_STEPS.findIndex((s) => s.key === 'subdomainSelection') + 1;

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 8);
};

const generateId = (): string => {
  return 'profile-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
};

// Same blank profile the adapter falls back to. Every optional field it omits
// (lawFirmName, profilePhoto, website, linkedIn) is already guarded with `|| ''`
// at its input, so the steps stay controlled.
const initialProfile = createBlankLawyerProfile();

export function useProfileForm() {
  const totalSteps = PROFILE_STEPS.length;
  const { toast } = useToast();

  const [profile, setProfile] = useState<LawyerProfile>(() => {
    return { ...initialProfile, id: generateId() };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const lastSavedProfile = useRef(JSON.stringify(profile));
  const seeded = useRef(false);

  const { data: fetchedProfile, isLoading: loading } = useQuery({
    ...getProfileOptions(),
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  });

  /* eslint-disable react-hooks/set-state-in-effect -- seeding local state from query cache once */
  useEffect(() => {
    if (!fetchedProfile || seeded.current) return;
    seeded.current = true;
    setProfile(prev => toLawyerProfile(fetchedProfile, prev));
    if (fetchedProfile.slug) {
      setCurrentStep(fetchedProfile.professionalProfile?.deploymentURL ? totalSteps - 1 : totalSteps);
    }
  }, [fetchedProfile, totalSteps]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!loading) {
      lastSavedProfile.current = JSON.stringify(profile);
    }
  }, [loading]);

  // Handle manual saves
  const saveProfileData = useCallback(async () => {
    const currentProfileJson = JSON.stringify(profile);
    if (currentProfileJson === lastSavedProfile.current) return;

    try {
      const dataToSave: Partial<LawyerProfile> = { ...profile };
      if (profile.professionalProfile?.deploymentURL) {
        delete dataToSave.subdomainSelection;
      }

      await saveProfile({ body: dataToSave as LawyerProfile, throwOnError: true });
      lastSavedProfile.current = currentProfileJson;
    } catch (error) {
      console.error("Failed to auto-save profile:", error);
    }
  }, [profile]);

  const updateProfile = useCallback(<K extends keyof LawyerProfile>(
    field: K,
    value: LawyerProfile[K]
  ) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateNestedProfile = useCallback(<K extends keyof Omit<LawyerProfile, 'id' | 'slug' | 'isPublished' | 'publishedAt' | 'siteUrl'>>(
    category: K,
    fields: Partial<LawyerProfile[K]>
  ) => {
    setProfile(prev => ({
      ...prev,
      [category]: { ...(prev[category] as object), ...fields }
    }));
  }, []);

  const nextStep = useCallback(async () => {
    await saveProfileData();
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps, saveProfileData]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), totalSteps));
  }, [totalSteps]);

  const publishProfile = useCallback(async () => {
    // Priority: Nested subdomain > existing slug > generated slug
    const finalSlug = profile.subdomainSelection?.subdomain || profile.slug || generateSlug(profile.basicInformation.fullName);

    // Deliberately does NOT set isPublished/siteUrl here. Both are derived
    // server-side from the sites table (the API strips them on write), and
    // deploySite below only *queues* the deploy - the DNS record is created
    // several steps later. Claiming "live" now enables "View Site" while the
    // name still NXDOMAINs, and one click (or the browser omnibox resolving
    // as you type) caches that miss for the zone's 30-minute SOA minimum,
    // leaving the site unreachable from that machine long after it is up.
    // The deploy stream's terminal event refetches the profile for the truth.
    const updatedProfile: LawyerProfile = {
      ...profile,
      slug: finalSlug,
      subdomainSelection: {
        ...profile.subdomainSelection,
        subdomain: finalSlug
      },
      publishedAt: profile.publishedAt || new Date().toISOString(),
    };

    setProfile(updatedProfile);

    try {
      const dataToSave: Partial<LawyerProfile> = { ...updatedProfile };
      if (profile.professionalProfile?.deploymentURL) {
        delete dataToSave.subdomainSelection;
      }
      await saveProfile({ body: dataToSave as LawyerProfile, throwOnError: true });

      // Only queues the deploy - progress arrives on the deploy stream
      // (see useDeployStream / DeployProgressModal), which refetches the
      // profile once the backend confirms DNS resolves. No second save:
      // siteUrl is derived server-side, so writing it back is a no-op.
      await deploySite({ throwOnError: true });
      return finalSlug;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to publish profile.",
        variant: "destructive"
      });
      return finalSlug;
    }
  }, [profile, toast]);

  /**
   * The subdomain is frozen server-side once a site is deployed, so its step
   * becomes read-only — and, being last, it also moves where the wizard ends.
   * Derived here so the builder page and the shell can't answer differently.
   */
  const lockedSteps = useMemo(
    () => (profile.professionalProfile?.deploymentURL ? [SUBDOMAIN_STEP] : []),
    [profile.professionalProfile?.deploymentURL]
  );
  // The subdomain is the last step, so a locked tail is exactly one step:
  // finishing one short of the end.
  const finishStep = lockedSteps.includes(totalSteps) ? totalSteps - 1 : totalSteps;

  const resetProfile = useCallback(() => {
    // Spread first: initialProfile now carries id/slug, so keeping the existing
    // id (to overwrite the same record if saved) means overriding after it.
    setProfile({ ...initialProfile, id: profile.id });


    toast({
      title: "Selection Cleared",
      description: "All entered data has been removed.",
    });
  }, [profile.id, toast]);

  const resetCurrentStep = useCallback(() => {
    const key = PROFILE_STEPS[currentStep - 1]?.key;
    if (key) {
      setProfile(prev => ({
        ...prev,
        [key]: initialProfile[key]
      }));
      
      toast({
        title: "Step Cleared",
        description: `Reset ${key.replace(/([A-Z])/g, ' $1').toLowerCase()} to initial state.`,
      });
    }
  }, [currentStep, toast]);

  return {
    profile,
    currentStep,
    totalSteps,
    lockedSteps,
    finishStep,
    loading,
    updateProfile,
    updateNestedProfile,
    nextStep,
    prevStep,
    goToStep,
    publishProfile,
    saveProfileData,
    setProfile,
    resetProfile,
    resetCurrentStep,
  };
}
