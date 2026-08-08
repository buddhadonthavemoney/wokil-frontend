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
} from 'lucide-react';
import { googleLogin } from '@/generated/wokil-api';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
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

const courtCalendarHighlights = [
    'Hearing Date Tracking',
    'Judge & Courtroom Assignments',
    'Calendar Sync (Google/Outlook)',
    'Deadlines & Reminders',
];

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

export function HomeClient({ professionals }: HomeClientProps) {
    const { toast } = useToast();
    const router = useRouter();

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
            <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
                <div className="max-w-[1440px] mx-auto px-4 md:px-16 h-20 flex items-center justify-between">
                    <span className="text-xl font-heading font-bold text-primary">Wokil</span>
                    <nav className="hidden md:flex items-center gap-10">
                        <a href="#" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Features</a>
                        <a href="/professionals" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Directory</a>
                        <a href="#" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                        <a href="#" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">About</a>
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

            <main className="pt-20">
                {/* Hero */}
                <section className="relative overflow-hidden bg-gradient-to-b from-background to-secondary/40 px-4 md:px-16 pt-24 pb-32 flex flex-col items-center text-center">
                    <div className="absolute -top-20 -left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
                    <div className="absolute top-40 -right-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />

                    <div className="relative max-w-3xl mx-auto">
                        <span className="inline-block px-4 py-1.5 mb-8 rounded-full border border-accent/30 bg-card/60 backdrop-blur-sm text-primary text-xs font-semibold uppercase tracking-widest shadow-sm">
                            The Modern Standard for Nepal&apos;s Legal Professionals
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold text-primary leading-tight mb-8">
                            Establish Your Authority.<br />Elevate Your Practice.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
                            A comprehensive digital infrastructure designed exclusively for Nepalese advocates and law firms. From verified credentials to intelligent legal research, seamlessly manage your professional presence.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button onClick={handleLogin} size="lg" className="w-full sm:w-auto gap-2 h-14 px-8 rounded-xl text-xs font-semibold uppercase tracking-widest shadow-card">
                                <UserCircle className="w-5 h-5" />
                                Join Wokil Network
                            </Button>
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto h-14 px-8 rounded-xl text-xs font-semibold uppercase tracking-widest"
                                onClick={() => router.push('/professionals')}
                            >
                                Explore Directory
                            </Button>
                        </div>
                        {professionalsCount > 0 && (
                            <p className="mt-6 text-sm text-muted-foreground">
                                Joined by <span className="text-foreground font-semibold">{professionalsCount.toLocaleString()}+</span> legal professionals
                            </p>
                        )}
                    </div>

                    {/* Hero mockup */}
                    <div className="relative w-full max-w-[1200px] mx-auto mt-20 rounded-xl border border-border bg-card p-3 shadow-card">
                        <div className="w-full aspect-[16/9] rounded-lg bg-muted border border-border p-8 flex flex-col gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-muted-foreground/10 animate-pulse" />
                                <div className="space-y-2 flex-1 max-w-xs">
                                    <div className="h-4 w-1/2 bg-muted-foreground/10 rounded animate-pulse" />
                                    <div className="h-3 w-1/3 bg-muted-foreground/10 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-6 flex-1">
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className="rounded-lg bg-card border border-border p-4 space-y-3">
                                        <div className="h-3 w-2/3 bg-muted-foreground/10 rounded animate-pulse" />
                                        <div className="h-2 w-full bg-muted-foreground/10 rounded animate-pulse" />
                                        <div className="h-2 w-5/6 bg-muted-foreground/10 rounded animate-pulse" />
                                    </div>
                                ))}
                            </div>
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
                            <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col gap-4">
                                <div className="flex gap-4">
                                    <div className="w-1/3 h-24 bg-muted rounded-lg border border-border relative overflow-hidden">
                                        <div className="absolute top-0 w-full h-4 bg-primary/10" />
                                    </div>
                                    <div className="w-1/3 h-24 bg-muted rounded-lg border-2 border-primary relative overflow-hidden">
                                        <div className="absolute top-0 w-full h-4 bg-primary" />
                                        <div className="absolute bottom-2 right-2 w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                                            <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                                        </div>
                                    </div>
                                    <div className="w-1/3 h-24 bg-muted rounded-lg border border-border relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-8 h-full bg-primary/10" />
                                    </div>
                                </div>
                                <div className="flex-1 w-full bg-background rounded-lg border border-border overflow-hidden flex flex-col">
                                    <div className="h-8 w-full bg-muted border-b border-border flex items-center px-4 gap-2">
                                        <div className="w-2 h-2 rounded-full bg-destructive/50" />
                                        <div className="w-2 h-2 rounded-full bg-secondary" />
                                        <div className="w-2 h-2 rounded-full bg-accent/50" />
                                        <div className="ml-4 w-1/2 h-4 bg-card rounded-sm" />
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col gap-3">
                                        <div className="w-1/3 h-4 bg-primary rounded-sm" />
                                        <div className="w-full h-2 bg-muted-foreground/15 rounded-sm" />
                                        <div className="w-5/6 h-2 bg-muted-foreground/15 rounded-sm" />
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
                            <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col">
                                <div className="flex gap-4 mb-6">
                                    <div className="flex-1 p-4 rounded-xl bg-muted border border-border">
                                        <div className="text-muted-foreground text-xs uppercase mb-1">Total Visitors</div>
                                        <div className="text-primary text-2xl font-heading font-semibold">2,481</div>
                                    </div>
                                    <div className="flex-1 p-4 rounded-xl bg-muted border border-border">
                                        <div className="text-muted-foreground text-xs uppercase mb-1">Page Views</div>
                                        <div className="text-primary text-2xl font-heading font-semibold">8,192</div>
                                    </div>
                                </div>
                                <div className="flex-1 bg-background rounded-xl border border-border p-4 flex items-end gap-2 relative overflow-hidden">
                                    <div className="absolute top-4 left-4 text-muted-foreground text-xs uppercase">Traffic Overview</div>
                                    <div className="w-full h-full flex items-end gap-2 pt-10">
                                        {[30, 50, 40, 80, 60, 90, 45, 100, 70, 55].map((h, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-t-sm ${h === 100 ? 'bg-accent shadow-[0_0_10px_rgba(197,160,89,0.5)]' : h === 80 ? 'bg-accent/60' : 'bg-primary/50'}`}
                                                style={{ height: `${h}%` }}
                                            />
                                        ))}
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
                            <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex flex-col">
                                <div className="w-full h-12 rounded-lg bg-muted flex items-center px-4 mb-6 border border-border">
                                    <Search className="w-4 h-4 text-muted-foreground mr-3 shrink-0" />
                                    <span className="text-sm text-muted-foreground truncate">Search &ldquo;Property rights under Muluki Civil Code...&rdquo;</span>
                                </div>
                                <div className="flex-1 flex flex-col gap-4">
                                    <div className="w-full p-4 rounded-lg bg-secondary/60 border border-border border-l-4 border-l-accent">
                                        <div className="w-1/3 h-3 bg-primary/20 rounded mb-3" />
                                        <div className="w-full h-2 bg-muted-foreground/15 rounded mb-2" />
                                        <div className="w-5/6 h-2 bg-muted-foreground/15 rounded" />
                                    </div>
                                    <div className="w-full p-4 rounded-lg bg-background border border-border opacity-70">
                                        <div className="w-1/4 h-3 bg-primary/20 rounded mb-3" />
                                        <div className="w-full h-2 bg-muted-foreground/15 rounded mb-2" />
                                        <div className="w-3/4 h-2 bg-muted-foreground/15 rounded" />
                                    </div>
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
                            <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-card shadow-card p-6 flex flex-col gap-4">
                                {[
                                    { label: 'Mon, Aug 11', case: 'State v. Sharma — Hearing', time: '10:30 AM' },
                                    { label: 'Wed, Aug 13', case: 'Property Dispute — Filing Deadline', time: '5:00 PM' },
                                    { label: 'Fri, Aug 15', case: 'Contract Review — Chamber No. 4', time: '2:00 PM' },
                                ].map((item) => (
                                    <div key={item.case} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/40 border border-border">
                                        <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <CalendarClock className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs uppercase tracking-widest text-accent font-semibold">{item.label}</p>
                                            <p className="text-sm text-foreground font-medium truncate">{item.case}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
                                    </div>
                                ))}
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
                        <div className="w-full lg:w-1/2 flex justify-center">
                            <div className="relative">
                                <div className="w-80 h-48 bg-primary rounded-xl shadow-card border border-white/10 relative overflow-hidden transform -rotate-2 transition-transform hover:rotate-0 duration-500">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                                    <div className="relative p-6 flex flex-col justify-between h-full">
                                        <div>
                                            <div className="text-primary-foreground text-lg font-heading font-semibold">
                                                Sarah Jenkins <span className="text-accent text-xs align-middle">Esq.</span>
                                            </div>
                                            <div className="text-primary-foreground/50 text-[10px] uppercase tracking-widest">Managing Partner</div>
                                            <div className="w-6 h-px bg-accent mt-2" />
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-primary-foreground/70 text-[10px] space-y-1">
                                                <div className="flex items-center gap-1"><Phone className="w-3 h-3 text-accent" /> (555) 019-8234</div>
                                                <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" /> Kathmandu, Nepal</div>
                                            </div>
                                            <div className="flex flex-col items-center opacity-60">
                                                <Nfc className="w-5 h-5 text-primary-foreground" />
                                                <span className="text-primary-foreground text-[8px] tracking-widest">TAP</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-4 -right-4 w-80 h-48 bg-card rounded-xl shadow-lg border border-border -z-10 transform rotate-3 opacity-80" />
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
                            <h2 className="heading-section">Firm Backoffice Software</h2>
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
                            <div className="relative w-full aspect-[4/3] rounded-2xl border border-border bg-card p-6 shadow-card flex gap-4">
                                <div className="w-1/4 h-full bg-muted rounded-lg border border-border flex flex-col p-3 gap-3">
                                    <div className="w-full h-2 bg-primary/20 rounded" />
                                    <div className="w-3/4 h-2 bg-primary/20 rounded" />
                                    <div className="w-full h-2 bg-primary/20 rounded" />
                                    <div className="w-1/2 h-2 bg-primary/20 rounded" />
                                </div>
                                <div className="w-3/4 flex flex-col gap-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 h-20 bg-background border border-border rounded-lg p-3">
                                            <div className="w-1/2 h-2 bg-muted-foreground/15 rounded mb-3" />
                                            <div className="w-1/4 h-6 bg-primary rounded" />
                                        </div>
                                        <div className="flex-1 h-20 bg-background border border-border rounded-lg p-3">
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
