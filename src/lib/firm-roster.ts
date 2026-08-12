import { RosterMember } from '@/types/firm';

/**
 * Path of the firm's People page, relative to the site root.
 *
 * A directory-style URL rather than `team.html` so the address stays clean.
 * The edge worker maps `/team/` to the `team/index.html` object.
 */
export const TEAM_PAGE_PATH = 'team/index.html';
export const TEAM_PAGE_HREF = '/team/';

/**
 * Anchor for one member within the People page, so the home page and the
 * People page's own index can link to a specific person.
 *
 * Index-suffixed: two lawyers at one firm can share a name, and a duplicate
 * anchor silently sends every link to the first one. The suffix also
 * guarantees a non-empty id when a name slugifies to "" (all punctuation, or
 * a script this regex strips).
 */
export function memberAnchor(member: RosterMember, index: number): string {
  const base = (member.fullName ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${base || 'lawyer'}-${index + 1}`;
}

/** Link straight to one person's entry on the People page. */
export function memberHref(member: RosterMember, index: number): string {
  return `${TEAM_PAGE_HREF}#${memberAnchor(member, index)}`;
}

/**
 * Which page of a site a theme is rendering.
 *
 * A published site is more than one HTML file, but every page is the same
 * theme — so the theme takes this rather than there being a second, separately
 * styled page component per page.
 */
export type SitePage = 'home' | 'team';

/**
 * A theme's in-page anchor, made to work from whichever page it is rendered on.
 *
 * Every section a theme links to lives on the home page, so from a subpage the
 * bare `#about` resolves to an anchor that isn't there. Root-relative it is,
 * from anywhere but home.
 */
export function sectionHref(page: SitePage, hash: string): string {
  return page === 'team' ? `/${hash}` : hash;
}

/** Two initials for the avatar fallback when a member has no photo. */
export function memberInitials(name: string): string {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
