import { Phone, Mail, MapPin, Clock } from 'lucide-react';

interface ContactGridProps {
  phoneNumber?: string;
  email?: string;
  officeAddress?: string;
  officeHours?: string;
}

export function ContactGrid({ phoneNumber, email, officeAddress, officeHours }: ContactGridProps) {
  return (
    <section className="grid @md:grid-cols-2 @lg:grid-cols-4 gap-6 mb-24 anim-in fade-in slide-in-from-bottom duration-700 delay-700">
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
  );
}
