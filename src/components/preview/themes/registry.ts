import { SiteModel } from '@/types/site-model';
import { SitePage } from '@/lib/firm-roster';

import { ClassicTheme } from './ClassicTheme';
import { ExecutiveTheme } from './ExecutiveTheme';
import { LegalCraftTheme } from './LegalCraftTheme';
import { CorporateEliteTheme } from './CorporateEliteTheme';
import { SwissInstitutionalTheme } from './SwissInstitutionalTheme';

// Typed as a plain function component rather than ComponentType: render.ts is a
// .ts file and calls these directly (`Component({ site })`) instead of via JSX,
// which a class component would not support.
//
// `page` is what makes a theme responsible for every page of the site it
// styles, not just the home page. It is optional and defaults to 'home', so a
// caller that only ever renders the landing page passes nothing.
export type SiteThemeComponent = (props: {
  site: SiteModel;
  page?: SitePage;
}) => React.ReactElement;

/**
 * Every theme, keyed by the id stored on the profile.
 *
 * All of them take the normalized SiteModel and render either an individual's
 * site or a firm's, branching only where the content genuinely differs — the
 * middle of the page, where a lawyer has a timeline, value points, process and
 * FAQ and a firm has its roster. The shell around it is the same either way.
 *
 * This used to be two maps against two prop types, which meant a firm could
 * only ever be offered the one theme built for it.
 */
export const THEMES: Record<string, SiteThemeComponent> = {
  classic: ClassicTheme,
  executive: ExecutiveTheme,
  'legal-craft': LegalCraftTheme,
  'corporate-elite': CorporateEliteTheme,
  'swiss-institutional': SwissInstitutionalTheme,

  // Retired id, kept as an alias. Firms created before the themes were unified
  // stored 'firm-classic', and their saved profile must keep rendering; the
  // migration rewrites the blobs, but a stale client or an unmigrated row would
  // otherwise resolve to nothing and fail the deploy.
  'firm-classic': ClassicTheme,
};

/**
 * Look up a theme by id.
 *
 * Returns undefined for an unknown id rather than silently falling back, so a
 * deploy of a theme this build does not have fails loudly instead of publishing
 * a site that looks nothing like the one the user previewed.
 */
export function resolveTheme(themeId: string | undefined): SiteThemeComponent | undefined {
  return themeId ? THEMES[themeId] : undefined;
}
