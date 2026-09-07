/*
 * next/link is deliberately not used here. These components are rendered with
 * renderToStaticMarkup into a standalone HTML file that is uploaded to R2 and
 * served by a Cloudflare Worker — the published page ships no React and never
 * hydrates, so a <Link> would emit markup whose client-side navigation can
 * never run.
 */
import { RosterMember } from '@/types/firm';
import { TimelineEntry, formatTimelineRange } from '@/types/lawyer';
import { SiteModel } from '@/types/site-model';
import { memberAnchor, memberHref, memberInitials } from '@/lib/firm-roster';
import {
  Mail, Phone, Linkedin, Users, Scale, GraduationCap, Briefcase, type LucideIcon,
} from 'lucide-react';

/**
 * The class names a theme lends the roster so it looks native to that theme.
 *
 * A palette rather than a copy of the markup: every theme needs the same
 * structure — avatar, name, title, years, bio, practice-area chips, contact
 * row — and the only real difference is colour and edge treatment. Five copies
 * of this JSX is exactly the fork that made the two Classic themes drift apart
 * in the first place.
 *
 * A theme supplies two of these: a compact one for the home page's roster and a
 * fuller one for the People page, which is where the optional keys below get
 * used. The sizes genuinely differ between the two, which is why it is two
 * objects and not one.
 */
export interface RosterPalette {
  /** Outer card for one person. */
  card: string;
  /** Avatar box (photo and initials share it, so keep the size here). */
  avatar: string;
  /** Initials text inside the avatar. */
  avatarText: string;
  name: string;
  title: string;
  /** Small uppercase "N+ years of practice" line. */
  meta: string;
  body: string;
  /** Practice-area chip. */
  chip: string;
  /** Contact links under the bio. */
  link: string;
  /** Icon colour, applied to the small glyphs throughout. */
  icon: string;
  /** Card used for the empty state. */
  emptyCard: string;
  emptyHeading: string;
  emptyBody: string;
  /** Primary "Email the firm" button in the empty state. */
  emptyButton: string;
  /** Grid wrapper for the cards. Themes differ on one vs two columns. */
  grid?: string;
  /** Framed box around the empty state's icon; bare glyph without it. */
  emptyIconBox?: string;

  /* The rest are read by the 'full' variant — the People page — only. */

  /** Section label above the practice-area chips and the timeline rails. */
  sectionLabel?: string;
  /** Rule above the contact row. */
  contactRow?: string;

  /** Career-history rail. */
  railList?: string;
  railDot?: string;
  railTitle?: string;
  railOrg?: string;
  railRange?: string;
  railBody?: string;

  /** Sticky "On this page" card. */
  jumpCard?: string;
  jumpHeading?: string;
  jumpName?: string;
  jumpTitle?: string;
}

/**
 * How much of a member to show.
 *
 * 'card' is the home page's roster entry — enough to recognise someone and
 * reach them. 'full' is their entry on the People page, which adds the section
 * labels and the career rails a card has no room for.
 */
type MemberVariant = 'card' | 'full';

