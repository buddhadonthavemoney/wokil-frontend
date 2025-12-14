import { LawyerProfile } from '@/types/lawyer';
import { Phone, Mail, MapPin, Clock, Globe, Linkedin, Scale } from 'lucide-react';

interface ClassicThemeProps {
  profile: LawyerProfile;
}

export function ClassicTheme({ profile }: ClassicThemeProps) {
  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]">
      {/* Hero Section */}
      <header className="bg-gradient-to-br from-[hsl(215,50%,23%)] to-[hsl(220,55%,18%)] text-white">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {profile.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.fullName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-[hsl(45,70%,50%)] shadow-xl"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-[hsl(215,40%,30%)] flex items-center justify-center border-4 border-[hsl(45,70%,50%)]">
                <Scale className="w-16 h-16 text-[hsl(45,70%,50%)]" />
              </div>
            )}
            
            <div className="text-center md:text-left">
              <h1 className="font-heading text-4xl md:text-5xl font-bold mb-2">
                {profile.fullName || 'Your Name'}
              </h1>
              <p className="text-[hsl(45,70%,60%)] text-xl font-medium mb-2">
                {profile.professionalTitle || 'Professional Title'}
              </p>
              {profile.lawFirmName && (
                <p className="text-white/80">{profile.lawFirmName}</p>
              )}
              <p className="text-white/70 mt-2">
                {profile.yearsOfExperience} Years of Experience
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* About */}
            <section className="bg-white rounded-xl p-8 shadow-card">
              <h2 className="font-heading text-2xl font-semibold text-[hsl(215,50%,23%)] mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-[hsl(45,70%,50%)]" />
                About
              </h2>
              <p className="text-[hsl(215,20%,35%)] leading-relaxed">
                {profile.bio || 'Professional bio will appear here...'}
              </p>
            </section>

            {/* Practice Areas */}
            {profile.areasOfPractice.length > 0 && (
              <section className="bg-white rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-semibold text-[hsl(215,50%,23%)] mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-[hsl(45,70%,50%)]" />
                  Practice Areas
                </h2>
                <div className="flex flex-wrap gap-3">
                  {profile.areasOfPractice.map((area) => (
                    <span
                      key={area}
                      className="px-4 py-2 bg-[hsl(215,50%,23%)] text-white rounded-full text-sm font-medium"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Jurisdictions */}
            {profile.jurisdictions && profile.jurisdictions.length > 0 && (
              <section className="bg-white rounded-xl p-8 shadow-card">
                <h2 className="font-heading text-2xl font-semibold text-[hsl(215,50%,23%)] mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-[hsl(45,70%,50%)]" />
                  Jurisdictions
                </h2>
                <div className="flex flex-wrap gap-3">
                  {profile.jurisdictions.map((jurisdiction) => (
                    <span
                      key={jurisdiction}
                      className="px-4 py-2 bg-[hsl(45,70%,50%)] text-[hsl(215,50%,15%)] rounded-full text-sm font-medium"
                    >
                      {jurisdiction}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl p-6 shadow-card">
              <h3 className="font-heading text-lg font-semibold text-[hsl(215,50%,23%)] mb-4">
                Contact Information
              </h3>
              <div className="space-y-4">
                <a href={`tel:${profile.phoneNumber}`} className="flex items-center gap-3 text-[hsl(215,20%,35%)] hover:text-[hsl(215,50%,23%)] transition-colors">
                  <Phone className="w-5 h-5 text-[hsl(45,70%,50%)]" />
                  <span>{profile.phoneNumber || 'Phone number'}</span>
                </a>
                <a href={`mailto:${profile.email}`} className="flex items-center gap-3 text-[hsl(215,20%,35%)] hover:text-[hsl(215,50%,23%)] transition-colors">
                  <Mail className="w-5 h-5 text-[hsl(45,70%,50%)]" />
                  <span>{profile.email || 'Email address'}</span>
                </a>
                <div className="flex items-start gap-3 text-[hsl(215,20%,35%)]">
                  <MapPin className="w-5 h-5 text-[hsl(45,70%,50%)] mt-0.5" />
                  <span>{profile.officeAddress || 'Office address'}</span>
                </div>
                <div className="flex items-center gap-3 text-[hsl(215,20%,35%)]">
                  <Clock className="w-5 h-5 text-[hsl(45,70%,50%)]" />
                  <span>{profile.officeHours || 'Office hours'}</span>
                </div>
              </div>
            </div>

            {/* Online Presence */}
            {(profile.website || profile.linkedIn) && (
              <div className="bg-white rounded-xl p-6 shadow-card">
                <h3 className="font-heading text-lg font-semibold text-[hsl(215,50%,23%)] mb-4">
                  Online Presence
                </h3>
                <div className="space-y-3">
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[hsl(215,20%,35%)] hover:text-[hsl(215,50%,23%)] transition-colors">
                      <Globe className="w-5 h-5 text-[hsl(45,70%,50%)]" />
                      <span>Website</span>
                    </a>
                  )}
                  {profile.linkedIn && (
                    <a href={profile.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-[hsl(215,20%,35%)] hover:text-[hsl(215,50%,23%)] transition-colors">
                      <Linkedin className="w-5 h-5 text-[hsl(45,70%,50%)]" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[hsl(215,50%,23%)] text-white/80 py-6 mt-12">
        <div className="container mx-auto px-6 text-center text-sm">
          <p>© {new Date().getFullYear()} {profile.fullName || 'Lawyer Name'}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
