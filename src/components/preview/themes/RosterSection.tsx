import { RosterMember } from '@/types/firm';
import { memberInitials } from '@/lib/firm-roster';
import { Mail, Phone, Linkedin, Users, Scale } from 'lucide-react';

/**
 * The class names a theme lends the roster so it looks native to that theme.
 *
 * A palette rather than a copy of the markup: every theme needs the same
 * structure — avatar, name, title, years, bio, practice-area chips, contact
 * row — and the only real difference is colour and edge treatment. Four copies
 * of this JSX is exactly the fork that made the two Classic themes drift apart
 * in the first place.
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
  /** Icon colour, applied to the small glyphs in the contact row. */
  icon: string;
  /** Card used for the empty state. */
  emptyCard: string;
  emptyHeading: string;
  emptyBody: string;
  /** Primary "Email the firm" button in the empty state. */
  emptyButton: string;
  /** Grid wrapper for the cards. Themes differ on one vs two columns. */
  grid?: string;
}

function MemberCard({
  member,
  index,
  palette,
  anchor,
}: {
  member: RosterMember;
  index: number;
  palette: RosterPalette;
  anchor?: (member: RosterMember, index: number) => string;
}) {
  const areas = member.areasOfPractice ?? [];

  return (
    <article id={anchor?.(member, index)} className={`scroll-mt-24 ${palette.card}`}>
      <div className="shrink-0">
        {member.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={member.photo} alt={member.fullName} className={`object-cover ${palette.avatar}`} />
        ) : (
          <div className={`flex items-center justify-center ${palette.avatar}`}>
            <span className={palette.avatarText}>
              {memberInitials(member.fullName) || <Scale className="w-8 h-8" />}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-3">
        <div>
          <h4 className={palette.name}>{member.fullName}</h4>
          <p className={palette.title}>{member.professionalTitle}</p>
          {/* Rendered only when set: a firm that left it blank gets a clean
              card, not "0+ years of practice". */}
          {member.yearsOfExperience ? (
            <p className={palette.meta}>{member.yearsOfExperience}+ years of practice</p>
          ) : null}
        </div>

        {member.bio && <p className={palette.body}>{member.bio}</p>}

        {areas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <span key={area} className={palette.chip}>
                {area}
              </span>
            ))}
          </div>
        )}

        {(member.email || member.phone || member.linkedIn) && (
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
            {member.email && (
              <a href={`mailto:${member.email}`} className={`flex items-center gap-2 ${palette.link}`}>
                <Mail className={`w-4 h-4 shrink-0 ${palette.icon}`} />
                <span className="break-all">{member.email}</span>
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className={`flex items-center gap-2 ${palette.link}`}>
                <Phone className={`w-4 h-4 shrink-0 ${palette.icon}`} />
                {member.phone}
              </a>
            )}
            {member.linkedIn && (
              <a
                href={member.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 ${palette.link}`}
              >
                <Linkedin className={`w-4 h-4 shrink-0 ${palette.icon}`} />
                LinkedIn
              </a>
            )}
          </div>
        )}
      </div>
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
export function EmptyRoster({
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
      <Users className={`w-8 h-8 mx-auto mb-5 ${palette.icon}`} />
      <h4 className={palette.emptyHeading}>Our team is being introduced</h4>
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

/** The roster itself: every lawyer, or the empty state. */
export function RosterList({
  members,
  palette,
  email,
  phone,
  anchor,
}: {
  members: RosterMember[];
  palette: RosterPalette;
  email?: string;
  phone?: string;
  anchor?: (member: RosterMember, index: number) => string;
}) {
  if (members.length === 0) {
    return <EmptyRoster email={email} phone={phone} palette={palette} />;
  }

  return (
    <div className={palette.grid ?? 'space-y-6'}>
      {members.map((member, index) => (
        <MemberCard key={index} member={member} index={index} palette={palette} anchor={anchor} />
      ))}
    </div>
  );
}
