import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale } from 'lucide-react';

interface ClassicThemeProps {
  profile: LawyerProfile;
}

export function ClassicTheme({ profile }: ClassicThemeProps) {
  return (
    <div className="min-h-screen bg-[#FDFCFB] font-body text-[#1A1A1A]">
      {/* Hero Section */}
      <header className="bg-[#1B2B44] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        <div className="container mx-auto px-6 py-20 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-12 max-w-6xl mx-auto">
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#C5A059] rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.fullName}
                  className="w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-4 border-[#C5A059] shadow-2xl relative"
                />
              ) : (
                <div className="w-40 h-40 md:w-56 md:h-56 rounded-full bg-[#2A3B54] flex items-center justify-center border-4 border-[#C5A059] shadow-2xl relative">
                  <Scale className="w-20 h-20 text-[#C5A059]" />
                </div>
              )}
            </div>

            <div className="text-center md:text-left space-y-4">
              <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight">
                {profile.fullName || 'Your Name'}
              </h1>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <span className="text-[#C5A059] text-2xl font-medium font-heading">
                  {profile.professionalTitle || 'Barrister & Solicitor'}
                </span>
                {profile.lawFirmName && (
                  <>
                    <span className="hidden md:block w-1.5 h-1.5 rounded-full bg-white/20" />
                    <span className="text-white/80 text-xl font-light italic">{profile.lawFirmName}</span>
                  </>
                )}
              </div>
              <p className="text-white/60 text-lg uppercase tracking-[0.2em] font-medium pt-2">
                {profile.yearsOfExperience}+ Years of Distinguished Practice
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-12 gap-12 max-w-6xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* About */}
            <section className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
              <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                <span className="w-10 h-[2px] bg-[#C5A059]" />
                Professional Profile
              </h2>
              <p className="text-[#4A4A4A] text-xl leading-relaxed font-light">
                {profile.bio || 'Detailed professional biography and expertise will be presented here.'}
              </p>
            </section>

            {/* Practice Areas */}
            {profile.areasOfPractice.length > 0 && (
              <section className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                  <span className="w-10 h-[2px] bg-[#C5A059]" />
                  Areas of Expertise
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.areasOfPractice.map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-3 p-4 bg-[#F8F9FB] rounded-xl border border-[#EDF0F5] hover:border-[#C5A059]/30 transition-colors"
                    >
                      <div className="w-2 h-2 rounded-full bg-[#C5A059]" />
                      <span className="text-[#1B2B44] font-medium text-lg tracking-tight">{area}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Jurisdictions */}
            {profile.jurisdictions && profile.jurisdictions.length > 0 && (
              <section className="bg-white rounded-2xl p-10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#F0F0F0]">
                <h2 className="font-heading text-3xl font-bold text-[#1B2B44] mb-8 flex items-center gap-4">
                  <span className="w-10 h-[2px] bg-[#C5A059]" />
                  Jurisdictions
                </h2>
                <div className="flex flex-wrap gap-4">
                  {profile.jurisdictions.map((jurisdiction) => (
                    <span
                      key={jurisdiction}
                      className="px-6 py-3 bg-[#1B2B44] text-[#C5A059] rounded-lg text-sm font-bold uppercase tracking-wider"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Contact Card */}
            <div className="bg-[#1B2B44] rounded-2xl p-8 shadow-2xl text-white">
              <h3 className="font-heading text-xl font-bold mb-8 text-[#C5A059] uppercase tracking-widest border-b border-white/10 pb-4">
                Credentials
              </h3>
              <div className="space-y-8">
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Phone className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Telephone</p>
                    <a href={`tel:${profile.phoneNumber}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors">{profile.phoneNumber || 'Available upon request'}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Mail className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Electronic Correspondence</p>
                    <a href={`mailto:${profile.email}`} className="text-lg font-medium hover:text-[#C5A059] transition-colors break-all leading-snug">{profile.email || 'Professional Inquiry'}</a>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <MapPin className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Office Location</p>
                    <p className="text-lg font-medium leading-tight">{profile.officeAddress || 'Global Chambers'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 group">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#C5A059]/10 transition-colors">
                    <Clock className="w-6 h-6 text-[#C5A059]" />
                  </div>
                  <div>
                    <p className="text-xs text-white/40 uppercase font-bold tracking-tighter mb-1">Consultation Hours</p>
                    <p className="text-lg font-medium">{profile.officeHours || 'By Appointment Only'}</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex gap-4">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#C5A059]/20 rounded-xl transition-all">
                    <Globe className="w-5 h-5 text-[#C5A059]" />
                  </a>
                )}
                {profile.linkedIn && (
                  <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 hover:bg-[#C5A059]/20 rounded-xl transition-all">
                    <Linkedin className="w-5 h-5 text-[#C5A059]" />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1B2B44] border-t border-white/5 py-12">
        <div className="container mx-auto px-6 text-center space-y-6">
          <div className="flex items-center justify-center gap-3">
            <div className="w-8 h-8 bg-[#C5A059] rounded-md flex items-center justify-center font-bold text-white text-sm">W</div>
            <span className="font-heading font-bold text-xl tracking-tighter text-white">Wokil</span>
          </div>
          <p className="text-white/40 text-sm max-w-sm mx-auto font-light">
            Excellence in digital legal representation. Curated for the finest legal minds.
          </p>
          <div className="text-white/20 text-xs tracking-widest font-bold uppercase pt-4">
            © {new Date().getFullYear()} {profile.fullName || 'Lawyer Name'} · All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
