import { LawyerProfile } from '@/types/lawyer';
import { ClassicTheme } from './themes/ClassicTheme';
import { ModernTheme } from './themes/ModernTheme';
import { ExecutiveTheme } from './themes/ExecutiveTheme';
import { LegalCraftTheme } from './themes/LegalCraftTheme';
import { ComponentType } from 'react';

interface ProfilePreviewProps {
  profile: LawyerProfile;
  zoom?: number;
}

const THEME_COMPONENTS: Record<string, ComponentType<{ profile: LawyerProfile }>> = {
  modern: ModernTheme,
  classic: ClassicTheme,
  executive: ExecutiveTheme,
  'legal-craft': LegalCraftTheme,
};

// Renders the actual production theme component directly — no server round
// trip, no iframe/blob-URL indirection. The profile is already local state
// here, so there's nothing to fetch; switching themes is just picking a
// different component, not waiting on a network response.
export function ProfilePreview({ profile, zoom = 1 }: ProfilePreviewProps) {
  const Theme = THEME_COMPONENTS[profile.themeSelection?.theme] ?? ModernTheme;

  return (
    <div className="w-full h-full overflow-auto bg-white">
      <div
        className="origin-top-left"
        style={{
          width: `${(1 / zoom) * 100}%`,
          transform: `scale(${zoom})`,
        }}
      >
        <Theme profile={profile} />
      </div>
    </div>
  );
}
