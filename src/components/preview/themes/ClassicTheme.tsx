import { LawyerProfile, TimelineEntry, formatTimelineRange, resolveSiteContent } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale, UserCheck, MessageCircle, Wallet, Menu, GraduationCap, Briefcase, type LucideIcon } from 'lucide-react';

interface ClassicThemeProps {
  profile: LawyerProfile;
}

// Value points are free text, so there's no icon to store per entry — cycle
// through these by position instead.
const VALUE_ICONS = [UserCheck, MessageCircle, Wallet];

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

export function ClassicTheme({ profile }: ClassicThemeProps) {
  const {
    basicInformation,
    practiceDetails,
    contactInformation,
    professionalProfile,
    onlinePresence,
    timeline
  } = profile;

  const education = timeline?.education ?? [];
  const experience = timeline?.experience ?? [];
  const hasTimeline = education.length > 0 || experience.length > 0;

  const fullName = basicInformation.fullName || 'Your Name';
  const professionalTitle = basicInformation.professionalTitle || 'Barrister & Solicitor';
  const lawFirmName = basicInformation.lawFirmName;
  const yearsOfExperience = basicInformation.yearsOfExperience;

  const areasOfPractice = practiceDetails.areasOfPractice || [];
  const jurisdictions = practiceDetails.jurisdictions || [];

  const phoneNumber = contactInformation.phoneNumber;
  const email = contactInformation.email;
  const officeAddress = contactInformation.officeAddress;

  const bio = professionalProfile.bio;
  const profilePhoto = professionalProfile.profilePhoto;
  const officeHours = professionalProfile.officeHours;

  const website = onlinePresence.website;
  const linkedIn = onlinePresence.linkedIn;

  const { valuePoints, processSteps, faqs } = resolveSiteContent(profile, {
      expertiseSection: 'Areas of Expertise',
      cta: 'Request Consultation',
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-body text-[#1A1A1A]">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#1B2B44]/95 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <a href="#top" className="flex items-center gap-2 min-w-0 font-heading font-bold text-white tracking-tight">
            <Scale className="w-5 h-5 text-[#C5A059] shrink-0" />
            <span className="truncate">{lawFirmName || fullName}</span>
          </a>
          <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-white/60">
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#practice-areas" className="hover:text-white transition-colors">Areas of Expertise</a>
            {hasTimeline && <a href="#timeline" className="hover:text-white transition-colors">Timeline</a>}
            <a href="#why" className="hover:text-white transition-colors">Why Work With Me</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
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
              <a href="#practice-areas" className="hover:text-white transition-colors">Areas of Expertise</a>
              {hasTimeline && <a href="#timeline" className="hover:text-white transition-colors">Timeline</a>}
              <a href="#why" className="hover:text-white transition-colors">Why Work With Me</a>
              <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
              <a href="#contact" className="mt-1 px-4 py-2.5 bg-[#C5A059] hover:bg-[#B18F4A] rounded-lg text-sm font-bold text-[#1B2B44] text-center transition-colors">
                Request Consultation
              </a>
            </div>
          </details>
        </div>
      </nav>

      {/* Hero Section */}
      <header id="top" className="bg-[#1B2B44] text-white relative overflow-hidden scroll-mt-16">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-6 py-14 @md:py-32 relative z-10">
          <div className="flex flex-col @md:flex-row items-center gap-8 @md:gap-12 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#C5A059] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              {profilePhoto ? (
                <img
                  src={profilePhoto}
                  alt={fullName}
                  className="w-24 h-24 @sm:w-32 @sm:h-32 @md:w-56 @md:h-56 rounded-full object-cover border-4 border-[#C5A059] shadow-2xl relative"
                />
              ) : (
                <div className="w-24 h-24 @sm:w-32 @sm:h-32 @md:w-56 @md:h-56 rounded-full bg-[#2A3B54] flex items-center justify-center border-4 border-[#C5A059] shadow-2xl relative">
                  <Scale className="w-12 h-12 @sm:w-16 @sm:h-16 @md:w-20 @md:h-20 text-[#C5A059]" />
                </div>
              )}
            </div>

            <div className="text-center @md:text-left space-y-4">
              <h1 className="font-heading text-3xl @sm:text-4xl @md:text-6xl @lg:text-7xl font-bold tracking-tight">
                {fullName}
              </h1>
              <div className="flex flex-col @md:flex-row @md:items-center gap-2 @md:gap-4">
                <span className="text-[#C5A059] text-lg @sm:text-xl @md:text-2xl font-medium font-heading">
                  {professionalTitle}
                </span>
                {lawFirmName && (
                  <>
                    <span className="hidden @md:block w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="text-white/80 text-base @sm:text-lg @md:text-xl font-light italic">{lawFirmName}</span>
                  </>
                )}
              </div>
              <p className="text-white/60 text-xs @sm:text-sm @md:text-lg uppercase tracking-[0.2em] font-medium pt-2">
                {yearsOfExperience}+ Years of Practice
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="grid @lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="min-w-0 @lg:col-span-8 space-y-12">
            {/* About */}
            <section data-reveal id="about" className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
              <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                <span className="w-10 h-[2px] bg-[#C5A059]" />
                Professional Profile
              </h2>
              <p className="text-[#4A4A4A] text-xl leading-relaxed font-light">
                {bio || 'Detailed professional biography and expertise will be presented here.'}
              </p>
            </section>

            {/* Practice Areas */}
            {areasOfPractice.length > 0 && (
              <section data-reveal id="practice-areas" className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                  <span className="w-10 h-[2px] bg-[#C5A059]" />
                  Areas of Expertise
                </h2>
                <div className="grid grid-cols-1 @md:grid-cols-2 gap-4">
                  {areasOfPractice.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-3 p-4 bg-[#F8F9FB] rounded-xl border border-[#EDF0F5] hover:border-[#C5A059]/30 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      <span className="text-[#1B2B44] font-medium text-lg tracking-tight">{area}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Jurisdictions */}
            {jurisdictions && jurisdictions.length > 0 && (
              <section data-reveal className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                  <span className="w-10 h-[2px] bg-[#C5A059]" />
                  Jurisdictions
                </h2>
                <div className="flex flex-wrap gap-4">
                  {jurisdictions.map((jurisdiction) => (
                    <span
                      key={jurisdiction}
                      className="px-6 py-3 bg-[#1B2B44] text-[#C5A059] rounded-lg text-sm font-bold uppercase tracking-wider"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Timeline */}
            {hasTimeline && (
              <section data-reveal id="timeline" className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                  <span className="w-10 h-[2px] bg-[#C5A059]" />
                  Timeline
                </h2>
                <div className="space-y-12">
                  <TimelineRail icon={Briefcase} title="Experience" entries={experience} />
                  <TimelineRail icon={GraduationCap} title="Education" entries={education} />
                </div>
              </section>
            )}

            {/* Why Work With Me */}
            <section data-reveal id="why" className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
              <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                <span className="w-10 h-[2px] bg-[#C5A059]" />
                Why Work With Me
              </h2>
              <div className="grid grid-cols-1 @md:grid-cols-3 gap-6">
                {valuePoints.map(({ title, description }, i) => {
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
            </section>

            {/* Process */}
            <section data-reveal className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
              <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                <span className="w-10 h-[2px] bg-[#C5A059]" />
                How It Works
              </h2>
              <div className="grid grid-cols-1 @md:grid-cols-3 gap-6">
                {processSteps.map(({ title, description }, i) => (
                  <div key={title} className="p-6 bg-[#F8F9FB] rounded-xl border border-[#EDF0F5]">
                    <span className="block font-heading font-black text-3xl text-[#C5A059]/40 mb-3">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="font-heading font-bold text-[#1B2B44] mb-2">{title}</h3>
                    <p className="text-[#4A4A4A] text-sm leading-relaxed">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* FAQ */}
            <section data-reveal id="faq" className="scroll-mt-24 bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
              <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                <span className="w-10 h-[2px] bg-[#C5A059]" />
                Frequently Asked Questions
              </h2>
              <div className="divide-y divide-[#F0F0F0]">
                {faqs.map(({ question, answer }) => (
                  <details key={question} className="group py-5">
                    <summary className="flex items-center justify-between cursor-pointer list-none text-lg font-semibold text-[#1B2B44]">
                      {question}
                      <span className="text-[#C5A059] text-xl transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
                    </summary>
                    <p className="mt-3 text-[#4A4A4A] leading-relaxed">{answer}</p>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 @lg:col-span-4 space-y-8">
            {/* Contact Card */}
            <div data-reveal id="contact" className="scroll-mt-24 bg-[#1B2B44] rounded-2xl p-8 shadow-2xl text-white">
              <h3 className="font-heading text-xl font-bold mb-8 text-[#C5A059] uppercase tracking-widest border-b border-white/10 pb-4">
                Credentials
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Phone className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Telephone</p>
                    <a href={`tel:${phoneNumber}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors">{phoneNumber || 'Available upon request'}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Mail className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Electronic Correspondence</p>
                    <a href={`mailto:${email}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors break-all leading-snug">{email || 'Professional Inquiry'}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <MapPin className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Office Location</p>
                    <p className="text-lg font-medium leading-tight">{officeAddress || 'Global Chambers'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Clock className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Consultation Hours</p>
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
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B2B44] border-t border-white/5">
        <div className="container mx-auto px-6 py-16 grid grid-cols-1 @md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-heading font-bold text-white">
              <Scale className="w-5 h-5 text-[#C5A059]" />
              {lawFirmName || fullName}
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs font-light">
              This website provides general information about the practice of {fullName}. It does not constitute legal advice, and viewing this site does not create an attorney-client relationship.
            </p>
          </div>

          <div>
            <h4 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-white/60">
              <li><a href="#about" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#practice-areas" className="hover:text-white transition-colors">Areas of Expertise</a></li>
              {hasTimeline && <li><a href="#timeline" className="hover:text-white transition-colors">Timeline</a></li>}
              <li><a href="#why" className="hover:text-white transition-colors">Why Work With Me</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
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
            <p>© {new Date().getFullYear()} {fullName}. All rights reserved. Attorney Advertising.</p>
            <p>Site by Wokil</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
