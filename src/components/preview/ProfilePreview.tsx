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

}
