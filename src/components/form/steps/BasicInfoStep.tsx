import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LawyerProfile, PROFESSIONAL_TITLES } from '@/types/lawyer';

interface BasicInfoStepProps {
  profile: LawyerProfile;
  onUpdate: <K extends keyof LawyerProfile>(field: K, value: LawyerProfile[K]) => void;
}

export function BasicInfoStep({ profile, onUpdate }: BasicInfoStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Basic Information</h2>
        <p className="text-muted-foreground">Let's start with your professional details.</p>
      </div>
      
      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="e.g., John A. Smith"
            value={profile.fullName}
            onChange={(e) => onUpdate('fullName', e.target.value)}
            className="h-12"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="professionalTitle">Professional Title *</Label>
          <Select
            value={profile.professionalTitle}
            onValueChange={(value) => onUpdate('professionalTitle', value)}
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
            value={profile.lawFirmName || ''}
            onChange={(e) => onUpdate('lawFirmName', e.target.value)}
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
            value={profile.yearsOfExperience || ''}
            onChange={(e) => onUpdate('yearsOfExperience', parseInt(e.target.value) || 0)}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}
