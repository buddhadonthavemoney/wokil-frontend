import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Shield, Award, Briefcase } from 'lucide-react';

interface ExecutiveThemeProps {
    profile: LawyerProfile;
}

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

    return (
        <div className="min-h-screen bg-slate-50 font-body text-slate-900 selection:bg-blue-600/10">
            {/* Top Bar */}
            <div className="bg-slate-900 text-slate-400 py-2 border-b border-slate-800">
                <div className="container mx-auto px-6 flex justify-between items-center text-[10px] font-bold uppercase tracking-[0.2em]">
                    <span>Institutional Legal Excellence</span>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-1.5"><Shield className="w-3 h-3" /> Certified Member</span>
                        <span className="flex items-center gap-1.5"><Award className="w-3 h-3" /> Top Rated</span>
                    </div>
                </div>
            </div>

            {/* Hero Header */}
            <header className="bg-white border-b border-slate-200">
                <div className="container mx-auto px-6 py-20">
                    <div className="flex flex-col md:flex-row gap-16 items-center max-w-6xl mx-auto">
                        <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left duration-700">
                            <div className="space-y-4">
                                <h2 className="text-blue-700 font-heading font-bold uppercase tracking-[0.25em] text-sm">
                                    {lawFirmName}
                                </h2>
                                <h1 className="text-5xl md:text-7xl font-heading font-extrabold text-slate-900 tracking-tight leading-none">
                                    {fullName}
                                </h1>
                                <p className="text-2xl text-slate-500 font-light max-w-2xl">
                                    {professionalTitle} specialized in Institutional Advocacy.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-4">
                                <a href={`tel:${phoneNumber}`} className="px-10 py-4 bg-slate-900 text-white rounded-lg font-bold hover:bg-blue-700 transition-all shadow-xl shadow-slate-900/10">
                                    Request Consultation
                                </a>
                                <a href={`mailto:${email}`} className="px-10 py-4 border-2 border-slate-200 rounded-lg font-bold text-slate-700 hover:border-blue-700 hover:text-blue-700 transition-all">
                                    Direct Correspondence
                                </a>
                            </div>
                        </div>

                        <div className="w-full md:w-96 animate-in fade-in zoom-in duration-700">
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
                                        <Briefcase className="w-24 h-24 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-6 py-24 max-w-6xl">
                <div className="grid lg:grid-cols-3 gap-16">
                    {/* Main Profile col */}
                    <div className="lg:col-span-2 space-y-24">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Executive Summary</h3>
                            </div>
                            <p className="text-xl text-slate-600 leading-relaxed font-light">
                                {bio || 'Professional brief will be curated here.'}
                            </p>
                        </section>

                        <section className="space-y-12">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-1 bg-blue-700" />
                                <h3 className="font-heading font-bold text-3xl text-slate-900 tracking-tight">Practice Areas</h3>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-6">
                                {areasOfPractice.map((area) => (
                                    <div key={area} className="p-8 bg-white border border-slate-200 rounded-xl hover:border-blue-600 hover:shadow-xl transition-all group">
                                        <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center mb-6 group-hover:bg-blue-50 transition-colors">
                                            <Briefcase className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <h4 className="font-heading font-bold text-lg text-slate-900 mb-2 uppercase tracking-wide">{area}</h4>
                                        <p className="text-sm text-slate-500 font-medium">Core Strategic Focus</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Institutional Sidebar */}
                    <aside className="space-y-10">
                        <div className="bg-white border-2 border-slate-900 p-8 rounded-2xl space-y-10 shadow-2xl">
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
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chambers</p>
                                        <p className="font-bold text-slate-900 leading-tight">{officeAddress || 'Private Chambers'}</p>
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

                        <div className="bg-blue-700 text-white p-8 rounded-2xl space-y-6">
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

            <footer className="bg-slate-900 text-slate-500 py-16">
                <div className="container mx-auto px-6 max-w-6xl flex flex-col items-center gap-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-700 rounded flex items-center justify-center font-bold text-white text-lg">W</div>
                        <span className="font-heading font-bold text-2xl tracking-tighter text-white">Wokil</span>
                    </div>
                    <p className="text-center text-sm max-w-sm font-medium">
                        Institutional platform for world-class legal practitioners.
                    </p>
                    <div className="h-px w-24 bg-slate-800" />
                    <p className="text-xs uppercase tracking-widest font-bold">
                        © {new Date().getFullYear()} {fullName} · Solicitor & Barrister
                    </p>
                </div>
            </footer>
        </div>
    );
}
