import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LawyerProfile, PROFESSIONAL_TITLES } from '@/types/lawyer';

interface BasicInfoStepProps {
  profile: LawyerProfile;
  onUpdate: (fields: Partial<LawyerProfile['basicInformation']>) => void;
  onFillSample?: () => void;
}

export function BasicInfoStep({ profile, onUpdate, onFillSample }: BasicInfoStepProps) {
  const { basicInformation } = profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="heading-section text-foreground">Basic Information</h2>
          <p className="text-muted-foreground">Let's start with your professional details.</p>
        </div>
        {onFillSample && !basicInformation.fullName && (
          <Button
            variant="outline"
            size="sm"
            onClick={onFillSample}
            className="gap-2 text-primary border-primary/20 hover:bg-primary/5 shadow-sm shrink-0 self-start sm:self-center"
          >
            <Scale className="w-4 h-4 opacity-70" />
            Fill with Sample Data
          </Button>
        )}
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="e.g., John A. Smith"
            value={basicInformation.fullName}
            onChange={(e) => onUpdate({ fullName: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalTitle">Professional Title *</Label>
          <Select
            value={basicInformation.professionalTitle}
            onValueChange={(value) => onUpdate({ professionalTitle: value })}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select your title" />
            </SelectTrigger>
            <SelectContent>
              {PROFESSIONAL_TITLES.map((title) => (
                <SelectItem key={title} value={title}>
                  {title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lawFirmName">Law Firm Name (Optional)</Label>
          <Input
            id="lawFirmName"
            placeholder="e.g., Smith & Associates"
            value={basicInformation.lawFirmName || ''}
            onChange={(e) => onUpdate({ lawFirmName: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
          <Input
            id="yearsOfExperience"
            type="number"
            min="0"
            max="70"
            placeholder="e.g., 15"
            value={basicInformation.yearsOfExperience || ''}
            onChange={(e) => onUpdate({ yearsOfExperience: parseInt(e.target.value) || 0 })}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}
