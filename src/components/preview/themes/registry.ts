import { LawyerProfile } from '@/types/lawyer';
import { SiteModel } from '@/types/site-model';

import { ClassicTheme } from './ClassicTheme';
import { ExecutiveTheme } from './ExecutiveTheme';
import { LegalCraftTheme } from './LegalCraftTheme';
import { CorporateEliteTheme } from './CorporateEliteTheme';
import { SwissInstitutionalTheme } from './SwissInstitutionalTheme';

/**
 * Themes that take the normalized SiteModel, and so can render either an
 * individual's site or a firm's from one component.
 *
 * `classic` and `firm-classic` are deliberately the same component. They were
 * two files that rendered the same nav, hero, about, practice areas, courts,
 * contact card and footer, diverging only in a few labels and in the middle
 * section — a lawyer's timeline/why/process/FAQ versus a firm's roster. Keeping
 * them as separate ids still matters: the id is what's stored on the site row
 * and what listThemes returns per category, so a firm is only ever offered
 * themes that know how to render a roster.
 */
// Typed as plain function components rather than ComponentType: render.ts is a
// .ts file and calls them directly (`Component({ site })`) instead of via JSX,
// which a class component would not support.
export type SiteThemeComponent = (props: { site: SiteModel }) => React.ReactElement;
export type ProfileThemeComponent = (props: { profile: LawyerProfile }) => React.ReactElement;

export const SITE_THEMES: Record<string, SiteThemeComponent> = {
  classic: ClassicTheme,
  'firm-classic': ClassicTheme,
};

/**
 * Themes still on the old LawyerProfile prop.
 *
 * These four are individual-only and have not been migrated to SiteModel yet;
 * each carries its own per-theme copy defaults ("Professional Advocate",
 * "Private Practice", …) that SiteModel's mapper does not reproduce, so porting
 * them is a content decision as much as a mechanical one. They are unreachable
 * for a firm — listThemes scopes by category and no firm category lists them.
 */
export const PROFILE_THEMES: Record<string, ProfileThemeComponent> = {
  executive: ExecutiveTheme,
  'legal-craft': LegalCraftTheme,
  'corporate-elite': CorporateEliteTheme,
  'swiss-institutional': SwissInstitutionalTheme,
};

export type ResolvedTheme =
  | { kind: 'site'; Component: SiteThemeComponent }
  | { kind: 'profile'; Component: ProfileThemeComponent };

/**
 * Look a theme id up across both registries.
 *
 * Returns undefined for an unknown id rather than silently falling back, so a
 * deploy of a theme this build does not have fails loudly instead of publishing
 * a site that looks nothing like the one the user previewed.
 */
export function resolveTheme(themeId: string | undefined): ResolvedTheme | undefined {
  if (!themeId) return undefined;

  const site = SITE_THEMES[themeId];
  if (site) return { kind: 'site', Component: site };

  const profile = PROFILE_THEMES[themeId];
  if (profile) return { kind: 'profile', Component: profile };

  return undefined;
}
