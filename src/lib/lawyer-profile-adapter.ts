import type {
  LawyerProfile as ApiLawyerProfile,
  TimelineEntry as ApiTimelineEntry,
} from '@/generated/wokil-api';
import type { LawyerProfile, TimelineEntry } from '@/types/lawyer';

const THEMES = ['classic', 'executive', 'legal-craft'] as const;
type Theme = LawyerProfile['themeSelection']['theme'];

function toTheme(theme: string | undefined, fallback: Theme): Theme {
  return (THEMES as readonly string[]).includes(theme ?? '') ? (theme as Theme) : fallback;
}

/**
 * Every field on the generated `TimelineEntry` is optional; the domain type
 * requires the three the editor always writes. Fill rather than cast, so a blob
 * hand-edited (or written by an older client) can't smuggle `undefined` into a
 * theme's string interpolation.
 */
function toTimelineEntries(
  entries: ApiTimelineEntry[] | undefined,
  fallback: TimelineEntry[]
): TimelineEntry[] {
  if (!entries) return fallback;
  return entries.map((entry) => ({
    ...entry,
    title: entry.title ?? '',
    organization: entry.organization ?? '',
    startYear: entry.startYear ?? '',
  }));
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
    timeline: {
      education: [],
      experience: [],
    },
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
    // siteUrl/isPublished/deploymentURL are derived server-side from the sites
    // table and come back omitted (not empty) when there's no live site. Take
    // them straight from `data` with empty defaults so a deleted site's URL
    // can't survive via the `...existing` fallback above.
    siteUrl: data.siteUrl ?? '',
    isPublished: data.isPublished ?? false,
    basicInformation: { ...existing.basicInformation, ...data.basicInformation },
    practiceDetails: {
      ...existing.practiceDetails,
      ...data.practiceDetails,
      areasOfPractice: data.practiceDetails?.areasOfPractice ?? existing.practiceDetails.areasOfPractice,
      jurisdictions: data.practiceDetails?.jurisdictions ?? existing.practiceDetails.jurisdictions,
    },
    contactInformation: { ...existing.contactInformation, ...data.contactInformation },
    professionalProfile: {
      ...existing.professionalProfile,
      ...data.professionalProfile,
      // Derived; force empty when omitted so it can't inherit a stale URL from
      // `existing` — covers the case where the backend drops the whole object.
      deploymentURL: data.professionalProfile?.deploymentURL ?? '',
    },
    onlinePresence: { ...existing.onlinePresence, ...data.onlinePresence },
    timeline: {
      // Spelled out per-list rather than spread: the API omits empty arrays, and
      // a plain spread would let a cleared list survive via `existing`.
      education: toTimelineEntries(data.timeline?.education, existing.timeline.education),
      experience: toTimelineEntries(data.timeline?.experience, existing.timeline.experience),
    },
    themeSelection: {
      ...existing.themeSelection,
      ...data.themeSelection,
      theme: toTheme(data.themeSelection?.theme, existing.themeSelection.theme),
    },
    subdomainSelection: { ...existing.subdomainSelection, ...data.subdomainSelection },
  };
}
