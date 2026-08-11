import { TimelineEntry, formatTimelineRange } from '@/types/lawyer';
import { SiteModel } from '@/types/site-model';
import { TEAM_PAGE_HREF } from '@/lib/firm-roster';
import { RosterList, type RosterPalette } from './RosterSection';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale, BookOpen, PenTool as Pen, Gavel, Building2, UserCheck, MessageCircle, Wallet, Menu, GraduationCap, Briefcase, ArrowRight, type LucideIcon } from 'lucide-react';

interface LegalCraftThemeProps {
    site: SiteModel;
}

// LegalCraft in roster form: warm cream panels with the theme's left tan rule.
const ROSTER_PALETTE: RosterPalette = {
    card: 'p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373] flex flex-col @sm:flex-row gap-6 hover:bg-white hover:shadow-2xl transition-all',
    avatar: 'w-24 h-24 rounded-sm bg-white border border-[#E5E5E5]',
    avatarText: 'font-heading text-2xl font-bold text-[#D4A373]',
    name: 'text-xl font-bold text-[#1A120B] font-heading leading-snug',
    title: 'text-[#D4A373] font-heading italic font-medium',
    meta: 'text-[10px] font-bold uppercase tracking-[0.2em] text-[#3C2A21]/50 mt-1',
    body: 'text-sm text-[#3C2A21]/70 leading-relaxed',
    chip: 'px-3 py-1 bg-white border border-[#E5E5E5] rounded-sm text-xs font-medium text-[#1A120B]',
    link: 'text-[#3C2A21] hover:text-[#D4A373] transition-colors',
    icon: 'text-[#D4A373]',
    emptyCard: 'p-12 bg-[#F5F2ED] border-l-4 border-[#D4A373] text-center',
    emptyHeading: 'font-heading text-xl font-bold text-[#1A120B] mb-2',
    emptyBody: 'text-sm text-[#3C2A21]/70 leading-relaxed max-w-md mx-auto',
    emptyButton: 'px-5 py-2.5 bg-[#3C2A21] text-white rounded-sm font-bold uppercase tracking-wide hover:bg-[#1A120B] transition-colors',
};

// Value points are free text, so there's no icon to store per entry — cycle
// through these by position instead.
const VALUE_ICONS = [UserCheck, MessageCircle, Wallet];

