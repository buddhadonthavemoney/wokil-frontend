import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LawyerProfile } from '@/types/lawyer';
import { Camera, Clock } from 'lucide-react';
import { useCallback } from 'react';

interface ProfessionalProfileStepProps {
  profile: LawyerProfile;
  onUpdate: (fields: Partial<LawyerProfile['professionalProfile']>) => void;
}

export function ProfessionalProfileStep({ profile, onUpdate }: ProfessionalProfileStepProps) {
  const { professionalProfile } = profile;

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ profilePhoto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  }, [onUpdate]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Professional Profile</h2>
        <p className="text-muted-foreground">Tell potential clients about yourself.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-muted-foreground" />
            Profile Photo
          </Label>
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center border-2 border-dashed border-border">
              {professionalProfile.profilePhoto ? (
                <img
                  src={professionalProfile.profilePhoto}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Camera className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Recommended: Square image, at least 400x400px
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio *</Label>
          <Textarea
            id="bio"
            placeholder="Write a compelling summary of your experience, expertise, and approach to legal services..."
            value={professionalProfile.bio}
            onChange={(e) => onUpdate({ bio: e.target.value })}
            rows={5}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            {professionalProfile.bio.length}/500 characters recommended
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="officeHours" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Office Hours *
          </Label>
          <Input
            id="officeHours"
            placeholder="e.g., Mon-Fri 9:00 AM - 6:00 PM"
            value={professionalProfile.officeHours}
            onChange={(e) => onUpdate({ officeHours: e.target.value })}
            className="h-12"
          />
        </div>
      </div>
    </div>
  );
}
