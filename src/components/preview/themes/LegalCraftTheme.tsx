import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale, BookOpen, PenTool as Pen, Gavel, UserCheck, MessageCircle, Wallet } from 'lucide-react';

interface LegalCraftThemeProps {
    profile: LawyerProfile;
}

// Generic value-proposition copy, not claims specific to any one attorney —
// placeholder content until the data model grows fields for this. Safe to
// ship as-is: it's boilerplate common on solo/boutique practice sites, not
// a factual assertion about the particular attorney.
const VALUE_POINTS = [
    { icon: UserCheck, title: 'Direct Access', description: "You'll work with me personally throughout your matter — not handed off to a rotating cast of associates." },
    { icon: MessageCircle, title: 'Clear Communication', description: 'Plain-language updates at every stage, so you always know where your case stands.' },
    { icon: Wallet, title: 'Transparent Fees', description: 'Fee structures are discussed upfront during your consultation — no surprises on your invoice.' },
];

const PROCESS_STEPS = [
    { step: '01', title: 'Initial Consultation', description: 'We discuss the facts of your matter, your goals, and whether representation makes sense.' },
    { step: '02', title: 'Case Strategy', description: 'A tailored plan is built around your case, timeline, and desired outcome.' },
    { step: '03', title: 'Representation', description: 'Your matter is handled from filing through resolution, with regular updates along the way.' },
];

