import { RefObject, useEffect } from 'react';

/**
 * Re-creates, for a dashboard preview, the two behaviours that a *published*
 * site gets from the plain <script> tags baked into `site-shell.ts`.
 *
 * The deployed page ships zero React, so those scripts are its only way to
 * animate and collapse. A preview is the one place the same theme markup
 * actually hydrates, so without this the preview and the deployed site
 * disagree — and they disagree in the worst direction: `globals.css` hides
 * every `[data-reveal]` until `.is-visible` is added, so a preview with no
 * observer renders those sections **permanently invisible**. That is not a
 * subtle animation difference, it is entire sections (a firm's roster, for
 * one) silently missing from the preview.
 *
 * @param containerRef the scrollable box — `root` for the observer, and the
 *   element that actually scrolls in both the wizard's phone mockup and the
 *   full-page preview. Not the viewport.
 * @param deps re-run when the rendered theme or its data changes.
 */
export function useSiteHydration(
  containerRef: RefObject<HTMLElement | null>,
  deps: unknown[]
) {
  // Scroll-reveal — mirrors the [data-reveal] observer in site-shell.ts.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);

  // Overflow-driven nav collapse — mirrors the [data-nav] script in site-shell.ts.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, ...deps]);
}
