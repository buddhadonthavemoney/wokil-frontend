/* eslint-disable @next/next/no-html-link-for-pages */
import { TimelineEntry, formatTimelineRange } from '@/types/lawyer';
import { RosterMember } from '@/types/firm';
import { SiteModel } from '@/types/site-model';
import {
  TEAM_PAGE_HREF, SitePage, sectionHref, memberAnchor, memberHref, memberInitials,
} from '@/lib/firm-roster';
import { TeamBody, TeamPalette } from './TeamSection';
import {
  Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale, UserCheck, MessageCircle, Wallet, Menu,
  GraduationCap, Briefcase, Users, Building2, CalendarDays, BadgeCheck, ArrowRight, ArrowLeft,
  type LucideIcon,
} from 'lucide-react';

interface ClassicThemeProps {
  site: SiteModel;
  page?: SitePage;
}

/** Classic's navy-and-gold rendering of the People page. */
const TEAM_PALETTE: TeamPalette = {
  card: 'bg-white rounded-2xl p-8 @md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]',
  avatar: 'w-32 h-32 rounded-2xl bg-[#1B2B44] border-2 border-[#C5A059]',
  avatarText: 'font-heading text-3xl font-bold text-[#C5A059]',
  name: 'font-heading text-3xl font-bold text-[#1B2B44] leading-snug',
  title: 'text-[#C5A059] text-lg font-medium',
  meta: 'text-xs font-bold uppercase tracking-widest text-[#4A4A4A]/60',
  body: 'text-[#4A4A4A] text-lg leading-relaxed font-light',
  sectionLabel: 'text-xs font-bold uppercase tracking-widest text-[#1B2B44]',
  chip: 'px-3 py-1.5 bg-[#F8F9FB] border border-[#EDF0F5] rounded-lg text-sm font-medium text-[#1B2B44]',
  link: 'text-[#4A4A4A] hover:text-[#1B2B44] transition-colors',
  contactRow: 'pt-2 border-t border-[#F0F0F0] mt-2',
  icon: 'text-[#C5A059]',

  jumpCard: 'bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]',
  jumpHeading: 'font-heading text-xs font-bold mb-4 text-[#1B2B44] uppercase tracking-widest',
  jumpName: 'font-medium text-[#1B2B44] hover:text-[#C5A059] transition-colors',
  jumpTitle: 'text-[#4A4A4A]/70 text-xs',

  railList: 'border-l-2 border-[#EDF0F5] pl-6',
  railDot: '-left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#C5A059] ring-4 ring-white',
  railTitle: 'font-heading text-lg font-bold text-[#1B2B44] leading-snug',
  railOrg: 'text-[#4A4A4A] font-light',
  railRange: 'text-xs font-bold uppercase tracking-widest text-[#C5A059] mt-1',
  railBody: 'text-[#4A4A4A] text-sm leading-relaxed',

  emptyCard:
    'bg-white rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-dashed border-[#D8DEE8] text-center',
  emptyIconBox:
    'w-14 h-14 mx-auto rounded-2xl bg-[#F8F9FB] border border-[#EDF0F5] flex items-center justify-center mb-5',
  emptyHeading: 'font-heading text-xl font-bold text-[#1B2B44] mb-2',
  emptyBody: 'text-[#4A4A4A] leading-relaxed max-w-md mx-auto',
  emptyButton:
    'inline-block mt-6 px-5 py-2.5 bg-[#1B2B44] text-white rounded-lg text-sm font-bold hover:bg-[#243652] transition-colors',
};

// Value points are free text, so there's no icon to store per entry — cycle
// through these by position instead.
const VALUE_ICONS = [UserCheck, MessageCircle, Wallet];

const FACT_ICONS: Record<string, LucideIcon> = { calendar: CalendarDays, users: Users };

/** Section card — the rhythm every block on this theme shares. */
function Card({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section
      data-reveal
      id={id}
      className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]"
    >
      {children}
    </section>
  );
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
      <span className="w-10 h-[2px] bg-[#C5A059]" />
      {children}
    </h2>
  );
}

