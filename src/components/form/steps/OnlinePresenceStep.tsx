import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LawyerProfile } from '@/types/lawyer';
import { Globe, Linkedin } from 'lucide-react';

interface OnlinePresenceStepProps {
  // See PracticeDetailsStep: narrowed so the firm wizard can share it.
  profile: Pick<LawyerProfile, 'onlinePresence'>;
  onUpdate: (fields: Partial<LawyerProfile['onlinePresence']>) => void;
}

export function OnlinePresenceStep({ profile, onUpdate }: OnlinePresenceStepProps) {
  const { onlinePresence } = profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Online Presence</h2>
        <p className="text-muted-foreground">Add links to your professional profiles (optional).</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="website" className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Website
          </Label>
          <Input
            id="website"
            type="url"
            placeholder="https://www.yourwebsite.com"
            value={onlinePresence.website || ''}
            onChange={(e) => onUpdate({ website: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="linkedIn" className="flex items-center gap-2">
            <Linkedin className="w-4 h-4 text-muted-foreground" />
            LinkedIn Profile
          </Label>
          <Input
            id="linkedIn"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={onlinePresence.linkedIn || ''}
            onChange={(e) => onUpdate({ linkedIn: e.target.value })}
            className="h-12"
          />
        </div>
      </div>

      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <p className="text-sm text-muted-foreground">
          💡 Adding professional links helps build trust with potential clients and improves your online visibility.
        </p>
      </div>
    </div>
  );
}
