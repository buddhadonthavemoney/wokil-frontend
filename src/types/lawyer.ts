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
  /**
   * Marketing copy the themes render. Every list is optional — themes fall back
   * to the DEFAULT_* below, which is exactly what they hardcoded before this
   * existed, so an untouched profile renders identically.
   */
  siteContent?: {
    valuePoints?: { title: string; description: string }[];
    processSteps?: { title: string; description: string }[];
    faqs?: { question: string; answer: string }[];
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

// Generic value-proposition copy, not claims specific to any one attorney.
// Used verbatim by every theme until the lawyer overrides it in Profile Details.
export const DEFAULT_VALUE_POINTS = [
  {
    title: 'Direct Access',
    description: "You'll work with me personally throughout your matter — not handed off to a rotating cast of associates.",
  },
  {
    title: 'Clear Communication',
    description: 'Plain-language updates at every stage, so you always know where your case stands.',
  },
  {
    title: 'Transparent Fees',
    description: 'Fee structures are discussed upfront during your consultation — no surprises on your invoice.',
  },
];

export const DEFAULT_PROCESS_STEPS = [
  { title: 'Initial Consultation', description: 'We discuss the facts of your matter, your goals, and whether representation makes sense.' },
  { title: 'Case Strategy', description: 'A tailored plan is built around your case, timeline, and desired outcome.' },
  { title: 'Representation', description: 'Your matter is handled from filing through resolution, with regular updates along the way.' },
];

/**
 * Per-theme wording for the generated FAQ answers — each theme names its own
 * expertise section and consultation button, so the fallback copy has to match.
 */
export interface FaqLabels {
  expertiseSection: string;
  cta: string;
}

/** FAQ fallback — derived from the profile, so it stays accurate without being edited. */
export function defaultFaqs(profile: LawyerProfile, labels: FaqLabels) {
  const fullName = profile.basicInformation.fullName || 'the office';
  const jurisdictions = profile.practiceDetails.jurisdictions ?? [];
  const officeHours = profile.professionalProfile.officeHours;
  return [
    { question: 'Do you offer an initial consultation?', answer: `Yes — use the contact details below to schedule a consultation with ${fullName}.` },
    { question: 'What areas do you practice in?', answer: jurisdictions.length > 0 ? `Admitted to practice in ${jurisdictions.join(', ')}. See ${labels.expertiseSection} above for matters handled.` : `See ${labels.expertiseSection} above for the specific matters handled.` },
    { question: 'What are your office hours?', answer: officeHours || 'Office hours are available by appointment — contact the office to schedule a time.' },
    { question: 'How do I get started?', answer: `Call or email using the details below, or use the "${labels.cta}" button at the top of the page.` },
  ];
}

/** What the themes actually render: overrides when present, defaults otherwise. */
export function resolveSiteContent(profile: LawyerProfile, labels: FaqLabels) {
  const c = profile.siteContent;
  return {
    valuePoints: c?.valuePoints?.length ? c.valuePoints : DEFAULT_VALUE_POINTS,
    processSteps: c?.processSteps?.length ? c.processSteps : DEFAULT_PROCESS_STEPS,
    faqs: c?.faqs?.length ? c.faqs : defaultFaqs(profile, labels),
  };
}

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
