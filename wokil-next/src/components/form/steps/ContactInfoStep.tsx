import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin } from 'lucide-react';

interface ContactInfoStepProps {
  profile: LawyerProfile;
  onUpdate: (fields: Partial<LawyerProfile['contactInformation']>) => void;
}

export function ContactInfoStep({ profile, onUpdate }: ContactInfoStepProps) {
  const { contactInformation } = profile;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-2">
        <h2 className="heading-section text-foreground">Contact Information</h2>
        <p className="text-muted-foreground">How can potential clients reach you?</p>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-muted-foreground" />
            Phone Number *
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="e.g., +1 (555) 123-4567"
            value={contactInformation.phoneNumber}
            onChange={(e) => onUpdate({ phoneNumber: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="e.g., john.smith@lawfirm.com"
            value={contactInformation.email}
            onChange={(e) => onUpdate({ email: e.target.value })}
            className="h-12"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="officeAddress" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Office Address *
          </Label>
          <Textarea
            id="officeAddress"
            placeholder="Enter your full office address"
            value={contactInformation.officeAddress}
            onChange={(e) => onUpdate({ officeAddress: e.target.value })}
            rows={3}
            className="resize-none"
          />
        </div>
      </div>
    </div>
  );
}
