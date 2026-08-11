import { TimelineEntry, formatTimelineRange } from '@/types/lawyer';
import { SiteModel } from '@/types/site-model';
import { TEAM_PAGE_HREF } from '@/lib/firm-roster';
import { RosterList, type RosterPalette } from './RosterSection';
import {
    Phone, Mail, MapPin, Globe, Linkedin, Menu, Landmark, Briefcase, ShieldCheck,
    ChevronDown, Gavel, Building2, Users, Plane, Copyright, HeartPulse, Home, ReceiptText, ScrollText,
    Banknote, Scale, Leaf, Stethoscope, ArrowRight, type LucideIcon,
} from 'lucide-react';

interface SwissInstitutionalThemeProps {
    site: SiteModel;
}

// Swiss in roster form: hard edges, hairline rules, no shadows or rounding —
// the whole point of the theme is that nothing is soft.
const ROSTER_PALETTE: RosterPalette = {
    card: 'border border-[#c5c6ce] bg-white p-6 @sm:p-8 flex flex-col @sm:flex-row gap-6',
    avatar: 'w-24 h-24 bg-[#e2e2e2] grayscale',
    avatarText: 'text-2xl font-bold text-[#05162e]',
    name: 'text-2xl font-semibold tracking-tight uppercase text-[#05162e] leading-snug',
    title: 'text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e]',
    meta: 'text-[12px] font-bold uppercase tracking-[0.06em] text-[#75777e] mt-1',
    body: 'text-[15px] leading-6 text-[#1a1c1c]',
    chip: 'px-3 py-1 border border-[#c5c6ce] text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e] whitespace-nowrap',
    link: 'text-[#1a1c1c] hover:text-[#05162e] transition-colors',
    icon: 'text-[#75777e]',
    emptyCard: 'border border-dashed border-[#c5c6ce] bg-white p-12 text-center',
    emptyHeading: 'text-2xl font-semibold tracking-tight uppercase text-[#05162e] mb-2',
    emptyBody: 'text-[15px] leading-6 text-[#1a1c1c] max-w-md mx-auto',
    emptyButton: 'px-6 py-3 bg-[#1b2b44] text-white text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#05162e] transition-colors',
};

// Same practice-area -> glyph map as Corporate Elite; free-text areas fall
// back to the generic briefcase.
const PRACTICE_ICONS: Record<string, LucideIcon> = {
    'Corporate Law': Building2,
    'Criminal Defense': Gavel,
    'Family Law': Users,
    'Immigration Law': Plane,
    'Intellectual Property': Copyright,
    'Labor & Employment': Briefcase,
    'Personal Injury': HeartPulse,
    'Real Estate': Home,
    'Tax Law': ReceiptText,
    'Estate Planning': ScrollText,
    'Bankruptcy': Banknote,
    'Civil Litigation': Scale,
    'Environmental Law': Leaf,
    'Healthcare Law': Stethoscope,
    'Mergers & Acquisitions': Landmark,
};

// Same unified career+education rail as Corporate Elite (see that file for
// the sort rationale) — newest/current first, tagged Career or Degree.
function startYearOf(entry: TimelineEntry): number {
    const match = entry.startYear?.match(/\d{4}/);
    return match ? Number(match[0]) : -Infinity;
}

function unifiedTimeline(lawyer: SiteModel['lawyer']) {
    const tagged = [
        ...(lawyer?.experience ?? []).map((entry) => ({ entry, kind: 'Career' as const })),
        ...(lawyer?.education ?? []).map((entry) => ({ entry, kind: 'Degree' as const })),
    ];
    return tagged
        .map((row, index) => ({ ...row, index }))
        .sort((a, b) => {
            if (!!a.entry.current !== !!b.entry.current) return a.entry.current ? -1 : 1;
            const diff = startYearOf(b.entry) - startYearOf(a.entry);
            return Number.isNaN(diff) || diff === 0 ? a.index - b.index : diff;
        });
}

