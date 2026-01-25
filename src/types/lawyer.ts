export interface LawyerProfile {
  id: string;
  basicInformation: {
    fullName: string;
    professionalTitle: string;
    lawFirmName?: string;
    yearsOfExperience: number;
  };
  practiceDetails: {
    areasOfPractice: string[];
    jurisdictions: string[];
  };
  contactInformation: {
    phoneNumber: string;
    email: string;
    officeAddress: string;
  };
  professionalProfile: {
    bio: string;
    profilePhoto?: string;
    officeHours: string;
    deploymentURL?: string;
  };
  onlinePresence: {
    website?: string;
    linkedIn?: string;
  };
  themeSelection: {
    theme: 'classic' | 'modern' | 'minimal' | 'executive' | 'legal-craft';
  };
  subdomainSelection: {
    subdomain: string;
  };
  isPublished: boolean;
  publishedAt?: string;
  slug: string;
  siteUrl?: string;
  googleAnalyticsId?: string;
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
