'use client';

import ReactMarkdown from 'react-markdown';
import { AlertTriangle, FileText, Gavel, Loader2, Search } from 'lucide-react';

import type { LegalResearchFile, LegalResearchSource } from '@/generated/wokil-api';

import type { DocumentTarget } from './DocumentPanel';

export type Turn = {
  question: string;
  answer: string;
  /** Deduplicated per-document view — one card each, best passage first. */
  sources: LegalResearchFile[];
  /** The individual passages, when this turn was streamed. Persisted turns
   *  keep only the per-document snapshot, so this is empty for them. */
  passages?: LegalResearchSource[];
  fromGeneralKnowledge: boolean;
  citationWarning?: boolean;
  lowConfidence?: boolean;
  suggestions?: string[];
  createdAt?: string;
};

// RAG marks a repealed act by its category, not by a flag on the file — the
// display string it builds carries a "⚠ REPEALED — " prefix that must never
// be string-matched, since reworded prose would silently break the badge.
function isRepealed(file: LegalResearchFile): boolean {
  return file.category?.startsWith('repealed-') ?? false;
}

function SourceCard({
  file,
  passages,
  onOpen,
}: {
  file: LegalResearchFile;
  passages: LegalResearchSource[];
  onOpen: (target: DocumentTarget) => void;
}) {
  const repealed = isRepealed(file);
  return (
    <button
      type="button"
      onClick={() => onOpen({ documentId: file.document_id, chunkId: passages[0]?.chunk_id })}
      className="w-full text-left p-4 rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md hover:border-accent"
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-medium text-foreground">{file.document_title}</h4>
        <span className="shrink-0 label-caps text-[10px] px-2 py-0.5 rounded-md bg-accent/10 border border-accent/30 text-accent-foreground">
          {Math.round(file.score * 100)}%
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
        {(file.collection || file.category) && (
          <p className="text-xs text-muted-foreground">
            {[file.collection, file.category].filter(Boolean).join(' · ')}
          </p>
        )}
        {repealed && (
          <span className="label-caps text-[10px] px-2 py-0.5 rounded-md bg-destructive/10 border border-destructive/30 text-destructive">
            Repealed
          </span>
        )}
        {passages.length > 0 && (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
            <FileText className="w-3 h-3" />
            {passages.length} passage{passages.length === 1 ? '' : 's'}
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * What the answer's own guards found. citation_warning is a detector, not a
 * corrector — RAG leaves the answer untouched, so the notice says verify,
 * never "this is wrong".
 */
function AnswerWarnings({
  turn,
  onAsk,
}: {
  turn: Turn;
  onAsk: (question: string) => void;
}) {
  return (
    <>
      {turn.fromGeneralKnowledge && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-accent/40 bg-accent/10">
          <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">
              Answered from general knowledge — not the corpus
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Nothing in the Najir decisions or Nepal Law Commission acts matched
              this query. Verify this answer before relying on it.
            </p>
          </div>
        </div>
      )}
      {turn.citationWarning && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/40 bg-destructive/10">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-foreground">Verify these citations</p>
            <p className="text-xs text-muted-foreground mt-1">
              At least one citation in this answer could not be matched to a
              retrieved passage. Open the sources below and confirm each one
              before relying on it.
            </p>
          </div>
        </div>
      )}
      {turn.lowConfidence && !turn.citationWarning && (
        <p className="text-xs text-muted-foreground border-l-2 border-border pl-3">
          Retrieval was weak for this question — the passages behind this answer
          scored below the usual confidence floor.
        </p>
      )}
      {(turn.suggestions?.length ?? 0) > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Search className="w-3 h-3" /> Did you mean
          </span>
          {turn.suggestions?.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onAsk(suggestion)}
              className="px-3 py-1 rounded-full border border-border bg-card text-xs text-foreground transition-colors hover:border-accent hover:bg-surface-low"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </>
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

function AssistantMessage({
  turn,
  onOpenDocument,
  onAsk,
}: {
  turn: Turn;
  onOpenDocument: (target: DocumentTarget) => void;
  onAsk: (question: string) => void;
}) {
  // Passages grouped under the document they came from: a decision cited
  // three times is one card, not three.
  const passagesByDocument = new Map<number, LegalResearchSource[]>();
  for (const passage of turn.passages ?? []) {
    const list = passagesByDocument.get(passage.document_id) ?? [];
    list.push(passage);
    passagesByDocument.set(passage.document_id, list);
  }

  return (
    <div className="flex items-start gap-3">
      <AssistantAvatar />
      <div className="flex-1 min-w-0 space-y-3">
        <AnswerWarnings turn={turn} onAsk={onAsk} />
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
                <SourceCard
                  key={file.document_id}
                  file={file}
                  passages={passagesByDocument.get(file.document_id) ?? []}
                  onOpen={onOpenDocument}
                />
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
  onOpenDocument: (target: DocumentTarget) => void;
  onAsk: (question: string) => void;
}

export function MessageList({
  turns,
  streamingQuestion,
  streamingAnswer,
  onOpenDocument,
  onAsk,
}: MessageListProps) {
  return (
    <>
      {turns.map((turn, i) => (
        <div key={`${turn.createdAt ?? ''}-${i}`} className="space-y-4">
          <UserMessage question={turn.question} />
          <AssistantMessage turn={turn} onOpenDocument={onOpenDocument} onAsk={onAsk} />
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
