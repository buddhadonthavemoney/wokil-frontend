import { LawyerProfile, TimelineEntry } from '@/types/lawyer';

/**
 * One lawyer as the firm entered them.
 *
 * Deliberately not a user account: nobody on this list can sign in, there is no
 * invite to accept and no role to hold. It is directory content the firm types
 * and its site renders. Only `fullName` and `professionalTitle` are expected —
 * everything else renders when present and is simply omitted when not.
 */
export interface RosterMember {
  fullName: string;
  professionalTitle: string;
  yearsOfExperience?: number;
  photo?: string;
  bio?: string;
  areasOfPractice?: string[];
  email?: string;
  phone?: string;
  linkedIn?: string;
  /**
   * This lawyer's own education and career history — the same shape a solo
   * lawyer's profile carries, edited by the same {@link TimelineEntryList}.
   * Rendered on the firm's People page only; the home-page roster stays a
   * summary, so a twelve-lawyer firm's landing page isn't a wall of dates.
   */
  timeline?: { education: TimelineEntry[]; experience: TimelineEntry[] };
}

/**
 * A law firm's own profile — the firm counterpart of {@link LawyerProfile}.
 *
 * The groups a firm shares with a lawyer (practice areas, contact details,
 * online presence, subdomain, theme) reuse the lawyer types rather than
 * redeclaring identical ones: the wizard steps for them are literally the same
 * components.
 */
export interface FirmProfile {
  firmDetails: {
    name: string;
    registrationNumber?: string;
    /**
     * Free text, not a date — firms give Gregorian and Bikram Sambat years
     * alike, and nothing sorts or compares them.
     */
    foundedYear?: string;
    tagline?: string;
  };
  practiceDetails: LawyerProfile['practiceDetails'];
  contactInformation: LawyerProfile['contactInformation'];
  firmProfile: {
    about?: string;
    logo?: string;
    officeHours?: string;
    deploymentURL?: string;
  };
  /** An empty roster is a valid, publishable state. */
  roster: RosterMember[];
  onlinePresence: LawyerProfile['onlinePresence'];
  subdomainSelection: LawyerProfile['subdomainSelection'];
  themeSelection: { theme: string };

  // Derived server-side from the sites table; never stored on the firm.
  id?: number;
  slug?: string;
  siteUrl?: string;
  isPublished?: boolean;
  /**
   * Shared GA4 measurement ID, present only once the firm has opted in.
   * Derived from firms.ga_enabled server-side and stripped on write.
   */
  googleAnalyticsId?: string;
}

/** Search hit for the firm typeahead in the individual wizard. */
export interface FirmSummary {
  id: number;
  name: string;
  slug: string;
}

/** The blank firm a fresh wizard starts from. Mirrors createBlankLawyerProfile. */
export function createBlankFirmProfile(): FirmProfile {
  return {
    firmDetails: { name: '' },
    practiceDetails: { areasOfPractice: [], jurisdictions: [] },
    contactInformation: { phoneNumber: '', email: '', officeAddress: '' },
    firmProfile: { about: '', officeHours: '' },
    roster: [],
    onlinePresence: {},
    subdomainSelection: { subdomain: '' },
    themeSelection: { theme: 'firm-classic' },
  };
}

/**
 * Fills in whatever the API left out.
 *
 * The Go side marshals FirmProfile with `omitempty` pointer sub-structs, so a
 * partially-filled firm arrives with whole groups missing. Both the wizard's
 * controlled inputs and the theme components assume every top-level group is
 * present, so merge onto a blank rather than trusting the incoming shape.
 */
export function toFirmProfile(
  input: Partial<FirmProfile> | undefined,
  base: FirmProfile = createBlankFirmProfile()
): FirmProfile {
  return {
    ...base,
    ...input,
    firmDetails: { ...base.firmDetails, ...input?.firmDetails },
    practiceDetails: { ...base.practiceDetails, ...input?.practiceDetails },
    contactInformation: { ...base.contactInformation, ...input?.contactInformation },
    firmProfile: { ...base.firmProfile, ...input?.firmProfile },
    // Not spread-merged: the roster is a list the firm edits wholesale, so an
    // incoming empty array must mean "no members", not "keep the old ones".
    roster: input?.roster ?? base.roster,
    onlinePresence: { ...base.onlinePresence, ...input?.onlinePresence },
    subdomainSelection: { ...base.subdomainSelection, ...input?.subdomainSelection },
    themeSelection: { ...base.themeSelection, ...input?.themeSelection },
  };
}
