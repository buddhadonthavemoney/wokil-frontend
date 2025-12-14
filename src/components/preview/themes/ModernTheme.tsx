import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, User } from 'lucide-react';

interface ModernThemeProps {
  profile: LawyerProfile;
}

export function ModernTheme({ profile }: ModernThemeProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
        <div className="container mx-auto px-6 py-20 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm font-medium mb-6">
                {profile.professionalTitle || 'Professional Title'}
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                {profile.fullName || 'Your Name'}
              </h1>
              {profile.lawFirmName && (
                <p className="text-slate-400 text-xl mb-4">{profile.lawFirmName}</p>
              )}
              <p className="text-slate-500">
                {profile.yearsOfExperience}+ Years of Legal Excellence
              </p>
              
              <div className="flex gap-4 mt-8">
                <a href={`tel:${profile.phoneNumber}`} className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors">
                  Contact Me
                </a>
                <a href={`mailto:${profile.email}`} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-colors">
                  Send Email
                </a>
              </div>
            </div>
            
            <div className="flex justify-center">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.fullName}
                  className="w-64 h-64 md:w-80 md:h-80 rounded-2xl object-cover border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20"
                />
              ) : (
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-slate-800 flex items-center justify-center border-2 border-blue-500/30">
                  <User className="w-24 h-24 text-slate-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16">
        {/* About Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
            <span className="w-12 h-1 bg-blue-500 rounded" />
            About Me
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-3xl">
            {profile.bio || 'Professional bio will appear here...'}
          </p>
        </section>

        {/* Practice Areas */}
        {profile.areasOfPractice.length > 0 && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <span className="w-12 h-1 bg-blue-500 rounded" />
              Practice Areas
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.areasOfPractice.map((area) => (
                <div
                  key={area}
                  className="p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-blue-500/50 transition-colors"
                >
                  <span className="text-slate-300 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Grid */}
        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
            <Phone className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-slate-400 text-sm mb-1">Phone</h3>
            <p className="text-white font-medium">{profile.phoneNumber || 'Phone number'}</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
            <Mail className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-slate-400 text-sm mb-1">Email</h3>
            <p className="text-white font-medium break-all">{profile.email || 'Email address'}</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
            <MapPin className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-slate-400 text-sm mb-1">Office</h3>
            <p className="text-white font-medium">{profile.officeAddress || 'Office address'}</p>
          </div>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl">
            <Clock className="w-8 h-8 text-blue-500 mb-4" />
            <h3 className="text-slate-400 text-sm mb-1">Hours</h3>
            <p className="text-white font-medium">{profile.officeHours || 'Office hours'}</p>
          </div>
        </section>

        {/* Online Links */}
        {(profile.website || profile.linkedIn) && (
          <section className="mt-8 flex gap-4">
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-colors">
                <Globe className="w-5 h-5 text-blue-500" />
                <span>Website</span>
              </a>
            )}
            {profile.linkedIn && (
              <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:border-blue-500/50 transition-colors">
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
          <p>© {new Date().getFullYear()} {profile.fullName || 'Lawyer Name'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
