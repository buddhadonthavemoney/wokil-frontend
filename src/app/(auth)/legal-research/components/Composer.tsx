'use client';

import { Send, Square, Zap, Telescope, Search } from 'lucide-react';

import type { LegalResearchScope } from '@/generated/wokil-api';
import { Button } from '@/components/ui/button';

import { useNepaliIME } from '../lib/useNepaliIME';
import { ScopePicker } from './ScopePicker';

export type ChatMode = 'ask' | 'research' | 'search';

const modes = [
  { value: 'ask' as const, icon: Zap, label: 'Ask', title: 'Fast and focused' },
  { value: 'research' as const, icon: Telescope, label: 'Research', title: 'Searches far more of the corpus — materially slower' },
  { value: 'search' as const, icon: Search, label: 'Search', title: 'Raw passage retrieval — no LLM answer' },
] as const;

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (question: string) => void;
  streaming: boolean;
  onStop: () => void;
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  scope: LegalResearchScope;
  onScopeChange: (scope: LegalResearchScope) => void;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  streaming,
  onStop,
  mode,
  onModeChange,
  scope,
  onScopeChange,
}: ComposerProps) {
  const ime = useNepaliIME(value, onChange);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || streaming) return;
    onSubmit(trimmed);
  };

  return (
    <div className="px-5 py-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex rounded-lg border border-border overflow-hidden">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              disabled={streaming}
              onClick={() => onModeChange(m.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors disabled:opacity-50 ${
                mode === m.value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-muted-foreground hover:bg-surface-low'
              }`}
              title={m.title}
            >
              <m.icon className="w-3.5 h-3.5" /> {m.label}
            </button>
          ))}
        </div>

        <ScopePicker scope={scope} onChange={onScopeChange} disabled={streaming} />

        {mode === 'research' && (
          <span className="text-[11px] text-muted-foreground">
            Searches ~5x more of the corpus; expect a longer wait.
          </span>
        )}
        {mode === 'search' && (
          <span className="text-[11px] text-muted-foreground">
            Returns ranked passages only — no AI-generated answer.
          </span>
        )}
      </div>

      <form
        className="flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="flex-1 relative">
          <textarea
            value={value}
            onChange={ime.onChange}
            onKeyDown={(e) => {
              ime.onKeyDown(e);
              if (e.defaultPrevented) return;
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            disabled={streaming}
            rows={1}
            placeholder={ime.enabled ? 'नेपालीमा टाइप गर्नुहोस्…' : 'Ask a question about the corpus…'}
            className="w-full resize-none field-sizing-content pl-4 pr-12 py-3 rounded-xl border border-border bg-card shadow-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-shadow focus:border-accent focus:ring-1 focus:ring-accent text-sm max-h-40"
          />
          <button
            type="button"
            onClick={ime.toggle}
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded text-xs font-bold transition-colors ${
              ime.enabled
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-low'
            }`}
            title={ime.enabled ? 'Switch to English' : 'Switch to Nepali (phonetic)'}
          >
            ने
          </button>

          {ime.suggestions.length > 0 && ime.composing && (
            <div className="absolute bottom-full left-0 mb-1 rounded-lg border border-border bg-popover shadow-lg z-30 min-w-[200px] max-w-[320px] overflow-hidden">
              {ime.suggestions.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    ime.select(i);
                  }}
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
        {streaming ? (
          <Button variant="destructive" size="icon" onClick={onStop} title="Stop" className="shrink-0 w-11 h-11">
            <Square className="w-4 h-4" />
          </Button>
        ) : (
          <Button type="submit" size="icon" disabled={!value.trim()} title="Send" className="shrink-0 w-11 h-11">
            <Send className="w-4 h-4" />
          </Button>
        )}
      </form>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Answers cite their sources from the corpus. Always verify legal answers
        before relying on them.
      </p>
    </div>
  );
}
