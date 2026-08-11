import { FirmProfile } from '@/types/firm';
import { RosterMemberList } from '@/components/form/RosterMemberList';

interface RosterStepProps {
  profile: Pick<FirmProfile, 'roster'>;
  // The whole list, not a patch. Removing a member has to shorten the array,
  // which merging index-by-index cannot express.
  onUpdate: (members: Partial<FirmProfile['roster']>) => void;
}

/**
 * The firm's lawyers.
 *
 * This step is the reason the firm wizard exists as its own flow. The entries
 * are details the firm types about its people — not invitations, not accounts.
 * Nobody listed here can sign in, and the list may legitimately stay empty.
 */
export function RosterStep({ profile, onUpdate }: RosterStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Our Team</h2>
        <p className="text-muted-foreground">
          Add the lawyers at your firm. They&apos;ll appear on your site — this doesn&apos;t send
          anyone an invitation or create accounts for them.
        </p>
      </div>

      <RosterMemberList
        members={profile.roster ?? []}
        onChange={(roster) => onUpdate(roster)}
      />
    </div>
  );
}
