import { Phone, Mail, User } from 'lucide-react';

interface HeroProps {
  fullName: string;
  professionalTitle: string;
  lawFirmName?: string;
  yearsOfExperience: number;
  phoneNumber?: string;
  email?: string;
  profilePhoto?: string;
}

export function Hero({
  fullName,
  professionalTitle,
  lawFirmName,
  yearsOfExperience,
  phoneNumber,
  email,
  profilePhoto,
}: HeroProps) {
  return (
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
  );
}