/** Vertical rail of career-history rows, in the LegalCraft cream/tan palette. */
function TimelineRail({ icon: Icon, title, entries }: { icon: LucideIcon; title: string; entries: TimelineEntry[] }) {
    if (entries.length === 0) return null;

    return (
        <div className="space-y-8">
            <h4 className="font-heading text-lg font-bold text-[#1A120B] uppercase tracking-[0.2em] flex items-center gap-3">
                <Icon className="w-5 h-5 text-[#D4A373]" />
                {title}
            </h4>
            <ol className="space-y-6">
                {entries.map((entry, index) => (
                    <li key={index} className="p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373]">
                        <p className="text-xs uppercase tracking-[0.3em] font-bold text-[#3C2A21]/50 mb-3">{formatTimelineRange(entry)}</p>
                        <h5 className="text-xl font-bold text-[#1A120B] font-heading">{entry.title}</h5>
                        <p className="text-[#3C2A21]/70 italic font-heading">{entry.organization}</p>
                        {entry.description && (
                            <p className="text-sm text-[#3C2A21]/70 leading-relaxed mt-4">{entry.description}</p>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function LegalCraftTheme({ site }: LegalCraftThemeProps) {
    const isFirm = site.kind === 'firm';
    const lawyer = site.lawyer;
    const members = site.roster ?? [];

    const education = lawyer?.education ?? [];
    const experience = lawyer?.experience ?? [];
    const hasTimeline = education.length > 0 || experience.length > 0;

    const fullName = site.name;
    const professionalTitle = site.tagline;
    const lawFirmName = site.affiliation;

    const areasOfPractice = site.areasOfPractice;

    const { phoneNumber, email, officeAddress, officeHours } = site.contact;
    const bio = site.about;
    const profilePhoto = site.image?.src;
    const { website, linkedIn } = site.online;

    const BrandIcon = isFirm ? Building2 : Gavel;
    const aboutHeading = isFirm ? site.heading.about : 'Professional Philosophy';
    const practiceHeading = isFirm ? site.heading.practice : 'Crafted Expertise';

    const navLinks = isFirm
        ? [
            { href: '#about', label: aboutHeading },
            { href: '#practice-areas', label: practiceHeading },
            { href: '#team', label: 'Our Team' },
        ]
        : [
            { href: '#about', label: 'Philosophy' },
            { href: '#practice-areas', label: 'Expertise' },
            ...(hasTimeline ? [{ href: '#timeline', label: 'Timeline' }] : []),
            { href: '#why', label: 'Why Work With Me' },
            { href: '#faq', label: 'FAQ' },
        ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-body text-[#3C2A21] selection:bg-[#D4A373]/20">
            {/* Decorative Border */}
            <div className="h-2 bg-gradient-to-r from-[#1A120B] via-[#3C2A21] to-[#1A120B]" />

            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E5E5E5]">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    <a href="#top" className="flex items-center gap-2 min-w-0 font-heading font-bold text-[#1A120B] tracking-tight">
                        <BrandIcon className="w-5 h-5 text-[#D4A373] shrink-0" />
                        <span className="truncate">{site.brandName}</span>
                    </a>
                    <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-[#3C2A21]/60">
                        {navLinks.map(({ href, label }) => (
                            <a key={href} href={href} className="hover:text-[#1A120B] transition-colors">{label}</a>
                        ))}
                    </div>
                    <a href="#contact" className="hidden @lg:block px-4 @md:px-5 py-2.5 bg-[#3C2A21] hover:bg-[#1A120B] rounded-sm text-sm font-bold text-white tracking-wide uppercase transition-colors shrink-0">
                        Request Interview
                    </a>
                    <details className="@lg:hidden relative shrink-0">
                        <summary className="flex items-center justify-center w-9 h-9 rounded-sm text-[#1A120B] list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                            <Menu className="w-5 h-5" />
                        </summary>
                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#FDFBF7] border border-[#E5E5E5] rounded-sm shadow-2xl p-4 flex flex-col gap-3 text-sm font-medium text-[#3C2A21]/70 z-50">
                            {navLinks.map(({ href, label }) => (
                                <a key={href} href={href} className="hover:text-[#1A120B] transition-colors">{label}</a>
                            ))}
                            <a href="#contact" className="mt-1 px-4 py-2.5 bg-[#3C2A21] hover:bg-[#1A120B] rounded-sm text-sm font-bold text-white tracking-wide uppercase text-center transition-colors">
                                Request Interview
                            </a>
                        </div>
                    </details>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="top" className="relative pt-8 pb-10 @sm:pt-16 @sm:pb-20 @md:pt-24 @md:pb-32 overflow-hidden border-b border-[#E5E5E5] scroll-mt-16 min-h-[calc(100cqh-4rem)] flex flex-col justify-center">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3C2A21]/[0.02] -skew-x-12 transform translate-x-1/2" />
                <div className="container mx-auto px-6 relative">
                    <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-6 @sm:space-y-10">
                        <div className="flex items-center gap-4 @sm:gap-6 animate-in fade-in slide-in-from-top duration-700">
                            <span className="h-px w-8 @sm:w-12 bg-[#D4A373]" />
                            <div className="w-10 h-10 @sm:w-16 @sm:h-16 rounded-full border border-[#D4A373] flex items-center justify-center">
                                <BrandIcon className="w-5 h-5 @sm:w-8 @sm:h-8 text-[#D4A373]" />
                            </div>
                            <span className="h-px w-8 @sm:w-12 bg-[#D4A373]" />
                        </div>

                        <div className="space-y-3 @sm:space-y-6 animate-in fade-in duration-1000">
                            <h1 className="text-4xl @sm:text-5xl @md:text-7xl @lg:text-8xl font-heading font-bold text-[#1A120B] leading-tight tracking-tight">
                                {fullName}
                            </h1>
                            <div className="flex flex-col items-center gap-2">
                                {professionalTitle && (
                                    <span className="text-lg @sm:text-xl @md:text-2xl @lg:text-3xl font-heading italic text-[#D4A373] font-medium">
                                        {professionalTitle}
                                    </span>
                                )}
                                {lawFirmName && (
                                    <span className="text-lg text-[#3C2A21]/60 font-medium uppercase tracking-[0.3em] font-heading">
                                        {lawFirmName}
                                    </span>
                                )}
                                {site.facts.length > 0 && (
                                    <span className="text-xs text-[#3C2A21]/50 font-bold uppercase tracking-[0.3em] pt-2">
                                        {site.facts.map((f) => f.label).join(' · ')}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-3 @sm:gap-6 mt-2 @sm:mt-12">
                            <a href={`tel:${phoneNumber}`} className="group relative px-6 py-3 @sm:px-12 @sm:py-5 overflow-hidden rounded-sm font-bold text-white text-xs @sm:text-base tracking-wide @sm:tracking-widest uppercase transition-all">
                                <div className="absolute inset-0 bg-[#3C2A21] group-hover:bg-[#1A120B] transition-colors" />
                                <span className="relative flex items-center gap-2 @sm:gap-3 whitespace-nowrap">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    Request Interview
                                </span>
                            </a>
                            <a href={`mailto:${email}`} className="px-6 py-3 @sm:px-12 @sm:py-5 border-2 border-[#3C2A21] rounded-sm font-bold text-[#3C2A21] text-xs @sm:text-base tracking-wide @sm:tracking-widest uppercase hover:bg-[#3C2A21] hover:text-white transition-all transform hover:-translate-y-1 whitespace-nowrap">
                                Correspondence
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-24 max-w-6xl">
                <div className="grid @lg:grid-cols-12 gap-20">
                    {/* Detailed Bio */}
                    <div data-reveal id="about" className="scroll-mt-24 min-w-0 @lg:col-span-12 space-y-12 mb-12">
                        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                            <h2 className="font-heading text-4xl font-bold text-[#1A120B]">{aboutHeading}</h2>
                            <div className="h-1.5 w-24 bg-[#D4A373] rounded-full" />
                            <p className="text-2xl text-[#3C2A21]/80 leading-relaxed font-light italic">
                                &ldquo;{bio}&rdquo;
                            </p>
                            {site.aboutNote && (
                                <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#3C2A21]/50">{site.aboutNote}</p>
                            )}
                        </div>
                    </div>

                    {/* Core Expertise */}
                    <div className="min-w-0 @lg:col-span-8 space-y-16">
                        {areasOfPractice.length > 0 && (
                            <section data-reveal id="practice-areas" className="scroll-mt-24">
                                <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                    <Pen className="w-6 h-6 text-[#D4A373]" />
                                    {practiceHeading}
                                </h3>
                                <div className="grid @md:grid-cols-2 gap-8">
                                    {areasOfPractice.map((area, idx) => (
                                        <div key={area} className="relative p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373] group hover:bg-white hover:shadow-2xl transition-all">
                                            <span className="absolute top-4 right-6 text-[#D4A373]/20 font-heading text-4xl font-black">0{idx + 1}</span>
                                            <h4 className="text-xl font-bold text-[#1A120B] font-heading">{area}</h4>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* The one part that genuinely differs by site kind. */}
                        {isFirm ? (
                            <section data-reveal id="team" className="scroll-mt-24 space-y-10">
                                <h3 className="font-heading text-2xl font-bold text-[#1A120B] flex items-center gap-4 uppercase tracking-wider">
                                    <Pen className="w-6 h-6 text-[#D4A373]" />
                                    Our Team
                                </h3>
                                <RosterList members={members} palette={ROSTER_PALETTE} email={email} phone={phoneNumber} />
                                {members.length > 0 && (
                                    <a
                                        href={TEAM_PAGE_HREF}
                                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1A120B] hover:text-[#D4A373] transition-colors group"
                                    >
                                        Meet the full team
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                )}
                            </section>
                        ) : lawyer ? (
                            <>
                        {hasTimeline && (
                            <section data-reveal id="timeline" className="scroll-mt-24">
                                <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                    <Pen className="w-6 h-6 text-[#D4A373]" />
                                    Timeline
                                </h3>
                                <div className="space-y-12">
                                    <TimelineRail icon={Briefcase} title="Experience" entries={experience} />
                                    <TimelineRail icon={GraduationCap} title="Education" entries={education} />
                                </div>
                            </section>
                        )}

                        <section data-reveal className="bg-[#1A120B] text-[#D4A373] p-16 rounded-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                <Scale className="w-64 h-64" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-sm uppercase tracking-[0.4em] font-bold text-[#D4A373]/60 mb-8">Professional Standing</h3>
                                <div className="flex items-center gap-8">
                                    <div className="space-y-1">
                                        <p className="text-2xl font-heading font-medium text-white">{site.facts[0]?.label}</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section data-reveal id="why" className="scroll-mt-24">
                            <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                <Pen className="w-6 h-6 text-[#D4A373]" />
                                Why Work With Me
                            </h3>
                            <div className="grid @md:grid-cols-3 gap-8">
                                {lawyer.valuePoints.map(({ title, description }, i) => {
                                    const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
                                    return (
                                    <div key={title} className="p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373]">
                                        <Icon className="w-6 h-6 text-[#D4A373] mb-4" />
                                        <h4 className="text-lg font-bold text-[#1A120B] font-heading mb-2">{title}</h4>
                                        <p className="text-sm text-[#3C2A21]/70 leading-relaxed">{description}</p>
                                    </div>
                                    );
                                })}
                            </div>
                        </section>

                        <section data-reveal>
                            <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                <Pen className="w-6 h-6 text-[#D4A373]" />
                                How It Works
                            </h3>
                            <div className="grid @md:grid-cols-3 gap-8">
                                {lawyer.processSteps.map(({ title, description }, i) => (
                                    <div key={title} className="p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373]">
                                        <span className="block font-heading font-black text-3xl text-[#D4A373]/40 mb-4">{String(i + 1).padStart(2, '0')}</span>
                                        <h4 className="text-lg font-bold text-[#1A120B] font-heading mb-2">{title}</h4>
                                        <p className="text-sm text-[#3C2A21]/70 leading-relaxed">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section data-reveal id="faq" className="scroll-mt-24">
                            <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                <Pen className="w-6 h-6 text-[#D4A373]" />
                                Frequently Asked Questions
                            </h3>
                            <div className="divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
                                {lawyer.faqs.map(({ question, answer }) => (
                                    <details key={question} className="group py-6">
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-lg font-semibold text-[#1A120B]">
                                            {question}
                                            <span className="text-[#D4A373] text-xl transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
                                        </summary>
                                        <p className="mt-4 text-[#3C2A21]/70 leading-relaxed">{answer}</p>
                                    </details>
                                ))}
                            </div>
                        </section>
                            </>
                        ) : null}
                    </div>

                    {/* Sidebar */}
                    <div className="min-w-0 @lg:col-span-4 space-y-12">
                        <div data-reveal className="relative p-1 bg-gradient-to-br from-[#D4A373] to-[#3C2A21] rounded-sm shadow-2xl">
                            {profilePhoto ? (
                                <img
                                    src={profilePhoto}
                                    alt={site.image?.alt ?? fullName}
                                    className={`w-full aspect-square ${isFirm ? 'object-contain bg-white p-8' : 'object-cover'}`}
                                />
                            ) : (
                                <div className="w-full aspect-square bg-[#F5F2ED] flex items-center justify-center">
                                    {isFirm ? <BrandIcon className="w-20 h-20 text-[#D4A373]" /> : <BookOpen className="w-20 h-20 text-[#D4A373]" />}
                                </div>
                            )}
                        </div>

                        <div data-reveal id="contact" className="scroll-mt-24 space-y-10 bg-white p-10 border border-[#E5E5E5] shadow-sm">
                            <h4 className="font-heading font-bold text-lg uppercase tracking-widest border-b border-[#E5E5E5] pb-4">Chambers Details</h4>
                            <div className="space-y-8">
                                <div className="flex gap-4 items-start">
                                    <MapPin className="w-5 h-5 text-[#D4A373] mt-1 shrink-0" />
                                    <p className="text-[#3C2A21] font-medium leading-relaxed">{officeAddress || 'Private Chambers'}</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Phone className="w-5 h-5 text-[#D4A373] shrink-0" />
                                    <a href={`tel:${phoneNumber}`} className="text-[#3C2A21] font-medium hover:text-[#D4A373] transition-colors">{phoneNumber || 'By Appointment'}</a>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Mail className="w-5 h-5 text-[#D4A373] shrink-0" />
                                    <a href={`mailto:${email}`} className="text-[#3C2A21] font-medium hover:text-[#D4A373] transition-colors break-all">{email || 'Professional Inquiry'}</a>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Clock className="w-5 h-5 text-[#D4A373] shrink-0" />
                                    <p className="text-[#3C2A21] font-medium">{officeHours || 'By Appointment'}</p>
                                </div>
                                {website && (
                                    <div className="flex gap-4 items-center">
                                        <Globe className="w-5 h-5 text-[#D4A373] shrink-0" />
                                        <a href={website} target="_blank" rel="noopener noreferrer" className="text-[#3C2A21] font-medium hover:text-[#D4A373] transition-colors">Website</a>
                                    </div>
                                )}
                                {linkedIn && (
                                    <div className="flex gap-4 items-center">
                                        <Linkedin className="w-5 h-5 text-[#D4A373] shrink-0" />
                                        <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="text-[#3C2A21] font-medium hover:text-[#D4A373] transition-colors">LinkedIn</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-[#1A120B] text-[#D4A373]/80 border-t-8 border-[#D4A373]">
                <div className="container mx-auto px-6 py-16 max-w-6xl grid grid-cols-1 @md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-heading font-bold text-white">
                            <BrandIcon className="w-5 h-5 text-[#D4A373]" />
                            {site.brandName}
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs opacity-70">{site.disclaimer}</p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Quick Links</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            {navLinks.map(({ href, label }) => (
                                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                            ))}
                            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Chambers</h4>
                        <ul className="space-y-3 text-sm opacity-80">
                            {phoneNumber && (
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <a href={`tel:${phoneNumber}`} className="hover:text-white transition-colors">{phoneNumber}</a>
                                </li>
                            )}
                            {email && (
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a>
                                </li>
                            )}
                            {officeAddress && (
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                    <span>{officeAddress}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-[#D4A373]/10">
                    <div className="container mx-auto px-6 py-6 max-w-6xl flex flex-col @md:flex-row items-center justify-between gap-2 text-xs opacity-50">
                        <p>© {new Date().getFullYear()} {fullName} · Attorney Advertising</p>
                        <p>Site by Wokil</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
