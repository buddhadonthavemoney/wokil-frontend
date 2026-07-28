import type { LawyerProfile as ApiLawyerProfile } from '@/generated/wokil-api';
import type { LawyerProfile } from '@/types/lawyer';

const THEMES = ['classic', 'modern', 'minimal', 'executive', 'legal-craft'] as const;
type Theme = LawyerProfile['themeSelection']['theme'];

function toTheme(theme: string | undefined, fallback: Theme): Theme {
  return (THEMES as readonly string[]).includes(theme ?? '') ? (theme as Theme) : fallback;
}

export function createBlankLawyerProfile(): LawyerProfile {
  return {
    id: '',
    slug: '',
    basicInformation: {
      fullName: '',
      professionalTitle: '',
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
    },
    onlinePresence: {},
    themeSelection: {
      theme: 'classic',
    },
    subdomainSelection: {
      subdomain: '',
    },
    isPublished: false,
  };
}

/**
 * The generated SDK's `LawyerProfile` marks every field optional and has no `id`
 * (the backend response body never includes one). Adapts an API response onto the
 * domain `LawyerProfile`, which requires `id` and several nested fields, falling
 * back to `existing` for anything the response omits.
 */
export function toLawyerProfile(
  data: ApiLawyerProfile,
  existing: LawyerProfile = createBlankLawyerProfile()
): LawyerProfile {
  return {
    ...existing,
    ...data,
    id: existing.id,
    slug: data.slug ?? existing.slug,
    basicInformation: { ...existing.basicInformation, ...data.basicInformation },
    practiceDetails: {
      ...existing.practiceDetails,
      ...data.practiceDetails,
      areasOfPractice: data.practiceDetails?.areasOfPractice ?? existing.practiceDetails.areasOfPractice,
      jurisdictions: data.practiceDetails?.jurisdictions ?? existing.practiceDetails.jurisdictions,
    },
    contactInformation: { ...existing.contactInformation, ...data.contactInformation },
    professionalProfile: { ...existing.professionalProfile, ...data.professionalProfile },
    onlinePresence: { ...existing.onlinePresence, ...data.onlinePresence },
    themeSelection: {
      ...existing.themeSelection,
      ...data.themeSelection,
      theme: toTheme(data.themeSelection?.theme, existing.themeSelection.theme),
    },
    subdomainSelection: { ...existing.subdomainSelection, ...data.subdomainSelection },
  };
}
