import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  LawyerProfile,
  DEFAULT_VALUE_POINTS,
  DEFAULT_PROCESS_STEPS,
  defaultFaqs,
} from '@/types/lawyer';
import { Plus, Trash2, RotateCcw } from 'lucide-react';

interface SiteContentStepProps {
  profile: LawyerProfile;
  onUpdate: (fields: Partial<NonNullable<LawyerProfile['siteContent']>>) => void;
}

/**
 * Every list here is the same shape — a heading and a paragraph — so one editor
 * covers value points, process steps and FAQs; only the labels change.
 */
function ListEditor<T extends Record<string, string>>({
  label,
  hint,
  items,
  blank,
  headingKey,
  bodyKey,
  headingLabel,
  bodyLabel,
  addLabel,
  onChange,
  onReset,
}: {
  label: string;
  hint: string;
  items: T[];
  blank: T;
  headingKey: keyof T;
  bodyKey: keyof T;
  headingLabel: string;
  bodyLabel: string;
  addLabel: string;
  onChange: (items: T[]) => void;
  onReset: () => void;
}) {
  const update = (index: number, key: keyof T, value: string) =>
    onChange(items.map((item, i) => (i === index ? { ...item, [key]: value } : item)));

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <Label className="text-base">{label}</Label>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="shrink-0 gap-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset to default
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                {headingLabel} {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
                className="h-7 px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <Input
              placeholder={headingLabel}
              value={item[headingKey]}
              onChange={(e) => update(index, headingKey, e.target.value)}
            />
            <Textarea
              placeholder={bodyLabel}
              value={item[bodyKey]}
              onChange={(e) => update(index, bodyKey, e.target.value)}
              rows={3}
              className="resize-none"
            />
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onChange([...items, { ...blank }])}
        className="gap-2"
      >
        <Plus className="w-4 h-4" />
        {addLabel}
      </Button>
    </div>
  );
}

export function SiteContentStep({ profile, onUpdate }: SiteContentStepProps) {
  // Seed the editors with the same copy the themes fall back to, so editing
  // starts from what the site actually shows rather than an empty box.
  const content = profile.siteContent ?? {};
  const valuePoints = content.valuePoints?.length ? content.valuePoints : DEFAULT_VALUE_POINTS;
  const processSteps = content.processSteps?.length ? content.processSteps : DEFAULT_PROCESS_STEPS;
  const faqs = content.faqs?.length
    ? content.faqs
    : defaultFaqs(profile, { expertiseSection: 'Areas of Expertise', cta: 'Request Consultation' });

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Website Content</h2>
        <p className="text-muted-foreground">
          The copy your theme renders in the &ldquo;Why Work With Me&rdquo;, &ldquo;How It Works&rdquo; and FAQ
          sections. Leave it as-is to keep the standard wording.
        </p>
      </div>

      <ListEditor
        label="Why Work With Me"
        hint="Three to four short reasons a client should pick you."
        items={valuePoints}
        blank={{ title: '', description: '' }}
        headingKey="title"
        bodyKey="description"
        headingLabel="Reason"
        bodyLabel="Describe it in a sentence or two"
        addLabel="Add reason"
        onChange={(valuePoints) => onUpdate({ valuePoints })}
        onReset={() => onUpdate({ valuePoints: [] })}
      />

      <ListEditor
        label="How It Works"
        hint="The steps a client goes through, in order. Numbering is automatic."
        items={processSteps}
        blank={{ title: '', description: '' }}
        headingKey="title"
        bodyKey="description"
        headingLabel="Step"
        bodyLabel="What happens at this step"
        addLabel="Add step"
        onChange={(processSteps) => onUpdate({ processSteps })}
        onReset={() => onUpdate({ processSteps: [] })}
      />

      <ListEditor
        label="Frequently Asked Questions"
        hint="Questions clients ask before getting in touch."
        items={faqs}
        blank={{ question: '', answer: '' }}
        headingKey="question"
        bodyKey="answer"
        headingLabel="Question"
        bodyLabel="Answer"
        addLabel="Add question"
        onChange={(faqs) => onUpdate({ faqs })}
        onReset={() => onUpdate({ faqs: [] })}
      />
    </div>
  );
}
