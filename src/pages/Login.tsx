import { Button } from '@/components/ui/button';
import {
    Scale,
    LogIn,
    Globe,
    Zap,
    BarChart3,
    Shield,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { auth } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function Login() {
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('token')) {
            navigate('/dashboard');
        }
    }, [navigate]);

    const handleLogin = async () => {
        try {
            const url = await auth.getLoginUrl();
            window.location.href = url;
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to initiate login.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="min-h-screen bg-background selection:bg-primary/20">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                            <Scale className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">Wokil</span>
                    </div>
                    <Button variant="ghost" onClick={handleLogin} className="gap-2 hidden sm:flex">
                        <LogIn className="w-4 h-4" />
                        Sign In
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 text-center lg:text-left space-y-8 max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold tracking-wide uppercase">
                                <Zap className="w-3 h-3" />
                                The Future of Lawyer Presence
                            </div>
                            <h1 className="text-5xl lg:text-7xl font-heading font-bold text-foreground leading-[1.1]">
                                Your Professional <span className="text-primary italic">Digital Identity</span> Built in Minutes.
                            </h1>
                            <p className="text-xl text-muted-foreground leading-relaxed">
                                Wokil empowers lawyers to create stunning, professional profiles that attract clients and build trust. No coding required.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button onClick={handleLogin} size="lg" className="w-full sm:w-auto gap-2 h-12 px-8 text-base shadow-lg shadow-primary/20">
                                    <LogIn className="w-4 h-4" />
                                    Get Started with Google
                                </Button>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 h-12 px-8 text-base group">
                                    View Examples
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </div>
                            <div className="flex items-center justify-center lg:justify-start gap-4 text-sm text-muted-foreground pt-4">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center overflow-hidden">
                                            <div className="w-full h-full bg-primary/20" />
                                        </div>
                                    ))}
                                </div>
                                <p>Joined by <span className="text-foreground font-semibold">1,000+</span> professionals</p>
                            </div>
                        </div>

                        {/* Hero Illustration / Mockup */}
                        <div className="flex-1 relative w-full max-w-[500px] mx-auto lg:mx-0">
                            <div className="relative group p-6 sm:p-10">
                                <div className="absolute inset-6 sm:inset-10 bg-gradient-to-tr from-primary/20 to-transparent rounded-3xl blur-3xl -z-10" />

                                <div className="relative">
                                    {/* Main Mockup Card */}
                                    <div className="bg-card border border-border rounded-2xl shadow-2xl p-6 relative overflow-hidden z-10">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-16 h-16 rounded-full bg-muted animate-pulse" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                                                <div className="h-3 w-1/4 bg-muted/60 rounded animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-4 mb-8">
                                            <div className="h-3 w-5/6 bg-muted rounded animate-pulse" />
                                            <div className="h-3 w-full bg-muted rounded animate-pulse" />
                                            <div className="h-3 w-4/6 bg-muted rounded animate-pulse" />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-10 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-center">
                                                <div className="h-2 w-12 bg-primary/20 rounded" />
                                            </div>
                                            <div className="h-10 bg-primary/5 border border-primary/10 rounded-lg flex items-center justify-center">
                                                <div className="h-2 w-12 bg-primary/20 rounded" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Overlay "Live" Badge - Tied to card mockup bounds */}
                                    <div className="absolute -top-3 -right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-green-500/20 text-green-600 text-[10px] font-bold uppercase tracking-wider shadow-lg">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                        Digital Profile Live
                                    </div>

                                    {/* Floating Analytics Card - Tied to card mockup bounds */}
                                    <div className="absolute -bottom-6 -left-6 z-20 bg-card border border-border p-4 rounded-xl shadow-xl max-w-[160px] sm:max-w-[200px] animate-in slide-in-from-bottom-5 duration-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <BarChart3 className="w-4 h-4 text-primary" />
                                            <span className="text-xs font-semibold">Growth</span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-lg font-bold">12,402</div>
                                            <div className="text-[10px] text-green-600 flex items-center gap-0.5 font-medium">
                                                +24% this month
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-card/30 border-y border-border">
                <div className="container mx-auto px-6 text-center space-y-16">
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-3xl font-heading font-bold text-foreground">Everything you need to stand out</h2>
                        <p className="text-muted-foreground">Focus on your practice, we'll handle your online presence.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[{
                            icon: <Globe className="w-6 h-6" />,
                            title: "Instant Public URL",
                            desc: "Get a clean, professional link to share with prospects and clients immediately."
                        }, {
                            icon: <Zap className="w-6 h-6" />,
                            title: "Progressive Builder",
                            desc: "Our step-by-step assistant guides you through creating the perfect profile in minutes."
                        }, {
                            icon: <BarChart3 className="w-6 h-6" />,
                            title: "Customizable Business Card",
                            desc: "Get your customizable business card with your contact and website QRs."
                        }, {
                            icon: <BarChart3 className="w-6 h-6" />,
                            title: "Smart Analytics(Coming Soon)",
                            desc: "Track profile views, QR scans, and contact button clicks to measure your impact."
                        }].map((feature, i) => (
                            <div key={i} className="bg-card border border-border p-8 rounded-2xl text-left hover:border-primary/40 transition-colors group">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-heading font-bold mb-3">{feature.title}</h3>
                                <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                                <Scale className="w-3 h-3 text-primary-foreground" />
                            </div>
                            <span className="font-heading font-bold text-lg">Wokil</span>
                        </div>
                        <div className="flex gap-8 text-sm text-muted-foreground">
                            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} Wokil. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
