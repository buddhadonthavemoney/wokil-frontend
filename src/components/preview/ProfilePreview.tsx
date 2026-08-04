import { LawyerProfile } from '@/types/lawyer';
import { ClassicTheme } from './themes/ClassicTheme';
import { ExecutiveTheme } from './themes/ExecutiveTheme';
import { LegalCraftTheme } from './themes/LegalCraftTheme';
import { ComponentType } from 'react';

interface ProfilePreviewProps {
  profile: LawyerProfile;
  zoom?: number;
}

const THEME_COMPONENTS: Record<string, ComponentType<{ profile: LawyerProfile }>> = {
  classic: ClassicTheme,
  executive: ExecutiveTheme,
  'legal-craft': LegalCraftTheme,
};

// Renders the actual production theme component directly — no server round
// trip, no iframe/blob-URL indirection. The profile is already local state
// here, so there's nothing to fetch; switching themes is just picking a
// different component, not waiting on a network response.
//
// `@container` here (not on the inner zoom wrapper — transform: scale()
// doesn't change layout size, only the outer box's real rendered width
// should decide breakpoints) makes the theme components' `@sm:`/`@md:`/`@lg:`
// classes respond to the actual box they're rendered in — a few hundred
// px in the profile-builder's phone mockup, the full page on /preview —
// instead of the browser viewport, which is what let a "mobile" preview
// silently render in desktop layout before.
export function ProfilePreview({ profile, zoom = 1 }: ProfilePreviewProps) {
  const Theme = THEME_COMPONENTS[profile.themeSelection?.theme] ?? ClassicTheme;

  return (
    <div className="@container w-full h-full overflow-auto bg-white no-scrollbar">
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
