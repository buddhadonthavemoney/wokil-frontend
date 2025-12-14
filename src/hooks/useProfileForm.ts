import { useState, useCallback } from 'react';
import { LawyerProfile } from '@/types/lawyer';

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
  
  // Check if we're editing an existing profile
  const [profile, setProfile] = useState<LawyerProfile>(() => {
    const editingSlug = sessionStorage.getItem('editingProfileSlug');
    if (editingSlug) {
      const profiles = JSON.parse(localStorage.getItem('lawyerProfiles') || '{}');
      const existingProfile = profiles[editingSlug];
      if (existingProfile) {
        // Clear the editing flag so it doesn't persist
        sessionStorage.removeItem('editingProfileSlug');
        return existingProfile;
      }
    }
    return {
      ...initialProfile,
      id: generateId(),
      slug: '',
    };
  });
  
  // If editing (profile has a slug), start at the last step
  const [currentStep, setCurrentStep] = useState(() => {
    return profile.slug ? totalSteps : 1;
  });

  const updateProfile = useCallback(<K extends keyof LawyerProfile>(
    field: K,
    value: LawyerProfile[K]
  ) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateMultipleFields = useCallback((fields: Partial<LawyerProfile>) => {
    setProfile(prev => ({ ...prev, ...fields }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  }, [totalSteps]);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), totalSteps));
  }, [totalSteps]);

  const publishProfile = useCallback(() => {
    // If editing an existing profile, keep the same slug
    const slug = profile.slug || generateSlug(profile.fullName);
    const updatedProfile: LawyerProfile = {
      ...profile,
      slug,
      isPublished: true,
      publishedAt: profile.publishedAt || new Date().toISOString(),
    };
    
    // Save to localStorage
    const profiles = JSON.parse(localStorage.getItem('lawyerProfiles') || '{}');
    profiles[slug] = updatedProfile;
    localStorage.setItem('lawyerProfiles', JSON.stringify(profiles));
    
    setProfile(updatedProfile);
    return slug;
  }, [profile]);

  return {
    profile,
    currentStep,
    totalSteps,
    updateProfile,
    updateMultipleFields,
    nextStep,
    prevStep,
    goToStep,
    publishProfile,
  };
}
