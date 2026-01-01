import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, User } from 'lucide-react';

interface ModernThemeProps {
  profile: LawyerProfile;
}

export function ModernTheme({ profile }: ModernThemeProps) {
  const {
    basicInformation,
    practiceDetails,
    contactInformation,
    professionalProfile,
    onlinePresence
  } = profile;

  const fullName = basicInformation.fullName || 'Your Name';
  const professionalTitle = basicInformation.professionalTitle || 'Legal Professional';
  const lawFirmName = basicInformation.lawFirmName;
  const yearsOfExperience = basicInformation.yearsOfExperience;

  const areasOfPractice = practiceDetails.areasOfPractice || [];

  const phoneNumber = contactInformation.phoneNumber;
  const email = contactInformation.email;
  const officeAddress = contactInformation.officeAddress;

  const bio = professionalProfile.bio;
  const profilePhoto = professionalProfile.profilePhoto;
  const officeHours = professionalProfile.officeHours;

  const website = onlinePresence.website;
  const linkedIn = onlinePresence.linkedIn;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-body selection:bg-blue-500/30">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(59,130,246,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(139,92,246,0.1),transparent)]" />
        <div className="container mx-auto px-6 py-24 relative">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="animate-in fade-in slide-in-from-left duration-1000">
              <div className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-semibold mb-8 tracking-wide uppercase">
                {professionalTitle}
              </div>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 font-heading tracking-tight leading-[1.1] bg-gradient-to-r from-white via-white to-slate-500 bg-clip-text text-transparent">
                {fullName}
              </h1>
              {lawFirmName && (
                <p className="text-slate-400 text-2xl mb-4 font-light italic">{lawFirmName}</p>
              )}
              <div className="flex items-center gap-3 text-slate-500 mb-10">
                <span className="h-px w-8 bg-blue-500/50" />
                <p className="text-lg tracking-wide uppercase">
                  {yearsOfExperience}+ Years of Legal Excellence
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a href={`tel:${phoneNumber}`} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-blue-500/25 flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Me
                </a>
                <a href={`mailto:${email}`} className="px-8 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700/50 rounded-xl font-bold transition-all hover:scale-105 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Send Email
                </a>
              </div>
            </div>

            <div className="flex justify-center animate-in fade-in zoom-in duration-1000">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl group-hover:opacity-75 transition-opacity" />
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt={fullName}
                    className="w-72 h-72 md:w-96 md:h-96 rounded-[2rem] object-cover border border-white/10 shadow-2xl relative z-10 transition-all"
                  />
                ) : (
                  <div className="w-72 h-72 md:w-96 md:h-96 rounded-[2rem] bg-slate-900 flex items-center justify-center border border-white/10 relative z-10 shadow-2xl">
                    <User className="w-32 h-32 text-slate-700" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-24">
        {/* About Section */}
        <section className="mb-24 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <h2 className="text-4xl font-bold mb-8 font-heading flex items-center gap-4">
            <span className="w-12 h-1 bg-blue-600 rounded-full" />
            Professional Background
          </h2>
          <p className="text-slate-400 text-xl leading-relaxed max-w-4xl font-light">
            {bio || 'Professional bio will appear here...'}
          </p>
        </section>

        {/* Practice Areas */}
        {areasOfPractice.length > 0 && (
          <section className="mb-24 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            <h2 className="text-4xl font-bold mb-10 font-heading flex items-center gap-4">
              <span className="w-12 h-1 bg-blue-600 rounded-full" />
              Strategic Focus
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {areasOfPractice.map((area, idx) => (
                <div
                  key={area}
                  className="group p-8 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-all duration-300 hover:translate-y-[-4px]"
                >
                  <span className="block text-blue-500 font-bold mb-4 text-sm tracking-tighter">0{idx + 1}</span>
                  <span className="text-xl text-white font-medium group-hover:text-blue-400 transition-colors uppercase tracking-tight">{area}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24 anim-in fade-in slide-in-from-bottom duration-700 delay-700">
          <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl group hover:bg-slate-900 transition-colors">
            <Phone className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Direct Line</h3>
            <p className="text-xl text-white font-medium leading-none">{phoneNumber || 'Phone number'}</p>
          </div>
          <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl group hover:bg-slate-900 transition-colors">
            <Mail className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Electronic Mail</h3>
            <p className="text-xl text-white font-medium break-all leading-tight">{email || 'Email address'}</p>
          </div>
          <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl group hover:bg-slate-900 transition-colors">
            <MapPin className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Chambers</h3>
            <p className="text-xl text-white font-medium leading-snug">{officeAddress || 'Office address'}</p>
          </div>
          <div className="p-8 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl group hover:bg-slate-900 transition-colors">
            <Clock className="w-8 h-8 text-blue-500 mb-6 group-hover:scale-110 transition-transform" />
            <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Availability</h3>
            <p className="text-xl text-white font-medium leading-none">{officeHours || 'Office hours'}</p>
          </div>
        </section>

        {/* Online Links */}
        {(website || linkedIn) && (
          <section className="flex flex-wrap gap-4 justify-center items-center py-12 border-y border-slate-800/50">
            {website && (
              <a href={website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-6 py-3 bg-slate-900 border border-slate-800 rounded-full hover:border-blue-500/50 hover:text-blue-400 transition-all font-medium">
                <Globe className="w-5 h-5" />
                <span>Official Website</span>
              </a>
            )}
            {linkedIn && (
              <a href={linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-colors">
                <Linkedin className="w-5 h-5 text-blue-500" />
                <span>LinkedIn</span>
              </a>
            )}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-16">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} {fullName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
