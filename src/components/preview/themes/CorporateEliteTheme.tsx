/* eslint-disable @next/next/no-html-link-for-pages */
import { TimelineEntry, formatTimelineRange } from '@/types/lawyer';
import { SiteModel } from '@/types/site-model';
import { TEAM_PAGE_HREF, SitePage, sectionHref } from '@/lib/firm-roster';
import { RosterList, TeamBody, type RosterPalette } from './RosterSection';
import {
    Phone, Mail, MapPin, Globe, Linkedin, Menu, Landmark, Verified, Handshake, Briefcase, ShieldCheck,
    ChevronDown, Gavel, Building2, Users, Plane, Copyright, HeartPulse, Home, ReceiptText, ScrollText,
    Banknote, Scale, Leaf, Stethoscope, ArrowRight, ArrowLeft, type LucideIcon,
} from 'lucide-react';

interface CorporateEliteThemeProps {
    site: SiteModel;
    page?: SitePage;
}

// Corporate Elite's People page: the roster palette at full-entry scale.
const TEAM_PALETTE: RosterPalette = {
    card: 'bg-[#faf9f8] p-8 @md:p-10 rounded-lg border border-[#c5c6ce]/20 shadow-[0_4px_12px_rgba(27,43,68,0.08)]',
    avatar: 'w-32 h-32 rounded-lg bg-[#1b2b44]/10',
    avatarText: 'font-heading text-3xl text-[#05162e]',
    name: 'font-heading text-3xl text-[#05162e] leading-snug',
    title: 'text-lg font-semibold text-[#05162e]',
    meta: 'text-[12px] font-semibold uppercase tracking-[0.1em] text-[#44474d]',
    body: 'text-[#44474d] text-lg leading-relaxed',
    sectionLabel: 'text-[12px] font-semibold uppercase tracking-[0.1em] text-[#05162e]',
    chip: 'px-3 py-1.5 rounded-full bg-white border border-[#c5c6ce]/40 text-sm font-medium text-[#44474d] whitespace-nowrap',
    link: 'text-[#44474d] hover:text-[#05162e] transition-colors',
    contactRow: 'pt-2 border-t border-[#c5c6ce]/30 mt-2',
    icon: 'text-[#05162e]',

    jumpCard: 'bg-white p-6 rounded-lg border border-[#c5c6ce]/20 shadow-[0_4px_12px_rgba(27,43,68,0.08)]',
    jumpHeading: 'font-heading text-[12px] font-semibold uppercase tracking-[0.1em] text-[#05162e] mb-4',
    jumpName: 'font-semibold text-[#05162e]',
    jumpTitle: 'text-[#44474d] text-xs',

    railList: 'border-l border-[#c5c6ce]/40 pl-6',
    railDot: '-left-[31px] top-2 w-3 h-3 rounded-full bg-[#05162e] ring-4 ring-[#faf9f8]',
    railTitle: 'font-heading text-lg text-[#05162e] leading-snug',
    railOrg: 'text-[#44474d]',
    railRange: 'text-[12px] font-semibold uppercase tracking-[0.1em] text-[#44474d] mt-1',
    railBody: 'text-[#44474d] text-sm leading-relaxed',

    emptyCard: 'bg-[#faf9f8] p-12 rounded-lg border border-dashed border-[#c5c6ce] text-center',
    emptyIconBox: 'w-14 h-14 mx-auto rounded-lg bg-white border border-[#c5c6ce]/40 flex items-center justify-center mb-5',
    emptyHeading: 'font-heading text-2xl text-[#05162e] mb-2',
    emptyBody: 'text-[#44474d] leading-relaxed max-w-md mx-auto',
    emptyButton: 'inline-block mt-6 px-6 py-3 rounded-lg bg-[#05162e] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-opacity',
};

