'use client';

import ReactMarkdown from 'react-markdown';
import { AlertTriangle, Gavel, Loader2 } from 'lucide-react';

import type { LegalResearchFile } from '@/generated/wokil-api';

export type Turn = {
  question: string;
  answer: string;
  sources: LegalResearchFile[];
  fromGeneralKnowledge: boolean;
  createdAt?: string;
};

// Unchanged from the pre-streaming page: citation rendering is its own story,
// and touching it here would collide with that work.
function SourceCard({ file }: { file: LegalResearchFile }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-medium text-foreground">{file.document_title}</h4>
        <span className="shrink-0 label-caps text-[10px] px-2 py-0.5 rounded-md bg-accent/10 border border-accent/30 text-accent-foreground">
          {Math.round(file.score * 100)}%
        </span>
      </div>
      {(file.collection || file.category) && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {[file.collection, file.category].filter(Boolean).join(' · ')}
        </p>
      )}
    </div>
  );
}

function AssistantAvatar() {
  // Gold marks the assistant, navy the user — same pairing as the sidebar's
  // active marker, so the two speakers read apart at a glance.
  return (
    <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
      <Gavel className="w-4 h-4" />
    </div>
  );
}

function AssistantMessage({ turn }: { turn: Turn }) {
  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div className="flex-1 min-w-0 space-y-3">
        {turn.fromGeneralKnowledge && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-accent/40 bg-accent/10">
            <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-foreground">
                Answered from general knowledge — not the corpus
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Nothing in the Najir decisions or Nepal Law Commission acts
                matched this query. Verify this answer before relying on it.
              </p>
            </div>
          </div>
        )}
        <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:bg-secondary prose-pre:text-foreground prose-headings:font-heading prose-a:text-accent">
          <ReactMarkdown>{turn.answer}</ReactMarkdown>
        </div>
        {turn.sources.length > 0 && (
          <div>
            <p className="text-xs label-caps text-muted-foreground mb-2">
              Sources ({turn.sources.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {turn.sources.map((file) => (
                <SourceCard key={file.document_id} file={file} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ question }: { question: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] md:max-w-[70%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-primary text-primary-foreground text-sm leading-relaxed whitespace-pre-wrap">
        {question}
      </div>
    </div>
  );
}

/**
 * The answer as it arrives. Before the first token there is nothing to render
 * but the wait — research mode spends 15-70s retrieving before the model says
 * anything, so the placeholder has to survive a long silence.
 */
function StreamingAnswer({ answer }: { answer: string }) {
  if (!answer) {
    return (
      <div className="flex items-start gap-3">
        <AssistantAvatar />
        <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Searching the corpus and synthesizing…</span>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div className="flex-1 min-w-0">
        <div className="prose prose-sm max-w-none prose-p:my-2 prose-pre:bg-secondary prose-pre:text-foreground prose-headings:font-heading prose-a:text-accent">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
        <span className="inline-block w-1.5 h-4 align-text-bottom bg-accent animate-pulse" />
      </div>
    </div>
  );
}

interface MessageListProps {
  turns: Turn[];
  /** The question being answered right now, rendered after the settled turns. */
  streamingQuestion: string | null;
  streamingAnswer: string;
}

export function MessageList({ turns, streamingQuestion, streamingAnswer }: MessageListProps) {
  return (
    <>
      {turns.map((turn, i) => (
        <div key={`${turn.createdAt ?? ''}-${i}`} className="space-y-4">
          <UserMessage question={turn.question} />
          <AssistantMessage turn={turn} />
        </div>
      ))}
      {streamingQuestion != null && (
        <div className="space-y-4">
          <UserMessage question={streamingQuestion} />
          <StreamingAnswer answer={streamingAnswer} />
        </div>
      )}
    </>
  );
}