/** One lawyer's education or experience, as a vertical rail. */
function TimelineRail({
  icon: Icon,
  title,
  entries,
  palette,
}: {
  icon: LucideIcon;
  title: string;
  entries: TimelineEntry[];
  palette: RosterPalette;
}) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className={`flex items-center gap-2 ${palette.sectionLabel}`}>
        <Icon className={`w-3.5 h-3.5 ${palette.icon}`} />
        {title}
      </h3>
      {/*
        Keyed by index: entries carry no id, the lists are short, and the editor
        only appends and removes — the same call RosterMemberList makes.
      */}
      <ol className={`space-y-6 ${palette.railList}`}>
        {entries.map((entry, index) => (
          <li key={index} className="relative">
            <span className={`absolute ${palette.railDot}`} />
            <p className={palette.railTitle}>{entry.title}</p>
            <p className={palette.railOrg}>{entry.organization}</p>
            <p className={palette.railRange}>{formatTimelineRange(entry)}</p>
            {entry.description && <p className={`mt-2 ${palette.railBody}`}>{entry.description}</p>}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One person, at whichever depth the page calls for.
 *
 * Every field below the name and title is optional and is omitted rather than
 * shown as a placeholder — a firm that entered only names gets a clean list of
 * names, not a wall of "Not provided".
 */
export function MemberCard({
  member,
  index,
  palette,
  variant = 'card',
}: {
  member: RosterMember;
  index: number;
  palette: RosterPalette;
  variant?: MemberVariant;
}) {
  const full = variant === 'full';
  const areas = member.areasOfPractice ?? [];
  const education = member.timeline?.education ?? [];
  const experience = member.timeline?.experience ?? [];
  const hasTimeline = full && (education.length > 0 || experience.length > 0);
  const Name = full ? 'h2' : 'h3';

  const avatar = (
    <div className="shrink-0">
      {member.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photo} alt={member.fullName} className={`object-cover ${palette.avatar}`} />
      ) : (
        <div className={`flex items-center justify-center ${palette.avatar}`}>
          <span className={palette.avatarText}>
            {memberInitials(member.fullName) || (
              <Scale className={`${full ? 'w-10 h-10' : 'w-8 h-8'} ${palette.icon}`} />
            )}
          </span>
        </div>
      )}
    </div>
  );

  const details = (
    <div className={full ? 'min-w-0 flex-1 space-y-5' : 'min-w-0 space-y-3'}>
      <div>
        <Name className={palette.name}>
          {/* The card is the way through to this lawyer's own entry; on that
              entry there is nowhere further to go. */}
          {full ? member.fullName : <a href={memberHref(member, index)}>{member.fullName}</a>}
        </Name>
        <p className={palette.title}>{member.professionalTitle}</p>
        {/* Rendered only when set: a firm that left it blank gets a clean
            card, not "0+ years of practice". */}
        {member.yearsOfExperience ? (
          <p className={full ? `mt-2 flex items-center gap-2 ${palette.meta}` : palette.meta}>
            {full && <Briefcase className={`w-3.5 h-3.5 ${palette.icon}`} />}
            {member.yearsOfExperience}+ years of practice
          </p>
        ) : null}
      </div>

      {member.bio && <p className={palette.body}>{member.bio}</p>}

      {areas.length > 0 && (
        <div className="space-y-2">
          {full && <h3 className={palette.sectionLabel}>Practice Areas</h3>}
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <span key={area} className={palette.chip}>
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/*
        The career history the firm entered for this lawyer. It lives on the
        People page rather than the home page's roster card on purpose: a
        twelve-lawyer firm's landing page would otherwise be a wall of dates.
      */}
      {hasTimeline && (
        <div className="grid gap-8 @lg:grid-cols-2 pt-1">
          <TimelineRail icon={Briefcase} title="Experience" entries={experience} palette={palette} />
          <TimelineRail icon={GraduationCap} title="Education" entries={education} palette={palette} />
        </div>
      )}

      {(member.email || member.phone || member.linkedIn) && (
        <div
          className={
            full
              ? `flex flex-wrap items-center gap-5 text-sm ${palette.contactRow}`
              : 'flex flex-wrap items-center gap-4 pt-1 text-sm'
          }
        >
          {member.email && (
            <a
              href={`mailto:${member.email}`}
              className={`flex items-center gap-2 ${full ? 'pt-4 ' : ''}${palette.link}`}
            >
              <Mail className={`w-4 h-4 shrink-0 ${palette.icon}`} />
              <span className="break-all">{member.email}</span>
            </a>
          )}
          {member.phone && (
            <a
              href={`tel:${member.phone}`}
              className={`flex items-center gap-2 ${full ? 'pt-4 ' : ''}${palette.link}`}
            >
              <Phone className={`w-4 h-4 shrink-0 ${palette.icon}`} />
              {member.phone}
            </a>
          )}
          {member.linkedIn && (
            <a
              href={member.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-2 ${full ? 'pt-4 ' : ''}${palette.link}`}
            >
              <Linkedin className={`w-4 h-4 shrink-0 ${palette.icon}`} />
              LinkedIn
            </a>
          )}
        </div>
      )}
    </div>
  );

  return (
    <article id={memberAnchor(member, index)} className={`scroll-mt-24 ${palette.card}`}>
      {/* The compact card gets its own flex from palette.card, which differs by
          theme; the full entry's two columns are the same everywhere. */}
      {full ? (
        <div className="flex flex-col @md:flex-row gap-8">
          {avatar}
          {details}
        </div>
      ) : (
        <>
          {avatar}
          {details}
        </>
      )}
    </article>
  );
}

/**
 * What the roster renders before anyone has been added.
 *
 * A first-class state, not an afterthought: a firm can legitimately publish
 * before entering its lawyers, and the deploy path explicitly allows it. It
 * invents no people — no stub cards, no "Jane Doe, Partner" — and points
 * visitors at the firm's own contact details, which are real.
 */
function EmptyRoster({
  email,
  phone,
  palette,
}: {
  email?: string;
  phone?: string;
  palette: RosterPalette;
}) {
  return (
    <div className={palette.emptyCard}>
      {palette.emptyIconBox ? (
        <div className={palette.emptyIconBox}>
          <Users className={`w-7 h-7 ${palette.icon}`} />
        </div>
      ) : (
        <Users className={`w-8 h-8 mx-auto mb-5 ${palette.icon}`} />
      )}
      <h3 className={palette.emptyHeading}>Our team is being introduced</h3>
      <p className={palette.emptyBody}>
        Profiles for our lawyers are on the way. In the meantime, please get in touch and we will put
        you in contact with the right person.
      </p>
      {(email || phone) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          {email && (
            <a href={`mailto:${email}`} className={palette.emptyButton}>
              Email the firm
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className={palette.link}>
              {phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/** The home page's roster: every lawyer as a card, or the empty state. */
export function RosterList({
  members,
  palette,
  email,
  phone,
}: {
  members: RosterMember[];
  palette: RosterPalette;
  email?: string;
  phone?: string;
}) {
  if (members.length === 0) {
    return <EmptyRoster email={email} phone={phone} palette={palette} />;
  }

  return (
    <div className={palette.grid ?? 'space-y-6'}>
      {members.map((member, index) => (
        <MemberCard key={index} member={member} index={index} palette={palette} />
      ))}
    </div>
  );
}

/**
 * The body of a firm's People page: every lawyer in full, on one page.
 *
 * A second page rather than N per-person pages — the roster is short, one page
 * means one thing to keep consistent, and a visitor comparing two lawyers does
 * not have to navigate back and forth. Each entry still has its own anchor, so
 * links can point at an individual.
 *
 * The surrounding chrome (nav, page header, footer) belongs to the theme and is
 * rendered around this, which is what makes the People page read as the same
 * site as the home page.
 */
export function TeamBody({ site, palette }: { site: SiteModel; palette: RosterPalette }) {
  const members = site.roster ?? [];
  const email = site.contact.email;

  return (
    <div className="max-w-6xl mx-auto grid @lg:grid-cols-12 gap-10 items-start">
      {members.length > 1 && (
        <aside className="@lg:col-span-3 @lg:sticky @lg:top-24">
          <div className={palette.jumpCard}>
            <h2 className={palette.jumpHeading}>On this page</h2>
            <ul className="space-y-3 text-sm">
              {members.map((member, index) => (
                <li key={memberAnchor(member, index)}>
                  <a href={`#${memberAnchor(member, index)}`} className="flex flex-col">
                    <span className={palette.jumpName}>{member.fullName}</span>
                    <span className={palette.jumpTitle}>{member.professionalTitle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      <div className={members.length > 1 ? '@lg:col-span-9 space-y-8' : '@lg:col-span-12 space-y-8'}>
        {members.length === 0 ? (
          <EmptyRoster email={email} phone={site.contact.phoneNumber} palette={palette} />
        ) : (
          members.map((member, index) => (
            <MemberCard
              key={memberAnchor(member, index)}
              member={member}
              index={index}
              palette={palette}
              variant="full"
            />
          ))
        )}
      </div>
    </div>
  );
}
