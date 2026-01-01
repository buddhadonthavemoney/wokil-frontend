import { useState, useCallback, useEffect } from 'react';
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

  // Fetch profile on mount
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
      [category]: { ...prev[category], ...fields }
    }));
  }, []);

  // Better approach for auto-save:
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const timer = setTimeout(async () => {
      try {
        await profileApi.save(profile);
      } catch (error) {
        console.error("Failed to save profile", error);
      }
    }, 1000); // 1s debounce

    return () => clearTimeout(timer);
  }, [profile]); // Triggers on every profile change

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), totalSteps));
  }, [totalSteps]);

  const publishProfile = useCallback(async () => {
    // If editing an existing profile, keep the same slug
    const slug = profile.slug || generateSlug(profile.basicInformation.fullName);
    let updatedProfile: LawyerProfile = {
      ...profile,
      slug,
      isPublished: true,
      publishedAt: profile.publishedAt || new Date().toISOString(),
    };

    setProfile(updatedProfile);

    try {
      await profileApi.save(updatedProfile);
      const { url } = await siteApi.deploy({ slug });

      if (url) {
        updatedProfile = { ...updatedProfile, siteUrl: url };
        setProfile(updatedProfile);
        // Also save again with the siteUrl
        await profileApi.save(updatedProfile);
      }
      return updatedProfile.siteUrl || slug;
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to publish profile.",
        variant: "destructive"
      });
      return slug;
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
  };
}
