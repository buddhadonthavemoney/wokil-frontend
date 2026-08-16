'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import {
  Gavel,
  History,
  Send,
  SquarePen,
  AlertTriangle,
  Loader2,
  Scale,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  chatLegalResearch,
  listLegalResearchConversations,
  listLegalResearchConversationMessages,
  type LegalResearchChatResponse,
  type LegalResearchConversation,
  type LegalResearchFile,
  type LegalResearchMessage,
} from '@/generated/wokil-api';
import { PageHeader } from '@/components/layout/PageHeader';

const suggestedChips = ['Fundamental Rights (Part 3)', 'Muluki Civil Code 2074', 'Cyber Crime Precedents'];

type Turn = {
  question: string;
  answer: string;
  sources: LegalResearchFile[];
  fromGeneralKnowledge: boolean;
  createdAt?: string;
};

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

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

function AssistantMessage({ turn }: { turn: Turn }) {
  return (
    <div className="flex items-start gap-3">
      {/* Gold marks the assistant, navy the user — same pairing as the
          sidebar's active marker, so the two speakers read apart at a glance. */}
      <div className="w-8 h-8 rounded-lg bg-accent text-accent-foreground flex items-center justify-center shrink-0">
        <Gavel className="w-4 h-4" />
      </div>
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

export default function LegalResearchPage() {
  const [query, setQuery] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const queryClient = useQueryClient();

  const conversationsQuery = useQuery({
    queryKey: ['legal-research', 'conversations'],
    queryFn: async (): Promise<LegalResearchConversation[]> => {
      const { data, error } = await listLegalResearchConversations();
      if (error !== undefined) {
        throw new Error(
          typeof error === 'string' ? error : 'Failed to load recent research.',
        );
      }
      return (data ?? []) as LegalResearchConversation[];
    },
  });

  const messagesQuery = useQuery({
    queryKey: ['legal-research', 'messages', activeConversationId],
    queryFn: async (): Promise<LegalResearchMessage[]> => {
      if (activeConversationId == null) return [];
      const { data, error } = await listLegalResearchConversationMessages({
        path: { conversation_id: activeConversationId },
      });
      if (error !== undefined) {
        throw new Error(
          typeof error === 'string' ? error : 'Failed to load the conversation.',
        );
      }
      return (data ?? []) as LegalResearchMessage[];
    },
    enabled: activeConversationId != null,
  });

  const transcript: Turn[] = useMemo(
    () =>
      (messagesQuery.data ?? []).map((m) => ({
        question: m.question,
        answer: m.answer,
        sources: m.sources ?? [],
        fromGeneralKnowledge: m.from_general_knowledge,
        createdAt: m.created_at,
      })),
    [messagesQuery.data],
  );

  const allTurns: Turn[] = useMemo(
    () => [
      ...transcript,
      ...(pendingQuestion != null
        ? [
            {
              question: pendingQuestion,
              answer: '',
              sources: [] as LegalResearchFile[],
              fromGeneralKnowledge: false,
            },
          ]
        : []),
    ],
    [transcript, pendingQuestion],
  );

  const researchMutation = useMutation({
    mutationFn: async (question: string): Promise<LegalResearchChatResponse> => {
      // Chat queries routinely take 5–10s (retrieval + synthesis); give the
      // UI a hard deadline so a hung server can't leave the button spinning
      // forever. The SDK's fetch client can't abort mid-flight, so this
      // races the request rather than cancelling it.
      const timedOut = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('timed-out')), 120_000);
      });
      const { data, error } = await Promise.race([
        chatLegalResearch({
          body: {
            question,
            conversation_id: activeConversationId ?? undefined,
          },
        }),
        timedOut,
      ]);
      if (error !== undefined) {
        throw new Error(
          typeof error === 'string' ? error : 'Failed to run the research query.',
        );
      }
      return data as LegalResearchChatResponse;
    },
    onMutate: (question) => {
      setPendingQuestion(question);
    },
    onSuccess: (data) => {
      const confirmed: LegalResearchMessage = {
        id: 0,
        turn_index: 0,
        question: researchMutation.variables as string,
        answer: data.answer,
        sources: (data.files ?? []) as LegalResearchFile[],
        from_general_knowledge: data.from_general_knowledge,
        created_at: new Date().toISOString(),
      };
      const conversationId = data.conversation_id ?? activeConversationId;
      if (conversationId != null) {
        queryClient.setQueryData<LegalResearchMessage[]>(
          ['legal-research', 'messages', conversationId],
          (old) => [...(old ?? []), confirmed],
        );
        if (activeConversationId !== conversationId) {
          setActiveConversationId(conversationId);
        }
      }
      setPendingQuestion(null);
      void conversationsQuery.refetch();
    },
    onError: (error: Error) => {
      setPendingQuestion(null);
      toast.error(
        error?.message === 'timed-out'
          ? 'Request timed out. Try a shorter or more specific question.'
          : error?.message || 'Failed to run the research query.',
      );
    },
  });

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [allTurns, researchMutation.isPending]);

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || researchMutation.isPending) return;
    setQuery('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    researchMutation.mutate(trimmed);
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setPendingQuestion(null);
    setQuery('');
  };

  const openConversation = (conversation: LegalResearchConversation) => {
    if (activeConversationId === conversation.id) return;
    setActiveConversationId(conversation.id);
    setPendingQuestion(null);
    setQuery('');
  };

  const activeTitle =
    conversationsQuery.data?.find((c) => c.id === activeConversationId)?.title ?? null;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      <main className="container mx-auto px-6 py-6 max-w-7xl w-full flex-1 min-h-0 flex flex-col">
        <PageHeader
          icon={<Gavel />}
          title="Legal Research"
          description="Access comprehensive Nepali constitutional law, civil codes, and criminal precedents through our AI-powered research system."
        />

        <section className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-stretch">
          {/* Sidebar: conversations */}
          <aside className="hidden md:flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0">
            <div className="p-3 border-b border-border">
              <button
                type="button"
                onClick={startNewConversation}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium shadow-navy hover:bg-primary/90 transition-colors"
              >
                <SquarePen className="w-4 h-4" /> New chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              <p className="px-3 pt-2 pb-1 label-caps text-[10px] text-muted-foreground">
                Recent research
              </p>
              {conversationsQuery.isPending && (
                <p className="px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" /> Loading…
                </p>
              )}
              {conversationsQuery.isError && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  Couldn&apos;t load conversations.
                </p>
              )}
              {(conversationsQuery.data ?? []).map((conversation) => (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() => openConversation(conversation)}
                  className={`w-full p-3 rounded-lg text-left border-r-4 transition-colors ${
                    activeConversationId === conversation.id
                      ? 'bg-surface-low border-accent'
                      : 'border-transparent hover:bg-surface-low'
                  }`}
                >
                  <p className="text-sm font-medium text-foreground truncate">
                    {conversation.last_question || conversation.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {timeAgo(conversation.updated_at)} · {conversation.message_count} turn
                    {conversation.message_count === 1 ? '' : 's'}
                  </p>
                </button>
              ))}
              {(conversationsQuery.data ?? []).length === 0 && !conversationsQuery.isPending && (
                <p className="px-3 py-2 text-xs text-muted-foreground">
                  No research yet — start a new chat.
                </p>
              )}
            </div>
          </aside>

          {/* Chat window */}
          <div className="flex flex-col rounded-xl border border-border bg-card overflow-hidden min-h-0">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-2 min-w-0">
                <History className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-semibold text-foreground truncate">
                  {activeTitle ?? (allTurns.length > 0 ? 'Conversation' : 'New research')}
                </p>
              </div>
              <button
                type="button"
                onClick={startNewConversation}
                className="md:hidden flex items-center gap-1.5 label-caps text-accent-foreground"
              >
                <SquarePen className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {/* Thread */}
            <div ref={threadRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {allTurns.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-6 py-16">
                  <div className="w-14 h-14 rounded-xl bg-accent/12 border border-accent/30 text-accent flex items-center justify-center">
                    <Scale className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-semibold text-primary">
                      Ask the legal corpus anything
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Query the Constitution, the Muluki Civil Code 2074, criminal
                      precedents, and Najir decisions.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    {suggestedChips.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        disabled={researchMutation.isPending}
                        onClick={() => submit(chip)}
                        className="px-4 py-2 rounded-full border border-border bg-card text-sm text-foreground shadow-sm transition-colors hover:border-accent hover:bg-surface-low disabled:opacity-50"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {allTurns.map((turn, i) => (
                <div key={`${turn.createdAt ?? ''}-${i}`} className="space-y-4">
                  <UserMessage question={turn.question} />
                  {researchMutation.isPending && turn.answer === '' ? (
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                        <Gavel className="w-4 h-4" />
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm pt-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Searching the corpus and synthesizing…</span>
                      </div>
                    </div>
                  ) : (
                    <AssistantMessage turn={turn} />
                  )}
                </div>
              ))}
            </div>

            {/* Composer */}
            <div className="px-5 py-4 border-t border-border">
              <form
                className="flex items-end gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(query);
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      submit(query);
                    }
                  }}
                  disabled={researchMutation.isPending}
                  rows={1}
                  placeholder="Ask a question about the corpus…"
                  className="flex-1 resize-none px-4 py-3 rounded-xl border border-border bg-card shadow-sm text-foreground placeholder:text-muted-foreground/70 outline-none transition-shadow focus:border-accent focus:ring-1 focus:ring-accent text-sm max-h-40"
                />
                <button
                  type="submit"
                  disabled={researchMutation.isPending || !query.trim()}
                  className="shrink-0 w-11 h-11 rounded-xl bg-primary text-primary-foreground shadow-navy flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none hover:bg-primary/90 transition-colors"
                  title="Send"
                >
                  {researchMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
              <p className="mt-2 text-[11px] text-muted-foreground">
                Answers cite their sources from the corpus. Always verify legal
                answers before relying on them.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
