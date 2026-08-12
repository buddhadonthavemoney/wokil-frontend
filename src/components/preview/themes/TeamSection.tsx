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
import { memberAnchor, memberInitials } from '@/lib/firm-roster';
import { Mail, Phone, Linkedin, Users, Scale, GraduationCap, Briefcase, type LucideIcon } from 'lucide-react';

/**
 * The class names a theme lends the People page so it looks native to that
 * theme.
 *
 * The sibling of RosterSection's RosterPalette, and there for the same reason:
 * every theme needs the same structure — a jump list, one full entry per
 * lawyer, an empty state — and only colour and edge treatment differ. This page
 * used to be a sixth, Classic-only page component, which is why following "Our
 * Team" from an Executive site looked like the theme had changed.
 */
export interface TeamPalette {
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
  /** Section label above the practice-area chips and the timeline rails. */
  sectionLabel: string;
  /** Practice-area chip. */
  chip: string;
  /** Contact links under the bio, and the rule above them. */
  link: string;
  contactRow: string;
  /** Icon colour, applied to the small glyphs throughout. */
  icon: string;

  /** Sticky "On this page" card. */
  jumpCard: string;
  jumpHeading: string;
  jumpName: string;
  jumpTitle: string;

  /** Career-history rail. */
  railList: string;
  railDot: string;
  railTitle: string;
  railOrg: string;
  railRange: string;
  railBody: string;

  /** Card used for the empty state. */
  emptyCard: string;
  emptyIconBox: string;
  emptyHeading: string;
  emptyBody: string;
  /** Primary "Email the firm" button in the empty state. */
  emptyButton: string;
}

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
  palette: TeamPalette;
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
 * One person's full entry.
 *
 * Every field except name and title is optional and is omitted rather than
 * shown as a placeholder — a firm that entered only names gets a clean list of
 * names, not a wall of "Not provided".
 */
function MemberEntry({
  member,
  index,
  palette,
}: {
  member: RosterMember;
  index: number;
  palette: TeamPalette;
}) {
  const areas = member.areasOfPractice ?? [];
  const education = member.timeline?.education ?? [];
  const experience = member.timeline?.experience ?? [];
  const hasTimeline = education.length > 0 || experience.length > 0;
  const hasContact = Boolean(member.email || member.phone || member.linkedIn);

  return (
    <article id={memberAnchor(member, index)} className={`scroll-mt-24 ${palette.card}`}>
      <div className="flex flex-col @md:flex-row gap-8">
        <div className="shrink-0">
          {member.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.photo} alt={member.fullName} className={`object-cover ${palette.avatar}`} />
          ) : (
            <div className={`flex items-center justify-center ${palette.avatar}`}>
              <span className={palette.avatarText}>
                {memberInitials(member.fullName) || <Scale className={`w-10 h-10 ${palette.icon}`} />}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <h2 className={palette.name}>{member.fullName}</h2>
            <p className={palette.title}>{member.professionalTitle}</p>
            {member.yearsOfExperience ? (
              <p className={`mt-2 flex items-center gap-2 ${palette.meta}`}>
                <Briefcase className={`w-3.5 h-3.5 ${palette.icon}`} />
                {member.yearsOfExperience}+ years of practice
              </p>
            ) : null}
          </div>

          {member.bio && <p className={palette.body}>{member.bio}</p>}

          {areas.length > 0 && (
            <div className="space-y-2">
              <h3 className={palette.sectionLabel}>Practice Areas</h3>
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
            The career history the firm entered for this lawyer. It lives here
            rather than on the home page's roster card on purpose: a twelve-
            lawyer firm's landing page would otherwise be a wall of dates.
          */}
          {hasTimeline && (
            <div className="grid gap-8 @lg:grid-cols-2 pt-1">
              <TimelineRail icon={Briefcase} title="Experience" entries={experience} palette={palette} />
              <TimelineRail icon={GraduationCap} title="Education" entries={education} palette={palette} />
            </div>
          )}

          {hasContact && (
            <div className={`flex flex-wrap items-center gap-5 text-sm ${palette.contactRow}`}>
              {member.email && (
                <a href={`mailto:${member.email}`} className={`flex items-center gap-2 pt-4 ${palette.link}`}>
                  <Mail className={`w-4 h-4 shrink-0 ${palette.icon}`} />
                  <span className="break-all">{member.email}</span>
                </a>
              )}
              {member.phone && (
                <a href={`tel:${member.phone}`} className={`flex items-center gap-2 pt-4 ${palette.link}`}>
                  <Phone className={`w-4 h-4 shrink-0 ${palette.icon}`} />
                  {member.phone}
                </a>
              )}
              {member.linkedIn && (
                <a
                  href={member.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-2 pt-4 ${palette.link}`}
                >
                  <Linkedin className={`w-4 h-4 shrink-0 ${palette.icon}`} />
                  LinkedIn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
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
export function TeamBody({ site, palette }: { site: SiteModel; palette: TeamPalette }) {
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
          // The same first-class empty state the home page uses. A firm may
          // publish before entering anyone, and this page still has to say
          // something true rather than inventing people.
          <div className={palette.emptyCard}>
            <div className={palette.emptyIconBox}>
              <Users className={`w-7 h-7 ${palette.icon}`} />
            </div>
            <h2 className={palette.emptyHeading}>Our team is being introduced</h2>
            <p className={palette.emptyBody}>
              Profiles for our lawyers are on the way. In the meantime, please get in touch and we
              will put you in contact with the right person.
            </p>
            {email && (
              <a href={`mailto:${email}`} className={palette.emptyButton}>
                Email the firm
              </a>
            )}
          </div>
        ) : (
          members.map((member, index) => (
            <MemberEntry
              key={memberAnchor(member, index)}
              member={member}
              index={index}
              palette={palette}
            />
          ))
        )}
      </div>
    </div>
  );
}
