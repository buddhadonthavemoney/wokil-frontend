'use client';

import { useNepaliIME } from '../lib/useNepaliIME';

interface NepaliSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NepaliSearchInput({ value, onChange, placeholder, className }: NepaliSearchInputProps) {
  const ime = useNepaliIME(value, onChange);

  return (
    <div className="relative flex-1">
      <input
        type="text"
        value={value}
        onChange={ime.onChange as any}
        onKeyDown={ime.onKeyDown as any}
        placeholder={ime.enabled ? 'नेपालीमा खोज्नुहोस्…' : placeholder}
        className={className}
      />
      <button
        type="button"
        onClick={ime.toggle}
        className={`absolute right-1 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded text-[10px] font-bold transition-colors ${
          ime.enabled
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-surface-low'
        }`}
        title={ime.enabled ? 'Switch to English' : 'Switch to Nepali'}
      >
        ने
      </button>

      {ime.suggestions.length > 0 && ime.composing && (
        <div className="absolute top-full left-0 mt-1 rounded-lg border border-border bg-popover shadow-lg z-30 min-w-[200px] max-w-[320px] overflow-hidden">
          {ime.suggestions.map((s, i) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); ime.select(i); }}
              className={`w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors ${
                i === ime.activeIndex
                  ? 'bg-accent/10 text-foreground'
                  : 'text-foreground hover:bg-surface-low'
              }`}
            >
              <span className="text-muted-foreground text-xs w-4 text-right shrink-0">{i + 1}</span>
              <span>{s}</span>
            </button>
          ))}
          <div className="px-3 py-1 text-[10px] text-muted-foreground border-t border-border bg-surface-low">
            {ime.composing} · ↑↓ navigate · 1-9 select · Space commit
          </div>
        </div>
      )}
    </div>
  );
}
