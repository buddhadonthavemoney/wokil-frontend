import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { LawyerProfile, PRACTICE_AREAS } from '@/types/lawyer';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { CourtSelector } from '../CourtSelector';

interface PracticeDetailsStepProps {
  // Only the group this step edits, so the firm wizard - whose practiceDetails
  // has the identical shape - can reuse this component as-is.
  profile: Pick<LawyerProfile, 'practiceDetails'>;
  onUpdate: (fields: Partial<LawyerProfile['practiceDetails']>) => void;
}

export function PracticeDetailsStep({ profile, onUpdate }: PracticeDetailsStepProps) {
  const { practiceDetails } = profile;

  const togglePracticeArea = (area: string) => {
    const current = practiceDetails.areasOfPractice;
    if (current.includes(area)) {
      onUpdate({ areasOfPractice: current.filter(a => a !== area) });
    } else {
      onUpdate({ areasOfPractice: [...current, area] });
    }
  };

  const toggleJurisdiction = (court: string) => {
    const jurisdictions = practiceDetails.jurisdictions || [];
    if (jurisdictions.includes(court)) {
      onUpdate({ jurisdictions: jurisdictions.filter(j => j !== court) });
    } else {
      onUpdate({ jurisdictions: [...jurisdictions, court] });
    }
  };

  const removeJurisdiction = (jurisdiction: string) => {
    onUpdate({ jurisdictions: practiceDetails.jurisdictions?.filter(j => j !== jurisdiction) || [] });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Practice Details</h2>
        <p className="text-muted-foreground">Select your areas of expertise and jurisdictions.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Areas of Practice *</Label>
          <div className="flex flex-wrap gap-2">
            {PRACTICE_AREAS.map((area) => {
              const isSelected = practiceDetails.areasOfPractice.includes(area);
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => togglePracticeArea(area)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {area}
                </button>
              );
            })}
          </div>
          {practiceDetails.areasOfPractice.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {practiceDetails.areasOfPractice.length} area(s) selected
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="jurisdictions">Courts</Label>
          <CourtSelector 
            selectedCourts={practiceDetails.jurisdictions || []}
            onSelect={toggleJurisdiction}
          />
          {practiceDetails.jurisdictions && practiceDetails.jurisdictions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {practiceDetails.jurisdictions.map((jurisdiction) => (
                <Badge
                  key={jurisdiction}
                  variant="secondary"
                  className="gap-1 px-3 py-1"
                >
                  {jurisdiction}
                  <button
                    type="button"
                    onClick={() => removeJurisdiction(jurisdiction)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
