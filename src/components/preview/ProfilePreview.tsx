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
    return (
      <div className="w-full h-full animate-fade-in">
        <iframe 
          key={html.length} // Force re-mount/re-animate when content changes significantly
          srcDoc={html}
          title="Profile Preview"
          className="w-full h-full border-none bg-white"
          style={{ display: 'block' }}
        />
      </div>
    );
  }

}
