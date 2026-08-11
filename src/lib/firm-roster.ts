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

/** Two initials for the avatar fallback when a member has no photo. */
export function memberInitials(name: string): string {
  return (name ?? '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
