import { useMemo, useRef } from 'react';
import { FirmProfile } from '@/types/firm';
import { fromFirmProfile } from '@/types/site-model';
import { ClassicTheme } from './themes/ClassicTheme';
import { SITE_THEMES } from './themes/registry';
import { ContactQrWidget, buildFirmVCard } from './ContactQrWidget';
import { useSiteHydration } from './useSiteHydration';

interface FirmPreviewProps {
  firm: FirmProfile;
  zoom?: number;
}

/**
 * Firm counterpart to ProfilePreview: renders the real production theme with
 * the same hydration and container semantics, so what the wizard shows matches
 * what deploys.
 *
 * Rendering the theme bare (as the wizard did before this existed) is not
 * equivalent. It marks six sections `[data-reveal]` — the roster among them —
 * and globals.css hides those until `.is-visible`. With no observer the roster
 * never appears at all.
 *
 * Only SITE_THEMES is consulted: the four unmigrated themes take a
 * LawyerProfile and have nowhere to put a roster.
 */
export function FirmPreview({ firm, zoom = 1 }: FirmPreviewProps) {
  const Theme = SITE_THEMES[firm.themeSelection?.theme] ?? ClassicTheme;
  const containerRef = useRef<HTMLDivElement>(null);

  const site = useMemo(() => fromFirmProfile(firm), [firm]);

  useSiteHydration(containerRef, [Theme, firm, zoom]);

  return (
    // Same structure as ProfilePreview: the QR widget is a sibling of the
    // scroll container so it neither scrolls away nor escapes the frame.
    <div className="@container relative w-full h-full">
      {/* container-type: size so the themes' 100cqh hero resolves against this
          box's real height, matching a published page's viewport. */}
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
      <ContactQrWidget vcard={buildFirmVCard(firm)} className="absolute" />
    </div>
  );
}
