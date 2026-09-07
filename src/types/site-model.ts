import { LawyerProfile, TimelineEntry, resolveSiteContent } from '@/types/lawyer';
import { FirmProfile, RosterMember } from '@/types/firm';

/**
 * What every theme actually needs to render its shell.
 *
 * Themes used to come in pairs — ClassicTheme took a LawyerProfile,
 * FirmClassicTheme took a FirmProfile — even though the two rendered the same
 * nav, hero, about, practice areas, contact card and footer in the same
 * palette. The only real differences were a handful of labels and the middle
 * sections. That fork meant every theme fix had to be made twice, and the ones
 * that weren't are exactly where the bugs showed up.
 *
 * So: both profile shapes normalise into this, each theme renders it once, and
 * a theme branches on `kind` only where the content genuinely differs.
 */
export interface SiteModel {
  kind: 'individual' | 'firm';

  /** Hero headline — the lawyer's or the firm's name. */
  name: string;
  /** Nav and footer wordmark. A lawyer shows their firm's name when they gave one. */
  brandName: string;
  /** Gold subtitle under the headline: professional title, or firm tagline. */
  tagline?: string;
  /** Italic third line in the hero — a lawyer's firm affiliation. Firms have none. */
  affiliation?: string;
  /**
   * Small uppercase facts under the hero: years of practice, or founded +
   * headcount. `icon` is a name, not a component — each theme maps it to its
   * own icon set rather than having one imposed on it.
   */
  facts: { label: string; icon?: 'calendar' | 'users' }[];

  /** Hero image. Lawyers get a circular portrait, firms a rounded logo card. */
  image?: { src?: string; alt: string; shape: 'circle' | 'rounded' };

  heading: {
    /** "Professional Profile" vs "About the Firm". */
    about: string;
    /** "Areas of Expertise" vs "Practice Areas". */
    practice: string;
  };
  /** Body of the about section, already defaulted. */
  about: string;
  /** Optional line under the about body — a firm's registration number. */
  aboutNote?: string;

  areasOfPractice: string[];
  jurisdictions: string[];

  contact: {
    phoneNumber?: string;
    email?: string;
    officeAddress?: string;
    officeHours?: string;
  };
  online: { website?: string; linkedIn?: string };

  /** Footer legal line — differs between a solo practice and a firm. */
  disclaimer: string;

  /** Individual-only content. Empty for a firm. */
  lawyer?: {
    education: TimelineEntry[];
    experience: TimelineEntry[];
    valuePoints: { title: string; description: string }[];
    processSteps: { title: string; description: string }[];
    faqs: { question: string; answer: string }[];
  };

  /** Firm-only content. Absent for an individual. */
  roster?: RosterMember[];
}

export function fromLawyerProfile(profile: LawyerProfile): SiteModel {
  const { basicInformation, practiceDetails, contactInformation, professionalProfile, onlinePresence, timeline } =
    profile;

  const fullName = basicInformation.fullName || 'Your Name';
  const { valuePoints, processSteps, faqs } = resolveSiteContent(profile, {
    expertiseSection: 'Areas of Expertise',
    cta: 'Request Consultation',
  });

  return {
    kind: 'individual',
    name: fullName,
    brandName: basicInformation.lawFirmName || fullName,
    tagline: basicInformation.professionalTitle || 'Barrister & Solicitor',
    affiliation: basicInformation.lawFirmName,
    facts: [{ label: `${basicInformation.yearsOfExperience}+ Years of Practice` }],
    image: { src: professionalProfile.profilePhoto, alt: fullName, shape: 'circle' },
    heading: { about: 'Professional Profile', practice: 'Areas of Expertise' },
    about: professionalProfile.bio || 'Detailed professional biography and expertise will be presented here.',
    areasOfPractice: practiceDetails.areasOfPractice || [],
    jurisdictions: practiceDetails.jurisdictions || [],
    contact: {
      phoneNumber: contactInformation.phoneNumber,
      email: contactInformation.email,
      officeAddress: contactInformation.officeAddress,
      officeHours: professionalProfile.officeHours,
    },
    online: { website: onlinePresence.website, linkedIn: onlinePresence.linkedIn },
    disclaimer: `This website provides general information about the practice of ${fullName}. It does not constitute legal advice, and viewing this site does not create an attorney-client relationship.`,
    lawyer: {
      education: timeline?.education ?? [],
      experience: timeline?.experience ?? [],
      valuePoints,
      processSteps,
      faqs,
    },
  };
}

export function fromFirmProfile(firm: FirmProfile): SiteModel {
  const { firmDetails, practiceDetails, contactInformation, firmProfile, onlinePresence, roster } = firm;

  const name = firmDetails.name || 'Your Firm';
  const members = roster ?? [];

  const facts: SiteModel['facts'] = [];
  if (firmDetails.foundedYear) {
    facts.push({ label: `Established ${firmDetails.foundedYear}`, icon: 'calendar' });
  }
  if (members.length) {
    facts.push({
      label: `${members.length} ${members.length === 1 ? 'lawyer' : 'lawyers'}`,
      icon: 'users',
    });
  }

  return {
    kind: 'firm',
    name,
    brandName: name,
    tagline: firmDetails.tagline,
    facts,
    image: { src: firmProfile.logo, alt: name, shape: 'rounded' },
    heading: { about: 'About the Firm', practice: 'Practice Areas' },
    about: firmProfile.about || `${name} is a law firm serving clients across a range of practice areas.`,
    aboutNote: firmDetails.registrationNumber ? `Registration no. ${firmDetails.registrationNumber}` : undefined,
    areasOfPractice: practiceDetails.areasOfPractice ?? [],
    jurisdictions: practiceDetails.jurisdictions ?? [],
    contact: {
      phoneNumber: contactInformation.phoneNumber,
      email: contactInformation.email,
      officeAddress: contactInformation.officeAddress,
      officeHours: firmProfile.officeHours,
    },
    online: { website: onlinePresence.website, linkedIn: onlinePresence.linkedIn },
    disclaimer: `This website provides general information about ${name}. It does not constitute legal advice, and viewing this site does not create an attorney-client relationship.`,
    roster: members,
  };
}