// Corporate Elite in roster form: soft off-white cards on the theme's warm
// grey, navy headings, the same 12px uppercase meta as the rest of the page.
const ROSTER_PALETTE: RosterPalette = {
    card: 'bg-[#faf9f8] p-6 rounded-lg border border-[#c5c6ce]/20 shadow-[0_4px_12px_rgba(27,43,68,0.08)] hover:shadow-[0_8px_24px_rgba(27,43,68,0.12)] transition-shadow flex flex-col @sm:flex-row gap-6',
    avatar: 'w-24 h-24 rounded-lg bg-[#1b2b44]/10',
    avatarText: 'font-heading text-2xl text-[#05162e]',
    name: 'font-heading text-2xl text-[#05162e] leading-snug',
    title: 'font-semibold text-[#05162e]',
    meta: 'text-[12px] font-semibold uppercase tracking-[0.1em] text-[#44474d] mt-1',
    body: 'text-[#44474d] leading-relaxed',
    chip: 'px-3 py-1 rounded-full bg-white border border-[#c5c6ce]/40 text-sm font-medium text-[#44474d] whitespace-nowrap',
    link: 'text-[#44474d] hover:text-[#05162e] transition-colors',
    icon: 'text-[#05162e]',
    emptyCard: 'bg-[#faf9f8] p-12 rounded-lg border border-dashed border-[#c5c6ce] text-center',
    emptyHeading: 'font-heading text-2xl text-[#05162e] mb-2',
    emptyBody: 'text-[#44474d] leading-relaxed max-w-md mx-auto',
    emptyButton: 'px-6 py-3 rounded-lg bg-[#05162e] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-opacity',
};

const VALUE_ICONS = [Verified, Globe, Handshake];

// The design gives each practice-area card its own glyph rather than repeating
// one. Areas come from PRACTICE_AREAS but the field is free text on older
// profiles, so anything unrecognised falls back to the generic briefcase.
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

/**
 * The design's defining move: education and experience share one rail, newest
 * first, each row tagged Career or Degree — instead of the two separate rails
 * every other theme uses.
 *
 * Years are free text ('2014', '2014-15', BS years), so sorting reads the first
 * 4-digit run and leaves anything unparseable at the bottom in input order.
 */
function startYearOf(entry: TimelineEntry): number {
    const match = entry.startYear?.match(/\d{4}/);
    return match ? Number(match[0]) : -Infinity;
}

function unifiedTimeline(lawyer: SiteModel['lawyer']) {
    const tagged = [
        ...(lawyer?.experience ?? []).map((entry) => ({ entry, kind: 'Career' as const })),
        ...(lawyer?.education ?? []).map((entry) => ({ entry, kind: 'Degree' as const })),
    ];
    // Current roles float to the top — an open-ended entry is "now" regardless
    // of when it started.
    return tagged
        .map((row, index) => ({ ...row, index }))
        .sort((a, b) => {
            if (!!a.entry.current !== !!b.entry.current) return a.entry.current ? -1 : 1;
            const diff = startYearOf(b.entry) - startYearOf(a.entry);
            return Number.isNaN(diff) || diff === 0 ? a.index - b.index : diff;
        });
}

