import { LawyerProfile } from '@/types/lawyer';
import { ClassicTheme } from './themes/ClassicTheme';
import { ModernTheme } from './themes/ModernTheme';
import { MinimalTheme } from './themes/MinimalTheme';
import { ExecutiveTheme } from './themes/ExecutiveTheme';
import { LegalCraftTheme } from './themes/LegalCraftTheme';

interface ProfilePreviewProps {
  profile: LawyerProfile;
  html?: string;
}

export function ProfilePreview({ profile, html }: ProfilePreviewProps) {
  if (html) {
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
  }

  switch (profile.themeSelection.theme) {
    case 'modern':
      return <ModernTheme profile={profile} />;
    case 'minimal':
      return <MinimalTheme profile={profile} />;
    case 'executive':
      return <ExecutiveTheme profile={profile} />;
    case 'legal-craft':
      return <LegalCraftTheme profile={profile} />;
    case 'classic':
    default:
      return <ClassicTheme profile={profile} />;
  }
}
