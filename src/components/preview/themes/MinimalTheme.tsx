import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, ArrowUpRight, User } from 'lucide-react';

interface MinimalThemeProps {
  profile: LawyerProfile;
}

export function MinimalTheme({ profile }: MinimalThemeProps) {
  return (
    <div className="min-h-screen bg-[#F9F8F6] font-body text-[#2D2A26] selection:bg-[#E5E1DA]">
      {/* Navigation */}
      <nav className="border-b border-[#E5E1DA] sticky top-0 bg-[#F9F8F6]/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-6 py-5 flex justify-between items-center">
          <span className="font-heading font-bold text-xl tracking-tight text-[#2D2A26]">
            {profile.fullName || 'Professional Presence'}
          </span>
          <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-[#8C857D]">
            <span>Profile</span>
            <span>Expertise</span>
            <span>Contact</span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="container mx-auto px-6 py-24 md:py-40">
        <div className="max-w-4xl">
          <div className="flex items-center gap-4 mb-8">
            <span className="w-8 h-px bg-[#8C857D]" />
            <p className="text-[#8C857D] tracking-[0.2em] uppercase text-xs font-bold">
              {profile.professionalTitle || 'Legal Counsel'}
              {profile.lawFirmName && ` · ${profile.lawFirmName}`}
            </p>
          </div>
          <h1 className="text-6xl md:text-9xl font-heading font-light text-[#1A1816] mb-12 leading-[0.9] tracking-tighter">
            {profile.fullName || 'Your Name'}
          </h1>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <p className="text-2xl text-[#5C564E] leading-relaxed font-light italic">
              {profile.bio || 'Architecting legal solutions with precision and integrity.'}
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-3 px-10 py-5 bg-[#1A1816] text-[#F9F8F6] rounded-full hover:bg-[#2D2A26] transition-all hover:scale-105 active:scale-95 font-bold text-sm tracking-widest uppercase shadow-xl shadow-[#1A1816]/10">
                Initiate Contact
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-32">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-12 gap-24">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-24">
            {/* Practice Areas */}
            {profile.areasOfPractice.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-[#8C857D] mb-10 border-b border-[#E5E1DA] pb-4">
                  Practice Specializations
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                  {profile.areasOfPractice.map((area, index) => (
                    <div
                      key={area}
                      className="py-8 border-b border-[#E5E1DA] flex justify-between items-center group cursor-default"
                    >
                      <span className="text-2xl text-[#2D2A26] font-heading font-medium tracking-tight group-hover:translate-x-2 transition-transform duration-500">{area}</span>
                      <span className="text-[#8C857D] text-[10px] font-bold tracking-widest">/ 0{index + 1}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Jurisdictions */}
            {profile.jurisdictions && profile.jurisdictions.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-[#8C857D] mb-10 border-b border-[#E5E1DA] pb-4">
                  Jurisdictions
                </h2>
                <div className="flex flex-wrap gap-4">
                  {profile.jurisdictions.map((jurisdiction) => (
                    <span
                      key={jurisdiction}
                      className="px-6 py-3 bg-[#EEEBE4] text-[#2D2A26] rounded-full text-sm font-bold tracking-wide border border-[#DFDAD0]"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            <section className="bg-[#1A1816] text-[#F9F8F6] p-16 rounded-[3rem] overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#F9F8F6]/5 rounded-full blur-3xl -mr-32 -mt-32" />
              <h2 className="text-xs uppercase tracking-[0.3em] font-bold text-[#F9F8F6]/40 mb-12">
                Proven Legacy
              </h2>
              <div className="flex items-baseline gap-4">
                <span className="text-9xl font-heading font-light tracking-tighter leading-none">
                  {profile.yearsOfExperience}
                </span>
                <div className="space-y-1">
                  <p className="text-4xl font-heading font-medium tracking-tight">Years</p>
                  <p className="text-[#F9F8F6]/60 text-sm tracking-wide uppercase font-bold italic">Professional Practice</p>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-16">
            {/* Photo */}
            <div className="relative group overflow-hidden rounded-[2rem]">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.fullName}
                  className="w-full aspect-[4/5] object-cover scale-102 group-hover:scale-110 transition-transform duration-1000 grayscale hover:grayscale-0"
                />
              ) : (
                <div className="w-full aspect-[4/5] bg-[#E5E1DA] flex items-center justify-center">
                  <User className="w-20 h-20 text-[#8C857D]" />
                </div>
              )}
              <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem]" />
            </div>

            {/* Contact */}
            <div className="space-y-10 bg-[#F2EDE4] p-10 rounded-[2.5rem] border border-[#E5E1DA]">
              <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-[#8C857D] border-b border-[#E5E1DA] pb-4">
                Communication
              </h3>
              <div className="space-y-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-[#8C857D] font-bold uppercase tracking-widest">Telephone</p>
                  <a href={`tel:${profile.phoneNumber}`} className="text-lg font-medium text-[#1A1816] hover:text-stone-500 transition-colors block leading-tight">
                    {profile.phoneNumber || 'Available on request'}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#8C857D] font-bold uppercase tracking-widest">Email</p>
                  <a href={`mailto:${profile.email}`} className="text-lg font-medium text-[#1A1816] hover:text-stone-500 transition-colors block break-all leading-tight">
                    {profile.email || 'Professional inquiry'}
                  </a>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#8C857D] font-bold uppercase tracking-widest">Office</p>
                  <p className="text-lg font-medium text-[#1A1816] leading-snug">{profile.officeAddress || 'Global Chambers'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#8C857D] font-bold uppercase tracking-widest">Availability</p>
                  <p className="text-lg font-medium text-[#1A1816] leading-tight">{profile.officeHours || 'By Appointment'}</p>
                </div>
              </div>
            </div>

            {/* Links */}
            {(profile.website || profile.linkedIn) && (
              <div className="flex gap-4">
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1A1816] text-[#F9F8F6] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Globe className="w-6 h-6" />
                  </a>
                )}
                {profile.linkedIn && (
                  <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1A1816] text-[#F9F8F6] rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                    <Linkedin className="w-6 h-6" />
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E1DA] py-16 bg-[#F2EDE4]">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1A1816] rounded-xl flex items-center justify-center text-[#F9F8F6] font-bold text-xl">W</div>
            <span className="font-heading font-bold text-2xl tracking-tighter text-[#1A1816]">Wokil</span>
          </div>
          <div className="text-[#8C857D] text-xs font-bold uppercase tracking-[0.2em] text-center md:text-right">
            <p>© {new Date().getFullYear()} {profile.fullName || 'Lawyer Name'}</p>
            <p className="mt-1 opacity-50">Crafted for Legal Excellence</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
