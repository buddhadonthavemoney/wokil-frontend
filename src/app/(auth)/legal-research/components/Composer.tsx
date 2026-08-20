'use client';

import { useRef } from 'react';
import { Send, Square, Zap, Telescope } from 'lucide-react';

import type { LegalResearchScope } from '@/generated/wokil-api';

import { ScopePicker } from './ScopePicker';

export type ChatMode = 'ask' | 'research';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed || streaming) return;
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    onSubmit(trimmed);
  };

  return (
    <div className="px-5 py-4 border-t border-border">
      <div className="flex items-center gap-2 mb-3">
        {/* Mode is a two-state toggle rather than a dropdown: there are two
            options and the slow one needs its cost stated, not hidden. */}
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => onModeChange('ask')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
              mode === 'ask'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-surface-low'
            }`}
            title="Fast and focused"
          >
            <Zap className="w-3.5 h-3.5" /> Ask
          </button>
          <button
            type="button"
            onClick={() => onModeChange('research')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
              mode === 'research'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card text-muted-foreground hover:bg-surface-low'
            }`}
            title="Searches far more of the corpus — materially slower"
          >
            <Telescope className="w-3.5 h-3.5" /> Research
          </button>
        </div>

        <ScopePicker scope={scope} onChange={onScopeChange} disabled={streaming} />

        {mode === 'research' && (
          <span className="text-[11px] text-muted-foreground">
            Searches ~5× more of the corpus; expect a longer wait.
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
          ref={textareaRef}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={streaming}
          rows={1}
          placeholder="Ask a question about the corpus…"
          className="flex-1 resize-none px-4 py-3 rounded-xl border border-border bg-card shadow-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-shadow focus:border-accent focus:ring-1 focus:ring-accent text-sm max-h-40"
        />
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="shrink-0 w-11 h-11 rounded-xl bg-destructive text-destructive-foreground shadow-sm flex items-center justify-center hover:opacity-90 transition-opacity"
            title="Stop"
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground shadow-navy flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:bg-primary/90 transition-colors"
            title="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        )}
      </form>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Answers cite their sources from the corpus. Always verify legal answers
        before relying on them.
      </p>
    </div>
  );
}