export function LegalCraftTheme({ profile }: LegalCraftThemeProps) {
    const {
        basicInformation,
        practiceDetails,
        contactInformation,
        professionalProfile,
        onlinePresence
    } = profile;

    const fullName = basicInformation.fullName || 'Your Name';
    const professionalTitle = basicInformation.professionalTitle || 'Barrister & solicitor';
    const lawFirmName = basicInformation.lawFirmName;
    const yearsOfExperience = basicInformation.yearsOfExperience;

    const areasOfPractice = practiceDetails.areasOfPractice || [];
    const jurisdictions = practiceDetails.jurisdictions || [];

    const phoneNumber = contactInformation.phoneNumber;
    const email = contactInformation.email;
    const officeAddress = contactInformation.officeAddress;

    const bio = professionalProfile.bio;
    const profilePhoto = professionalProfile.profilePhoto;
    const officeHours = professionalProfile.officeHours;

    const website = onlinePresence.website;
    const linkedIn = onlinePresence.linkedIn;

    const faqs = [
        { q: 'Do you offer an initial consultation?', a: `Yes — use the contact details below to schedule a consultation with ${fullName}.` },
        { q: 'What areas do you practice in?', a: jurisdictions.length > 0 ? `Admitted to practice in ${jurisdictions.join(', ')}. See Crafted Expertise above for matters handled.` : 'See Crafted Expertise above for the specific matters handled.' },
        { q: 'What are your office hours?', a: officeHours || 'Office hours are available by appointment — contact the office to schedule a time.' },
        { q: 'How do I get started?', a: 'Call or email using the details below, or use the "Request Interview" button at the top of the page.' },
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] font-body text-[#3C2A21] selection:bg-[#D4A373]/20">
            {/* Decorative Border */}
            <div className="h-2 bg-gradient-to-r from-[#1A120B] via-[#3C2A21] to-[#1A120B]" />

            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E5E5E5]">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    <a href="#top" className="flex items-center gap-2 font-heading font-bold text-[#1A120B] tracking-tight shrink-0">
                        <Gavel className="w-5 h-5 text-[#D4A373]" />
                        <span className="truncate max-w-[40vw] @md:max-w-none">{lawFirmName || fullName}</span>
                    </a>
                    <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-[#3C2A21]/60">
                        <a href="#about" className="hover:text-[#1A120B] transition-colors">Philosophy</a>
                        <a href="#practice-areas" className="hover:text-[#1A120B] transition-colors">Expertise</a>
                        <a href="#why" className="hover:text-[#1A120B] transition-colors">Why Work With Me</a>
                        <a href="#faq" className="hover:text-[#1A120B] transition-colors">FAQ</a>
                    </div>
                    <a href="#contact" className="px-4 @md:px-5 py-2.5 bg-[#3C2A21] hover:bg-[#1A120B] rounded-sm text-sm font-bold text-white tracking-wide uppercase transition-colors shrink-0">
                        Request Interview
                    </a>
                </div>
            </nav>

            {/* Hero Section */}
            <header id="top" className="relative pt-24 pb-32 overflow-hidden border-b border-[#E5E5E5] scroll-mt-16">
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
                            <h1 className="text-6xl @md:text-8xl font-heading font-bold text-[#1A120B] leading-tight tracking-tight">
                                {fullName}
                            </h1>
                            <div className="flex flex-col items-center gap-2">
                                <span className="text-2xl @md:text-3xl font-heading italic text-[#D4A373] font-medium">
                                    {professionalTitle}
                                </span>
                                {lawFirmName && (
                                    <span className="text-lg text-[#3C2A21]/60 font-medium uppercase tracking-[0.3em] font-heading">
                                        {lawFirmName}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-center gap-6 mt-12">
                            <a href={`tel:${phoneNumber}`} className="group relative px-12 py-5 overflow-hidden rounded-sm font-bold text-white tracking-widest uppercase transition-all">
                                <div className="absolute inset-0 bg-[#3C2A21] group-hover:bg-[#1A120B] transition-colors" />
                                <span className="relative flex items-center gap-3">
                                    <Phone className="w-4 h-4" />
                                    Request Interview
                                </span>
                            </a>
                            <a href={`mailto:${email}`} className="px-12 py-5 border-2 border-[#3C2A21] rounded-sm font-bold text-[#3C2A21] tracking-widest uppercase hover:bg-[#3C2A21] hover:text-white transition-all transform hover:-translate-y-1">
                                Correspondence
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-24 max-w-6xl">
                <div className="grid @lg:grid-cols-12 gap-20">
                    {/* Detailed Bio */}
                    <div id="about" className="scroll-mt-24 @lg:col-span-12 space-y-12 mb-12">
                        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
                            <h2 className="font-heading text-4xl font-bold text-[#1A120B]">Professional Philosophy</h2>
                            <div className="h-1.5 w-24 bg-[#D4A373] rounded-full" />
                            <p className="text-2xl text-[#3C2A21]/80 leading-relaxed font-light italic">
                                &ldquo;{bio || 'A professional biography will be presented here.'}&rdquo;
                            </p>
                        </div>
                    </div>

                    {/* Core Expertise */}
                    <div className="@lg:col-span-8 space-y-16">
                        {areasOfPractice.length > 0 && (
                            <section id="practice-areas" className="scroll-mt-24">
                                <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                    <Pen className="w-6 h-6 text-[#D4A373]" />
                                    Crafted Expertise
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

                        <section className="bg-[#1A120B] text-[#D4A373] p-16 rounded-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-1000">
                                <Scale className="w-64 h-64" />
                            </div>
                            <div className="relative z-10 space-y-6">
                                <h3 className="text-sm uppercase tracking-[0.4em] font-bold text-[#D4A373]/60 mb-8">Professional Standing</h3>
                                <div className="flex items-center gap-8">
                                    <div className="text-7xl font-heading font-bold">{yearsOfExperience}</div>
                                    <div className="space-y-1">
                                        <p className="text-2xl font-heading font-medium text-white">Years of Practice</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section id="why" className="scroll-mt-24">
                            <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                <Pen className="w-6 h-6 text-[#D4A373]" />
                                Why Work With Me
                            </h3>
                            <div className="grid @md:grid-cols-3 gap-8">
                                {VALUE_POINTS.map(({ icon: Icon, title, description }) => (
                                    <div key={title} className="p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373]">
                                        <Icon className="w-6 h-6 text-[#D4A373] mb-4" />
                                        <h4 className="text-lg font-bold text-[#1A120B] font-heading mb-2">{title}</h4>
                                        <p className="text-sm text-[#3C2A21]/70 leading-relaxed">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                <Pen className="w-6 h-6 text-[#D4A373]" />
                                How It Works
                            </h3>
                            <div className="grid @md:grid-cols-3 gap-8">
                                {PROCESS_STEPS.map(({ step, title, description }) => (
                                    <div key={step} className="p-8 bg-[#F5F2ED] border-l-4 border-[#D4A373]">
                                        <span className="block font-heading font-black text-3xl text-[#D4A373]/40 mb-4">{step}</span>
                                        <h4 className="text-lg font-bold text-[#1A120B] font-heading mb-2">{title}</h4>
                                        <p className="text-sm text-[#3C2A21]/70 leading-relaxed">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section id="faq" className="scroll-mt-24">
                            <h3 className="font-heading text-2xl font-bold text-[#1A120B] mb-10 flex items-center gap-4 uppercase tracking-wider">
                                <Pen className="w-6 h-6 text-[#D4A373]" />
                                Frequently Asked Questions
                            </h3>
                            <div className="divide-y divide-[#E5E5E5] border-y border-[#E5E5E5]">
                                {faqs.map(({ q, a }) => (
                                    <details key={q} className="group py-6">
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-lg font-semibold text-[#1A120B]">
                                            {q}
                                            <span className="text-[#D4A373] text-xl transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
                                        </summary>
                                        <p className="mt-4 text-[#3C2A21]/70 leading-relaxed">{a}</p>
                                    </details>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Sidebar */}
                    <div className="@lg:col-span-4 space-y-12">
                        <div className="relative p-1 bg-gradient-to-br from-[#D4A373] to-[#3C2A21] rounded-sm shadow-2xl">
                            {profilePhoto ? (
                                <img src={profilePhoto} alt={fullName} className="w-full aspect-square object-cover" />
                            ) : (
                                <div className="w-full aspect-square bg-[#F5F2ED] flex items-center justify-center">
                                    <BookOpen className="w-20 h-20 text-[#D4A373]" />
                                </div>
                            )}
                        </div>

                        <div id="contact" className="scroll-mt-24 space-y-10 bg-white p-10 border border-[#E5E5E5] shadow-sm">
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
                            <Gavel className="w-5 h-5 text-[#D4A373]" />
                            {lawFirmName || fullName}
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs opacity-70">
                            This website provides general information about the practice of {fullName}. It does not constitute legal advice, and viewing this site does not create an attorney-client relationship.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">Quick Links</h4>
                        <ul className="space-y-2 text-sm opacity-80">
                            <li><a href="#about" className="hover:text-white transition-colors">Philosophy</a></li>
                            <li><a href="#practice-areas" className="hover:text-white transition-colors">Expertise</a></li>
                            <li><a href="#why" className="hover:text-white transition-colors">Why Work With Me</a></li>
                            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
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
