import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RosterMember } from '@/types/firm';
import { PRACTICE_AREAS } from '@/types/lawyer';
import { Plus, Trash2, UserPlus } from 'lucide-react';

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
 * These entries are directory content the firm types, not accounts — no invite
 * is sent and nobody here can sign in.
 */
export function RosterMemberList({ members, onChange }: RosterMemberListProps) {
  const updateMember = (index: number, fields: Partial<RosterMember>) => {
    onChange(members.map((member, i) => (i === index ? { ...member, ...fields } : member)));
  };

  const toggleArea = (index: number, area: string) => {
    const current = members[index]?.areasOfPractice ?? [];
    updateMember(index, {
      areasOfPractice: current.includes(area)
        ? current.filter((a) => a !== area)
        : [...current, area],
    });
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
        <div key={index} className="relative rounded-xl border border-border bg-muted/30 p-4 space-y-4">
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

          <div className="grid gap-4 sm:grid-cols-2 pr-10">
            <div className="space-y-2">
              <Label htmlFor={`roster-name-${index}`}>Full name</Label>
              <Input
                id={`roster-name-${index}`}
                value={member.fullName ?? ''}
                onChange={(e) => updateMember(index, { fullName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`roster-title-${index}`}>Title</Label>
              <Input
                id={`roster-title-${index}`}
                placeholder="Managing Partner"
                value={member.professionalTitle ?? ''}
                onChange={(e) => updateMember(index, { professionalTitle: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`roster-years-${index}`}>Years of experience</Label>
              <Input
                id={`roster-years-${index}`}
                type="number"
                min={0}
                placeholder="10"
                value={member.yearsOfExperience ?? ''}
                onChange={(e) =>
                  // Blank clears the field rather than storing 0 — nobody has
                  // "0+ years of practice", and the theme hides it when absent.
                  updateMember(index, {
                    yearsOfExperience: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`roster-photo-${index}`}>Photo URL</Label>
              <Input
                id={`roster-photo-${index}`}
                placeholder="https://…"
                value={member.photo ?? ''}
                onChange={(e) => updateMember(index, { photo: e.target.value })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor={`roster-email-${index}`}>Email</Label>
              <Input
                id={`roster-email-${index}`}
                type="email"
                value={member.email ?? ''}
                onChange={(e) => updateMember(index, { email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`roster-phone-${index}`}>Phone</Label>
              <Input
                id={`roster-phone-${index}`}
                value={member.phone ?? ''}
                onChange={(e) => updateMember(index, { phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`roster-linkedin-${index}`}>LinkedIn</Label>
              <Input
                id={`roster-linkedin-${index}`}
                placeholder="https://linkedin.com/in/…"
                value={member.linkedIn ?? ''}
                onChange={(e) => updateMember(index, { linkedIn: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Practice areas</Label>
            <div className="flex flex-wrap gap-2">
              {PRACTICE_AREAS.map((area) => {
                const selected = (member.areasOfPractice ?? []).includes(area);
                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() => toggleArea(index, area)}
                    aria-pressed={selected}
                    className={
                      selected
                        ? 'px-3 py-1.5 rounded-lg text-xs font-medium border border-primary bg-primary/10 text-primary transition-colors'
                        : 'px-3 py-1.5 rounded-lg text-xs font-medium border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground transition-colors'
                    }
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`roster-bio-${index}`}>Bio</Label>
            <Textarea
              id={`roster-bio-${index}`}
              placeholder="Optional — background, notable matters, honours."
              value={member.bio ?? ''}
              onChange={(e) => updateMember(index, { bio: e.target.value })}
              rows={2}
              className="resize-none"
            />
          </div>
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
