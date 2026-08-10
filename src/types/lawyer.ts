/**
 * One row of career history — a degree or a job. Both use the same shape; only
 * the labels differ in the UI.
 *
 * Years are strings, not numbers: profiles carry '2014', '2014-15' and Bikram
 * Sambat years alike, and nothing sorts or compares them.
 */
export interface TimelineEntry {
  title?: string;
  organization?: string;
  startYear?: string;
  endYear?: string;
  /** Renders 'Present' in the themes; endYear is ignored when true. */
  current?: boolean;
  description?: string;
}

/** '2010 — 2014', '2019 — Present', or just '2010' when no end is given. */
export function formatTimelineRange({ startYear, endYear, current }: TimelineEntry): string {
  return [startYear, current ? 'Present' : endYear].filter(Boolean).join(' — ');
}

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
  timeline: {
    education: TimelineEntry[];
    experience: TimelineEntry[];
  };
  themeSelection: {
    theme: 'classic' | 'executive' | 'legal-craft';
  };
  subdomainSelection: {
    subdomain: string;
  };
  isPublished: boolean;
  publishedAt?: string;
  slug: string;
  siteUrl?: string;
  googleAnalyticsId?: string;
  isPublic?: boolean;
  showPicture?: boolean;
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
