'use client';

import { Button } from '@/components/ui/button';
import {
    LogIn,
    UserCircle,
    Globe,
    BarChart3,
    Gavel,
    CalendarClock,
    Nfc,
    Briefcase,
    CheckCircle2,
    Search,
    Phone,
    MapPin,
    BookOpen,
} from 'lucide-react';
import { googleLogin } from '@/generated/wokil-api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { PublicDirectoryResponse } from '@/generated/wokil-api';
import { StructuredData } from '@/components/SEO/StructuredData';

interface HomeClientProps {
    professionals: PublicDirectoryResponse;
}

const researchTopics = [
    { title: 'Constitution of Nepal', desc: 'Instantly cross-reference articles and amendments.' },
    { title: 'Muluki Codes', desc: 'Search through Civil and Criminal codes efficiently.' },
    {
        title: 'Supreme Court Precedents',
        desc: 'Discover relevant case law and established precedents with context-aware search.',
        span: true,
    },
];

const websiteThemes = [
    { bg: '#FDFCFB', accent: '#1B2B44' },
    { bg: '#FDFBF7', accent: '#D4A373' },
    { bg: '#F8FAFC', accent: '#1E40AF' },
];

const DEFAULT_THEME = 1;

const courtCalendarHighlights = [
    'Hearing Date Tracking',
    'Judge & Courtroom Assignments',
    'Calendar Sync (Google/Outlook)',
    'Deadlines & Reminders',
];

const courtCalendarWeekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const courtCalendarDays = Array.from({ length: 42 }, (_, i) => (i > 4 && i < 36 ? i - 4 : null));

const courtCalendarEvents: Record<number, { case: string; time: string }> = {
    11: { case: 'State v. Sharma — Hearing', time: '10:30 AM' },
    13: { case: 'Property Dispute — Filing', time: '5:00 PM' },
    15: { case: 'Contract Review — Ch. 4', time: '2:00 PM' },
};

const businessCardHighlights = [
    'Instant vCard sharing and digital profile synchronization',
    'High-quality matte polymer finishes with gold foil accents',
    'Verified credentials and practice areas integration',
    'Centralized bulk ordering system for entire law firms',
];

const backofficeHighlights = [
    'Secure document storage and sharing',
    'Automated billing and invoicing',
    'Client portal and secure messaging',
];

function CountUpStat({ label, value }: { label: string; value: number }) {
    const [count, setCount] = useState(value);
    const frameRef = useRef<number | undefined>(undefined);

    const handleEnter = () => {
        const start = performance.now();
        const duration = 800;
        setCount(0);
        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
            if (progress < 1) frameRef.current = requestAnimationFrame(tick);
        };
        frameRef.current = requestAnimationFrame(tick);
    };

    const handleLeave = () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
        setCount(value);
    };

    return (
        <div
            className="flex-1 p-4 rounded-xl bg-muted border border-border hover-pop hover:scale-105"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <div className="text-muted-foreground text-xs uppercase mb-1">{label}</div>
            <div className="text-primary text-2xl font-heading font-semibold">{count.toLocaleString()}</div>
        </div>
    );
}

