import { Button } from '@/components/ui/button';
import { RosterMember } from '@/types/firm';
import { Plus, Trash2, UserPlus } from 'lucide-react';
import { RosterMemberFields } from './RosterMemberFields';

interface RosterMemberListProps {
  members: RosterMember[];
  onChange: (members: RosterMember[]) => void;
}

const BLANK: RosterMember = { fullName: '', professionalTitle: '' };

/**
 * Add/remove list of the firm's lawyers.
 *
 * Rows are keyed by index, exactly as TimelineEntryList does: members carry no
 * id, the list is short, and the only mutations are append and
 * remove-at-index. There is no reordering, so nothing needs a stable key.
 *
 * The fields inside each card live in RosterMemberFields, shared with the
 * per-lawyer page at /firm-roster/[index]; this component is the list around
 * them.
 *
 * These entries are directory content the firm types, not accounts — no invite
 * is sent and nobody here can sign in.
 */
export function RosterMemberList({ members, onChange }: RosterMemberListProps) {
  const updateMember = (index: number, fields: Partial<RosterMember>) => {
    onChange(members.map((member, i) => (i === index ? { ...member, ...fields } : member)));
  };

  return (
    <div className="space-y-4">
      {members.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-xl bg-primary/5 flex items-center justify-center">
            <UserPlus className="w-6 h-6 text-primary/40" />
          </div>
          <p className="font-medium text-foreground">No lawyers added yet</p>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            You can publish without this and add your team later — your site will invite visitors
            to contact the firm in the meantime.
          </p>
        </div>
      )}

      {members.map((member, index) => (
        <div key={index} className="relative rounded-xl border border-border bg-muted/30 p-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(members.filter((_, i) => i !== index))}
            aria-label={`Remove lawyer ${index + 1}`}
            className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <RosterMemberFields
            member={member}
            idPrefix={String(index)}
            onChange={(fields) => updateMember(index, fields)}
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...members, { ...BLANK }])}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="w-4 h-4" />
        Add a lawyer
      </Button>
    </div>
  );
}
