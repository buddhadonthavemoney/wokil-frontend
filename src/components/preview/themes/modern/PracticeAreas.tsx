interface PracticeAreasProps {
  areas: string[];
}

export function PracticeAreas({ areas }: PracticeAreasProps) {
  if (areas.length === 0) return null;

  return (
    <section className="mb-24 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
      <h2 className="text-4xl font-bold mb-10 font-heading flex items-center gap-4">
        <span className="w-12 h-1 bg-blue-600 rounded-full" />
        Strategic Focus
      </h2>
      <div className="grid grid-cols-1 @md:grid-cols-2 @lg:grid-cols-4 gap-6">
        {areas.map((area, idx) => (
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
  );
}
