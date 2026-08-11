import { TimelineEntry, formatTimelineRange } from '@/types/lawyer';
import { SiteModel } from '@/types/site-model';
import { TEAM_PAGE_HREF } from '@/lib/firm-roster';
import { RosterList, type RosterPalette } from './RosterSection';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Shield, Award, Briefcase, Scale, Building2, Users, CalendarDays, UserCheck, MessageCircle, Wallet, Menu, GraduationCap, ArrowRight, type LucideIcon } from 'lucide-react';

interface ExecutiveThemeProps {
    site: SiteModel;
}

const FACT_ICONS: Record<string, LucideIcon> = { calendar: CalendarDays, users: Users };

// Executive in roster form: white cards, hairline slate borders, blue accents.
const ROSTER_PALETTE: RosterPalette = {
    card: 'bg-white border border-slate-200 rounded-xl p-8 flex flex-col @sm:flex-row gap-6 hover:border-blue-600 hover:shadow-xl transition-all',
    avatar: 'w-24 h-24 rounded-xl bg-slate-100 border border-slate-200',
    avatarText: 'font-heading text-2xl font-bold text-blue-700',
    name: 'font-heading font-bold text-xl text-slate-900 leading-snug',
    title: 'text-blue-700 font-medium',
    meta: 'text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1',
    body: 'text-slate-600 leading-relaxed',
    chip: 'px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700',
    link: 'text-slate-600 hover:text-blue-700 transition-colors',
    icon: 'text-blue-700',
    emptyCard: 'p-12 bg-white border border-dashed border-slate-300 rounded-xl text-center',
    emptyHeading: 'font-heading font-bold text-xl text-slate-900 mb-2',
    emptyBody: 'text-slate-500 leading-relaxed max-w-md mx-auto',
    emptyButton: 'px-5 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors',
};

// Value points are free text, so there's no icon to store per entry — cycle
// through these by position instead.
const VALUE_ICONS = [UserCheck, MessageCircle, Wallet];