export function HomeClient({ professionals }: HomeClientProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [hoveredThemeIndex, setHoveredThemeIndex] = useState(DEFAULT_THEME);
    const activeTheme = websiteThemes[hoveredThemeIndex];

    useEffect(() => {
        if (typeof window !== 'undefined' && localStorage.getItem('token')) {
            router.push('/dashboard');
        }
    }, [router]);

    const professionalsCount = professionals?.meta?.total || 0;

    const handleLogin = async () => {
        try {
            const { data } = await googleLogin({ throwOnError: true });
            window.location.href = data.url;
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to initiate login.",
                variant: "destructive"
            });
        }
    };

    return (
        <>
            <StructuredData type="Organization" />
            <StructuredData type="WebSite" />

            {/* Navbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="max-w-[1440px] mx-auto px-4 md:px-16 h-20 flex items-center justify-between">
                    <span className="text-xl font-heading font-bold text-primary">Wokil</span>
                    <nav className="hidden md:flex items-center gap-10">
                        {['Features', 'Directory', 'Pricing', 'About'].map((item) => (
                            <a
                                key={item}
                                href={item === 'Directory' ? '/professionals' : '#'}
                                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
                            >
                                {item}
                            </a>
                        ))}
                    </nav>
                    <div className="flex items-center gap-6">
                        <button onClick={handleLogin} className="hidden md:inline-flex text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                            Login
                        </button>
                        <Button onClick={handleLogin} className="rounded-lg gap-2 text-xs font-semibold uppercase tracking-widest shadow-card">
                            <LogIn className="w-4 h-4" />
                            Get Started
                        </Button>
                    </div>
                </div>
            </header>

            <main>
                {/* Hero */}
                <section className="relative overflow-hidden min-h-screen flex items-center pt-20">
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: 'url(/hero-bg.jpg)' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f1c2e]/90 via-[#0f1c2e]/75 to-[#0f1c2e]/50" />

                    <div className="relative w-full max-w-[1280px] mx-auto px-4 md:px-16 py-20 md:py-24">
                        <div className="max-w-2xl">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
                                Establish Your Authority.<br />Elevate Your Practice.
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 max-w-xl mb-8">
                                A comprehensive digital infrastructure designed exclusively for Nepalese advocates and law firms. From verified credentials to intelligent legal research, seamlessly manage your professional presence.
                            </p>
                            <div className="flex flex-col sm:flex-row items-start gap-4">
                                <Button onClick={handleLogin} size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 rounded-xl text-xs font-semibold uppercase tracking-widest shadow-card">
                                    <UserCircle className="w-5 h-5" />
                                    Join Wokil Network
                                </Button>
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto h-14 px-8 rounded-xl text-xs font-semibold uppercase tracking-widest bg-white/10 border-white/20 text-white hover:bg-white/20"
                                    onClick={() => router.push('/professionals')}
                                >
                                    Explore Directory
                                </Button>
                            </div>
                            {professionalsCount > 0 && (
                                <p className="mt-6 text-sm text-white/50">
                                    Joined by <span className="text-white font-semibold">{professionalsCount.toLocaleString()}+</span> legal professionals
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* 1. Build Your Website in Minutes */}
                <section className="px-4 md:px-16 py-24 md:py-32 bg-background border-t border-border">
                    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                <Globe className="w-5 h-5" />
                            </div>
                            <h2 className="heading-section">Build Your Website in Minutes</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Transform your professional profile into a fully functional website instantly. Choose from our gallery of premium themes designed specifically for legal professionals, and establish your online presence with a custom subdomain like yourname.wokil.com.np.
                            </p>
                            <ul className="flex flex-col gap-4 mt-4">
                                {['One-click profile to website conversion', 'Premium law-firm specific themes', 'Instant wokil.com.np subdomain setup'].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="group relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col gap-4">
                                <div className="flex gap-4">
                                    {websiteThemes.map((theme, i) => (
                                        <div
                                            key={i}
                                            onMouseEnter={() => setHoveredThemeIndex(i)}
                                            onMouseLeave={() => setHoveredThemeIndex(DEFAULT_THEME)}
                                            className="w-1/3 h-24 rounded-lg border relative overflow-hidden hover-pop hover:scale-110"
                                            style={{ background: theme.bg, borderColor: i === DEFAULT_THEME ? theme.accent : undefined, borderWidth: i === DEFAULT_THEME ? 2 : 1 }}
                                        >
                                            <div className="absolute top-0 w-full h-4" style={{ background: theme.accent }} />
                                            <div className="absolute inset-x-2 top-8 h-2 rounded-sm opacity-20" style={{ background: theme.accent }} />
                                            <div className="absolute inset-x-4 top-12 h-1.5 rounded-sm opacity-10" style={{ background: theme.accent }} />
                                            {i === DEFAULT_THEME && (
                                                <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                                                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div
                                    className="flex-1 w-full rounded-lg border border-border overflow-hidden flex flex-col transition-colors duration-500"
                                    style={{ background: activeTheme.bg }}
                                >
                                    <div className="h-8 w-full bg-muted border-b border-border flex items-center px-4 gap-2">
                                        <div className="w-2 h-2 rounded-full bg-destructive/50" />
                                        <div className="w-2 h-2 rounded-full bg-secondary" />
                                        <div className="w-2 h-2 rounded-full bg-accent/50" />
                                        <div className="ml-4 w-1/2 h-4 bg-card rounded-sm" />
                                    </div>
                                    <div className="flex-1 flex flex-col items-center justify-center gap-2 px-4">
                                        {[
                                            { cls: 'w-8 h-8 rounded-full border mb-1', bg: `${activeTheme.accent}1A` },
                                            { cls: 'w-1/2 h-4 rounded-sm', bg: activeTheme.accent },
                                            { cls: 'w-1/3 h-2 rounded-sm', bg: `${activeTheme.accent}80` },
                                            { cls: 'w-24 h-6 rounded-full mt-2', bg: activeTheme.accent },
                                        ].map(({ cls, bg }, i) => (
                                            <div
                                                key={i}
                                                style={{ animationDelay: `${i * 80}ms`, backgroundColor: bg, borderColor: activeTheme.accent }}
                                                className={`${cls} transition-colors duration-500 group-hover:animate-fade-in`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Live Traffic Analytics */}
                <section className="px-4 md:px-16 py-24 md:py-32 bg-secondary/40 border-t border-border">
                    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                <BarChart3 className="w-5 h-5" />
                            </div>
                            <h2 className="heading-section">Live Traffic Analytics</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Gain actionable insights into your digital presence. Our built-in analytics dashboard tracks visitor traffic in real-time, helping you understand client engagement and optimize your professional website.
                            </p>
                            <ul className="flex flex-col gap-4 mt-4">
                                {['Real-time visitor tracking and behavior flow', 'Detailed breakdown of traffic sources', 'Page view and client engagement metrics'].map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="group relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col">
                                <div className="flex gap-4 mb-6">
                                    <CountUpStat label="Total Views" value={2481} />
                                    <CountUpStat label="Unique Visitors" value={1204} />
                                </div>
                                <div className="flex-1 bg-background rounded-xl border border-border p-4 flex gap-4 relative overflow-hidden">
                                    <div className="flex-1 flex flex-col">
                                        <div className="text-muted-foreground text-xs uppercase mb-2">Traffic Overview</div>
                                        <svg viewBox="0 0 200 100" preserveAspectRatio="none" className="flex-1 w-full">
                                            <defs>
                                                <linearGradient id="homeTrafficFill" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
                                                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                                                </linearGradient>
                                            </defs>
                                            <polyline
                                                points="0,70 25,55 50,60 75,30 100,42 125,15 150,28 175,10 200,20"
                                                fill="none"
                                                stroke="var(--color-accent)"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                style={{ strokeDasharray: 250 }}
                                                className="group-hover:animate-draw-line"
                                            />
                                            <polygon
                                                points="0,70 25,55 50,60 75,30 100,42 125,15 150,28 175,10 200,20 200,100 0,100"
                                                fill="url(#homeTrafficFill)"
                                            />
                                        </svg>
                                    </div>
                                    <div className="w-20 shrink-0 flex flex-col items-center justify-center gap-2">
                                        <svg viewBox="0 0 36 36" className="w-16 h-16 rotate-[-90deg] transition-transform duration-700 ease-out group-hover:rotate-[270deg]">
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-muted)" strokeWidth="5" />
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeDasharray="97.4" strokeDashoffset="35" strokeLinecap="round" />
                                            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--color-accent)" strokeWidth="5" strokeDasharray="97.4" strokeDashoffset="72" strokeLinecap="round" />
                                        </svg>
                                        <span className="text-[9px] text-muted-foreground uppercase tracking-widest text-center">Sources</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 3. Intelligent Legal Research Hub */}
                <section className="px-4 md:px-16 py-24 md:py-32 bg-background border-t border-border">
                    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                <Gavel className="w-5 h-5" />
                            </div>
                            <h2 className="heading-section">Intelligent Legal Research Hub</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Navigate Nepal&apos;s legal landscape with unprecedented speed. Our proprietary RAG (Retrieval-Augmented Generation) system allows natural language querying across critical legal texts.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                {researchTopics.map((topic) => (
                                    <div key={topic.title} className={`p-4 rounded-xl border border-border bg-secondary/40 ${topic.span ? 'md:col-span-2' : ''}`}>
                                        <h4 className="font-heading font-semibold text-primary mb-2">{topic.title}</h4>
                                        <p className="text-sm text-muted-foreground">{topic.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="group relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col">
                                <div className="w-full h-12 rounded-lg bg-background flex items-center px-4 mb-3 border border-border">
                                    <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                                    <span className="text-sm text-muted-foreground truncate inline-block overflow-hidden whitespace-nowrap align-middle w-full group-hover:animate-typewriter">Query the Constitution, Civil Code, or specific precedents...</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {['Fundamental Rights', 'Muluki Civil Code 2074', 'Cyber Crime'].map((chip, i) => (
                                        <span
                                            key={chip}
                                            style={{ animationDelay: `${i * 100}ms` }}
                                            className="px-3 py-1.5 rounded-full border border-border bg-background text-[11px] text-muted-foreground group-hover:animate-fade-in"
                                        >
                                            {chip}
                                        </span>
                                    ))}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    {[
                                        { icon: BookOpen, label: 'Constitution of Nepal' },
                                        { icon: Gavel, label: 'Civil Law (Muluki)' },
                                    ].map(({ icon: Icon, label }, i) => (
                                        <div
                                            key={label}
                                            style={{ animationDelay: `${i * 120}ms` }}
                                            className="p-4 rounded-xl border border-border bg-secondary/40 flex flex-col gap-3 hover-pop hover:scale-105 group-hover:animate-fade-in"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <span className="text-xs font-heading font-semibold text-foreground">{label}</span>
                                            <div className="w-full h-1.5 bg-muted-foreground/15 rounded mt-auto" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4. Automated Court Calendar */}
                <section className="px-4 md:px-16 py-24 md:py-32 bg-secondary/40 border-t border-border">
                    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                <CalendarClock className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3">
                                <h2 className="heading-section">Automated Court Calendar</h2>
                                <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-semibold uppercase tracking-widest">
                                    Coming Soon
                                </span>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Never miss a hearing again. Our system automatically tracks court dates, hearing times, and judge assignments, syncing them directly to your calendar. Stay ahead of deadlines with proactive notifications and case status updates.
                            </p>
                            <ul className="flex flex-col gap-4 mt-4">
                                {courtCalendarHighlights.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-card shadow-card p-6 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-heading font-semibold text-primary">August 2026</span>
                                    <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-widest">
                                        <span className="w-2 h-2 rounded-full bg-primary" /> Hearing
                                    </span>
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {courtCalendarWeekdays.map((d, i) => (
                                        <div key={i} className="text-center text-[10px] font-semibold text-muted-foreground uppercase">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1 flex-1">
                                    {courtCalendarDays.map((day, i) => {
                                        const event = day ? courtCalendarEvents[day] : undefined;
                                        return (
                                            <div
                                                key={i}
                                                className={`group/day relative flex items-center justify-center rounded-lg text-xs hover-pop ${day ? 'hover:scale-110' : ''} ${event ? 'bg-primary text-primary-foreground font-semibold hover:animate-highlight-glow' : day ? 'text-foreground hover:bg-secondary/60' : ''}`}
                                            >
                                                {day}
                                                {event && (
                                                    <div className="pointer-events-none absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-primary text-primary-foreground text-[10px] px-2 py-1 opacity-0 scale-95 transition-all duration-200 group-hover/day:opacity-100 group-hover/day:scale-100 shadow-lg z-20">
                                                        {event.case} · {event.time}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. Business Cards & Premium NFC */}
                <section className="px-4 md:px-16 py-24 md:py-32 bg-background border-t border-border">
                    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row items-center gap-16">
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                <Nfc className="w-5 h-5" />
                            </div>
                            <h2 className="heading-section">Business Cards &amp; Premium NFC</h2>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Leave a lasting impression with professional networking tools. We offer high-quality standard printed business cards alongside premium NFC-enabled &ldquo;tap to share&rdquo; digital contact cards, bridging the gap between physical presence and digital connectivity for modern legal professionals.
                            </p>
                            <ul className="flex flex-col gap-4 mt-4">
                                {businessCardHighlights.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-secondary/40 p-6 shadow-card flex flex-col justify-center items-center overflow-hidden">
                                <div className="group cursor-pointer relative w-[340px] h-[210px] mx-auto" style={{ perspective: '1200px' }}>
                                    {/* Rear card — QR / tap-to-share */}
                                    <div className="absolute inset-0 z-0 translate-x-4 rotate-3 scale-90 bg-primary rounded-xl shadow-lg border border-white/10 flex flex-col items-center justify-center p-6 transition-all duration-700 ease-out group-hover:translate-x-24 group-hover:rotate-6 group-hover:scale-95">
                                        <div className="w-24 h-24 bg-white border border-border rounded-lg p-2 flex items-center justify-center mb-4">
                                            <div className="w-full h-full bg-primary flex flex-wrap gap-[2px] p-[2px]">
                                                <div className="w-1/2 h-[48%] bg-white" />
                                                <div className="w-[48%] h-[48%] bg-primary" />
                                                <div className="w-[48%] h-[48%] bg-primary" />
                                                <div className="w-1/2 h-[48%] bg-white" />
                                            </div>
                                        </div>
                                        <div className="text-primary-foreground text-sm font-heading font-semibold text-center">Tap to Share</div>
                                        <div className="text-accent text-xs text-center mt-1">wokil.com.np/sarah-j</div>
                                    </div>
                                    {/* Middle card — depth filler */}
                                    <div className="absolute inset-0 z-10 translate-x-2 rotate-1 scale-95 opacity-80 mix-blend-multiply bg-primary rounded-xl shadow-xl border border-white/10 p-6 transition-all duration-700 ease-out group-hover:translate-x-6 group-hover:rotate-2 group-hover:scale-100">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
                                    </div>
                                    {/* Front card — profile details */}
                                    <div className="absolute inset-0 z-20 origin-left bg-primary rounded-xl shadow-2xl border border-white/10 flex flex-col justify-between p-6 transition-all duration-700 ease-out group-hover:-translate-x-12 group-hover:-rotate-3 group-hover:scale-105">
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
                                        <div className="relative z-20">
                                            <div className="text-primary-foreground text-xl font-heading font-semibold">
                                                Sarah Jenkins <span className="text-accent text-sm align-middle">Esq.</span>
                                            </div>
                                            <div className="text-primary-foreground/60 text-[10px] uppercase tracking-widest">Managing Partner</div>
                                            <div className="w-8 h-0.5 bg-accent mt-3" />
                                        </div>
                                        <div className="relative z-20 flex justify-between items-end mt-8">
                                            <div className="text-primary-foreground/80 text-[10px] space-y-1.5">
                                                <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-accent" /> (555) 019-8234</div>
                                                <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 text-accent" /> Kathmandu, Nepal</div>
                                            </div>
                                            <div className="flex flex-col items-center opacity-80">
                                                <Nfc className="w-6 h-6 text-primary-foreground" />
                                                <span className="text-primary-foreground text-[8px] tracking-widest mt-1">TAP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 6. Firm Backoffice Software */}
                <section className="px-4 md:px-16 py-24 md:py-32 bg-secondary/40 border-t border-border">
                    <div className="max-w-[1280px] mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
                        <div className="w-full lg:w-1/2 flex flex-col gap-6">
                            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div className="flex items-center gap-3">
                                <h2 className="heading-section">Firm Backoffice Software</h2>
                                <span className="px-3 py-1 rounded-full bg-accent/10 border border-accent/30 text-accent text-[10px] font-semibold uppercase tracking-widest">
                                    Coming Soon
                                </span>
                            </div>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Streamline your practice with comprehensive management tools designed for modern law firms. Manage cases, client billing, and document automation from a single secure platform.
                            </p>
                            <ul className="flex flex-col gap-4 mt-4">
                                {backofficeHighlights.map((item) => (
                                    <li key={item} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 shrink-0" />
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="w-full lg:w-1/2">
                            <div className="group relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex gap-4">
                                <div className="w-1/4 h-full bg-muted rounded-lg border border-border flex flex-col p-3 gap-3">
                                    {['w-full', 'w-3/4', 'w-full', 'w-1/2'].map((w, i) => (
                                        <div key={i} style={{ animationDelay: `${i * 80}ms` }} className={`${w} h-2 bg-primary/20 rounded origin-left group-hover:animate-fade-in`} />
                                    ))}
                                </div>
                                <div className="w-3/4 flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 h-20 bg-background border border-border rounded-lg p-3 hover-pop hover:scale-105">
                                            <div className="w-1/2 h-2 bg-muted-foreground/15 rounded mb-3" />
                                            <div className="w-1/4 h-6 bg-primary rounded" />
                                        </div>
                                        <div className="flex-1 h-20 bg-background border border-border rounded-lg p-3 hover-pop hover:scale-105">
                                            <div className="w-1/2 h-2 bg-muted-foreground/15 rounded mb-3" />
                                            <div className="w-1/4 h-6 bg-accent rounded" />
                                        </div>
                                    </div>
                                    <div className="flex-1 bg-background border border-border rounded-lg p-4 flex flex-col gap-3">
                                        <div className="w-1/3 h-3 bg-primary/30 rounded mb-2" />
                                        <div className="w-full h-8 bg-muted rounded" />
                                        <div className="w-full h-8 bg-muted rounded" />
                                        <div className="w-full h-8 bg-muted rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="w-full py-16 bg-primary text-primary-foreground flex flex-col items-center px-4 md:px-16 gap-10">
                <div className="w-full max-w-[1280px] flex flex-col md:flex-row justify-between items-start gap-12 border-b border-white/10 pb-12">
                    <div className="flex flex-col gap-4 max-w-sm">
                        <span className="text-xl font-heading font-bold text-accent">Wokil</span>
                        <p className="text-sm text-primary-foreground/70 leading-relaxed">
                            The premier digital infrastructure for legal professionals in Nepal. Elevating practice management and online authority.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-12 md:gap-24">
                        <div className="flex flex-col gap-4">
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">Platform</span>
                            <a href="/professionals" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Directory</a>
                            <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Site Builder</a>
                            <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Legal Research</a>
                            <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Pricing</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            <span className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/50">Legal</span>
                            <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Terms of Service</a>
                            <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Privacy Policy</a>
                            <a href="#" className="text-sm text-primary-foreground/80 hover:text-accent transition-colors">Disclaimer</a>
                        </div>
                    </div>
                </div>
                <div className="w-full max-w-[1280px] flex justify-between items-center">
                    <p className="text-sm text-primary-foreground/50">
                        © {new Date().getFullYear()} Wokil Inc. All Rights Reserved. Designed for Nepal.
                    </p>
                </div>
            </footer>
        </>
    );
}
