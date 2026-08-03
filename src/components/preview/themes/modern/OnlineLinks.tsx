import { Globe, Linkedin } from 'lucide-react';

interface OnlineLinksProps {
  website?: string;
  linkedIn?: string;
}

export function OnlineLinks({ website, linkedIn }: OnlineLinksProps) {
  if (!website && !linkedIn) return null;

  return (
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
  );
}
