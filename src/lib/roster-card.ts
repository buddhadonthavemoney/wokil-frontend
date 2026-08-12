import { FirmProfile, RosterMember } from '@/types/firm';
import { LawyerProfile } from '@/types/lawyer';
import { createBlankLawyerProfile } from '@/lib/lawyer-profile-adapter';
import { memberHref } from '@/lib/firm-roster';
import { siteHref } from '@/lib/utils';

/**
 * A roster member as the business card sees them: their own details in front,
 * the firm's behind.
 *
 * A mapping rather than a firm-specific card component. BusinessCard already
 * builds its vCard out of a LawyerProfile — `ORG:` from `lawFirmName`, `NOTE:`
 * from the practice areas — so putting the firm's name in that field is all it
 * takes for a lawyer's card to carry their chambers.
 *
 * Contact details fall back to the firm's: a junior associate often has no
 * direct line, and a card with a blank phone number is worse than one with the
 * switchboard.
 */
export function rosterCardProfile(firm: FirmProfile, member: RosterMember): LawyerProfile {
  const blank = createBlankLawyerProfile();

  return {
    ...blank,
    basicInformation: {
      fullName: member.fullName ?? '',
      professionalTitle: member.professionalTitle ?? '',
      yearsOfExperience: member.yearsOfExperience ?? 0,
      lawFirmName: firm.firmDetails.name,
    },
    practiceDetails: {
      ...blank.practiceDetails,
      areasOfPractice:
        member.areasOfPractice?.length
          ? member.areasOfPractice
          : firm.practiceDetails.areasOfPractice,
      jurisdictions: firm.practiceDetails.jurisdictions,
    },
    contactInformation: {
      email: member.email || firm.contactInformation.email,
      phoneNumber: member.phone || firm.contactInformation.phoneNumber,
      // A lawyer has no address of their own — they sit at the firm's.
      officeAddress: firm.contactInformation.officeAddress,
    },
    professionalProfile: {
      ...blank.professionalProfile,
      bio: member.bio ?? '',
      profilePhoto: member.photo,
    },
    onlinePresence: {
      linkedIn: member.linkedIn || firm.onlinePresence.linkedIn,
      website: firm.onlinePresence.website,
    },
    timeline: member.timeline ?? blank.timeline,
    siteUrl: firm.siteUrl,
    isPublished: firm.isPublished ?? false,
  };
}

/**
 * Where the card's front QR points: this lawyer's own entry on the firm's
 * People page, not just the firm's front door.
 *
 * Empty when the firm has no live site — BusinessCard's QR already renders a
 * "no live site" placeholder for that, so an unpublished firm needs no special
 * case here.
 */
export function rosterCardUrl(firm: FirmProfile, member: RosterMember, index: number): string {
  if (!firm.siteUrl) return '';
  return `${siteHref(firm.siteUrl)}${memberHref(member, index)}`;
}
