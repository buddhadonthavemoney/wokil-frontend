import { useState, useCallback, useEffect, useRef } from 'react';
import { LawyerProfile } from '@/types/lawyer';
import { profile as profileApi, site as siteApi } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 8);
};

const generateId = (): string => {
  return 'profile-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
};

const initialProfile: Omit<LawyerProfile, 'id' | 'slug'> = {
  basicInformation: {
    fullName: '',
    professionalTitle: '',
    lawFirmName: '',
    yearsOfExperience: 0,
  },
  practiceDetails: {
    areasOfPractice: [],
    jurisdictions: [],
  },
  contactInformation: {
    phoneNumber: '',
    email: '',
    officeAddress: '',
  },
  professionalProfile: {
    bio: '',
    officeHours: '',
    profilePhoto: '',
  },
  onlinePresence: {
    website: '',
    linkedIn: '',
  },
  themeSelection: {
    theme: 'classic',
  },
  subdomainSelection: {
    subdomain: '',
  },
  isPublished: false,
};

export function useProfileForm() {
  const totalSteps = 6;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Check if we're editing an existing profile
  const [profile, setProfile] = useState<LawyerProfile>(() => {
    return {
      id: generateId(),
      slug: '',
      ...initialProfile,
    } as LawyerProfile;
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

      await profileApi.save(dataToSave as LawyerProfile);
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
        const data = await profileApi.get();
        // Merge with initial to ensure all nested fields exist
        setProfile(prev => ({
          ...prev,
          ...data,
          basicInformation: { ...prev.basicInformation, ...data.basicInformation },
          practiceDetails: {
            ...prev.practiceDetails,
            ...data.practiceDetails,
            areasOfPractice: data.practiceDetails?.areasOfPractice || [],
            jurisdictions: data.practiceDetails?.jurisdictions || [],
          },
          contactInformation: { ...prev.contactInformation, ...data.contactInformation },
          professionalProfile: { ...prev.professionalProfile, ...data.professionalProfile },
          onlinePresence: { ...prev.onlinePresence, ...data.onlinePresence },
          themeSelection: { ...prev.themeSelection, ...data.themeSelection },
          subdomainSelection: { ...prev.subdomainSelection, ...data.subdomainSelection },
        }));
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

    let updatedProfile: LawyerProfile = {
      ...profile,
      slug: finalSlug,
      subdomainSelection: {
        ...profile.subdomainSelection,
        subdomain: finalSlug
      },
      isPublished: true,
      publishedAt: profile.publishedAt || new Date().toISOString(),
    };

    setProfile(updatedProfile);

    try {
      const dataToSave = { ...updatedProfile };
      if (profile.professionalProfile?.deploymentURL) {
        delete (dataToSave as any).subdomainSelection;
      }
      await profileApi.save(dataToSave as LawyerProfile);

      const { url } = await siteApi.deploy({ slug: finalSlug });

      if (url) {
        const finalProfile = { ...updatedProfile, siteUrl: url };
        setProfile(finalProfile);
        // Also save again with the siteUrl
        const finalDataToSave = { ...finalProfile };
        if (profile.professionalProfile?.deploymentURL || finalProfile.professionalProfile?.deploymentURL) {
          delete (finalDataToSave as any).subdomainSelection;
        }
        await profileApi.save(finalDataToSave as LawyerProfile);
      }
      return updatedProfile.siteUrl || finalSlug;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to publish profile.",
        variant: "destructive"
      });
      return finalSlug;
    }
  }, [profile, toast]);

  const fetchPreview = useCallback(async () => {
    try {
      return await siteApi.getPreview();
    } catch (err) {
      console.error("Failed to fetch preview:", err);
      return "";
    }
  }, []);

  const resetProfile = useCallback(() => {
    setProfile({
      id: profile.id, // Keep the same ID so we overwrite the same record if saved
      slug: '',
      ...initialProfile,
    } as LawyerProfile);
    
    toast({
      title: "Selection Cleared",
      description: "All entered data has been removed.",
    });
  }, [profile.id, toast]);

  const resetCurrentStep = useCallback(() => {
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
    fetchPreview,
    saveProfileData,
    setProfile,
    resetProfile,
    resetCurrentStep,
  };
}
