import { LawyerProfile } from '@/types/lawyer';
import { ClassicTheme } from './themes/ClassicTheme';
import { ExecutiveTheme } from './themes/ExecutiveTheme';
import { LegalCraftTheme } from './themes/LegalCraftTheme';
import { CorporateEliteTheme } from './themes/CorporateEliteTheme';
import { SwissInstitutionalTheme } from './themes/SwissInstitutionalTheme';
import { ContactQrWidget, buildVCard } from './ContactQrWidget';
import { ComponentType, useEffect, useRef } from 'react';

interface ProfilePreviewProps {
  profile: LawyerProfile;
  zoom?: number;
}

const THEME_COMPONENTS: Record<string, ComponentType<{ profile: LawyerProfile }>> = {
  classic: ClassicTheme,
  executive: ExecutiveTheme,
  'legal-craft': LegalCraftTheme,
  'corporate-elite': CorporateEliteTheme,
  'swiss-institutional': SwissInstitutionalTheme,
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
  const containerRef = useRef<HTMLDivElement>(null);

  // The deployed site's [data-reveal] scroll animation is driven by a plain
  // <script> baked into site-shell.ts, because that page ships zero React —
  // this dashboard preview is the one place that markup actually hydrates,
  // so it needs its own IntersectionObserver wired up to match. `root` is
  // this scrollable div itself, not the viewport: it's what actually
  // scrolls in both the phone mockup and /preview.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const revealEls = container.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { root: container, threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    revealEls.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [Theme, profile]);

  // Same overflow-driven nav collapse the published site gets from the
  // [data-nav] script in site-shell.ts — this preview is the one place the
  // theme markup hydrates, so it needs its own copy to behave identically.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const navs = container.querySelectorAll<HTMLElement>('[data-nav]');
    if (!navs.length) return;

    const fitAll = () => {
      navs.forEach((nav) => {
        nav.removeAttribute('data-collapsed');
        const row = (nav.firstElementChild as HTMLElement) ?? nav;
        if (row.scrollWidth > row.clientWidth + 1) nav.setAttribute('data-collapsed', '');
      });
    };

    fitAll();
    const ro = new ResizeObserver(fitAll);
    navs.forEach((nav) => ro.observe(nav));
    document.fonts?.ready.then(fitAll);
    return () => ro.disconnect();
  }, [Theme, profile, zoom]);

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
          <Theme profile={profile} />
        </div>
      </div>
      <ContactQrWidget vcard={buildVCard(profile)} className="absolute" />
    </div>
  );
}
