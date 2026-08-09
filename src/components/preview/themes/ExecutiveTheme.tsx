import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Shield, Award, Briefcase, Scale, UserCheck, MessageCircle, Wallet, Menu } from 'lucide-react';

interface ExecutiveThemeProps {
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

export function ExecutiveTheme({ profile }: ExecutiveThemeProps) {
    const {
        basicInformation,
        practiceDetails,
        contactInformation,
        professionalProfile,
        onlinePresence
    } = profile;

    const fullName = basicInformation.fullName || 'Professional Advocate';
    const professionalTitle = basicInformation.professionalTitle || 'Principal Attorney';
    const lawFirmName = basicInformation.lawFirmName || 'Private Practice';
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
        { q: 'What areas do you practice in?', a: jurisdictions.length > 0 ? `Admitted to practice in ${jurisdictions.join(', ')}. See Practice Areas above for matters handled.` : 'See Practice Areas above for the specific matters handled.' },
        { q: 'What are your office hours?', a: officeHours || 'Office hours are available by appointment — contact the office to schedule a time.' },
        { q: 'How do I get started?', a: 'Call or email using the details below, or use the "Request Consultation" button at the top of the page.' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-body text-slate-900 selection:bg-blue-600/10">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    <a href="#top" className="flex items-center gap-2 min-w-0 font-heading font-bold text-slate-900 tracking-tight">
                        <Scale className="w-5 h-5 text-blue-700 shrink-0" />
                        <span className="truncate">{lawFirmName}</span>
                    </a>
                    <div className="hidden @lg:flex items-center gap-8 text-sm font-medium text-slate-500">
                        <a href="#about" className="hover:text-slate-900 transition-colors">Executive Summary</a>
                        <a href="#practice-areas" className="hover:text-slate-900 transition-colors">Practice Areas</a>
                        <a href="#why" className="hover:text-slate-900 transition-colors">Why Work With Me</a>
                        <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
                    </div>
                    <a href="#contact" className="hidden @lg:block px-4 @md:px-5 py-2.5 bg-slate-900 hover:bg-blue-700 rounded-lg text-sm font-bold text-white transition-colors shrink-0">
                        Request Consultation
                    </a>
                    <details className="@lg:hidden relative shrink-0">
                        <summary className="flex items-center justify-center w-9 h-9 rounded-lg text-slate-900 list-none cursor-pointer [&::-webkit-details-marker]:hidden">
                            <Menu className="w-5 h-5" />
                        </summary>
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-2xl p-4 flex flex-col gap-3 text-sm font-medium text-slate-500 z-50">
                            <a href="#about" className="hover:text-slate-900 transition-colors">Executive Summary</a>
                            <a href="#practice-areas" className="hover:text-slate-900 transition-colors">Practice Areas</a>
                            <a href="#why" className="hover:text-slate-900 transition-colors">Why Work With Me</a>
                            <a href="#faq" className="hover:text-slate-900 transition-colors">FAQ</a>
                            <a href="#contact" className="mt-1 px-4 py-2.5 bg-slate-900 hover:bg-blue-700 rounded-lg text-sm font-bold text-white text-center transition-colors">
                                Request Consultation
                            </a>
                        </div>
                    </details>
                </div>
            </nav>

            {/* Hero Header */}
            <header id="top" className="bg-white border-b border-slate-200 scroll-mt-16">
                <div className="container mx-auto px-6 py-12 @md:py-20">
                    <div className="flex flex-col @md:flex-row gap-10 @md:gap-16 items-center max-w-6xl mx-auto">
                        <div className="flex-1 space-y-6 @md:space-y-8 text-center @md:text-left animate-in fade-in slide-in-from-left duration-700">
                            <div className="space-y-3 @md:space-y-4">
                                <h2 className="text-blue-700 font-heading font-bold uppercase tracking-[0.25em] text-xs @md:text-sm">
                                    {lawFirmName}
                                </h2>
                                <h1 className="text-3xl @sm:text-4xl @md:text-6xl @lg:text-7xl font-heading font-extrabold text-slate-900 tracking-tight leading-none">
                                    {fullName}
                                </h1>
                                <p className="text-base @sm:text-lg @md:text-2xl text-slate-500 font-light @md:max-w-2xl">
                                    {professionalTitle}
                                </p>
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
                                        alt={fullName}
                                        className="w-full aspect-[4/5] object-cover rounded-2xl shadow-2xl border border-white"
                                    />
                                ) : (
                                    <div className="w-full aspect-[4/5] bg-slate-200 rounded-2xl flex items-center justify-center shadow-2xl border border-white">
                                        <Briefcase className="w-12 h-12 @sm:w-16 @sm:h-16 @md:w-24 @md:h-24 text-slate-400" />
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
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Executive Summary</h3>
                            </div>
                            <p className="text-xl text-slate-600 leading-relaxed font-light">
                                {bio || 'Professional brief will be curated here.'}
                            </p>
                        </section>

                        {areasOfPractice.length > 0 && (
                            <section data-reveal id="practice-areas" className="scroll-mt-24 space-y-12">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-1 bg-blue-700" />
                                    <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Practice Areas</h3>
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

                        <section data-reveal id="why" className="scroll-mt-24 space-y-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Why Work With Me</h3>
                            </div>
                            <div className="grid @sm:grid-cols-3 gap-6">
                                {VALUE_POINTS.map(({ icon: Icon, title, description }) => (
                                    <div key={title} className="p-8 bg-white border border-slate-200 rounded-xl">
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6">
                                            <Icon className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <h4 className="font-heading font-bold text-lg text-slate-900 mb-2">{title}</h4>
                                        <p className="text-sm text-slate-500">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section data-reveal className="space-y-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">How It Works</h3>
                            </div>
                            <div className="grid @sm:grid-cols-3 gap-6">
                                {PROCESS_STEPS.map(({ step, title, description }) => (
                                    <div key={step} className="p-8 bg-white border border-slate-200 rounded-xl">
                                        <span className="block font-heading font-black text-3xl text-blue-700/30 mb-4">{step}</span>
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
                                {faqs.map(({ q, a }) => (
                                    <details key={q} className="group py-6">
                                        <summary className="flex items-center justify-between cursor-pointer list-none text-lg font-semibold text-slate-900">
                                            {q}
                                            <span className="text-blue-700 text-xl transition-transform group-open:rotate-45 shrink-0 ml-4">+</span>
                                        </summary>
                                        <p className="mt-4 text-slate-600 leading-relaxed">{a}</p>
                                    </details>
                                ))}
                            </div>
                        </section>
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

                        <div data-reveal className="bg-blue-700 text-white p-8 rounded-2xl space-y-6">
                            <h4 className="font-heading font-bold text-lg uppercase tracking-widest opacity-60">Credentials</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Award className="w-5 h-5 text-blue-300" />
                                    <span className="font-bold">{yearsOfExperience}+ Years Experience</span>
                                </div>
                                {jurisdictions?.map(j => (
                                    <div key={j} className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-blue-300" />
                                        <span className="font-medium text-sm">Admitted: {j}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </main>

            <footer className="bg-slate-900 text-slate-500">
                <div className="container mx-auto px-6 py-16 max-w-6xl grid grid-cols-1 @md:grid-cols-3 gap-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 font-heading font-bold text-white">
                            <Scale className="w-5 h-5 text-blue-400" />
                            {lawFirmName}
                        </div>
                        <p className="text-sm leading-relaxed max-w-xs">
                            This website provides general information about the practice of {fullName}. It does not constitute legal advice, and viewing this site does not create an attorney-client relationship.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-slate-600 text-xs font-bold uppercase tracking-widest mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#about" className="hover:text-white transition-colors">Executive Summary</a></li>
                            <li><a href="#practice-areas" className="hover:text-white transition-colors">Practice Areas</a></li>
                            <li><a href="#why" className="hover:text-white transition-colors">Why Work With Me</a></li>
                            <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
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
