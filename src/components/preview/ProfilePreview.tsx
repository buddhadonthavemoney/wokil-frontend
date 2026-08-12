import { LawyerProfile } from '@/types/lawyer';
import { fromLawyerProfile } from '@/types/site-model';
import { ClassicTheme } from './themes/ClassicTheme';
import { THEMES } from './themes/registry';
import { ContactQrWidget, buildVCard } from './ContactQrWidget';
import { useSiteHydration } from './useSiteHydration';
import { useMemo, useRef } from 'react';

interface ProfilePreviewProps {
  profile: LawyerProfile;
  zoom?: number;
}

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
  // Unlike the deploy path, an unknown theme here falls back to Classic rather
  // than failing: this renders live as the user types, and a wizard that showed
  // an error card mid-edit would be worse than showing the default theme.
  const Theme = THEMES[profile.themeSelection?.theme] ?? ClassicTheme;
  const containerRef = useRef<HTMLDivElement>(null);

  const site = useMemo(() => fromLawyerProfile(profile), [profile]);

  // Replays the [data-reveal] and [data-nav] scripts that site-shell.ts bakes
  // into the published page. Shared with FirmPreview — see useSiteHydration.
  useSiteHydration(containerRef, [Theme, profile, zoom]);

  return (
    // The QR widget is a sibling of the scroll container, not a child: inside it
    // `absolute` would scroll away, and `fixed` would escape the phone mockup.
    // `@container` mirrors the published page's `<body class="@container">`, so
    // the widget's `@sm:`/`@md:` classes size against the preview box.
    <div className="@container relative w-full h-full">
      {/* container-type: size (not @container's default inline-size) so `cqh`
          resolves against this box's real height — themes use min-h-[100cqh] on
          their hero to fill exactly one "screen": this box here, or (per the CSS
          spec's no-container fallback) the viewport on a published site. */}
      <div ref={containerRef} className="[container-type:size] w-full h-full overflow-auto bg-white no-scrollbar">
        <div
          className="origin-top-left"
          style={{
            width: `${(1 / zoom) * 100}%`,
            transform: `scale(${zoom})`,
          }}
        >
          <Theme site={site} />
        </div>
      </div>
      <ContactQrWidget vcard={buildVCard(profile)} className="absolute" />
    </div>
  );
}
