'use client';

import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Search,
  Gavel,
  BookOpen,
  Scale,
  History,
  ArrowRight,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import {
  chatLegalResearch,
  listLegalResearchConversations,
  type LegalResearchChatResponse,
  type LegalResearchConversation,
} from '@/generated/wokil-api';
import { PageHeader } from '@/components/layout/PageHeader';

const databases = [
  {
    icon: BookOpen,
    title: 'Constitution of Nepal',
    description:
      'Explore the constitution, fundamental rights, and state structure with historical context.',
  },
  {
    icon: Gavel,
    title: 'Civil Law (Muluki)',
    description:
      'Access the Muluki Civil Code 2074, property laws, family law, and contract regulations.',
  },
  {
    icon: Scale,
    title: 'Criminal Law',
    description:
      'Muluki Criminal Code, penal procedures, evidence act, and major Supreme Court precedents.',
  },
];

const suggestedChips = ['Fundamental Rights (Part 3)', 'Muluki Civil Code 2074', 'Cyber Crime Precedents'];

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return new Date(iso).toLocaleDateString();
}

export default function LegalResearchPage() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<LegalResearchChatResponse | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);

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
        // The spec's error bodies are text/plain, so every status maps to a
        // plain string (e.g. the backend's 503 "legal research service
        // unavailable").
        throw new Error(
          typeof error === 'string' ? error : 'Failed to run the research query.',
        );
      }
      return data as LegalResearchChatResponse;
    },
    onSuccess: (data) => {
      setResult(data);
      // Follow-ups continue the same conversation; a fresh one (no
      // conversation_id) is started by the backend and adopted here.
      if (data.conversation_id != null) {
        setActiveConversationId(data.conversation_id);
      }
      void conversationsQuery.refetch();
    },
    onError: (error: Error) => {
      toast.error(
        error?.message === 'timed-out'
          ? 'Request timed out. Try a shorter or more specific question.'
          : error?.message || 'Failed to run the research query.',
      );
    },
  });

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || researchMutation.isPending) return;
    researchMutation.mutate(trimmed);
  };

  const startNewConversation = () => {
    setActiveConversationId(null);
    setResult(null);
    setQuery('');
  };

  const resumeConversation = (conversation: LegalResearchConversation) => {
    setActiveConversationId(conversation.id);
    setResult(null);
    setQuery(conversation.last_question ?? '');
    toast.info(`Resuming "${conversation.title}" — follow-up questions continue on it.`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex flex-col gap-12">
          <PageHeader
            icon={<Gavel />}
            title="Legal Research"
            description="Access comprehensive Nepali constitutional law, civil codes, and criminal precedents through our AI-powered research system."
          />

          <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
            <h2 className="font-heading text-lg font-bold text-foreground mb-6">
              Law &amp; Constitution Search
            </h2>
            <form
              className="relative"
              onSubmit={(e) => {
                e.preventDefault();
                submit(query);
              }}
            >
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={researchMutation.isPending}
                placeholder="Query the Constitution, Civil Code, or specific precedents..."
                className="w-full pl-12 pr-28 py-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground outline-none"
              />
              <button
                type="submit"
                disabled={researchMutation.isPending || !query.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {researchMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </form>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {activeConversationId != null && (
                <button
                  type="button"
                  onClick={startNewConversation}
                  className="px-4 py-2 rounded-full border border-accent bg-secondary/50 text-sm text-foreground hover:border-accent"
                  title="Stop continuing the current conversation"
                >
                  Continuing conversation #<span className="font-bold">{activeConversationId}</span>{' '}
                  <X className="w-3.5 h-3.5 inline -mt-0.5" />
                </button>
              )}
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2">
                Suggested:
              </span>
              {suggestedChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={researchMutation.isPending}
                  onClick={() => submit(chip)}
                  className="px-4 py-2 rounded-full border border-border bg-background text-sm text-foreground hover:border-accent disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>
          </section>

          {researchMutation.isPending && (
            <section className="bg-card border border-border rounded-xl p-8 shadow-sm">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <p className="text-sm">
                  Searching the corpus and synthesizing an answer… this usually
                  takes 5–10 seconds.
                </p>
              </div>
            </section>
          )}

          {result && !researchMutation.isPending && (
            <section className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-6">
              {result.from_general_knowledge && (
                <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-600/40 bg-amber-600/10">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-700">
                      Answered from general knowledge — not the corpus
                    </p>
                    <p className="text-xs text-amber-700/80 mt-1">
                      Nothing in the Najir decisions or Nepal Law Commission
                      acts matched this query. Verify this answer before relying
                      on it.
                    </p>
                  </div>
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                  {result.answer}
                </p>
              </div>

              {result.files.length > 0 && (
                <div>
                  <h3 className="font-heading text-sm font-bold text-foreground mb-3">
                    Sources ({result.files.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {result.files.map((file) => (
                      <div
                        key={file.document_id}
                        className="p-4 rounded-lg border border-border bg-background"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h4 className="text-sm font-medium text-foreground">
                            {file.document_title}
                          </h4>
                          <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary border border-accent text-foreground">
                            {Math.round(file.score * 100)}%
                          </span>
                        </div>
                        {(file.collection || file.category) && (
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            {[file.collection, file.category].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground mb-6">
              Core Legal Databases
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {databases.map(({ icon: Icon, title, description }) => (
                <div key={title} className="p-6 rounded-xl border border-border bg-card">
                  <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-foreground mb-2">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{description}</p>
                  <div className="mt-4 flex items-center gap-1 text-accent text-xs font-bold uppercase tracking-widest">
                    Browse <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-lg font-bold text-foreground">
                Recent Research
              </h2>
              <span className="text-xs font-bold uppercase tracking-widest text-accent">
                {conversationsQuery.data?.length ?? 0} conversation
                {(conversationsQuery.data?.length ?? 0) === 1 ? '' : 's'}
              </span>
            </div>
            {conversationsQuery.isPending ? (
              <div className="bg-card border border-border rounded-xl p-8 flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <p className="text-sm">Loading your recent research…</p>
              </div>
            ) : conversationsQuery.isError ? (
              <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground">
                Couldn&apos;t load recent research. {conversationsQuery.error?.message}
              </div>
            ) : (conversationsQuery.data?.length ?? 0) === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-sm text-muted-foreground">
                No research yet — ask your first question above and it will
                appear here.
              </div>
            ) : (
              <div className="bg-card border border-border rounded-xl overflow-hidden divide-y divide-border">
                {(conversationsQuery.data ?? []).map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => resumeConversation(conversation)}
                    disabled={researchMutation.isPending}
                    className={`w-full p-4 flex items-start gap-4 text-left hover:bg-secondary/40 transition-colors disabled:opacity-50 ${
                      activeConversationId === conversation.id
                        ? 'bg-secondary/60'
                        : ''
                    }`}
                  >
                    <History className="w-5 h-5 text-muted-foreground mt-1 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {conversation.last_question || conversation.title}
                      </h3>
                      {conversation.last_question &&
                        conversation.last_question !== conversation.title && (
                          <p className="mt-0.5 text-xs text-muted-foreground truncate">
                            {conversation.title}
                          </p>
                        )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{timeAgo(conversation.updated_at)}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="bg-secondary border border-accent text-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                          {conversation.message_count} question
                          {conversation.message_count === 1 ? '' : 's'}
                        </span>
                        {activeConversationId === conversation.id && (
                          <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}