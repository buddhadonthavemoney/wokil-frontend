import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FirmProfile } from '@/types/firm';
import { Building2, Clock } from 'lucide-react';
import { useCallback } from 'react';

interface FirmAboutStepProps {
  profile: Pick<FirmProfile, 'firmProfile'>;
  onUpdate: (fields: Partial<FirmProfile['firmProfile']>) => void;
}

/**
 * The firm's "about" section — the counterpart of the lawyer wizard's
 * Professional Profile, with a logo where that has a photo.
 */
export function FirmAboutStep({ profile, onUpdate }: FirmAboutStepProps) {
  const { firmProfile } = profile;

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Read as a data URL and hand the base64 straight to the save endpoint,
      // exactly as the lawyer photo does — the backend turns it into an upload.
      const reader = new FileReader();
      reader.onloadend = () => onUpdate({ logo: reader.result as string });
      reader.readAsDataURL(file);
    },
    [onUpdate]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Firm Profile</h2>
        <p className="text-muted-foreground">Tell potential clients about your firm.</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Firm Logo
          </Label>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl border border-border bg-muted/30 flex items-center justify-center overflow-hidden shrink-0">
              {firmProfile.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={firmProfile.logo} alt="Firm logo" className="w-full h-full object-contain p-2" />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground/40" />
              )}
            </div>
            <div className="space-y-2">
              <Input id="firmLogo" type="file" accept="image/*" onChange={handleLogoUpload} />
              <p className="text-xs text-muted-foreground">PNG or SVG on a transparent background works best.</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="firmAbout">About the Firm</Label>
          <Textarea
            id="firmAbout"
            placeholder="What your firm does, who it serves, and what sets it apart."
            value={firmProfile.about || ''}
            onChange={(e) => onUpdate({ about: e.target.value })}
            rows={6}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firmOfficeHours" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Office Hours
          </Label>
          <Input
            id="firmOfficeHours"
            placeholder="9:00 AM - 5:00 PM, Sunday to Friday"
            value={firmProfile.officeHours || ''}
            onChange={(e) => onUpdate({ officeHours: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
