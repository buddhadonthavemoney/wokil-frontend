export interface LawyerProfile {
  id: string;
  // Basic Information
  fullName: string;
  professionalTitle: string;
  lawFirmName?: string;
  yearsOfExperience: number;
  
  // Practice Details
  areasOfPractice: string[];
  jurisdictions?: string[];
  
  // Contact Information
  phoneNumber: string;
  email: string;
  officeAddress: string;
  
  // Professional Profile
  bio: string;
  officeHours: string;
  profilePhoto?: string;
  
  // Online Presence
  website?: string;
  linkedIn?: string;
  
  // Theme
  theme: 'classic' | 'modern' | 'minimal';
  
  // Status
  isPublished: boolean;
  publishedAt?: string;
  slug: string;
}

export const PRACTICE_AREAS = [
  'Corporate Law',
  'Criminal Defense',
  'Family Law',
  'Immigration Law',
  'Intellectual Property',
  'Labor & Employment',
  'Personal Injury',
  'Real Estate',
  'Tax Law',
  'Estate Planning',
  'Bankruptcy',
  'Civil Litigation',
  'Environmental Law',
  'Healthcare Law',
  'Mergers & Acquisitions',
] as const;

export const PROFESSIONAL_TITLES = [
  'Advocate',
  'Attorney at Law',
  'Legal Consultant',
  'Senior Counsel',
  'Partner',
  'Associate',
  'Of Counsel',
  'Legal Advisor',
] as const;
