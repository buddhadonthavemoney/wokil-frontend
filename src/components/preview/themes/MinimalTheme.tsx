import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, ArrowUpRight } from 'lucide-react';

interface MinimalThemeProps {
  profile: LawyerProfile;
}

export function MinimalTheme({ profile }: MinimalThemeProps) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navigation */}
      <nav className="border-b border-stone-200">
        <div className="container mx-auto px-6 py-4">
          <span className="font-semibold text-stone-800">
            {profile.fullName || 'Your Name'}
          </span>
        </div>
      </nav>

      {/* Hero */}
      <header className="container mx-auto px-6 py-20 md:py-32">
        <div className="max-w-3xl">
          <p className="text-stone-500 mb-4 tracking-wide uppercase text-sm">
            {profile.professionalTitle || 'Professional Title'}
            {profile.lawFirmName && ` · ${profile.lawFirmName}`}
          </p>
          <h1 className="text-5xl md:text-7xl font-light text-stone-900 mb-8 leading-tight">
            {profile.fullName || 'Your Name'}
          </h1>
          <p className="text-xl text-stone-600 leading-relaxed max-w-2xl">
            {profile.bio || 'Professional bio will appear here...'}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-10">
            <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-full hover:bg-stone-800 transition-colors">
              Get in Touch
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-20">
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-16">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-16">
            {/* Practice Areas */}
            {profile.areasOfPractice.length > 0 && (
              <section>
                <h2 className="text-sm uppercase tracking-wide text-stone-500 mb-6">
                  Practice Areas
                </h2>
                <div className="space-y-0">
                  {profile.areasOfPractice.map((area, index) => (
                    <div
                      key={area}
                      className="py-4 border-b border-stone-200 flex justify-between items-center group"
                    >
                      <span className="text-lg text-stone-800">{area}</span>
                      <span className="text-stone-400 text-sm">0{index + 1}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Jurisdictions */}
            {profile.jurisdictions && profile.jurisdictions.length > 0 && (
              <section>
                <h2 className="text-sm uppercase tracking-wide text-stone-500 mb-6">
                  Jurisdictions Served
                </h2>
                <div className="flex flex-wrap gap-3">
                  {profile.jurisdictions.map((jurisdiction) => (
                    <span
                      key={jurisdiction}
                      className="px-4 py-2 border border-stone-300 rounded-full text-stone-700"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            <section>
              <h2 className="text-sm uppercase tracking-wide text-stone-500 mb-6">
                Experience
              </h2>
              <p className="text-4xl font-light text-stone-800">
                {profile.yearsOfExperience}+ Years
              </p>
              <p className="text-stone-500 mt-2">of dedicated legal practice</p>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="space-y-8">
            {/* Photo */}
            {profile.profilePhoto && (
              <img
                src={profile.profilePhoto}
                alt={profile.fullName}
                className="w-full aspect-[4/5] object-cover rounded-sm grayscale hover:grayscale-0 transition-all duration-500"
              />
            )}

            {/* Contact */}
            <div className="space-y-6">
              <h3 className="text-sm uppercase tracking-wide text-stone-500">
                Contact
              </h3>
              <div className="space-y-4">
                <a href={`tel:${profile.phoneNumber}`} className="flex items-center gap-3 text-stone-700 hover:text-stone-900 transition-colors">
                  <Phone className="w-4 h-4" />
                  <span>{profile.phoneNumber || 'Phone number'}</span>
                </a>
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-stone-700 hover:text-stone-900 transition-colors">
                  <Mail className="w-4 h-4" />
                  <span className="break-all">{profile.email || 'Email address'}</span>
                </a>
                <div className="flex items-start gap-3 text-stone-700">
                  <MapPin className="w-4 h-4 mt-0.5" />
                  <span>{profile.officeAddress || 'Office address'}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-700">
                  <Clock className="w-4 h-4" />
                  <span>{profile.officeHours || 'Office hours'}</span>
                </div>
              </div>
            </div>

            {/* Links */}
            {(profile.website || profile.linkedIn) && (
              <div className="space-y-4">
                <h3 className="text-sm uppercase tracking-wide text-stone-500">
                  Links
                </h3>
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors">
                    <Globe className="w-4 h-4" />
                    <span>Website</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
                {profile.linkedIn && (
                  <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-stone-700 hover:text-stone-900 transition-colors">
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8">
        <div className="container mx-auto px-6 text-stone-500 text-sm">
          <p>© {new Date().getFullYear()} {profile.fullName || 'Lawyer Name'}</p>
        </div>
      </footer>
    </div>
  );
}
