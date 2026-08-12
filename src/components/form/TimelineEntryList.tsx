import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TimelineEntry } from '@/types/lawyer';
import { Plus, Trash2 } from 'lucide-react';

interface TimelineEntryListProps {
  /** Section heading, e.g. 'Education'. */
  label: string;
  description: string;
  icon: React.ReactNode;
  /** Row labels differ per section — 'Degree' vs 'Role', 'Institution' vs 'Organization'. */
  titleLabel: string;
  organizationLabel: string;
  addLabel: string;
  /**
   * Namespace for the rows' DOM ids. Defaults to `label`, which is unique on
   * the individual timeline step but not on the firm roster, where every member
   * renders its own Education and Experience lists on one page.
   */
  idPrefix?: string;
  entries: TimelineEntry[];
  onChange: (entries: TimelineEntry[]) => void;
}

const BLANK: TimelineEntry = { title: '', organization: '', startYear: '' };

/**
 * Add/remove list of career-history rows, shared by the education and
 * experience halves of the timeline step.
 *
 * Rows are keyed by index: entries carry no id, the lists are short, and there
 * is no reordering — the only mutations are append and remove-at-index.
 */
export function TimelineEntryList({
  label,
  description,
  icon,
  titleLabel,
  organizationLabel,
  addLabel,
  idPrefix,
  entries,
  onChange,
}: TimelineEntryListProps) {
  const ids = idPrefix ?? label;
  const updateEntry = (index: number, fields: Partial<TimelineEntry>) => {
    onChange(entries.map((entry, i) => (i === index ? { ...entry, ...fields } : entry)));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label className="flex items-center gap-2 text-base">
          {icon}
          {label}
        </Label>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-4">
        {entries.map((entry, index) => (
          <div key={index} className="relative rounded-xl border border-border bg-muted/30 p-4 space-y-4">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onChange(entries.filter((_, i) => i !== index))}
              aria-label={`Remove ${titleLabel.toLowerCase()} entry ${index + 1}`}
              className="absolute top-3 right-3 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="w-4 h-4" />
            </Button>

            <div className="grid gap-4 sm:grid-cols-2 pr-10">
              <div className="space-y-2">
                <Label htmlFor={`${ids}-title-${index}`}>{titleLabel}</Label>
                <Input
                  id={`${ids}-title-${index}`}
                  value={entry.title ?? ''}
                  onChange={(e) => updateEntry(index, { title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${ids}-org-${index}`}>{organizationLabel}</Label>
                <Input
                  id={`${ids}-org-${index}`}
                  value={entry.organization ?? ''}
                  onChange={(e) => updateEntry(index, { organization: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${ids}-start-${index}`}>From</Label>
                <Input
                  id={`${ids}-start-${index}`}
                  placeholder="2014"
                  value={entry.startYear ?? ''}
                  onChange={(e) => updateEntry(index, { startYear: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${ids}-end-${index}`}>To</Label>
                <Input
                  id={`${ids}-end-${index}`}
                  placeholder="2018"
                  value={entry.current ? '' : entry.endYear ?? ''}
                  onChange={(e) => updateEntry(index, { endYear: e.target.value })}
                  disabled={entry.current}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id={`${ids}-current-${index}`}
                checked={Boolean(entry.current)}
                onCheckedChange={(checked) =>
                  // Drop endYear when marking current, so a stale year can't
                  // reappear in the themes if the box is later unticked.
                  updateEntry(index, checked === true ? { current: true, endYear: '' } : { current: false })
                }
              />
              <Label htmlFor={`${ids}-current-${index}`} className="font-normal text-muted-foreground">
                I&apos;m currently here
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${ids}-description-${index}`}>Description</Label>
              <Textarea
                id={`${ids}-description-${index}`}
                placeholder="Optional — what you did, notable matters, honours."
                value={entry.description ?? ''}
                onChange={(e) => updateEntry(index, { description: e.target.value })}
                rows={2}
                className="resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={() => onChange([...entries, { ...BLANK }])}
        className="w-full gap-2 border-dashed"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </Button>
    </div>
  );
}
