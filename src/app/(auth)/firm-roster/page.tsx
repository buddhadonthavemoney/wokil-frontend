'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Loader2, Plus, Trash2, UserPlus, Users } from 'lucide-react';

import { useFirmForm } from '@/hooks/useFirmForm';
import { useRequireAccountType } from '@/hooks/useAccountType';
import { useFeatureEnabled } from '@/hooks/useFeatures';
import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PageHeader } from '@/components/layout/PageHeader';
import { memberInitials } from '@/lib/firm-roster';
import { RosterMember } from '@/types/firm';

/**
 * The firm's lawyers, one row each — the sidebar's Roster entry.
 *
 * The wizard still collects the roster in place during onboarding; this is the
 * way back in afterwards, where each lawyer gets a page of their own instead of
 * a card in a stack of cards.
 *
 * Rows are addressed by index, as everywhere else in the roster (memberAnchor,
 * RosterMemberList, the dashboard): members carry no id, and the only mutations
 * are append and remove-at-index.
 */
export default function FirmRosterPage() {
  const { enabled: rosterEnabled } = useFeatureEnabled('firm_roster');
  const { firm, updateNestedFirm, saveFirmData, loaded } = useFirmForm();
  const { redirecting } = useRequireAccountType('firm', '/profile-details');
  const { toast } = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const roster = firm.roster ?? [];

  // Both mutations save the new roster explicitly rather than relying on state
  // having re-rendered: saveFirmData closes over the firm as it was, and the
  // add navigates away the moment it resolves.
  const save = async (next: RosterMember[]) => {
    updateNestedFirm('roster', next);
    await saveFirmData({ ...firm, roster: next });
  };

  const handleAdd = async () => {
    setBusy(true);
    try {
      const next = [...roster, { fullName: '', professionalTitle: '' }];
      await save(next);
      router.push(`/firm-roster/${next.length - 1}`);
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async (index: number, name: string) => {
    if (!window.confirm(`Remove ${name || 'this lawyer'} from your roster?`)) return;
    setBusy(true);
    try {
      await save(roster.filter((_, i) => i !== index));
      toast({ title: 'Removed', description: 'The lawyer is no longer on your roster.' });
    } finally {
      setBusy(false);
    }
  };

  const content = (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-20">
      <main className="container mx-auto px-6 py-6 max-w-4xl">
        <PageHeader
          icon={<Users />}
          title="Roster"
          description="The lawyers shown on your firm's site. Open one to edit their page."
          actions={
            <Button onClick={handleAdd} disabled={busy || !loaded} className="gap-2">
              <Plus className="w-4 h-4" />
              Add a lawyer
            </Button>
          }
        />

        {/* `loaded`, not `loading`: the latter is also false before the fetch
            starts, which would flash the empty state at a firm with a roster. */}
        {!loaded || redirecting ? (
          <div className="flex items-center justify-center py-24 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : roster.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-primary/5 flex items-center justify-center">
              <UserPlus className="w-6 h-6 text-primary/40" />
            </div>
            <p className="font-medium text-foreground">No lawyers added yet</p>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              You can publish without this and add your team later — your site will invite visitors
              to contact the firm in the meantime.
            </p>
          </div>
        ) : (
          <ul className="rounded-2xl bg-card shadow-premium divide-y divide-border overflow-hidden">
            {roster.map((member, index) => (
              <li key={index} className="flex items-center gap-4 pr-4">
                <Link
                  href={`/firm-roster/${index}`}
                  className="flex flex-1 min-w-0 items-center gap-4 py-4 pl-4 hover:bg-muted/40 transition-colors"
                >
                  <Avatar className="h-11 w-11">
                    {member.photo && <AvatarImage src={member.photo} alt={member.fullName} />}
                    <AvatarFallback>{memberInitials(member.fullName)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">
                      {member.fullName || <span className="text-muted-foreground">Unnamed lawyer</span>}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {[
                        member.professionalTitle,
                        (member.areasOfPractice ?? []).join(', '),
                      ]
                        .filter(Boolean)
                        .join(' · ') || 'No title yet'}
                    </p>
                  </div>
                  {member.yearsOfExperience ? (
                    <Badge variant="secondary" className="shrink-0">
                      {member.yearsOfExperience}+ yrs
                    </Badge>
                  ) : null}
                  <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                </Link>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={busy}
                  onClick={() => handleRemove(index, member.fullName)}
                  aria-label={`Remove ${member.fullName || `lawyer ${index + 1}`}`}
                  className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );

  if (!rosterEnabled) return <ComingSoonOverlay title="Firm Roster" description="Manage the lawyers shown on your firm's site.">{content}</ComingSoonOverlay>;
  return content;
}
