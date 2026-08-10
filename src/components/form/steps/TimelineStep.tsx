import { Separator } from '@/components/ui/separator';
import { LawyerProfile } from '@/types/lawyer';
import { Briefcase, GraduationCap } from 'lucide-react';
import { TimelineEntryList } from '../TimelineEntryList';

interface TimelineStepProps {
  profile: LawyerProfile;
  onUpdate: (fields: Partial<LawyerProfile['timeline']>) => void;
}

export function TimelineStep({ profile, onUpdate }: TimelineStepProps) {
  const { timeline } = profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Timeline</h2>
        <p className="text-muted-foreground">
          Your education and career history. Both sections are optional — leave them empty and
          your site simply won&apos;t show a timeline.
        </p>
      </div>

      <TimelineEntryList
        label="Education"
        description="Degrees, diplomas and bar admissions, most recent first."
        icon={<GraduationCap className="w-4 h-4 text-muted-foreground" />}
        titleLabel="Degree or Qualification"
        titlePlaceholder="e.g., LL.B."
        organizationLabel="Institution"
        organizationPlaceholder="e.g., Tribhuvan University"
        addLabel="Add education"
        entries={timeline.education}
        onChange={(education) => onUpdate({ education })}
      />

      <Separator />

      <TimelineEntryList
        label="Career Experience"
        description="Firms and roles, most recent first."
        icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
        titleLabel="Role"
        titlePlaceholder="e.g., Senior Associate"
        organizationLabel="Firm or Organization"
        organizationPlaceholder="e.g., Hamlin, Hamlin & McGill"
        addLabel="Add experience"
        entries={timeline.experience}
        onChange={(experience) => onUpdate({ experience })}
      />
    </div>
  );
}
