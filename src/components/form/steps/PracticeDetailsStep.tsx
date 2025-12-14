import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LawyerProfile, PRACTICE_AREAS } from '@/types/lawyer';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface PracticeDetailsStepProps {
  profile: LawyerProfile;
  onUpdate: <K extends keyof LawyerProfile>(field: K, value: LawyerProfile[K]) => void;
}

export function PracticeDetailsStep({ profile, onUpdate }: PracticeDetailsStepProps) {
  const togglePracticeArea = (area: string) => {
    const current = profile.areasOfPractice;
    if (current.includes(area)) {
      onUpdate('areasOfPractice', current.filter(a => a !== area));
    } else {
      onUpdate('areasOfPractice', [...current, area]);
    }
  };

  const addJurisdiction = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const input = e.currentTarget;
      const value = input.value.trim();
      if (value && !profile.jurisdictions?.includes(value)) {
        onUpdate('jurisdictions', [...(profile.jurisdictions || []), value]);
        input.value = '';
      }
    }
  };

  const removeJurisdiction = (jurisdiction: string) => {
    onUpdate('jurisdictions', profile.jurisdictions?.filter(j => j !== jurisdiction) || []);
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
              const isSelected = profile.areasOfPractice.includes(area);
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
          {profile.areasOfPractice.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {profile.areasOfPractice.length} area(s) selected
            </p>
          )}
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="jurisdictions">Jurisdictions Served (Optional)</Label>
          <Input
            id="jurisdictions"
            placeholder="Type a jurisdiction and press Enter"
            onKeyDown={addJurisdiction}
            className="h-12"
          />
          {profile.jurisdictions && profile.jurisdictions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.jurisdictions.map((jurisdiction) => (
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