/** Vertical rail of career-history rows, in the Classic navy/gold palette. */
function TimelineRail({ icon: Icon, title, entries }: { icon: LucideIcon; title: string; entries: TimelineEntry[] }) {
  if (entries.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="font-heading text-lg font-bold text-[#1B2B44] uppercase tracking-widest flex items-center gap-3">
        <Icon className="w-5 h-5 text-[#C5A059]" />
        {title}
      </h3>
      <ol className="border-l-2 border-[#EDF0F5] pl-6 space-y-8">
        {entries.map((entry, index) => (
          <li key={index} className="relative">
            <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-[#C5A059] ring-4 ring-[#FDFCFB]" />
            <p className="font-heading text-xl font-bold text-[#1B2B44] leading-snug">{entry.title}</p>
            <p className="text-[#4A4A4A] text-lg font-light">{entry.organization}</p>
            <p className="text-xs font-bold uppercase tracking-widest text-[#C5A059] mt-1">{formatTimelineRange(entry)}</p>
            {entry.description && (
              <p className="text-[#4A4A4A] leading-relaxed mt-3">{entry.description}</p>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

/**
 * One lawyer's card on a firm's roster.
 *
 * Every field below the name and title is optional, and each is omitted rather
 * than shown with a placeholder — a firm that entered only names gets a clean
 * list of names, not a wall of "Not provided".
 */
function RosterCard({ member, index }: { member: RosterMember; index: number }) {
  const areas = member.areasOfPractice ?? [];

  return (
    <article
      id={memberAnchor(member, index)}
      className="scroll-mt-24 bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0] flex flex-col @sm:flex-row gap-6"
    >
      <div className="shrink-0">
        {member.photo ? (
          <img
            src={member.photo}
            alt={member.fullName}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-[#C5A059]"
          />
        ) : (
          <div className="w-24 h-24 rounded-2xl bg-[#1B2B44] flex items-center justify-center border-2 border-[#C5A059]">
            <span className="font-heading text-2xl font-bold text-[#C5A059]">
              {memberInitials(member.fullName) || <Scale className="w-8 h-8 text-[#C5A059]" />}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-3">
        <div>
          <h3 className="font-heading text-2xl font-bold text-[#1B2B44] leading-snug">
            <a href={memberHref(member, index)} className="hover:text-[#C5A059] transition-colors">
              {member.fullName}
            </a>
          </h3>
          <p className="text-[#C5A059] font-medium">{member.professionalTitle}</p>
          {member.yearsOfExperience ? (
            <p className="text-xs font-bold uppercase tracking-widest text-[#4A4A4A]/60 mt-1">
              {member.yearsOfExperience}+ years of practice
            </p>
          ) : null}
        </div>

        {member.bio && <p className="text-[#4A4A4A] leading-relaxed">{member.bio}</p>}

        {areas.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <span
                key={area}
                className="px-3 py-1 bg-[#F8F9FB] border border-[#EDF0F5] rounded-lg text-xs font-medium text-[#1B2B44]"
              >
                {area}
              </span>
            ))}
          </div>
        )}

        {(member.email || member.phone || member.linkedIn) && (
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm">
            {member.email && (
              <a href={`mailto:${member.email}`} className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#1B2B44] transition-colors">
                <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                <span className="break-all">{member.email}</span>
              </a>
            )}
            {member.phone && (
              <a href={`tel:${member.phone}`} className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#1B2B44] transition-colors">
                <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                {member.phone}
              </a>
            )}
            {member.linkedIn && (
              <a
                href={member.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#1B2B44] transition-colors"
              >
                <Linkedin className="w-4 h-4 text-[#C5A059] shrink-0" />
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
 * What the roster section renders before anyone has been added.
 *
 * A first-class state, not an afterthought: a firm can legitimately publish
 * before entering its lawyers, and the deploy path explicitly allows it. It
 * deliberately invents no people — no stub cards, no "Jane Doe, Partner" — and
 * instead points visitors at the firm's own contact details, which are real.
 */
function EmptyRoster({ email, phone }: { email?: string; phone?: string }) {
  return (
    <div className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-dashed border-[#D8DEE8] text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F8F9FB] border border-[#EDF0F5] flex items-center justify-center mb-5">
        <Users className="w-7 h-7 text-[#C5A059]" />
      </div>
      <h3 className="font-heading text-xl font-bold text-[#1B2B44] mb-2">Our team is being introduced</h3>
      <p className="text-[#4A4A4A] leading-relaxed max-w-md mx-auto">
        Profiles for our lawyers are on the way. In the meantime, please get in touch and we will
        put you in contact with the right person.
      </p>
      {(email || phone) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm">
          {email && (
            <a
              href={`mailto:${email}`}
              className="px-5 py-2.5 bg-[#1B2B44] text-white rounded-lg font-bold hover:bg-[#243652] transition-colors"
            >
              Email the firm
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="px-5 py-2.5 border border-[#1B2B44]/20 rounded-lg font-bold text-[#1B2B44] hover:border-[#C5A059] transition-colors">
              {phone}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Classic — navy and gold, credential-forward.
 *
 * Renders both an individual lawyer's site and a firm's from one SiteModel, and
 * both pages of a firm's site from one component. The shell (nav, hero, about,
 * practice areas, courts, contact, footer) is identical for both kinds; only
 * the middle sections differ — a lawyer's timeline, value points, process and
 * FAQ, versus a firm's roster. This used to be two files, and the copy that
 * wasn't kept in sync is where the bugs lived.
 */
export function ClassicTheme({ site, page = 'home' }: ClassicThemeProps) {
  const isFirm = site.kind === 'firm';
  const lawyer = site.lawyer;
  const members = site.roster ?? [];

  const education = lawyer?.education ?? [];
  const experience = lawyer?.experience ?? [];
  const hasTimeline = education.length > 0 || experience.length > 0;

  const BrandIcon = isFirm ? Building2 : Scale;

  // The People page only exists for a firm; an individual site rendered with
  // page='team' is not a state the app produces, and falling through to the
  // home page beats inventing an error page for it.
  const isTeamPage = page === 'team' && isFirm;
  const anchor = (hash: string) => sectionHref(isTeamPage ? 'team' : 'home', hash);

  // Nav mirrors whichever sections actually render below, and stays pointed at
  // the home page's anchors when rendered on the People page.
  const navLinks = isFirm
    ? [
        { href: anchor('#about'), label: 'About' },
        { href: anchor('#practice-areas'), label: site.heading.practice },
        { href: TEAM_PAGE_HREF, label: 'Our Team' },
      ]
    : [
        { href: anchor('#about'), label: 'About' },
        { href: anchor('#practice-areas'), label: site.heading.practice },
        ...(hasTimeline ? [{ href: anchor('#timeline'), label: 'Timeline' }] : []),
        { href: anchor('#why'), label: 'Why Work With Me' },
        { href: anchor('#faq'), label: 'FAQ' },
      ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-body text-[#1A1A1A]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1B2B44]/95 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <a href={anchor('#top')} className="flex items-center gap-2 min-w-0 font-heading font-bold text-white tracking-tight">
            <BrandIcon className="w-5 h-5 text-[#C5A059] shrink-0" />
            <span className="truncate">{site.brandName}</span>
          </a>
          <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-white/60">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className={
                  isTeamPage && href === TEAM_PAGE_HREF
                    ? 'text-white transition-colors'
                    : 'hover:text-white transition-colors'
                }
              >
                {label}
              </a>
            ))}
          </div>
          <a href={anchor('#contact')} className="hidden @lg:block px-4 @md:px-5 py-2.5 bg-[#C5A059] hover:bg-[#B18F4A] rounded-lg text-sm font-bold text-[#1B2B44] transition-colors shrink-0">
            Request Consultation
          </a>
          <details className="@lg:hidden relative shrink-0">
            <summary className="flex items-center justify-center w-9 h-9 rounded-lg text-white list-none cursor-pointer [&::-webkit-details-marker]:hidden">
              <Menu className="w-5 h-5" />
            </summary>
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1B2B44] border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-3 text-sm font-medium text-white/70 z-50">
              {navLinks.map(({ href, label }) => (
                <a key={href} href={href} className="hover:text-white transition-colors">{label}</a>
              ))}
              <a href={anchor('#contact')} className="mt-1 px-4 py-2.5 bg-[#C5A059] hover:bg-[#B18F4A] rounded-lg text-sm font-bold text-[#1B2B44] text-center transition-colors">
                Request Consultation
              </a>
            </div>
          </details>
        </div>
      </nav>

      {isTeamPage ? (
        <>
          {/* The hero's band, sized for a subpage rather than a full screen. */}
          <header className="bg-[#1B2B44] text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="container mx-auto px-6 py-16 @md:py-24 relative z-10">
              <div className="max-w-6xl mx-auto space-y-4">
                <a
                  href="/"
                  className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to {site.brandName}
                </a>
                <div className="flex items-center gap-5">
                  {site.image?.src && (
                    <img
                      src={site.image.src}
                      alt={site.image.alt}
                      className="w-16 h-16 rounded-xl object-contain bg-white p-2 border-2 border-[#C5A059] shrink-0"
                    />
                  )}
                  <div>
                    <h1 className="font-heading text-4xl @md:text-6xl font-bold tracking-tight">Our Team</h1>
                    {members.length > 0 && (
                      <p className="text-white/60 text-xs @sm:text-sm uppercase tracking-[0.2em] font-medium pt-2 flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#C5A059]" />
                        {members.length} {members.length === 1 ? 'lawyer' : 'lawyers'} at {site.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="container mx-auto px-6 py-16">
            <TeamBody site={site} palette={TEAM_PALETTE} />
          </main>
        </>
      ) : (
        <>
      {/* Hero */}
      <header id="top" className="bg-[#1B2B44] text-white relative overflow-hidden scroll-mt-16 min-h-[calc(100cqh-4rem)] flex flex-col justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-6 py-14 @md:py-32 relative z-10">
          <div className="flex flex-col @md:flex-row items-center gap-8 @md:gap-12 max-w-6xl mx-auto">
            <div className="relative group shrink-0">
              <div
                className={`absolute -inset-1 bg-[#C5A059] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 ${
                  site.image?.shape === 'rounded' ? 'rounded-2xl' : 'rounded-full'
                }`}
              />
              {site.image?.src ? (
                <img
                  src={site.image.src}
                  alt={site.image.alt}
                  className={
                    site.image.shape === 'rounded'
                      ? 'w-24 h-24 @sm:w-32 @sm:h-32 @md:w-48 @md:h-48 rounded-2xl object-contain bg-white p-4 border-4 border-[#C5A059] shadow-2xl relative'
                      : 'w-24 h-24 @sm:w-32 @sm:h-32 @md:w-56 @md:h-56 rounded-full object-cover border-4 border-[#C5A059] shadow-2xl relative'
                  }
                />
              ) : (
                <div
                  className={`bg-[#2A3B54] flex items-center justify-center border-4 border-[#C5A059] shadow-2xl relative ${
                    site.image?.shape === 'rounded'
                      ? 'w-24 h-24 @sm:w-32 @sm:h-32 @md:w-48 @md:h-48 rounded-2xl'
                      : 'w-24 h-24 @sm:w-32 @sm:h-32 @md:w-56 @md:h-56 rounded-full'
                  }`}
                >
                  <BrandIcon className="w-12 h-12 @sm:w-16 @sm:h-16 @md:w-20 @md:h-20 text-[#C5A059]" />
                </div>
              )}
            </div>

            <div className="text-center @md:text-left space-y-4">
              <h1 className="font-heading text-3xl @sm:text-4xl @md:text-6xl @lg:text-7xl font-bold tracking-tight">
                {site.name}
              </h1>
              <div className="flex flex-col @md:flex-row @md:items-center gap-2 @md:gap-4">
                {site.tagline && (
                  <span className="text-[#C5A059] text-lg @sm:text-xl @md:text-2xl font-medium font-heading">
                    {site.tagline}
                  </span>
                )}
                {site.affiliation && (
                  <>
                    <span className="hidden @md:block w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="text-white/80 text-base @sm:text-lg @md:text-xl font-light italic">{site.affiliation}</span>
                  </>
                )}
              </div>
              {site.facts.length > 0 && (
                <div className="flex flex-col @md:flex-row @md:items-center gap-2 @md:gap-6 pt-2 text-white/60 text-xs @sm:text-sm @md:text-lg uppercase tracking-[0.2em] font-medium">
                  {site.facts.map(({ label, icon }) => {
                    const Icon = icon ? FACT_ICONS[icon] : undefined;
                    return (
                      <span key={label} className="flex items-center justify-center @md:justify-start gap-2">
                        {Icon && <Icon className="w-4 h-4 text-[#C5A059]" />}
                        {label}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="grid @lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          <div className="min-w-0 @lg:col-span-8 space-y-12">
            {/* About */}
            <Card id="about">
              <Heading>{site.heading.about}</Heading>
              <p className="text-[#4A4A4A] text-xl leading-relaxed font-light">{site.about}</p>
              {site.aboutNote && (
                <p className="mt-6 flex items-center gap-2 text-sm text-[#4A4A4A]/70">
                  <BadgeCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  {site.aboutNote}
                </p>
              )}
            </Card>

            {/* Practice Areas */}
            {site.areasOfPractice.length > 0 && (
              <Card id="practice-areas">
                <Heading>{site.heading.practice}</Heading>
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                  {site.areasOfPractice.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-3 p-4 bg-[#F8F9FB] rounded-xl border border-[#EDF0F5] hover:border-[#C5A059]/30 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      <span className="text-[#1B2B44] font-medium text-lg tracking-tight">{area}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Courts */}
            {site.jurisdictions.length > 0 && (
              <Card>
                <Heading>Courts</Heading>
                <div className="flex flex-wrap gap-4">
                  {site.jurisdictions.map((jurisdiction) => (
                    <span
                      key={jurisdiction}
                      className="px-6 py-3 bg-[#1B2B44] text-[#C5A059] rounded-lg text-sm font-bold uppercase tracking-wider"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </Card>
            )}

            {/* The one part that genuinely differs by site kind. */}
            {isFirm ? (
              <section data-reveal id="team" className="scroll-mt-24 space-y-6">
                <Heading>Our Team</Heading>
                {members.length === 0 ? (
                  <EmptyRoster email={site.contact.email} phone={site.contact.phoneNumber} />
                ) : (
                  <>
                    <div className="space-y-6">
                      {members.map((member, index) => (
                        <RosterCard key={index} member={member} index={index} />
                      ))}
                    </div>
                    <a
                      href={TEAM_PAGE_HREF}
                      className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#1B2B44] hover:text-[#C5A059] transition-colors group"
                    >
                      Meet the full team
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  </>
                )}
              </section>
            ) : (
              lawyer && (
                <>
                  {hasTimeline && (
                    <Card id="timeline">
                      <Heading>Timeline</Heading>
                      <div className="space-y-12">
                        <TimelineRail icon={Briefcase} title="Experience" entries={experience} />
                        <TimelineRail icon={GraduationCap} title="Education" entries={education} />
                      </div>
                    </Card>
                  )}

                  <Card id="why">
                    <Heading>Why Work With Me</Heading>
                    <div className="grid grid-cols-1 @md:grid-cols-3 gap-6">
                      {lawyer.valuePoints.map(({ title, description }, i) => {
                        const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
                        return (
                          <div key={title} className="p-6 bg-[#F8F9FB] rounded-xl border border-[#EDF0F5]">
                            <div className="w-10 h-10 rounded-lg bg-[#C5A059]/10 flex items-center justify-center mb-4">
                              <Icon className="w-5 h-5 text-[#C5A059]" />
                            </div>
                            <h3 className="font-heading font-bold text-[#1B2B44] mb-2">{title}</h3>
                            <p className="text-[#4A4A4A] text-sm leading-relaxed">{description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  <Card>
                    <Heading>How It Works</Heading>
                    <div className="grid grid-cols-1 @md:grid-cols-3 gap-6">
                      {lawyer.processSteps.map(({ title, description }, i) => (
                        <div key={title} className="p-6 bg-[#F8F9FB] rounded-xl border border-[#EDF0F5]">
                          <span className="block font-heading font-black text-3xl text-[#C5A059]/40 mb-3">{String(i + 1).padStart(2, '0')}</span>
                          <h3 className="font-heading font-bold text-[#1B2B44] mb-2">{title}</h3>
                          <p className="text-[#4A4A4A] text-sm leading-relaxed">{description}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card id="faq">
                    <Heading>Frequently Asked Questions</Heading>
                    <div className="divide-y divide-[#F0F0F0]">
                      {lawyer.faqs.map(({ question, answer }) => (
                        <details key={question} className="group py-5">
                          <summary className="flex items-center justify-between cursor-pointer list-none text-lg font-semibold text-[#1B2B44]">
                            {question}
                            <span className="text-[#C5A059] text-xl transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
                          </summary>
                          <p className="mt-3 text-[#4A4A4A] leading-relaxed">{answer}</p>
                        </details>
                      ))}
                    </div>
                  </Card>
                </>
              )
            )}
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 @lg:col-span-4 space-y-8">
            <div data-reveal id="contact" className="scroll-mt-24 bg-[#1B2B44] rounded-2xl p-8 shadow-2xl text-white">
              <h3 className="font-heading text-xl font-bold mb-8 text-[#C5A059] uppercase tracking-widest border-b border-white/10 pb-4">
                {isFirm ? 'Contact' : 'Credentials'}
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Phone className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Telephone</p>
                    <a href={`tel:${site.contact.phoneNumber}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors">{site.contact.phoneNumber || 'Available upon request'}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Mail className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Electronic Correspondence</p>
                    <a href={`mailto:${site.contact.email}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors break-all leading-snug">{site.contact.email || 'Professional Inquiry'}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <MapPin className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Office Location</p>
                    <p className="text-lg font-medium leading-tight">{site.contact.officeAddress || 'Global Chambers'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Clock className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Consultation Hours</p>
                    <p className="text-lg font-medium">{site.contact.officeHours || 'By Appointment Only'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
                {site.online.website && (
                  <a href={site.online.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#C5A059]/20 rounded-xl transition-all">
                    <Globe className="w-5 h-5 text-[#C5A059]" />
                  </a>
                )}
                {site.online.linkedIn && (
                  <a href={site.online.linkedIn} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#C5A059]/20 rounded-xl transition-all">
                    <Linkedin className="w-5 h-5 text-[#C5A059]" />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
        </>
      )}

      {/* Footer */}
      <footer className="bg-[#1B2B44] border-t border-white/5">
        <div className="container mx-auto px-6 py-16 grid grid-cols-1 @md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-heading font-bold text-white">
              <BrandIcon className="w-5 h-5 text-[#C5A059]" />
              {site.brandName}
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-light">{site.disclaimer}</p>
          </div>

          <div>
            <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              {navLinks.map(({ href, label }) => (
                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
              ))}
              <li><a href={anchor('#contact')} className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {site.contact.phoneNumber && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <a href={`tel:${site.contact.phoneNumber}`} className="hover:text-white transition-colors">{site.contact.phoneNumber}</a>
                </li>
              )}
              {site.contact.email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <a href={`mailto:${site.contact.email}`} className="hover:text-white transition-colors break-all">{site.contact.email}</a>
                </li>
              )}
              {site.contact.officeAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>{site.contact.officeAddress}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="container mx-auto px-6 py-6 flex flex-col @md:flex-row items-center justify-between gap-2 text-xs text-white/30">
            <p>© {new Date().getFullYear()} {site.name}. All rights reserved. Attorney Advertising.</p>
            <p>Site by Wokil</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
