'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { 
    Scale, 
    ArrowRight, 
    Globe, 
    Search,
    ChevronLeft,
    User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { googleLogin } from '@/generated/wokil-api';
import type { PublicDirectoryResponse } from '@/generated/wokil-api';

interface ProfessionalsClientProps {
    professionals: PublicDirectoryResponse;
}

export function ProfessionalsClient({ professionals: initialProfessionals }: ProfessionalsClientProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

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

    const filteredProfessionals = initialProfessionals?.profiles?.filter(p =>
        p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.professionalTitle?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <>
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div 
                        className="flex items-center gap-2 cursor-pointer" 
                        onClick={() => router.push('/')}
                    >
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <Scale className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-heading font-bold text-xl tracking-tight">Wokil</span>
                    </div>
                    <Button variant="ghost" onClick={() => router.push('/')} className="gap-2">
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
                        Meet Our <span className="text-primary italic">{initialProfessionals?.meta?.total || 0} Live Professionals</span>
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

                    {(filteredProfessionals && filteredProfessionals.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {filteredProfessionals.map((person, i) => (
                                <Card key={i} className="group border-none shadow-premium hover:shadow-premium-lg bg-white transition-all duration-500 overflow-hidden flex flex-col h-full rounded-[2.5rem]">
                                    <div className="aspect-[4/3] relative overflow-hidden shrink-0">
                                        {person.picture && person.picture.trim() !== '' ? (
                                            <div className="w-full h-full">
                                                <img 
                                                    src={person.picture} 
                                                    alt={person.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                />
                                                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#f8f9fb] relative overflow-hidden group">
                                                <Scale className="absolute -right-4 -bottom-4 w-32 h-32 text-black/5 -rotate-12 transition-transform duration-700 group-hover:rotate-0" />
                                                <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-[#1a1c1e] font-heading font-bold text-2xl shadow-xl shadow-black/5 border border-white z-10 transition-transform duration-500 group-hover:scale-110">
                                                    {getInitials(person.name ?? '')}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <CardContent className="p-8 pt-6 flex flex-col flex-1">
                                        <div className="mb-6">
                                            <h3 className="font-heading font-extrabold text-xl leading-tight text-[#1a1c1e] group-hover:text-primary transition-colors line-clamp-1 mb-1">
                                                {person.name}
                                            </h3>
                                            <p className="text-sm text-[#4b5563] font-medium opacity-80">
                                                {person.professionalTitle}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-3 mt-auto">
                                            {person.domains?.map((domain, dIdx) => (
                                                <a 
                                                    key={dIdx}
                                                    href={getProfileUrl(domain)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={`
                                                        w-full h-14 flex items-center justify-between px-6 rounded-2xl font-bold text-xs tracking-widest uppercase transition-all duration-300
                                                        ${dIdx === 0 
                                                            ? 'bg-[#1a1c24] text-white hover:bg-[#2a2c34] shadow-lg shadow-black/5' 
                                                            : 'bg-[#f8f9fb] text-[#1a1c24] hover:bg-[#eeeff2] border border-[#e5e7eb]'
                                                        }
                                                    `}
                                                >
                                                    <span className="truncate mr-2">{domain}</span>
                                                    <ArrowRight className={`w-4 h-4 shrink-0 transition-transform duration-300 ${dIdx === 0 ? 'group-hover:translate-x-1' : ''}`} />
                                                </a>
                                            ))}
                                            {(!person.domains || person.domains.length === 0) && (
                                                <div className="h-14 flex items-center justify-center px-6 rounded-2xl bg-muted/30 text-muted-foreground text-[10px] font-bold uppercase tracking-widest italic border border-dashed border-border">
                                                    No Site Deployed
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            
                            {(initialProfessionals?.meta?.hidden ?? 0) > 0 && (
                                <Card className="group border-none shadow-premium bg-[#1a1c24] transition-all duration-500 overflow-hidden flex flex-col rounded-[2.5rem]\">
                                    <div className="aspect-[4/3] relative overflow-hidden shrink-0 bg-white/5 flex items-center justify-center">
                                        <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                                            <Globe className="w-8 h-8" />
                                        </div>
                                    </div>
                                    
                                    <CardContent className="p-8 pt-6 flex flex-col flex-1">
                                        <div className="mb-6 text-center">
                                            <h3 className="text-3xl font-heading font-extrabold text-white mb-1">
                                                +{initialProfessionals?.meta?.hidden ?? 0}
                                            </h3>
                                            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em]">
                                                More Hidden Profiles
                                            </p>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <p className="text-white/70 text-sm leading-relaxed text-center">
                                                Manage your visibility with ease. Hide your entire profile or just your photo whenever you need.
                                            </p>
                                            <div className="h-px w-10 bg-white/10 mx-auto" />
                                            <p className="text-white/80 text-sm font-medium text-center">
                                                Want to build your own professional identity?
                                            </p>
                                        </div>

                                        <div className="flex flex-col w-full gap-3 mt-auto">
                                            <Button 
                                                onClick={handleLogin}
                                                className="h-12 rounded-xl bg-white text-black hover:bg-white/90 transition-all font-bold group/btn shadow-xl shadow-black/20"
                                            >
                                                Login to View
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                onClick={() => router.push('/')}
                                                className="text-white/60 hover:text-white hover:bg-white/5 font-bold"
                                            >
                                                Explore Features
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
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
        </>
    );
}
