interface AboutProps {
  bio?: string;
}

export function About({ bio }: AboutProps) {
  return (
    <section className="mb-24 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
      <h2 className="text-4xl font-bold mb-8 font-heading flex items-center gap-4">
        <span className="w-12 h-1 bg-blue-600 rounded-full" />
        Professional Background
      </h2>
      <p className="text-slate-400 text-xl leading-relaxed max-w-4xl font-light">
        {bio || 'Professional bio will appear here...'}
      </p>
    </section>
  );
}
