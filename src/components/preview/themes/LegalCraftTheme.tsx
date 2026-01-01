import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale, BookOpen, PenTool as Pen, Gavel } from 'lucide-react';

interface LegalCraftThemeProps {
    profile: LawyerProfile;
}

export function LegalCraftTheme({ profile }: LegalCraftThemeProps) {
    return (
        <div className="min-h-screen bg-[#FDFBF7] font-body text-[#3C2A21] selection:bg-[#D4A373]/20">
            {/* Decorative Border */}
            <div className="h-2 bg-gradient-to-r from-[#1A120B] via-[#3C2A21] to-[#1A120B]" />

            {/* Hero Section */}
            <header className="relative pt-24 pb-32 overflow-hidden border-b border-[#E5E5E5]">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#3C2A21]/[0.02] -skew-x-12 transform translate-x-1/2" />
                <div className="container mx-auto px-6 relative">
                    <div className="max-w-5xl mx-auto flex flex-col items-center text-center space-y-10">
                        <div className="flex items-center gap-6 animate-in fade-in slide-in-from-top duration-700">
                            <span className="h-px w-12 bg-[#D4A373]" />
                            <div className="w-16 h-16 rounded-full border border-[#D4A373] flex items-center justify-center">
                                <Gavel className="w-8 h-8 text-[#D4A373]" />
                            </div>
                            <span className="h-px w-12 bg-[#D4A373]" />
                        </div>

                        <div className="space-y-6 animate-in fade-in duration-1000">
                            <h1 className="text-6xl md:text-8xl font-heading font-bold text-[#1A120B] leading-tight tracking-tight">
                                {profile.fullName || 'Artisan of Law'}
                            </h1>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-2xl md:text-3xl font-heading italic text-[#D4A373] font-medium">
                                    {profile.professionalTitle || 'Barrister & solicitor'}
                                </span>
                                {profile.lawFirmName && (
                                    <span className="text-lg text-[#3C2A21]/60 font-medium uppercase tracking-[0.3em] font-heading">
                                        {profile.lawFirmName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 mt-12">
                            <a href={`tel:${profile.phoneNumber}`} className="group relative px-12 py-5 overflow-hidden rounded-sm font-bold text-white tracking-widest uppercase transition-all">
                                <div className="absolute inset-0 bg-[#3C2A21] group-hover:bg-[#1A120B] transition-colors" />
                                <span className="relative flex items-center gap-3">
                                    <Phone className="w-4 h-4" />
                                    Request Interview
                                </span>
                            </a>
                            <a href={`mailto:${profile.email}`} className="px-12 py-5 border-2 border-[#3C2A21] rounded-sm font-bold text-[#3C2A21] tracking-widest uppercase hover:bg-[#3C2A21] hover:text-white transition-all transform hover:-translate-y-1">
                                Correspondence
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-24 max-w-6xl">
                <div className="grid lg:grid-cols-12 gap-20">
                    {/* Detailed Bio */}
                    <div className="lg:col-span-12 space-y-12 mb-12">
                        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                            <h2 className="font-heading text-4xl font-bold text-[#1A120B]">Professional Philosophy</h2>
                            <div className="h-1.5 w-24 bg-[#D4A373] rounded-full" />
                            <p className="text-2xl text-[#3C2A21]/80 leading-relaxed font-light italic">
                                "{profile.bio || 'Meticulously crafting legal protections for the discerning client.'}"
                            </p>
                        </div>
                    </div>

                    {/* Core Expertise */}
                    <div className="lg:col-span-8 space-y-16">
                        <section>
                            <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                <Pen className="w-6 h-6 text-[#D4A373]" />
                                Crafted Expertise
                            </h3>
                            <div className="grid md:grid-cols-2 gap-8">
                                {profile.areasOfPractice.map((area, idx) => (
                                    <div key={area} className="relative p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373] group hover:bg-white hover:shadow-2xl transition-all">
                                        <span className="absolute top-4 right-6 text-[#D4A373]/20 font-heading text-4xl font-black">0{idx + 1}</span>
                                        <h4 className="text-xl font-bold text-[#1A120B] mb-4 font-heading">{area}</h4>
                                        <p className="text-sm text-[#3C2A21]/60 leading-relaxed">
                                            Strategically tailored representation focused on long-term client success and legal durability.
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="bg-[#1A120B] text-[#D4A373] p-16 rounded-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                <Scale className="w-64 h-64" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-sm uppercase tracking-[0.4em] font-bold text-[#D4A373]/60 mb-8">Professional Standing</h3>
                                <div className="flex items-center gap-8">
                                    <div className="text-7xl font-heading font-bold">{profile.yearsOfExperience}</div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-heading font-medium text-white">Years of Service</p>
                                        <p className="text-xs uppercase tracking-widest font-bold opacity-60">In the Honorable Pursuit of Law</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="relative p-1 bg-gradient-to-br from-[#D4A373] to-[#3C2A21] rounded-sm shadow-2xl">
                            {profile.profilePhoto ? (
                                <img src={profile.profilePhoto} alt={profile.fullName} className="w-full aspect-square object-cover" />
                            ) : (
                                <div className="w-full aspect-square bg-[#F5F2ED] flex items-center justify-center">
                                    <BookOpen className="w-20 h-20 text-[#D4A373]" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-10 bg-white p-10 border border-[#E5E5E5] shadow-sm">
                            <h4 className="font-heading font-bold text-lg uppercase tracking-widest border-b border-[#E5E5E5] pb-4">Chambers Details</h4>
                            <div className="space-y-8">
                                <div className="flex gap-4 items-start">
                                    <MapPin className="w-5 h-5 text-[#D4A373] mt-1 shrink-0" />
                                    <p className="text-[#3C2A21] font-medium leading-relaxed">{profile.officeAddress || 'Private Chambers'}</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Clock className="w-5 h-5 text-[#D4A373] shrink-0" />
                                    <p className="text-[#3C2A21] font-medium">{profile.officeHours || 'By Appointment'}</p>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Globe className="w-5 h-5 text-[#D4A373] shrink-0" />
                                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#3C2A21] font-medium hover:text-[#D4A373] transition-colors">Official Records</a>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <Linkedin className="w-5 h-5 text-[#D4A373] shrink-0" />
                                    <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="text-[#3C2A21] font-medium hover:text-[#D4A373] transition-colors">Professional Annals</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="bg-[#1A120B] text-[#D4A373] py-24 border-t-8 border-[#D4A373]">
                <div className="container mx-auto px-6 max-w-4xl flex flex-col items-center space-y-12">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="text-4xl font-heading font-black tracking-[0.2em] uppercase text-white">Wokil</div>
                        <div className="h-px w-32 bg-[#D4A373]/30" />
                        <p className="text-sm italic tracking-widest opacity-60">Architects of Justice · Since 2024</p>
                    </div>
                    <div className="text-center space-y-4 text-xs font-bold uppercase tracking-[0.3em] opacity-40">
                        <p>© {new Date().getFullYear()} {profile.fullName || 'Associate Practitioner'}</p>
                        <p>All Rights Reserved · Preserving the Integrity of the Bar</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
