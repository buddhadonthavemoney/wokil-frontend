import { FirmProfile, RosterMember } from '@/types/firm';
import {
  Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale, Menu, Users, Building2, CalendarDays, BadgeCheck,
} from 'lucide-react';

interface FirmClassicThemeProps {
  firm: FirmProfile;
}

/** Slug used for a roster member's anchor link, so the nav can jump to them. */
export function rosterAnchor(member: RosterMember, index: number): string {
  const base = member.fullName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  // Index-suffixed: two lawyers at the same firm can share a name, and a
  // duplicate anchor silently sends every link to the first one.
  return `member-${base || 'lawyer'}-${index + 1}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * One lawyer's card.
 *
 * Every field below the name and title is optional, and each is omitted rather
 * than shown with a placeholder — a firm that entered only names gets a clean
 * list of names, not a wall of "Not provided".
 */
function RosterCard({ member, index }: { member: RosterMember; index: number }) {
  const areas = member.areasOfPractice ?? [];

  return (
    <article
      id={rosterAnchor(member, index)}
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
              {initials(member.fullName) || <Scale className="w-8 h-8 text-[#C5A059]" />}
            </span>
          </div>
        )}
      </div>

      <div className="min-w-0 space-y-3">
        <div>
          <h3 className="font-heading text-2xl font-bold text-[#1B2B44] leading-snug">{member.fullName}</h3>
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
              className="px-5 py-2.5 bg-[#1B2B44] text-white rounded-lg font-bold hover:bg-[#24365286] transition-colors"
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
 * The firm counterpart of ClassicTheme, sharing its navy/gold palette and
 * section rhythm so a firm site and a lawyer site read as one product.
 *
 * The roster renders as a section on this single page with per-member anchor
 * links rather than separate pages, matching today's single-page model.
 */
export function FirmClassicTheme({ firm }: FirmClassicThemeProps) {
  const { firmDetails, practiceDetails, contactInformation, firmProfile, roster, onlinePresence } = firm;

  const name = firmDetails.name || 'Your Firm';
  const tagline = firmDetails.tagline;
  const foundedYear = firmDetails.foundedYear;
  const registrationNumber = firmDetails.registrationNumber;

  const areasOfPractice = practiceDetails.areasOfPractice ?? [];
  const jurisdictions = practiceDetails.jurisdictions ?? [];

  const { phoneNumber, email, officeAddress } = contactInformation;
  const { about, logo, officeHours } = firmProfile;
  const { website, linkedIn } = onlinePresence;

  const members = roster ?? [];
  const hasRoster = members.length > 0;

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-body text-[#1A1A1A]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1B2B44]/95 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-2 min-w-0 font-heading font-bold text-white tracking-tight">
            <Building2 className="w-5 h-5 text-[#C5A059] shrink-0" />
            <span className="truncate">{name}</span>
          </a>
          <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#practice-areas" className="hover:text-white transition-colors">Practice Areas</a>
            <a href="#team" className="hover:text-white transition-colors">Our Team</a>
          </div>
          <a href="#contact" className="hidden @lg:block px-4 @md:px-5 py-2.5 bg-[#C5A059] hover:bg-[#B18F4A] rounded-lg text-sm font-bold text-[#1B2B44] transition-colors shrink-0">
            Request Consultation
          </a>
          <details className="@lg:hidden relative shrink-0">
            <summary className="flex items-center justify-center w-9 h-9 rounded-lg text-white list-none cursor-pointer [&::-webkit-details-marker]:hidden">
              <Menu className="w-5 h-5" />
            </summary>
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1B2B44] border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-3 text-sm font-medium text-white/70 z-50">
              <a href="#about" className="hover:text-white transition-colors">About</a>
              <a href="#practice-areas" className="hover:text-white transition-colors">Practice Areas</a>
              <a href="#team" className="hover:text-white transition-colors">Our Team</a>
              <a href="#contact" className="mt-1 px-4 py-2.5 bg-[#C5A059] hover:bg-[#B18F4A] rounded-lg text-sm font-bold text-[#1B2B44] text-center transition-colors">
                Request Consultation
              </a>
            </div>
          </details>
        </div>
      </nav>

      {/* Hero */}
      <header id="top" className="bg-[#1B2B44] text-white relative overflow-hidden scroll-mt-16 min-h-[calc(100cqh-4rem)] flex flex-col justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-6 py-14 @md:py-32 relative z-10">
          <div className="flex flex-col @md:flex-row items-center gap-8 @md:gap-12 max-w-6xl mx-auto">
            <div className="relative group shrink-0">
              <div className="absolute -inset-1 bg-[#C5A059] rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              {logo ? (
                <img
                  src={logo}
                  alt={name}
                  className="w-24 h-24 @sm:w-32 @sm:h-32 @md:w-48 @md:h-48 rounded-2xl object-contain bg-white p-4 border-4 border-[#C5A059] shadow-2xl relative"
                />
              ) : (
                <div className="w-24 h-24 @sm:w-32 @sm:h-32 @md:w-48 @md:h-48 rounded-2xl bg-[#2A3B54] flex items-center justify-center border-4 border-[#C5A059] shadow-2xl relative">
                  <Building2 className="w-12 h-12 @sm:w-16 @sm:h-16 @md:w-20 @md:h-20 text-[#C5A059]" />
                </div>
              )}
            </div>

            <div className="text-center @md:text-left space-y-4">
              <h1 className="font-heading text-3xl @sm:text-4xl @md:text-6xl @lg:text-7xl font-bold tracking-tight">
                {name}
              </h1>
              {tagline && (
                <p className="text-[#C5A059] text-lg @sm:text-xl @md:text-2xl font-medium font-heading">{tagline}</p>
              )}
              <div className="flex flex-col @md:flex-row @md:items-center gap-2 @md:gap-6 pt-2 text-white/60 text-xs @sm:text-sm uppercase tracking-[0.2em] font-medium">
                {foundedYear && (
                  <span className="flex items-center justify-center @md:justify-start gap-2">
                    <CalendarDays className="w-4 h-4 text-[#C5A059]" />
                    Established {foundedYear}
                  </span>
                )}
                {hasRoster && (
                  <span className="flex items-center justify-center @md:justify-start gap-2">
                    <Users className="w-4 h-4 text-[#C5A059]" />
                    {members.length} {members.length === 1 ? 'lawyer' : 'lawyers'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="grid @lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          <div className="min-w-0 @lg:col-span-8 space-y-12">
            {/* About */}
            <section data-reveal id="about" className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
              <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                <span className="w-10 h-[2px] bg-[#C5A059]" />
                About the Firm
              </h2>
              <p className="text-[#4A4A4A] text-xl leading-relaxed font-light">
                {about || `${name} is a law firm serving clients across a range of practice areas.`}
              </p>
              {registrationNumber && (
                <p className="mt-6 flex items-center gap-2 text-sm text-[#4A4A4A]/70">
                  <BadgeCheck className="w-4 h-4 text-[#C5A059] shrink-0" />
                  Registration no. {registrationNumber}
                </p>
              )}
            </section>

            {/* Practice Areas */}
            {areasOfPractice.length > 0 && (
              <section data-reveal id="practice-areas" className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                  <span className="w-10 h-[2px] bg-[#C5A059]" />
                  Practice Areas
                </h2>
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                  {areasOfPractice.map((area) => (
                    <div key={area} className="flex items-center gap-3 p-4 bg-[#F8F9FB] rounded-xl border border-[#EDF0F5]">
                      <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      <span className="text-[#1B2B44] font-medium text-lg tracking-tight">{area}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Courts */}
            {jurisdictions.length > 0 && (
              <section data-reveal className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                  <span className="w-10 h-[2px] bg-[#C5A059]" />
                  Courts
                </h2>
                <div className="flex flex-wrap gap-4">
                  {jurisdictions.map((jurisdiction) => (
                    <span key={jurisdiction} className="px-6 py-3 bg-[#1B2B44] text-[#C5A059] rounded-lg text-sm font-bold uppercase tracking-wider">
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Roster */}
            <section data-reveal id="team" className="scroll-mt-24 space-y-6">
              <h2 className="font-heading text-3xl font-bold text-[#1B2B44] flex items-center gap-4">
                <span className="w-10 h-[2px] bg-[#C5A059]" />
                Our Team
              </h2>
              {hasRoster ? (
                <div className="space-y-6">
                  {members.map((member, index) => (
                    <RosterCard key={rosterAnchor(member, index)} member={member} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyRoster email={email} phone={phoneNumber} />
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 @lg:col-span-4 space-y-8">
            <div data-reveal id="contact" className="scroll-mt-24 bg-[#1B2B44] rounded-2xl p-8 shadow-2xl text-white">
              <h3 className="font-heading text-xl font-bold mb-8 text-[#C5A059] uppercase tracking-widest border-b border-white/10 pb-4">
                Contact
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Phone className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Telephone</p>
                    <a href={`tel:${phoneNumber}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors">
                      {phoneNumber || 'Available upon request'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Mail className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Email</p>
                    <a href={`mailto:${email}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors break-all leading-snug">
                      {email || 'Professional Inquiry'}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <MapPin className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Office</p>
                    <p className="text-lg font-medium leading-tight">{officeAddress || 'Chambers'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Clock className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Office Hours</p>
                    <p className="text-lg font-medium">{officeHours || 'By Appointment Only'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
                {website && (
                  <a href={website} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#C5A059]/20 rounded-xl transition-all">
                    <Globe className="w-5 h-5 text-[#C5A059]" />
                  </a>
                )}
                {linkedIn && (
                  <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#C5A059]/20 rounded-xl transition-all">
                    <Linkedin className="w-5 h-5 text-[#C5A059]" />
                  </a>
                )}
              </div>
            </div>

            {/* Jump list — the roster's stand-in for per-member pages. */}
            {hasRoster && (
              <div data-reveal className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h3 className="font-heading text-sm font-bold mb-5 text-[#1B2B44] uppercase tracking-widest">
                  Our Lawyers
                </h3>
                <ul className="space-y-3 text-sm">
                  {members.map((member, index) => (
                    <li key={rosterAnchor(member, index)}>
                      <a href={`#${rosterAnchor(member, index)}`} className="group flex flex-col hover:text-[#1B2B44] transition-colors">
                        <span className="font-medium text-[#1B2B44]">{member.fullName}</span>
                        <span className="text-[#4A4A4A]/70 text-xs">{member.professionalTitle}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B2B44] border-t border-white/5">
        <div className="container mx-auto px-6 py-16 grid grid-cols-1 @md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-heading font-bold text-white">
              <Building2 className="w-5 h-5 text-[#C5A059]" />
              {name}
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-light">
              This website provides general information about {name}. It does not constitute legal
              advice, and viewing this site does not create an attorney-client relationship.
            </p>
          </div>

          <div>
            <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#practice-areas" className="hover:text-white transition-colors">Practice Areas</a></li>
              <li><a href="#team" className="hover:text-white transition-colors">Our Team</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-white/60">
              {phoneNumber && (
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <a href={`tel:${phoneNumber}`} className="hover:text-white transition-colors">{phoneNumber}</a>
                </li>
              )}
              {email && (
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a>
                </li>
              )}
              {officeAddress && (
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#C5A059] shrink-0 mt-0.5" />
                  <span>{officeAddress}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5">
          <div className="container mx-auto px-6 py-6 flex flex-col @md:flex-row items-center justify-between gap-2 text-xs text-white/30">
            <p>© {new Date().getFullYear()} {name}. All rights reserved. Attorney Advertising.</p>
            <p>Site by Wokil</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