// Ports the "Jonathan Sterling — Swiss Institutional Redesign" Stitch mock
// (Wokil Design System project, screen 37008b86bdce49d29471feed7baa2302):
// navy-on-off-white, a single typeface (Inter, via the app's font-body), hard
// edges, hairline rules, a faint background grid, and "NN / SECTION" labels
// instead of colored badges or shadowed cards.
const HAIRLINE = '#E5E5E5';
// Matches the mock's .grid-bg exactly: 12 vertical column lines spanning the
// full element width, plus a 4px horizontal baseline grid (deliberately
// dense — it reads as a faint paper texture, not a visible ruling).
const GRID_BG: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, ${HAIRLINE} 1px, transparent 1px), linear-gradient(to bottom, ${HAIRLINE} 1px, transparent 1px)`,
    backgroundSize: 'calc(100% / 12) 4px',
};

function sectionLabel(index: string, label: string) {
    return (
        <span className="font-body text-[12px] font-bold uppercase tracking-[0.1em] text-[#5f5e5e] whitespace-nowrap">
            {index} / {label}
        </span>
    );
}

export function SwissInstitutionalTheme({ site }: SwissInstitutionalThemeProps) {
    const isFirm = site.kind === 'firm';
    const lawyer = site.lawyer;
    const members = site.roster ?? [];

    const fullName = site.name;
    const professionalTitle = site.tagline;
    const lawFirmName = site.brandName;

    const areasOfPractice = site.areasOfPractice;
    const jurisdictions = site.jurisdictions;

    const { phoneNumber, email, officeAddress, officeHours } = site.contact;
    const bio = site.about;
    const profilePhoto = site.image?.src;
    const { website, linkedIn } = site.online;

    const timeline = unifiedTimeline(lawyer);

    const navLinks = isFirm
        ? [
            ...(areasOfPractice.length > 0 ? [{ href: '#credentials', label: site.heading.practice }] : []),
            { href: '#team', label: 'Our Team' },
        ]
        : [
            ...(areasOfPractice.length > 0 ? [{ href: '#credentials', label: 'Expertise' }] : []),
            ...(timeline.length > 0 ? [{ href: '#timeline', label: 'Timeline' }] : []),
            { href: '#faq', label: 'FAQ' },
        ];

    return (
        <div className="min-h-screen bg-[#f9f9f9] font-body text-[#1a1c1c] selection:bg-[#05162e]/10" style={GRID_BG}>
            {/* Top nav */}
            <nav data-nav className="group/nav sticky top-0 z-50 bg-[#f9f9f9]/95 backdrop-blur-sm border-b border-[#c5c6ce]">
                <div className="container mx-auto max-w-[1280px] px-6 @md:px-12 h-16 flex items-center justify-between gap-6">
                    <a href="#top" className="block flex-1 min-w-0 truncate hover:whitespace-normal hover:overflow-visible text-base @sm:text-lg @md:text-xl font-bold uppercase tracking-tight text-[#05162e]">
                        {lawFirmName}
                    </a>
                    <div className="flex items-center gap-8 text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e] group-data-[collapsed]/nav:hidden">
                        {navLinks.map(({ href, label }) => (
                            <a key={href} href={href} className="hover:text-[#05162e] transition-colors">{label}</a>
                        ))}
                    </div>
                    <a href="#contact" className="shrink-0 px-6 py-3 bg-[#1b2b44] text-white text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#05162e] transition-colors whitespace-nowrap group-data-[collapsed]/nav:hidden">
                        Book Consultation
                    </a>
                    <details className="relative shrink-0 hidden group-data-[collapsed]/nav:block">
                        <summary className="flex items-center justify-center w-9 h-9 text-[#05162e] list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                            <Menu className="w-5 h-5" />
                        </summary>
                        <div className="absolute right-0 top-full w-56 bg-white border border-[#c5c6ce] p-4 flex flex-col gap-3 text-sm font-medium text-[#1a1c1c] z-50">
                            {navLinks.map(({ href, label }) => (
                                <a key={href} href={href} className="hover:text-[#05162e] transition-colors">{label}</a>
                            ))}
                            <a href="#contact" className="mt-1 px-4 py-2.5 bg-[#1b2b44] text-white text-sm font-bold text-center">Book Consultation</a>
                        </div>
                    </details>
                </div>
            </nav>

            <main className="container mx-auto max-w-[1280px] px-6 @md:px-12 py-12 flex flex-col gap-24">
                {/* Hero */}
                <section id="top" className="scroll-mt-24 grid grid-cols-1 @md:grid-cols-12 gap-8 @md:gap-6 items-start @md:items-center border-b border-[#c5c6ce] pb-4 @sm:pb-16 @md:pb-24 pt-0 @sm:pt-8 min-h-[calc(100cqh-7rem)]">
                    <div className="@md:col-span-7 flex flex-col gap-3 @sm:gap-8 @md:gap-12">
                        <h1 className="text-4xl @sm:text-6xl @lg:text-8xl font-bold leading-[0.95] tracking-tighter uppercase text-[#05162e] break-words">
                            {fullName}
                        </h1>
                        {site.facts.length > 0 && (
                            <div className="flex flex-col gap-3">
                                {site.facts.map(({ label }) => (
                                    <div key={label} className="flex items-center gap-4 border-l-4 border-[#05162e] pl-4">
                                        <span className="text-lg @sm:text-xl @md:text-2xl font-semibold uppercase tracking-tight leading-tight text-[#5f5e5e]">
                                            {label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="border border-[#c5c6ce] p-4 @sm:p-8 bg-white max-w-2xl">
                            {professionalTitle && (
                                <h2 className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e] mb-4">
                                    {professionalTitle}{site.affiliation ? ` — ${site.affiliation}` : ''}
                                </h2>
                            )}
                            <p className="text-lg leading-7 tracking-[-0.01em] text-[#1a1c1c] line-clamp-4 hover:line-clamp-none">{bio}</p>
                            {site.aboutNote && (
                                <p className="mt-4 text-[12px] font-bold uppercase tracking-[0.06em] text-[#75777e]">{site.aboutNote}</p>
                            )}
                        </div>
                        <a href="#contact" className="inline-block w-fit px-6 py-3 bg-[#1b2b44] text-white text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#05162e] transition-colors">
                            Book Consultation
                        </a>
                    </div>
                    <div className="hidden @md:block @md:col-span-5 h-[600px] bg-[#e2e2e2] relative overflow-hidden">
                        {profilePhoto ? (
                            <img
                                src={profilePhoto}
                                alt={site.image?.alt ?? fullName}
                                className={`absolute inset-0 w-full h-full ${isFirm ? 'object-contain bg-white p-16' : 'object-cover grayscale'}`}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Landmark className="w-24 h-24 text-[#c5c6ce]" />
                            </div>
                        )}
                    </div>
                </section>

                <div className="grid grid-cols-1 @md:grid-cols-12 gap-8 @md:gap-6">
                    {/* Sidebar */}
                    <aside className="@md:col-span-3 flex flex-col gap-12">
                        {jurisdictions.length > 0 && (
                            <div>
                                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e] border-b border-[#c5c6ce] pb-4 mb-4">
                                    Jurisdictions
                                </h3>
                                <ul className="flex flex-col gap-2">
                                    {jurisdictions.map((j) => (
                                        <li key={j} className="text-[15px] leading-6 text-[#1a1c1c] flex justify-between py-2 border-b border-[#c5c6ce]">
                                            <span>{j}</span>
                                            <ArrowRight className="w-4 h-4 text-[#75777e]" />
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        {officeHours && (
                            <div>
                                <h3 className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e] border-b border-[#c5c6ce] pb-4 mb-4">
                                    Office Hours
                                </h3>
                                <ul className="text-[15px] leading-6 text-[#1a1c1c]">
                                    {officeHours.split('\n').filter((line) => line.trim()).map((line, i, lines) => {
                                        const [, label, time] = line.match(/^(\D+?)\s*[:—–]?\s+(\d.*)$/) ?? [];
                                        return (
                                            <li key={i} className={`flex justify-between gap-4 py-2 ${i < lines.length - 1 ? 'border-b border-[#c5c6ce]' : ''}`}>
                                                {time ? <><span>{label}</span><span>{time}</span></> : <span>{line}</span>}
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </aside>

                    {/* Main content */}
                    <div className="@md:col-span-9 flex flex-col gap-24">
                        {/* Practice areas */}
                        {areasOfPractice.length > 0 && (
                            <section id="credentials" className="scroll-mt-24">
                                <div className="flex flex-col @sm:flex-row @sm:items-baseline justify-between border-b border-[#c5c6ce] pb-4 mb-8 gap-1 @sm:gap-4">
                                    <h2 className="text-2xl font-semibold tracking-tight uppercase text-[#05162e]">Core Expertise</h2>
                                    {sectionLabel('01', site.heading.practice.toUpperCase())}
                                </div>
                                <div className="grid grid-cols-1 @md:grid-cols-2 gap-px" style={{ backgroundColor: HAIRLINE }}>
                                    {areasOfPractice.map((area, i) => {
                                        const Icon = PRACTICE_ICONS[area] ?? Briefcase;
                                        return (
                                            <div key={area} className="bg-white p-8 flex flex-col justify-between min-h-[200px] hover:bg-[#f9f9f9] transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-[14px] font-bold tracking-[0.1em] text-[#05162e]">{String(i + 1).padStart(2, '0')}</span>
                                                    <Icon className="w-8 h-8 text-[#05162e]" />
                                                </div>
                                                <h3 className="text-2xl font-semibold tracking-tight text-[#05162e] mt-6">{area}</h3>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* The one part that genuinely differs by site kind. */}
                        {isFirm ? (
                            <section id="team" className="scroll-mt-24">
                                <div className="flex flex-col @sm:flex-row @sm:items-baseline justify-between border-b border-[#c5c6ce] pb-4 mb-8 gap-1 @sm:gap-4">
                                    <h2 className="text-2xl font-semibold tracking-tight uppercase text-[#05162e]">Our Team</h2>
                                    {sectionLabel('02', 'TEAM')}
                                </div>
                                <RosterList members={members} palette={ROSTER_PALETTE} email={email} phone={phoneNumber} />
                                {members.length > 0 && (
                                    <a
                                        href={TEAM_PAGE_HREF}
                                        className="mt-8 inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.06em] text-[#05162e] hover:opacity-70 transition-opacity group"
                                    >
                                        Meet the full team
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                    </a>
                                )}
                            </section>
                        ) : lawyer ? (
                            <>
                        {/* Timeline */}
                        {timeline.length > 0 && (
                            <section id="timeline" className="scroll-mt-24">
                                <div className="flex flex-col @sm:flex-row @sm:items-baseline justify-between border-b border-[#c5c6ce] pb-4 mb-8 gap-1 @sm:gap-4">
                                    <h2 className="text-2xl font-semibold tracking-tight uppercase text-[#05162e]">Professional Record</h2>
                                    {sectionLabel('02', 'TIMELINE')}
                                </div>
                                <div className="relative pl-8 border-l border-[#05162e]">
                                    {timeline.map(({ entry, kind, index }, i) => (
                                        <div key={`${kind}-${index}`} className={i < timeline.length - 1 ? 'mb-12 relative' : 'relative'}>
                                            <div className={`absolute w-3 h-3 -left-[38px] top-2 ${i === 0 ? 'bg-[#05162e]' : 'bg-[#c5c6ce]'}`} />
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                {formatTimelineRange(entry) && (
                                                    <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e]">
                                                        {formatTimelineRange(entry)}
                                                    </span>
                                                )}
                                                <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#75777e]">{kind}</span>
                                            </div>
                                            {entry.title && <h3 className="text-2xl font-semibold tracking-tight text-[#05162e]">{entry.title}</h3>}
                                            {entry.organization && <p className="text-lg leading-7 tracking-[-0.01em] text-[#1a1c1c] mb-1">{entry.organization}</p>}
                                            {entry.description && <p className="text-[15px] leading-6 text-[#5f5e5e]">{entry.description}</p>}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Why work with me */}
                        <section id="why" className="scroll-mt-24">
                            <div className="flex flex-col @sm:flex-row @sm:items-baseline justify-between border-b border-[#c5c6ce] pb-4 mb-8 gap-1 @sm:gap-4">
                                <h2 className="text-2xl font-semibold tracking-tight uppercase text-[#05162e]">Guiding Principles</h2>
                                {sectionLabel('03', 'WHY WORK WITH ME')}
                            </div>
                            <div className="grid grid-cols-1 @md:grid-cols-3 gap-8">
                                {lawyer.valuePoints.map(({ title, description }, i) => (
                                    <div key={title} className="border border-[#c5c6ce] p-6 bg-white flex flex-col h-full">
                                        <span className="text-[14px] font-bold tracking-[0.1em] text-[#75777e] mb-6 block border-b border-[#c5c6ce] pb-2">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h3 className="text-lg leading-7 font-bold tracking-[-0.01em] text-[#05162e] mb-4">{title}</h3>
                                        <p className="text-[15px] leading-6 text-[#5f5e5e]">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* How it works */}
                        <section>
                            <div className="flex flex-col @sm:flex-row @sm:items-baseline justify-between border-b border-[#c5c6ce] pb-4 mb-8 gap-1 @sm:gap-4">
                                <h2 className="text-2xl font-semibold tracking-tight uppercase text-[#05162e]">How It Works</h2>
                                {sectionLabel('04', 'PROCESS')}
                            </div>
                            <div className="grid grid-cols-1 @md:grid-cols-3 gap-px" style={{ backgroundColor: HAIRLINE }}>
                                {lawyer.processSteps.map(({ title, description }, i) => (
                                    <div key={title} className="bg-white p-6">
                                        <span className="text-[14px] font-bold tracking-[0.1em] text-[#05162e] block mb-4">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <h3 className="text-lg leading-7 font-bold tracking-[-0.01em] text-[#05162e] mb-2">{title}</h3>
                                        <p className="text-[15px] leading-6 text-[#5f5e5e]">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* FAQ */}
                        <section id="faq" className="scroll-mt-24">
                            <div className="flex flex-col @sm:flex-row @sm:items-baseline justify-between border-b border-[#c5c6ce] pb-4 mb-8 gap-1 @sm:gap-4">
                                <h2 className="text-2xl font-semibold tracking-tight uppercase text-[#05162e]">Frequently Asked Questions</h2>
                                {sectionLabel('05', 'FAQ')}
                            </div>
                            <div className="divide-y divide-[#c5c6ce] border-b border-[#c5c6ce]">
                                {lawyer.faqs.map(({ question, answer }) => (
                                    <details key={question} className="group">
                                        <summary className="flex justify-between items-center gap-4 py-4 cursor-pointer list-none text-lg font-bold tracking-[-0.01em] text-[#05162e] [&::-webkit-details-marker]:hidden">
                                            {question}
                                            <ChevronDown className="w-5 h-5 shrink-0 text-[#75777e] transition-transform group-open:rotate-180" />
                                        </summary>
                                        <div className="pb-4 text-[15px] leading-6 text-[#5f5e5e]">{answer}</div>
                                    </details>
                                ))}
                            </div>
                        </section>
                            </>
                        ) : null}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer id="contact" className="scroll-mt-24 bg-[#eeeeee] border-t border-[#c5c6ce] mt-24">
                <div className="container mx-auto max-w-[1280px] px-6 @md:px-12 py-12 grid grid-cols-1 @md:grid-cols-12 gap-8">
                    <div className="@md:col-span-4 flex flex-col justify-between">
                        <div className="text-[12px] font-bold uppercase tracking-tight text-[#05162e] mb-8">{lawFirmName}</div>
                        <p className="text-[15px] leading-6 text-[#5f5e5e]">
                            © {new Date().getFullYear()} {lawFirmName.toUpperCase()}. ALL RIGHTS RESERVED.
                        </p>
                    </div>

                    <div className="@md:col-span-3 @md:col-start-6">
                        <h4 className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e] mb-4">Contact</h4>
                        <address className="not-italic flex flex-col gap-3 text-[15px] leading-6 text-[#5f5e5e]">
                            {officeAddress && (
                                <p className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-1 shrink-0" />
                                    <span className="whitespace-pre-line">{officeAddress}</span>
                                </p>
                            )}
                            {phoneNumber && (
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <a href={`tel:${phoneNumber}`} className="hover:text-[#05162e] transition-colors">{phoneNumber}</a>
                                </p>
                            )}
                            {email && (
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <a href={`mailto:${email}`} className="hover:text-[#05162e] transition-colors break-all">{email}</a>
                                </p>
                            )}
                            {jurisdictions.length > 0 && (
                                <p className="flex items-start gap-2">
                                    <ShieldCheck className="w-4 h-4 mt-1 shrink-0" />
                                    <span>Admitted: {jurisdictions.join(', ')}</span>
                                </p>
                            )}
                        </address>
                    </div>

                    <div className="@md:col-span-2">
                        <h4 className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#5f5e5e] mb-4">Directory</h4>
                        <ul className="flex flex-col gap-3 text-[15px] leading-6 text-[#5f5e5e]">
                            {areasOfPractice.length > 0 && <li><a href="#credentials" className="hover:text-[#05162e] transition-colors">Expertise</a></li>}
                            {timeline.length > 0 && <li><a href="#timeline" className="hover:text-[#05162e] transition-colors">Timeline</a></li>}
                            <li><a href="#faq" className="hover:text-[#05162e] transition-colors">FAQ</a></li>
                            {(website || linkedIn) && (
                                <li className="flex gap-3 pt-1">
                                    {linkedIn && (
                                        <a href={linkedIn} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="hover:text-[#05162e] transition-colors">
                                            <Linkedin className="w-4 h-4" />
                                        </a>
                                    )}
                                    {website && (
                                        <a href={website} target="_blank" rel="noopener noreferrer" title="Website" className="hover:text-[#05162e] transition-colors">
                                            <Globe className="w-4 h-4" />
                                        </a>
                                    )}
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
