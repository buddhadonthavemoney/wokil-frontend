/*
 * next/link is deliberately not used here. This component is rendered with
 * renderToStaticMarkup into a standalone HTML file that is uploaded to R2 and
 * served by a Cloudflare Worker — the published page ships no React and never
 * hydrates, so a <Link> would emit markup whose client-side navigation can
 * never run. "/" here means the deployed site's root, not a Next route.
 */
/* eslint-disable @next/next/no-html-link-for-pages */
import { FirmProfile, RosterMember } from '@/types/firm';
import { memberAnchor, memberInitials } from '@/lib/firm-roster';
import {
  Phone, Mail, MapPin, Linkedin, Building2, Menu, Users, ArrowLeft, Scale, Briefcase,
} from 'lucide-react';

interface FirmTeamPageProps {
  firm: FirmProfile;
}

/**
 * One person's full entry.
 *
 * Every field except name and title is optional and is omitted rather than
 * shown as a placeholder — a firm that entered only names gets a clean list of
 * names, not a wall of "Not provided".
 */
function MemberEntry({ member, index }: { member: RosterMember; index: number }) {
  const areas = member.areasOfPractice ?? [];
  const hasContact = Boolean(member.email || member.phone || member.linkedIn);

  return (
    <article
      id={memberAnchor(member, index)}
      className="scroll-mt-24 bg-white rounded-2xl p-8 @md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]"
    >
      <div className="flex flex-col @md:flex-row gap-8">
        <div className="shrink-0">
          {member.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.photo}
              alt={member.fullName}
              className="w-32 h-32 rounded-2xl object-cover border-2 border-[#C5A059]"
            />
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-[#1B2B44] flex items-center justify-center border-2 border-[#C5A059]">
              <span className="font-heading text-3xl font-bold text-[#C5A059]">
                {memberInitials(member.fullName) || <Scale className="w-10 h-10 text-[#C5A059]" />}
              </span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-5">
          <div>
            <h2 className="font-heading text-3xl font-bold text-[#1B2B44] leading-snug">
              {member.fullName}
            </h2>
            <p className="text-[#C5A059] text-lg font-medium">{member.professionalTitle}</p>
            {member.yearsOfExperience ? (
              <p className="text-xs font-bold uppercase tracking-widest text-[#4A4A4A]/60 mt-2 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-[#C5A059]" />
                {member.yearsOfExperience}+ years of practice
              </p>
            ) : null}
          </div>

          {member.bio && (
            <p className="text-[#4A4A4A] text-lg leading-relaxed font-light">{member.bio}</p>
          )}

          {areas.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-[#1B2B44]">
                Practice Areas
              </h3>
              <div className="flex flex-wrap gap-2">
                {areas.map((area) => (
                  <span
                    key={area}
                    className="px-3 py-1.5 bg-[#F8F9FB] border border-[#EDF0F5] rounded-lg text-sm font-medium text-[#1B2B44]"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {hasContact && (
            <div className="flex flex-wrap items-center gap-5 pt-2 border-t border-[#F0F0F0] mt-2 text-sm">
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#1B2B44] transition-colors pt-4"
                >
                  <Mail className="w-4 h-4 text-[#C5A059] shrink-0" />
                  <span className="break-all">{member.email}</span>
                </a>
              )}
              {member.phone && (
                <a
                  href={`tel:${member.phone}`}
                  className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#1B2B44] transition-colors pt-4"
                >
                  <Phone className="w-4 h-4 text-[#C5A059] shrink-0" />
                  {member.phone}
                </a>
              )}
              {member.linkedIn && (
                <a
                  href={member.linkedIn}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#1B2B44] transition-colors pt-4"
                >
                  <Linkedin className="w-4 h-4 text-[#C5A059] shrink-0" />
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
 * The firm's People page — every lawyer on the roster, in full, on one page.
 *
 * A second page rather than N per-person pages: the roster is short, one page
 * means one thing to keep consistent, and a visitor comparing two lawyers does
 * not have to navigate back and forth. Each entry still has its own anchor, so
 * links can point at an individual.
 */
export function FirmTeamPage({ firm }: FirmTeamPageProps) {
  const { firmDetails, contactInformation, firmProfile, roster } = firm;

  const name = firmDetails.name || 'Your Firm';
  const logo = firmProfile?.logo;
  const { phoneNumber, email, officeAddress } = contactInformation;
  const members = roster ?? [];

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-body text-[#1A1A1A]">
      {/* Nav — same chrome as the home page, so the two read as one site. */}
      <nav className="sticky top-0 z-50 bg-[#1B2B44]/95 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <a href="/" className="flex items-center gap-2 min-w-0 font-heading font-bold text-white tracking-tight">
            <Building2 className="w-5 h-5 text-[#C5A059] shrink-0" />
            <span className="truncate">{name}</span>
          </a>
          <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="/#about" className="hover:text-white transition-colors">About</a>
            <a href="/#practice-areas" className="hover:text-white transition-colors">Practice Areas</a>
            <a href="/team/" className="text-white transition-colors">Our Team</a>
          </div>
          <a href="/#contact" className="hidden @lg:block px-4 @md:px-5 py-2.5 bg-[#C5A059] hover:bg-[#B18F4A] rounded-lg text-sm font-bold text-[#1B2B44] transition-colors shrink-0">
            Request Consultation
          </a>
          <details className="@lg:hidden relative shrink-0">
            <summary className="flex items-center justify-center w-9 h-9 rounded-lg text-white list-none cursor-pointer [&::-webkit-details-marker]:hidden">
              <Menu className="w-5 h-5" />
            </summary>
            <div className="absolute right-0 top-full mt-2 w-56 bg-[#1B2B44] border border-white/10 rounded-xl shadow-2xl p-4 flex flex-col gap-3 text-sm font-medium text-white/70 z-50">
              <a href="/#about" className="hover:text-white transition-colors">About</a>
              <a href="/#practice-areas" className="hover:text-white transition-colors">Practice Areas</a>
              <a href="/team/" className="text-white transition-colors">Our Team</a>
              <a href="/#contact" className="mt-1 px-4 py-2.5 bg-[#C5A059] hover:bg-[#B18F4A] rounded-lg text-sm font-bold text-[#1B2B44] text-center transition-colors">
                Request Consultation
              </a>
            </div>
          </details>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-[#1B2B44] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-6 py-16 @md:py-24 relative z-10">
          <div className="max-w-6xl mx-auto space-y-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to {name}
            </a>
            <div className="flex items-center gap-5">
              {logo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logo}
                  alt={name}
                  className="w-16 h-16 rounded-xl object-contain bg-white p-2 border-2 border-[#C5A059] shrink-0"
                />
              )}
              <div>
                <h1 className="font-heading text-4xl @md:text-6xl font-bold tracking-tight">Our Team</h1>
                {members.length > 0 && (
                  <p className="text-white/60 text-xs @sm:text-sm uppercase tracking-[0.2em] font-medium pt-2 flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#C5A059]" />
                    {members.length} {members.length === 1 ? 'lawyer' : 'lawyers'} at {name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto grid @lg:grid-cols-12 gap-10 items-start">
          {/* Jump list */}
          {members.length > 1 && (
            <aside className="@lg:col-span-3 @lg:sticky @lg:top-24">
              <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-xs font-bold mb-4 text-[#1B2B44] uppercase tracking-widest">
                  On this page
                </h2>
                <ul className="space-y-3 text-sm">
                  {members.map((member, index) => (
                    <li key={memberAnchor(member, index)}>
                      <a
                        href={`#${memberAnchor(member, index)}`}
                        className="flex flex-col hover:text-[#1B2B44] transition-colors"
                      >
                        <span className="font-medium text-[#1B2B44]">{member.fullName}</span>
                        <span className="text-[#4A4A4A]/70 text-xs">{member.professionalTitle}</span>
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
              <div className="bg-white rounded-2xl p-12 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-dashed border-[#D8DEE8] text-center">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F8F9FB] border border-[#EDF0F5] flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-[#C5A059]" />
                </div>
                <h2 className="font-heading text-xl font-bold text-[#1B2B44] mb-2">
                  Our team is being introduced
                </h2>
                <p className="text-[#4A4A4A] leading-relaxed max-w-md mx-auto">
                  Profiles for our lawyers are on the way. In the meantime, please get in touch and
                  we will put you in contact with the right person.
                </p>
                {email && (
                  <a
                    href={`mailto:${email}`}
                    className="inline-block mt-6 px-5 py-2.5 bg-[#1B2B44] text-white rounded-lg text-sm font-bold hover:bg-[#243652] transition-colors"
                  >
                    Email the firm
                  </a>
                )}
              </div>
            ) : (
              members.map((member, index) => (
                <MemberEntry key={memberAnchor(member, index)} member={member} index={index} />
              ))
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B2B44] border-t border-white/5">
        <div className="container mx-auto px-6 py-12 grid grid-cols-1 @md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <a href="/" className="flex items-center gap-2 font-heading font-bold text-white">
              <Building2 className="w-5 h-5 text-[#C5A059]" />
              {name}
            </a>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-light">
              This website provides general information about {name}. It does not constitute legal
              advice, and viewing this site does not create an attorney-client relationship.
            </p>
          </div>

          <div>
            <h3 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Contact</h3>
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
