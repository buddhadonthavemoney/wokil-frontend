import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RosterMember } from '@/types/firm';
import { PRACTICE_AREAS, TimelineEntry } from '@/types/lawyer';
import { Briefcase, ChevronDown, GraduationCap } from 'lucide-react';
import { TimelineEntryList } from './TimelineEntryList';

interface RosterMemberFieldsProps {
  member: RosterMember;
  /**
   * Namespaces the field ids so several editors can share a page: the list
   * passes the row index, the detail page the member's index in the roster.
   */
  idPrefix: string;
  onChange: (fields: Partial<RosterMember>) => void;
  /** Career & education starts open on the detail page, collapsed in the list. */
  defaultTimelineOpen?: boolean;
}

/**
 * Everything one lawyer is: their details, contact, practice areas, bio and the
 * two timelines that appear under them on the People page.
 *
 * Kept apart from the card chrome around it so the wizard's Team step,
 * /firm-details and the per-lawyer page at /firm-roster/[index] are one editor
 * rather than three that drift.
 */
export function RosterMemberFields({
  member,
  idPrefix,
  onChange,
  defaultTimelineOpen = false,
}: RosterMemberFieldsProps) {
  // Both halves are written back together, each reading its sibling off the
  // member — otherwise saving education would clobber experience.
  const updateTimeline = (half: 'education' | 'experience', entries: TimelineEntry[]) => {
    const current = member.timeline ?? { education: [], experience: [] };
    onChange({ timeline: { ...current, [half]: entries } });
  };

  const toggleArea = (area: string) => {
    const current = member.areasOfPractice ?? [];
    onChange({
      areasOfPractice: current.includes(area)
        ? current.filter((a) => a !== area)
        : [...current, area],
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 pr-10">
        <div className="space-y-2">
          <Label htmlFor={`roster-name-${idPrefix}`}>Full name</Label>
          <Input
            id={`roster-name-${idPrefix}`}
            value={member.fullName ?? ''}
            onChange={(e) => onChange({ fullName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`roster-title-${idPrefix}`}>Title</Label>
          <Input
            id={`roster-title-${idPrefix}`}
            placeholder="Managing Partner"
            value={member.professionalTitle ?? ''}
            onChange={(e) => onChange({ professionalTitle: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`roster-years-${idPrefix}`}>Years of experience</Label>
          <Input
            id={`roster-years-${idPrefix}`}
            type="number"
            min={0}
            placeholder="10"
            value={member.yearsOfExperience ?? ''}
            onChange={(e) =>
              // Blank clears the field rather than storing 0 — nobody has
              // "0+ years of practice", and the theme hides it when absent.
              onChange({
                yearsOfExperience: e.target.value === '' ? undefined : Number(e.target.value),
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`roster-photo-${idPrefix}`}>Photo URL</Label>
          <Input
            id={`roster-photo-${idPrefix}`}
            placeholder="https://…"
            value={member.photo ?? ''}
            onChange={(e) => onChange({ photo: e.target.value })}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`roster-email-${idPrefix}`}>Email</Label>
          <Input
            id={`roster-email-${idPrefix}`}
            type="email"
            value={member.email ?? ''}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`roster-phone-${idPrefix}`}>Phone</Label>
          <Input
            id={`roster-phone-${idPrefix}`}
            value={member.phone ?? ''}
            onChange={(e) => onChange({ phone: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`roster-linkedin-${idPrefix}`}>LinkedIn</Label>
          <Input
            id={`roster-linkedin-${idPrefix}`}
            placeholder="https://linkedin.com/in/…"
            value={member.linkedIn ?? ''}
            onChange={(e) => onChange({ linkedIn: e.target.value })}
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
                onClick={() => toggleArea(area)}
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
        <Label htmlFor={`roster-bio-${idPrefix}`}>Bio</Label>
        <Textarea
          id={`roster-bio-${idPrefix}`}
          placeholder="Optional — background, notable matters, honours."
          value={member.bio ?? ''}
          onChange={(e) => onChange({ bio: e.target.value })}
          rows={2}
          className="resize-none"
        />
      </div>

      {/*
        Collapsed in the list: the card is already tall, this is optional
        detail, and it only shows on the People page — the home-page roster
        card stays a summary. The per-lawyer page has room to open it.
      */}
      <Collapsible
        defaultOpen={defaultTimelineOpen}
        className="rounded-xl border border-border bg-background/60"
      >
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-2 p-4 text-left">
          <span className="text-sm font-medium text-foreground">
            Career &amp; education
            <span className="ml-2 font-normal text-muted-foreground">optional</span>
          </span>
          <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="px-4 pb-4 space-y-6">
          <p className="text-sm text-muted-foreground">
            Shown on your firm&apos;s People page, under this lawyer.
          </p>
          <TimelineEntryList
            label="Experience"
            description="Firms and roles, most recent first."
            icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
            titleLabel="Role"
            organizationLabel="Firm or Organization"
            addLabel="Add experience"
            idPrefix={`roster-${idPrefix}-experience`}
            entries={member.timeline?.experience ?? []}
            onChange={(experience) => updateTimeline('experience', experience)}
          />
          <TimelineEntryList
            label="Education"
            description="Degrees, diplomas and bar admissions, most recent first."
            icon={<GraduationCap className="w-4 h-4 text-muted-foreground" />}
            titleLabel="Degree or Qualification"
            organizationLabel="Institution"
            addLabel="Add education"
            idPrefix={`roster-${idPrefix}-education`}
            entries={member.timeline?.education ?? []}
            onChange={(education) => updateTimeline('education', education)}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
