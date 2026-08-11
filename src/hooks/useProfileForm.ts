import { useState, useCallback, useEffect, useRef } from 'react';
import { LawyerProfile } from '@/types/lawyer';
import { getProfile, saveProfile, deploySite } from '@/generated/wokil-api';
import { useToast } from '@/hooks/use-toast';
import { createBlankLawyerProfile, toLawyerProfile } from '@/lib/lawyer-profile-adapter';
import { PROFILE_STEPS, PROFILE_TOTAL_STEPS } from '@/components/form/steps';

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
  const totalSteps = PROFILE_TOTAL_STEPS;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Check if we're editing an existing profile
  const [profile, setProfile] = useState<LawyerProfile>(() => {
    return { ...initialProfile, id: generateId() };
  });

  const [currentStep, setCurrentStep] = useState(1);
  const lastSavedProfile = useRef(JSON.stringify(profile));

  // Initialize lastSavedProfile when data is fetched
  useEffect(() => {
    if (loading === false) {
      lastSavedProfile.current = JSON.stringify(profile);
    }
  }, [loading]); // Only reset when loading state changes (i.e. after initial fetch)

  // Handle manual saves
  const saveProfileData = useCallback(async () => {
    const currentProfileJson = JSON.stringify(profile);
    if (currentProfileJson === lastSavedProfile.current) return;

    try {
      // If already deployed, don't send subdomainSelection as it causes 400 errors
      const dataToSave = { ...profile };
      if (profile.professionalProfile?.deploymentURL) {
        delete (dataToSave as any).subdomainSelection;
      }

      await saveProfile({ body: dataToSave as LawyerProfile, throwOnError: true });
      lastSavedProfile.current = currentProfileJson;
    } catch (error) {
      console.error("Failed to auto-save profile:", error);
    }
  }, [profile]);
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        setLoading(true);
        const data = (await getProfile({ throwOnError: true })).data;
        setProfile(prev => toLawyerProfile(data, prev));
        if (data.slug) {
          setCurrentStep(totalSteps);
        }
      } catch (error) {
        console.error("Failed to fetch profile", error);
        // If 404/empty, that's fine, we start fresh
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

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
      const dataToSave = { ...updatedProfile };
      if (profile.professionalProfile?.deploymentURL) {
        delete (dataToSave as any).subdomainSelection;
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