export function CorporateEliteTheme({ site, page = 'home' }: CorporateEliteThemeProps) {
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

    const aboutHeading = isFirm ? site.heading.about : 'Professional Bio';
    const practiceHeading = isFirm ? site.heading.practice : 'Core Practice Areas';

    // The People page only exists for a firm; an individual site rendered with
    // page='team' is not a state the app produces, and falling through to the
    // home page beats inventing an error page for it.
    const isTeamPage = page === 'team' && isFirm;
    const anchor = (hash: string) => sectionHref(isTeamPage ? 'team' : 'home', hash);

    const navLinks = isFirm
        ? [
            { href: anchor('#credentials'), label: 'Credentials' },
            { href: isTeamPage ? TEAM_PAGE_HREF : '#team', label: 'Our Team' },
        ]
        : [
            ...(timeline.length > 0 ? [{ href: anchor('#timeline'), label: 'Timeline' }] : []),
            { href: anchor('#credentials'), label: 'Credentials' },
            { href: anchor('#faq'), label: 'FAQ' },
        ];

    return (
        <div className="min-h-screen bg-[#faf9f8] font-body text-[#1a1c1c] selection:bg-[#05162e]/10">
            {/* Top nav */}
            {/* Collapse is measured, not guessed at a breakpoint: the [data-nav]
                script (site-shell for published sites, ProfilePreview in the
                dashboard) compares the row's scroll width to its box and sets
                data-collapsed when the links/CTA no longer fit next to the firm
                name, hiding them behind the hamburger. The firm name itself never
                triggers that — it truncates with an ellipsis and expands back to
                the full name on hover instead. With no JS the full row renders,
                which is the pre-existing look. */}
            <nav data-nav className="group/nav sticky top-0 z-50 bg-[#faf9f8]/95 backdrop-blur-md border-b border-[#c5c6ce]/40">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between gap-6">
                    <a href={anchor('#top')} className="block flex-1 min-w-0 truncate hover:whitespace-normal hover:overflow-visible font-heading font-bold text-xl @md:text-2xl text-[#05162e] tracking-tight">
                        {lawFirmName}
                    </a>
                    <div className="flex items-center gap-6 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#44474d] group-data-[collapsed]/nav:hidden">
                        {navLinks.map(({ href, label }) => (
                            <a
                                key={href}
                                href={href}
                                className={
                                    isTeamPage && href === TEAM_PAGE_HREF
                                        ? 'text-[#05162e] transition-colors'
                                        : 'hover:text-[#05162e] transition-colors'
                                }
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 shrink-0 group-data-[collapsed]/nav:hidden">
                        {phoneNumber && (
                            <a href={`tel:${phoneNumber}`} className="px-4 py-2 rounded-lg border border-[#05162e] text-[12px] font-semibold uppercase tracking-[0.1em] text-[#05162e] hover:bg-[#e3e2e1] transition-colors whitespace-nowrap">
                                Call Now
                            </a>
                        )}
                        <a href="#contact" className="px-4 py-2 rounded-lg bg-[#05162e] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(27,43,68,0.08)] whitespace-nowrap">
                            Consultation
                        </a>
                    </div>
                    <details className="relative shrink-0 hidden group-data-[collapsed]/nav:block">
                        <summary className="flex items-center justify-center w-9 h-9 rounded-lg text-[#05162e] list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                            <Menu className="w-5 h-5" />
                        </summary>
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[#c5c6ce]/40 rounded-lg shadow-2xl p-4 flex flex-col gap-3 text-sm font-medium text-[#44474d] z-50">
                            {navLinks.map(({ href, label }) => (
                                <a key={href} href={href} className="hover:text-[#05162e] transition-colors">{label}</a>
                            ))}
                            <a href="#contact" className="mt-1 px-4 py-2.5 bg-[#05162e] text-white rounded-lg text-sm font-bold text-center">Consultation</a>
                        </div>
                    </details>
                </div>
            </nav>

            <main>
                {isTeamPage ? (
                    <>
                        {/* Page header — the hero's rhythm, sized for a subpage. */}
                        <section className="container mx-auto max-w-[1280px] px-6 py-16 @md:py-20 space-y-5 border-b border-[#c5c6ce]/40">
                            <a href="/" className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#44474d] hover:text-[#05162e] transition-colors">
                                <ArrowLeft className="w-3.5 h-3.5" />
                                Back to {lawFirmName}
                            </a>
                            <h1 className="font-heading text-4xl @md:text-6xl text-[#05162e] tracking-tight">Our Team</h1>
                            {members.length > 0 && (
                                <p className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#44474d]">
                                    <Users className="w-4 h-4 text-[#05162e]" />
                                    {members.length} {members.length === 1 ? 'lawyer' : 'lawyers'} at {fullName}
                                </p>
                            )}
                        </section>

                        <section className="container mx-auto max-w-[1280px] px-6 py-16">
                            <TeamBody site={site} palette={TEAM_PALETTE} />
                        </section>
                    </>
                ) : (
                    <>
                {/* Hero */}
                <section id="top" className="container mx-auto max-w-[1280px] px-6 pt-4 pb-8 @sm:pt-6 @md:py-20 grid grid-cols-1 @md:grid-cols-2 gap-10 items-start @md:items-center scroll-mt-24 min-h-[calc(100cqh-5rem)]">
                    <div>
                        {site.facts.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {site.facts.map(({ label }) => (
                                    <span key={label} className="inline-block px-3 py-1 rounded-full border border-[#05162e]/20 bg-[#1b2b44]/10 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#05162e]">
                                        {label}
                                    </span>
                                ))}
                            </div>
                        )}
                        <h1 className="font-heading font-semibold text-4xl @sm:text-5xl @lg:text-6xl leading-[1.1] tracking-tight text-[#05162e] mb-2">
                            {fullName}
                        </h1>
                        {professionalTitle && (
                            <div className="border-l-4 border-[#05162e] pl-4 font-heading text-xl @md:text-2xl text-[#44474d] mb-6">
                                {professionalTitle}{site.affiliation ? ` at ${site.affiliation}` : ''}
                            </div>
                        )}
                        {bio && (
                            <p className="text-lg leading-relaxed text-[#44474d] max-w-xl mb-10 line-clamp-4 hover:line-clamp-none">{bio}</p>
                        )}
                        <a href="#contact" className="inline-block px-6 py-3 rounded-lg bg-[#05162e] text-white text-[12px] font-semibold uppercase tracking-[0.1em] hover:opacity-90 transition-opacity shadow-[0_4px_12px_rgba(27,43,68,0.08)]">
                            Book a Consultation
                        </a>
                    </div>
                    <div className="hidden @md:block relative h-[560px] rounded-lg overflow-hidden bg-[#eeeeed] shadow-[0_4px_12px_rgba(27,43,68,0.08)]">
                        {profilePhoto ? (
                            <img
                                src={profilePhoto}
                                alt={site.image?.alt ?? fullName}
                                className={`absolute inset-0 w-full h-full ${isFirm ? 'object-contain bg-white p-16' : 'object-cover'}`}
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Landmark className="w-24 h-24 text-[#c5c6ce]" />
                            </div>
                        )}
                    </div>
                </section>

                {/* Bio + office hours */}
                <section data-reveal className="container mx-auto max-w-[1280px] px-6 py-16 border-t border-[#c5c6ce]/30 grid grid-cols-1 @md:grid-cols-3 gap-6">
                    <div className="@md:col-span-2">
                        <h2 className="font-heading text-3xl text-[#05162e] mb-6">{aboutHeading}</h2>
                        <p className="leading-relaxed text-[#44474d] whitespace-pre-line">{bio}</p>
                        {site.aboutNote && (
                            <p className="mt-4 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#44474d]">{site.aboutNote}</p>
                        )}
                    </div>
                    {officeHours && (
                        <div className="bg-[#f4f3f2] p-6 rounded-lg border border-[#c5c6ce]/20 shadow-[0_4px_12px_rgba(27,43,68,0.08)] h-fit">
                            <h3 className="font-heading text-2xl text-[#05162e] mb-4">Office Hours</h3>
                            {/* The mock lists days against times on hairline-separated rows.
                                officeHours is one free-text field, so each line becomes a
                                row, split on the first en/em dash or colon when there is one. */}
                            <ul className="text-[#44474d]">
                                {officeHours.split('\n').filter((line) => line.trim()).map((line, i, lines) => {
                                    // Day label runs up to the first digit — that holds for
                                    // "Mon-Fri 9:00 AM - 6:00 PM", "Mon-Fri: 9-6" and "Mon–Fri — 9-6"
                                    // alike. Splitting on the separator instead would break on the
                                    // colon inside "9:00". A line with no time at all stays whole.
                                    const [, label, time] = line.match(/^(\D+?)\s*[:—–]?\s+(\d.*)$/) ?? [];
                                    return (
                                        <li key={i} className={`flex justify-between gap-4 pb-2 ${i < lines.length - 1 ? 'mb-2 border-b border-[#c5c6ce]/20' : ''}`}>
                                            {time ? <><span>{label}</span><span>{time}</span></> : <span>{line}</span>}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </section>

                {/* Practice areas + jurisdictions */}
                {(areasOfPractice.length > 0 || jurisdictions.length > 0) && (
                    <section data-reveal id="credentials" className="scroll-mt-24 container mx-auto max-w-[1280px] px-6 py-16">
                        <div className="bg-[#f4f3f2] rounded-xl p-6 @md:p-10 grid grid-cols-1 @lg:grid-cols-4 gap-8">
                            {areasOfPractice.length > 0 && (
                                <div className="@lg:col-span-3">
                                    <h2 className="font-heading text-3xl text-[#05162e] mb-6">{practiceHeading}</h2>
                                    <div className="grid grid-cols-1 @md:grid-cols-2 gap-6">
                                        {areasOfPractice.map((area) => {
                                            const Icon = PRACTICE_ICONS[area] ?? Briefcase;
                                            return (
                                            <div key={area} className="group bg-[#faf9f8] p-6 rounded-lg border border-[#c5c6ce]/20 shadow-[0_4px_12px_rgba(27,43,68,0.08)] hover:shadow-[0_8px_24px_rgba(27,43,68,0.12)] transition-shadow">
                                                <div className="w-12 h-12 mb-3 rounded-lg bg-[#1b2b44]/10 text-[#05162e] flex items-center justify-center group-hover:bg-[#05162e] group-hover:text-white transition-colors">
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <h3 className="font-heading text-2xl text-[#05162e]">{area}</h3>
                                            </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            {jurisdictions.length > 0 && (
                                <div className="@lg:col-span-1 @lg:border-l @lg:border-[#c5c6ce]/30 @lg:pl-6">
                                    <h3 className="font-heading text-2xl text-[#05162e] mb-3">Courts</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {jurisdictions.map((j) => (
                                            <span key={j} className="px-3 py-1 rounded-full bg-[#faf9f8] border border-[#c5c6ce]/40 text-sm font-medium text-[#44474d] whitespace-nowrap">{j}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* The one part that genuinely differs by site kind. */}
                {isFirm ? (
                    <section data-reveal id="team" className="scroll-mt-24 container mx-auto max-w-[1280px] px-6 py-16">
                        <h2 className="font-heading text-3xl text-[#05162e] mb-12 text-center">Our Team</h2>
                        <RosterList members={members} palette={ROSTER_PALETTE} email={email} phone={phoneNumber} />
                        {members.length > 0 && (
                            <div className="mt-10 text-center">
                                <a
                                    href={TEAM_PAGE_HREF}
                                    className="inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#05162e] hover:opacity-70 transition-opacity group"
                                >
                                    Meet the full team
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                                </a>
                            </div>
                        )}
                    </section>
                ) : lawyer ? (
                    <>
                {/* Why work with me */}
                <section data-reveal id="why" className="scroll-mt-24 container mx-auto max-w-[1280px] px-6 py-16">
                    <h2 className="font-heading text-3xl text-[#05162e] mb-12 text-center">Why Work With Me</h2>
                    <div className="grid grid-cols-1 @md:grid-cols-3 gap-6">
                        {lawyer.valuePoints.map(({ title, description }, i) => {
                            const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
                            return (
                                <div key={title} className="text-center p-6">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#05162e] text-white flex items-center justify-center">
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <h3 className="font-heading text-2xl text-[#05162e] mb-2">{title}</h3>
                                    <p className="text-[#44474d] leading-relaxed">{description}</p>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Process */}
                <section data-reveal className="bg-[#f4f3f2] border-y border-[#c5c6ce]/20 py-16">
                    <div className="container mx-auto max-w-[1280px] px-6">
                        <h2 className="font-heading text-3xl text-[#05162e] mb-12 text-center">How It Works</h2>
                        <div className="grid grid-cols-1 @sm:grid-cols-2 @lg:grid-cols-4 gap-4">
                            {lawyer.processSteps.map(({ title, description }, i) => (
                                <div key={title} className="relative p-6 pt-8 bg-[#faf9f8] border border-[#c5c6ce]/20 rounded-lg shadow-[0_4px_12px_rgba(27,43,68,0.08)] text-center">
                                    <span className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-[#05162e] text-white font-bold flex items-center justify-center border-4 border-[#f4f3f2]">
                                        {i + 1}
                                    </span>
                                    <h3 className="font-heading text-2xl text-[#05162e] mb-2">{title}</h3>
                                    <p className="text-sm text-[#44474d] leading-relaxed">{description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Unified timeline */}
                {timeline.length > 0 && (
                    <section data-reveal id="timeline" className="scroll-mt-24 container mx-auto max-w-3xl px-6 py-16">
                        <h2 className="font-heading text-3xl text-[#05162e] mb-12 text-center">Path to Excellence</h2>
                        <ol className="relative pl-8 border-l-2 border-[#c5c6ce]/30 space-y-12">
                            {timeline.map(({ entry, kind, index }) => (
                                <li key={`${kind}-${index}`} className="relative group">
                                    <span className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-[#faf9f8] border-4 border-[#05162e] group-hover:scale-125 transition-transform" />
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        {formatTimelineRange(entry) && (
                                            <span className="px-2 py-1 rounded bg-[#1b2b44]/10 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#05162e]">
                                                {formatTimelineRange(entry)}
                                            </span>
                                        )}
                                        <span className={
                                            kind === 'Career'
                                                ? 'px-2 py-1 rounded border border-[#775a19]/20 bg-[#fed488]/30 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#775a19]'
                                                : 'px-2 py-1 rounded border border-[#360008]/20 bg-[#5d0014]/10 text-[12px] font-semibold uppercase tracking-[0.1em] text-[#360008]'
                                        }>
                                            {kind}
                                        </span>
                                    </div>
                                    <div className="bg-[#faf9f8] p-6 rounded-lg border border-[#c5c6ce]/20 shadow-[0_4px_12px_rgba(27,43,68,0.08)] hover:shadow-[0_8px_24px_rgba(27,43,68,0.12)] transition-shadow">
                                        {entry.title && <h3 className="font-heading text-2xl text-[#05162e]">{entry.title}</h3>}
                                        {entry.organization && <p className="font-semibold text-[#05162e] mb-2">{entry.organization}</p>}
                                        {entry.description && <p className="text-[#44474d] leading-relaxed">{entry.description}</p>}
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
                    </>
                ) : null}

                {/* FAQ — individual only: the questions are written in the first
                    person and a firm has no equivalent content to fill them. */}
                {lawyer && (
                <section data-reveal id="faq" className="scroll-mt-24 container mx-auto max-w-[1280px] px-6 py-16">
                    <h2 className="font-heading text-3xl text-[#05162e] mb-6 text-center">Frequently Asked Questions</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {lawyer.faqs.map(({ question, answer }) => (
                            <details key={question} className="group bg-[#faf9f8] border border-[#c5c6ce]/30 rounded-lg">
                                <summary className="flex justify-between items-center gap-4 p-4 cursor-pointer list-none font-heading text-xl text-[#05162e] [&::-webkit-details-marker]:hidden">
                                    {question}
                                    <ChevronDown className="w-5 h-5 text-[#05162e] shrink-0 transition-transform group-open:rotate-180" />
                                </summary>
                                <div className="p-4 pt-4 mt-2 border-t border-[#c5c6ce]/20 text-[#44474d] leading-relaxed">{answer}</div>
                            </details>
                        ))}
                    </div>
                </section>
                )}
                    </>
                )}
            </main>

            {/* Footer */}
            <footer id="contact" className="scroll-mt-24 bg-[#05162e] text-white py-16">
                <div className="container mx-auto max-w-[1280px] px-6 grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-3 gap-8 mb-8">
                    <div>
                        <div className="font-heading text-2xl mb-4">{lawFirmName}</div>
                        <p className="text-white/70 leading-relaxed mb-4">{site.disclaimer}</p>
                        {(website || linkedIn) && (
                            <div className="flex gap-4">
                                {linkedIn && (
                                    <a href={linkedIn} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-white/70 hover:text-white transition-colors">
                                        <Linkedin className="w-6 h-6" />
                                    </a>
                                )}
                                {website && (
                                    <a href={website} target="_blank" rel="noopener noreferrer" title="Website" className="text-white/70 hover:text-white transition-colors">
                                        <Globe className="w-6 h-6" />
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-4">Contact &amp; Office</h3>
                        <address className="not-italic space-y-2 text-white/70">
                            {officeAddress && (
                                <p className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 mt-1 shrink-0" />
                                    <span className="whitespace-pre-line">{officeAddress}</span>
                                </p>
                            )}
                            {phoneNumber && (
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 shrink-0" />
                                    <a href={`tel:${phoneNumber}`} className="hover:text-white transition-colors">{phoneNumber}</a>
                                </p>
                            )}
                            {email && (
                                <p className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 shrink-0" />
                                    <a href={`mailto:${email}`} className="hover:text-white transition-colors break-all">{email}</a>
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

                    <div>
                        <h3 className="text-[12px] font-semibold uppercase tracking-[0.1em] mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-white/70">
                            {navLinks.map(({ href, label }) => (
                                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>
                <div className="container mx-auto max-w-[1280px] px-6 border-t border-white/20 pt-6 flex flex-col @md:flex-row justify-between items-center gap-2 text-sm text-white/70">
                    <span>© {new Date().getFullYear()} {fullName}. All Rights Reserved.</span>
                    <span>Site by Wokil</span>
                </div>
            </footer>
        </div>
    );
}
