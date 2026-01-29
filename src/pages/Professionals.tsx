import { useQuery } from '@tanstack/react-query';
import { publicPeople } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { 
    Scale, 
    ArrowRight, 
    Globe, 
    Loader2, 
    ExternalLink, 
    User,
    ChevronLeft,
    Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Professionals() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: professionals, isLoading } = useQuery({
        queryKey: ['public-people'],
        queryFn: publicPeople.list,
    });

    const filteredProfessionals = professionals?.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.professionalTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getProfileUrl = (domain: string) => {
        if (!domain) return '#';
        if (domain.startsWith('http')) return domain;
        return `https://${domain}`;
    };

    const getInitials = (name: string) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 selection:bg-primary/20">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div 
                        className="flex items-center gap-2 cursor-pointer" 
                        onClick={() => navigate('/')}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Scale className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">Wokil</span>
                    </div>
                    <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
                        <ChevronLeft className="w-4 h-4" />
                        Back to Home
                    </Button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-8 overflow-hidden">
                <div className="container mx-auto px-6 text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold tracking-widest uppercase">
                        <Globe className="w-3 h-3" />
                        Live Directories
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-heading font-bold text-foreground leading-tight">
                        Meet Our <span className="text-primary italic">{professionals?.length || 0} Live Professionals</span>
                    </h1>
                    <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Discover the legal professionals who have built their digital identity with Wokil.
                    </p>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-8 pb-32">
                <div className="container mx-auto px-6">
                    <div className="mb-10 max-w-md mx-auto">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input 
                                placeholder="Search by name or title..." 
                                className="pl-10 h-11 rounded-xl border-border/60 shadow-sm focus:ring-primary bg-white/80 backdrop-blur-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground font-medium animate-pulse">Fetching professionals...</p>
                        </div>
                    ) : (filteredProfessionals && filteredProfessionals.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredProfessionals.map((person, i) => (
                                <Card key={i} className="group border-none shadow-premium hover:shadow-premium-lg bg-white transition-all duration-300 overflow-hidden flex flex-col h-full border border-transparent hover:border-primary/10">
                                    <div className="aspect-[16/10] bg-muted relative overflow-hidden shrink-0">
                                        {person.picture && person.picture.trim() !== '' ? (
                                            <img 
                                                src={person.picture} 
                                                alt={person.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/5">
                                                <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-primary font-heading font-bold text-xl shadow-sm border border-primary/10 group-hover:scale-110 transition-transform duration-500">
                                                    {getInitials(person.name)}
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                            <a 
                                                href={getProfileUrl(person.domains?.[0] || '')}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                            >
                                                <Button size="sm" className="gap-2 bg-white text-black hover:bg-white/90 font-bold px-5">
                                                    Visit Site
                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                </Button>
                                            </a>
                                        </div>
                                    </div>
                                    <CardContent className="p-4 flex flex-col flex-1">
                                        <div className="flex-1 space-y-1">
                                            <h3 className="font-heading font-bold text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                                                {person.name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                                                {person.professionalTitle}
                                            </p>
                                        </div>
                                        <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-border/30">
                                            {person.domains?.map((domain, dIdx) => (
                                                <a 
                                                    key={dIdx}
                                                    href={getProfileUrl(domain)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-primary text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:gap-2 transition-all hover:underline"
                                                >
                                                    {domain}
                                                    <ArrowRight className="w-3 h-3" />
                                                </a>
                                            ))}
                                            {(!person.domains || person.domains.length === 0) && (
                                                <span className="text-[10px] text-muted-foreground italic">No deployed site</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 space-y-6">
                            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform">
                                <User className="w-8 h-8 text-muted-foreground/40" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-lg font-bold">No results found</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto text-balance">
                                    We couldn't find any professionals matching "{searchQuery}".
                                </p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setSearchQuery('')}
                                    className="mt-4 rounded-xl"
                                >
                                    Clear search
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-border bg-white">
                <div className="container mx-auto px-6 flex flex-col items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                            <Scale className="w-3 h-3 text-primary-foreground" />
                        </div>
                        <span className="font-heading font-bold text-lg">Wokil</span>
                    </div>
                    <p className="text-xs text-muted-foreground text-center max-w-xs leading-relaxed">
                        The ultimate digital identity platform for modern legal professionals.
                    </p>
                    <div className="flex gap-6 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                        <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                        <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        <a href="#" className="hover:text-primary transition-colors">Contact</a>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 font-medium">
                        © {new Date().getFullYear()} Wokil. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}