/** Vertical rail of career-history rows, in the Executive slate/blue palette. */
function TimelineRail({ icon: Icon, title, entries }: { icon: LucideIcon; title: string; entries: TimelineEntry[] }) {
    if (entries.length === 0) return null;

    return (
        <div className="space-y-6">
            <h4 className="font-heading font-bold text-lg text-slate-900 uppercase tracking-widest flex items-center gap-3">
                <Icon className="w-5 h-5 text-blue-700" />
                {title}
            </h4>
            <ol className="border-l border-slate-200 pl-8 space-y-8">
                {entries.map((entry, index) => (
                    <li key={index} className="relative">
                        <span className="absolute -left-[37px] top-2 w-3 h-3 rounded-full bg-blue-700 ring-4 ring-slate-50" />
                        <p className="font-heading font-bold text-xl text-slate-900 leading-snug">{entry.title}</p>
                        <p className="text-slate-600 text-lg font-light">{entry.organization}</p>
                        <p className="text-xs font-bold uppercase tracking-widest text-blue-700 mt-1">{formatTimelineRange(entry)}</p>
                        {entry.description && (
                            <p className="text-slate-500 leading-relaxed mt-3">{entry.description}</p>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
}

export function ExecutiveTheme({ site }: ExecutiveThemeProps) {
    const isFirm = site.kind === 'firm';
    const lawyer = site.lawyer;
    const members = site.roster ?? [];

    const education = lawyer?.education ?? [];
    const experience = lawyer?.experience ?? [];
    const hasTimeline = education.length > 0 || experience.length > 0;

    const fullName = site.name;
    const professionalTitle = site.tagline;
    const lawFirmName = site.brandName;

    const areasOfPractice = site.areasOfPractice;
    const jurisdictions = site.jurisdictions;

    const { phoneNumber, email, officeAddress, officeHours } = site.contact;
    const bio = site.about;
    const profilePhoto = site.image?.src;
    const { website, linkedIn } = site.online;

    const BrandIcon = isFirm ? Building2 : Scale;
    const aboutHeading = isFirm ? site.heading.about : 'Executive Summary';

    // Nav mirrors whichever sections actually render below.
    const navLinks = isFirm
        ? [
            { href: '#about', label: aboutHeading },
            { href: '#practice-areas', label: site.heading.practice },
            { href: '#team', label: 'Our Team' },
        ]
        : [
            { href: '#about', label: aboutHeading },
            { href: '#practice-areas', label: site.heading.practice },
            ...(hasTimeline ? [{ href: '#timeline', label: 'Timeline' }] : []),
            { href: '#why', label: 'Why Work With Me' },
            { href: '#faq', label: 'FAQ' },
        ];

    return (
        <div className="min-h-screen bg-slate-50 font-body text-slate-900 selection:bg-blue-600/10">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    <a href="#top" className="flex items-center gap-2 min-w-0 font-heading font-bold text-slate-900 tracking-tight">
                        <BrandIcon className="w-5 h-5 text-blue-700 shrink-0" />
                        <span className="truncate">{lawFirmName}</span>
                    </a>
                    <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-slate-500">
                        {navLinks.map(({ href, label }) => (
                            <a key={href} href={href} className="hover:text-slate-900 transition-colors">{label}</a>
                        ))}
                    </div>
                    <a href="#contact" className="hidden @lg:block px-4 @md:px-5 py-2.5 bg-slate-900 hover:bg-blue-700 rounded-lg text-sm font-bold text-white transition-colors shrink-0">
                        Request Consultation
                    </a>
                    <details className="@lg:hidden relative shrink-0">
                        <summary className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-900 list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                            <Menu className="w-5 h-5" />
                        </summary>
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-2xl p-4 flex flex-col gap-3 text-sm font-medium text-slate-500 z-50">
                            {navLinks.map(({ href, label }) => (
                                <a key={href} href={href} className="hover:text-slate-900 transition-colors">{label}</a>
                            ))}
                            <a href="#contact" className="mt-1 px-4 py-2.5 bg-slate-900 hover:bg-blue-700 rounded-lg text-sm font-bold text-white text-center transition-colors">
                                Request Consultation
                            </a>
                        </div>
                    </details>
                </div>
            </nav>

            {/* Hero Header */}
            <header id="top" className="bg-white border-b border-slate-200 scroll-mt-16 min-h-[calc(100cqh-4rem)] flex flex-col justify-start @md:justify-center">
                <div className="container mx-auto px-6 pt-4 pb-8 @sm:pt-6 @sm:pb-12 @md:py-20">
                    <div className="flex flex-col @md:flex-row gap-10 @md:gap-16 items-center max-w-6xl mx-auto">
                        <div className="flex-1 space-y-6 @md:space-y-8 text-center @md:text-left animate-in fade-in slide-in-from-left duration-700">
                            <div className="space-y-3 @md:space-y-4">
                                <h2 className="text-blue-700 font-heading font-bold uppercase tracking-[0.25em] text-xs @md:text-sm">
                                    {lawFirmName}
                                </h2>
                                <h1 className="text-3xl @sm:text-4xl @md:text-6xl @lg:text-7xl font-heading font-extrabold text-slate-900 tracking-tight leading-none">
                                    {fullName}
                                </h1>
                                {professionalTitle && (
                                    <p className="text-base @sm:text-lg @md:text-2xl text-slate-500 font-light @md:max-w-2xl">
                                        {professionalTitle}
                                    </p>
                                )}
                                {site.facts.length > 0 && (
                                    <div className="flex flex-wrap gap-4 @md:gap-6 justify-center @md:justify-start pt-1 text-[10px] @md:text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                                        {site.facts.map(({ label, icon }) => {
                                            const Icon = icon ? FACT_ICONS[icon] : undefined;
                                            return (
                                                <span key={label} className="flex items-center gap-2">
                                                    {Icon && <Icon className="w-4 h-4 text-blue-700" />}
                                                    {label}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3 @md:gap-4 justify-center @md:justify-start">
                                <a href={`tel:${phoneNumber}`} className="px-6 @md:px-10 py-3 @md:py-4 bg-slate-900 text-white rounded-lg font-bold text-sm @md:text-base hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10">
                                    Request Consultation
                                </a>
                                <a href={`mailto:${email}`} className="px-6 @md:px-10 py-3 @md:py-4 border-2 border-slate-200 rounded-lg font-bold text-sm @md:text-base text-slate-700 hover:border-blue-700 hover:text-blue-700 transition-all">
                                    Direct Correspondence
                                </a>
                            </div>
                        </div>

                        <div className="w-40 @sm:w-52 mx-auto @md:w-96 @md:mx-0 animate-in fade-in zoom-in duration-700">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-700/5 rounded-2xl transform translate-x-4 translate-y-4 -z-10 transition-transform group-hover:translate-x-6 group-hover:translate-y-6" />
                                {profilePhoto ? (
                                    <img
                                        src={profilePhoto}
                                        alt={site.image?.alt ?? fullName}
                                        className={`w-full rounded-2xl shadow-2xl border border-white ${
                                            isFirm
                                                ? 'aspect-square object-contain bg-white p-8'
                                                : 'aspect-[4/5] object-cover'
                                        }`}
                                    />
                                ) : (
                                    <div className={`w-full bg-slate-200 rounded-2xl flex items-center justify-center shadow-2xl border border-white ${isFirm ? 'aspect-square' : 'aspect-[4/5]'}`}>
                                        <BrandIcon className="w-12 h-12 @sm:w-16 @sm:h-16 @md:w-24 @md:h-24 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-24 max-w-6xl">
                <div className="grid @lg:grid-cols-3 gap-16">
                    {/* Main Profile col */}
                    <div className="min-w-0 @lg:col-span-2 space-y-24">
                        <section data-reveal id="about" className="scroll-mt-24 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">{aboutHeading}</h3>
                            </div>
                            <p className="text-xl text-slate-600 leading-relaxed font-light">{bio}</p>
                            {site.aboutNote && (
                                <p className="text-sm text-slate-400 font-medium">{site.aboutNote}</p>
                            )}
                        </section>

                        {areasOfPractice.length > 0 && (
                            <section data-reveal id="practice-areas" className="scroll-mt-24 space-y-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-1 bg-blue-700" />
                                    <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">{site.heading.practice}</h3>
                                </div>
                                <div className="grid @sm:grid-cols-2 gap-6">
                                    {areasOfPractice.map((area) => (
                                        <div key={area} className="p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-xl transition-all group">
                                            <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                                                <Briefcase className="w-5 h-5 text-blue-700" />
                                            </div>
                                            <h4 className="font-heading font-bold text-lg text-slate-900 uppercase tracking-wide">{area}</h4>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* The one part that genuinely differs by site kind. */}
                        {isFirm ? (
                            <section data-reveal id="team" className="scroll-mt-24 space-y-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-1 bg-blue-700" />
                                    <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Our Team</h3>
                                </div>
                                <RosterList members={members} palette={ROSTER_PALETTE} email={email} phone={phoneNumber} />
                                {members.length > 0 && (
                                    <a
                                        href={TEAM_PAGE_HREF}
                                        className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-slate-900 hover:text-blue-700 transition-colors group"
                                    >
                                        Meet the full team
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                )}
                            </section>
                        ) : lawyer ? (
                            <>
                        <section data-reveal id="why" className="scroll-mt-24 space-y-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Why Work With Me</h3>
                            </div>
                            <div className="grid @sm:grid-cols-3 gap-6">
                                {lawyer.valuePoints.map(({ title, description }, i) => {
                                    const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
                                    return (
                                    <div key={title} className="p-8 bg-white border border-slate-200 rounded-xl">
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6">
                                            <Icon className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <h4 className="font-heading font-bold text-lg text-slate-900 mb-2">{title}</h4>
                                        <p className="text-sm text-slate-500">{description}</p>
                                    </div>
                                    );
                                })}
                            </div>
                        </section>

                        {hasTimeline && (
                            <section data-reveal id="timeline" className="scroll-mt-24 space-y-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-1 bg-blue-700" />
                                    <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Timeline</h3>
                                </div>
                                <div className="space-y-12">
                                    <TimelineRail icon={Briefcase} title="Experience" entries={experience} />
                                    <TimelineRail icon={GraduationCap} title="Education" entries={education} />
                                </div>
                            </section>
                        )}

                        <section data-reveal className="space-y-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">How It Works</h3>
                            </div>
                            <div className="grid @sm:grid-cols-3 gap-6">
                                {lawyer.processSteps.map(({ title, description }, i) => (
                                    <div key={title} className="p-8 bg-white border border-slate-200 rounded-xl">
                                        <span className="block font-heading font-black text-3xl text-blue-700/30 mb-4">{String(i + 1).padStart(2, '0')}</span>
                                        <h4 className="font-heading font-bold text-lg text-slate-900 mb-2">{title}</h4>
                                        <p className="text-sm text-slate-500">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section data-reveal id="faq" className="scroll-mt-24 space-y-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Frequently Asked Questions</h3>
                            </div>
                            <div className="divide-y divide-slate-200 border-y border-slate-200">
                                {lawyer.faqs.map(({ question, answer }) => (
                                    <details key={question} className="group py-6">
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-lg font-semibold text-slate-900">
                                            {question}
                                            <span className="text-blue-700 text-xl transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
                                        </summary>
                                        <p className="mt-4 text-slate-600 leading-relaxed">{answer}</p>
                                    </details>
                                ))}
                            </div>
                        </section>
                            </>
                        ) : null}
                    </div>

                    {/* Institutional Sidebar */}
                    <aside className="min-w-0 space-y-10">
                        <div data-reveal id="contact" className="scroll-mt-24 bg-white border-2 border-slate-900 p-8 rounded-2xl space-y-10 shadow-2xl">
                            <h4 className="font-heading font-bold text-xl uppercase tracking-widest border-b-2 border-slate-100 pb-4">
                                Contact Office
                            </h4>
                            <div className="space-y-8">
                                <div className="flex gap-4">
                                    <Phone className="w-6 h-6 text-blue-700 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Main Office</p>
                                        <p className="font-bold text-slate-900">{phoneNumber || 'Contact Unavailable'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Mail className="w-6 h-6 text-blue-700 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inquiries</p>
                                        <p className="font-bold text-slate-900 break-all">{email || 'Professional Inquiry'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <MapPin className="w-6 h-6 text-blue-700 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Office</p>
                                        <p className="font-bold text-slate-900 leading-tight">{officeAddress || 'Private Office'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <Clock className="w-6 h-6 text-blue-700 shrink-0" />
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Availability</p>
                                        <p className="font-bold text-slate-900">{officeHours || 'By Appointment Only'}</p>
                                    </div>
                                </div>
                            </div>

                            {(website || linkedIn) && (
                                <div className="pt-8 border-t border-slate-100 flex gap-4">
                                    {website && (
                                        <a href={website} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-slate-600">
                                            <Globe className="w-5 h-5" />
                                        </a>
                                    )}
                                    {linkedIn && (
                                        <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all text-slate-600">
                                            <Linkedin className="w-5 h-5" />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        {(site.facts.length > 0 || jurisdictions.length > 0) && (
                            <div data-reveal className="bg-blue-700 text-white p-8 rounded-2xl space-y-6">
                                <h4 className="font-heading font-bold text-lg uppercase tracking-widest opacity-60">
                                    {isFirm ? 'The Firm' : 'Credentials'}
                                </h4>
                                <div className="space-y-4">
                                    {site.facts.map(({ label }) => (
                                        <div key={label} className="flex items-center gap-3">
                                            <Award className="w-5 h-5 text-blue-300 shrink-0" />
                                            <span className="font-bold">{label}</span>
                                        </div>
                                    ))}
                                    {jurisdictions.map(j => (
                                        <div key={j} className="flex items-center gap-3">
                                            <Shield className="w-5 h-5 text-blue-300 shrink-0" />
                                            <span className="font-medium text-sm">Admitted: {j}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </main>

            <footer className="bg-slate-900 text-slate-500">
                <div className="container mx-auto px-6 py-16 max-w-6xl grid grid-cols-1 @md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-heading font-bold text-white">
                            <BrandIcon className="w-5 h-5 text-blue-400" />
                            {lawFirmName}
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">{site.disclaimer}</p>
                    </div>

                    <div>
                        <h4 className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            {navLinks.map(({ href, label }) => (
                                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                            ))}
                            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">Contact Office</h4>
                        <ul className="space-y-3 text-sm">
                            {phoneNumber && (
                                <li className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                                    <a href={`tel:${phoneNumber}`} className="hover:text-white transition-colors">{phoneNumber}</a>
                                </li>
                            )}
                            {email && (
                                <li className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                                    <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a>
                                </li>
                            )}
                            {officeAddress && (
                                <li className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                    <span>{officeAddress}</span>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800">
                    <div className="container mx-auto px-6 py-6 max-w-6xl flex flex-col @md:flex-row items-center justify-between gap-2 text-xs">
                        <p>© {new Date().getFullYear()} {fullName} · Attorney Advertising</p>
                        <p>Site by Wokil</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
