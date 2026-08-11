import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FirmProfile } from '@/types/firm';
import { Building2, BadgeCheck, CalendarDays, Quote } from 'lucide-react';

interface FirmDetailsStepProps {
  profile: Pick<FirmProfile, 'firmDetails'>;
  onUpdate: (fields: Partial<FirmProfile['firmDetails']>) => void;
}

/** The firm's identity — the counterpart of the lawyer wizard's Basic Info. */
export function FirmDetailsStep({ profile, onUpdate }: FirmDetailsStepProps) {
  const { firmDetails } = profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Firm Details</h2>
        <p className="text-muted-foreground">Start with how your firm is known and registered.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="firmName" className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Firm Name *
          </Label>
          <Input
            id="firmName"
            placeholder="Dewey, Cheatem & Howe"
            value={firmDetails.name || ''}
            onChange={(e) => onUpdate({ name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firmTagline" className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-muted-foreground" />
            Tagline
          </Label>
          <Input
            id="firmTagline"
            placeholder="Counsel you can rely on"
            value={firmDetails.tagline || ''}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
          />
          <p className="text-xs text-muted-foreground">
            One line, shown under your firm name on the site.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firmRegistration" className="flex items-center gap-2">
              <BadgeCheck className="w-4 h-4 text-muted-foreground" />
              Registration Number
            </Label>
            <Input
              id="firmRegistration"
              placeholder="NP-4471"
              value={firmDetails.registrationNumber || ''}
              onChange={(e) => onUpdate({ registrationNumber: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="firmFounded" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-muted-foreground" />
              Founded
            </Label>
            <Input
              id="firmFounded"
              placeholder="1978"
              value={firmDetails.foundedYear || ''}
              onChange={(e) => onUpdate({ foundedYear: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              Free text — Gregorian or Bikram Sambat, whichever you use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
