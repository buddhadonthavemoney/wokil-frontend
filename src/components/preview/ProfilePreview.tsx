import { LawyerProfile } from '@/types/lawyer';
import { ClassicTheme } from './themes/ClassicTheme';
import { ModernTheme } from './themes/ModernTheme';
import { MinimalTheme } from './themes/MinimalTheme';

interface ProfilePreviewProps {
  profile: LawyerProfile;
}

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  switch (profile.theme) {
    case 'modern':
      return <ModernTheme profile={profile} />;
    case 'minimal':
      return <MinimalTheme profile={profile} />;
    case 'classic':
    default:
      return <ClassicTheme profile={profile} />;
  }
}
