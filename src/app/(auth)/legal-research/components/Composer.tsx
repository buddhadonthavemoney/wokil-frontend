'use client';

import { Send, Square, Zap, Telescope } from 'lucide-react';

import type { LegalResearchScope } from '@/generated/wokil-api';
import { Button } from '@/components/ui/button';

import { ScopePicker } from './ScopePicker';

export type ChatMode = 'ask' | 'research';

const modes = [
  { value: 'ask' as const, icon: Zap, label: 'Ask', title: 'Fast and focused' },
  { value: 'research' as const, icon: Telescope, label: 'Research', title: 'Searches far more of the corpus — materially slower' },
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
  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || streaming) return;
    onSubmit(trimmed);
  };

  return (
    <div className="px-5 py-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        {/* Mode is a two-state toggle rather than a dropdown: there are two
            options and the slow one needs its cost stated, not hidden. */}
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
      </div>

      <form
        className="flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={streaming}
          rows={1}
          placeholder="Ask a question about the corpus…"
          className="flex-1 resize-none field-sizing-content px-4 py-3 rounded-xl border border-border bg-card shadow-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-shadow focus:border-accent focus:ring-1 focus:ring-accent text-sm max-h-40"
        />
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
