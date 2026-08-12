import { useMemo, useRef, useState } from 'react';
import { FirmProfile } from '@/types/firm';
import { fromFirmProfile } from '@/types/site-model';
import { SitePage } from '@/lib/firm-roster';
import { ClassicTheme } from './themes/ClassicTheme';
import { THEMES } from './themes/registry';
import { ContactQrWidget, buildFirmVCard } from './ContactQrWidget';
import { useSiteHydration } from './useSiteHydration';

interface FirmPreviewProps {
  firm: FirmProfile;
  zoom?: number;
  /**
   * Show the Home / Team switch. Off by default: in the wizard's phone mockup
   * there is no room for it, and the roster step already shows what it edits.
   */
  pageToggle?: boolean;
}

const PAGES: { id: SitePage; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'team', label: 'Team' },
];

/**
 * Firm counterpart to ProfilePreview: renders the real production theme with
 * the same hydration and container semantics, so what the wizard shows matches
 * what deploys.
 *
 * Rendering the theme bare (as the wizard did before this existed) is not
 * equivalent. It marks six sections `[data-reveal]` — the roster among them —
 * and globals.css hides those until `.is-visible`. With no observer the roster
 * never appears at all.
 */
export function FirmPreview({ firm, zoom = 1, pageToggle = false }: FirmPreviewProps) {
  const Theme = THEMES[firm.themeSelection?.theme] ?? ClassicTheme;
  const containerRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState<SitePage>('home');

  const site = useMemo(() => fromFirmProfile(firm), [firm]);

  useSiteHydration(containerRef, [Theme, firm, zoom, page]);

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
          <Theme site={site} page={page} />
        </div>
      </div>

      {/*
        A published firm site is two pages, both rendered by the chosen theme.
        Without this switch the People page could only be seen by deploying.
        A sibling of the scroll container for the same reason the QR widget is.
      */}
      {pageToggle && (
        // Bottom-left, not top: every theme's nav is sticky, so anything at the
        // top of the frame sits on top of the site's own branding. Raised clear
        // of PreviewChrome's theme bar, which spans the bottom on narrow windows.
        <div className="absolute bottom-24 left-4 z-20 flex rounded-lg bg-black/70 backdrop-blur p-1 text-xs font-medium">
          {PAGES.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPage(id)}
              aria-pressed={page === id}
              className={
                page === id
                  ? 'px-3 py-1.5 rounded-md bg-white text-black'
                  : 'px-3 py-1.5 rounded-md text-white/60 hover:text-white transition-colors'
              }
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <ContactQrWidget vcard={buildFirmVCard(firm)} className="absolute" />
    </div>
  );
}
