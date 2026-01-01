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
  fullName: '',
  professionalTitle: '',
  lawFirmName: '',
  yearsOfExperience: 0,
  areasOfPractice: [],
  jurisdictions: [],
  phoneNumber: '',
  email: '',
  officeAddress: '',
  bio: '',
  officeHours: '',
  profilePhoto: '',
  website: '',
  linkedIn: '',
  theme: 'classic',
  isPublished: false,
};

export function useProfileForm() {
  const totalSteps = 6;
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Check if we're editing an existing profile
  const [profile, setProfile] = useState<LawyerProfile>(() => {
    return {
      ...initialProfile,
      id: generateId(),
      slug: '',
    };
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
        // Merge with initial to ensure all fields exist
        setProfile(prev => ({
          ...prev,
          ...data,
          // Ensure arrays are initialized if null from backend
          areasOfPractice: data.areasOfPractice || [],
          jurisdictions: data.jurisdictions || [],
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

  const updateMultipleFields = useCallback((fields: Partial<LawyerProfile>) => {
    setProfile(prev => ({ ...prev, ...fields }));
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

  const publishProfile = useCallback(async (generatedHtml?: string) => {
    // If editing an existing profile, keep the same slug
    const slug = profile.slug || generateSlug(profile.fullName);
    let updatedProfile: LawyerProfile = {
      ...profile,
      slug,
      isPublished: true,
      publishedAt: profile.publishedAt || new Date().toISOString(),
      generatedHtml,
    };

    setProfile(updatedProfile);

    try {
      await profileApi.save(updatedProfile);
      if (generatedHtml) {
        const { url } = await siteApi.deploy({
          html: generatedHtml,
          slug
        });
        if (url) {
          updatedProfile = { ...updatedProfile, siteUrl: url };
          setProfile(updatedProfile);
          // Also save again with the siteUrl
          await profileApi.save(updatedProfile);
        }
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

  return {
    profile,
    currentStep,
    totalSteps,
    loading,
    updateProfile,
    updateMultipleFields,
    nextStep,
    prevStep,
    goToStep,
    publishProfile,
  };
}
