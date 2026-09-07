'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, FileText, Gavel, History, Pencil, SquarePen, Loader2, Scale, Trash2, Users, X } from 'lucide-react';
import { ComingSoonOverlay } from '@/components/layout/ComingSoonOverlay';
import { useFeatureEnabled } from '@/hooks/useFeatures';
import { toast } from 'sonner';

import {
  deleteLegalResearchConversation,
  listLegalResearchConversations,
  listLegalResearchConversationMessages,
  renameLegalResearchConversation,
  searchLegalResearch,
  type LegalResearchChatResponse,
  type LegalResearchConversation,
  type LegalResearchFile,
  type LegalResearchMessage,
  type LegalResearchScope,
  type LegalResearchSource,
} from '@/generated/wokil-api';
import {
  getLegalResearchDocumentStatsOptions,
  getLegalResearchGraphStatsOptions,
} from '@/generated/wokil-api/@tanstack/react-query.gen';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useChatStream } from '@/hooks/useChatStream';

import { Composer, type ChatMode } from './components/Composer';
import { CitationGraph } from './components/CitationGraph';
import { DocumentPanel, type DocumentTarget } from './components/DocumentPanel';
import { MessageList, type Turn } from './components/MessageList';
import { isWholeCorpus } from './components/ScopePicker';
import { takeChatPrefill } from './prefill';

/** A cached turn, plus the individual passages a streamed answer carried.
 *  They are not persisted server-side — a turn re-read from the API keeps only
 *  its per-document snapshot — so they live on the cache entry, not in the
 *  generated type. */
type CachedMessage = LegalResearchMessage & {
  passages?: LegalResearchSource[];
  suggestions?: string[];
};

const suggestedChips = ['Fundamental Rights (Part 3)', 'Muluki Civil Code 2074', 'Cyber Crime Precedents'];

function CorpusStats() {
  const { data: docStats } = useQuery({ ...getLegalResearchDocumentStatsOptions(), staleTime: 10 * 60 * 1000 });
  const { data: graphStats } = useQuery({ ...getLegalResearchGraphStatsOptions(), staleTime: 10 * 60 * 1000 });

  if (!docStats && !graphStats) return null;

  const cards = [
    docStats && { icon: <FileText className="w-4 h-4" />, label: 'Documents', value: docStats.total_documents },
    docStats && { icon: <Gavel className="w-4 h-4" />, label: 'Chunks', value: docStats.total_chunks },
    graphStats && { icon: <Users className="w-4 h-4" />, label: 'People', value: graphStats.entities },
    graphStats && { icon: <Scale className="w-4 h-4" />, label: 'Citations', value: graphStats.citations },
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: number }[];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
      {cards.map((c) => (
        <div key={c.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-low text-xs text-muted-foreground">
          {c.icon}
          <span className="tabular-nums font-medium text-foreground">{c.value.toLocaleString()}</span>
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function LegalResearchPage() {
  const { enabled } = useFeatureEnabled('legal_research.chat');
  const [query, setQuery] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [mode, setMode] = useState<ChatMode>('ask');
  const [scope, setScope] = useState<LegalResearchScope>({});
  const [documentTarget, setDocumentTarget] = useState<DocumentTarget | null>(null);
  const [graphSeed, setGraphSeed] = useState<string | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);
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
    queryFn: async (): Promise<CachedMessage[]> => {
      if (activeConversationId == null) return [];
      const { data, error } = await listLegalResearchConversationMessages({
        path: { conversation_id: activeConversationId },
      });
      if (error !== undefined) {
        throw new Error(
          typeof error === 'string' ? error : 'Failed to load the conversation.',
        );
      }
      return (data ?? []) as CachedMessage[];
    },
    enabled: activeConversationId != null,
  });

  const transcript: Turn[] = useMemo(
    () =>
      (messagesQuery.data ?? []).map((m) => ({
        question: m.question,
        answer: m.answer,
        sources: m.sources ?? [],
        passages: m.passages,
        suggestions: m.suggestions,
        fromGeneralKnowledge: m.from_general_knowledge,
        citationWarning: m.citation_warning,
        lowConfidence: m.low_confidence,
        createdAt: m.created_at,
      })),
    [messagesQuery.data],
  );

  // Reopening a thread restores how it was last asked. The backend stores mode
  // and scope per turn, so the transcript is the source of truth — no separate
  // client-side memory to drift out of sync with it.
  //
  // Deliberately keyed on the conversation, not on the message list: the list
  // also grows when a turn this page just streamed is appended, and re-running
  // then would reset the controls the user is still holding.
  const messagesLoaded = messagesQuery.isSuccess;
  useEffect(() => {
    const last = queryClient.getQueryData<LegalResearchMessage[]>([
      'legal-research',
      'messages',
      activeConversationId,
    ])?.at(-1);
    if (!last) return;
    setMode((last.mode as ChatMode) ?? 'ask');
    setScope(last.scope ?? {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId, messagesLoaded]);

  // Arriving from entity search: the person's name is in the box and their
  // documents are the scope, so the first question cannot wander outside them.
  useEffect(() => {
    const prefill = takeChatPrefill();
    if (!prefill) return;
    setQuery(prefill.question);
    setScope(prefill.scope);
    setActiveConversationId(null);
  }, []);

  const stream = useChatStream({
    onConversation: (conversationId) => {
      // Arrives before the first token, so the thread is selected (and its
      // title shown) while the answer is still being written.
      setActiveConversationId(conversationId);
    },
    onDone: (question, result: LegalResearchChatResponse) => {
      const conversationId = result.conversation_id ?? activeConversationId;
      if (conversationId != null) {
        const confirmed: CachedMessage = {
          id: 0,
          turn_index: 0,
          question,
          answer: result.answer,
          sources: (result.files ?? []) as LegalResearchFile[],
          passages: (result.sources ?? []) as LegalResearchSource[],
          suggestions: result.suggestions,
          from_general_knowledge: result.from_general_knowledge,
          created_at: new Date().toISOString(),
          citation_warning: result.citation_warning,
          low_confidence: result.low_confidence,
          mode: mode === 'search' ? 'ask' : mode,
          scope: isWholeCorpus(scope) ? undefined : scope,
        };
        // Append to the cached transcript rather than refetching: the streamed
        // turn and the persisted one are the same turn, and a refetch racing
        // the stream is what would double-render it.
        queryClient.setQueryData<CachedMessage[]>(
          ['legal-research', 'messages', conversationId],
          (old) => [...(old ?? []), confirmed],
        );
      }
      void conversationsQuery.refetch();
    },
    onError: (message) => toast.error(message || 'Failed to run the research query.'),
  });

  const [searchTurns, setSearchTurns] = useState<Turn[]>([]);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, searchTurns, stream.answer, stream.question]);

  const searchMutation = useMutation({
    mutationFn: async (question: string) => {
      const { data, error } = await searchLegalResearch({
        body: {
          query: question,
          scope: isWholeCorpus(scope) ? undefined : scope,
        },
      });
      if (error !== undefined) throw new Error(typeof error === 'string' ? error : 'Search failed.');
      return { question, data: data! };
    },
    onSuccess: ({ question, data }) => {
      setSearchTurns((prev) => [
        ...prev,
        {
          question,
          answer: '',
          sources: (data.files ?? []) as LegalResearchFile[],
          passages: (data.results ?? []) as LegalResearchSource[],
          fromGeneralKnowledge: false,
        },
      ]);
    },
    onError: () => toast.error('Search failed.'),
  });

  const submit = (question: string) => {
    if (stream.streaming || searchMutation.isPending) return;
    setQuery('');
    if (mode === 'search') {
      searchMutation.mutate(question);
      return;
    }
    stream.ask({
      question,
      conversation_id: activeConversationId ?? undefined,
      mode,
      scope: isWholeCorpus(scope) ? undefined : scope,
    });
  };

  const startNewConversation = () => {
    stream.stop();
    setActiveConversationId(null);
    setSearchTurns([]);
    setQuery('');
    setMode('ask');
    setScope({});
  };

  const openConversation = (conversation: LegalResearchConversation) => {
    if (activeConversationId === conversation.id) return;
    stream.stop();
    setActiveConversationId(conversation.id);
    setQuery('');
  };

  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const renameMutation = useMutation({
    mutationFn: async ({ id, title }: { id: number; title: string }) => {
      const { error } = await renameLegalResearchConversation({
        path: { conversation_id: id },
        body: { title },
      });
      if (error !== undefined) throw new Error(typeof error === 'string' ? error : 'Rename failed.');
    },
    onSuccess: () => {
      setRenamingId(null);
      void conversationsQuery.refetch();
    },
    onError: () => toast.error('Failed to rename conversation.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await deleteLegalResearchConversation({
        path: { conversation_id: id },
      });
      if (error !== undefined) throw new Error(typeof error === 'string' ? error : 'Delete failed.');
    },
    onSuccess: (_data, id) => {
      setConfirmDeleteId(null);
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
      void conversationsQuery.refetch();
    },
    onError: () => toast.error('Failed to delete conversation.'),
  });

  const activeTitle =
    conversationsQuery.data?.find((c) => c.id === activeConversationId)?.title ?? null;
  const isSearchMode = mode === 'search';
  const activeTurns = isSearchMode ? searchTurns : transcript;
  const isBusy = stream.streaming || searchMutation.isPending;
  const isEmpty = activeTurns.length === 0 && stream.question == null && !searchMutation.isPending;

  const content = (
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
              <Button onClick={startNewConversation} className="w-full">
                <SquarePen className="w-4 h-4" /> New chat
              </Button>
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
                <div
                  key={conversation.id}
                  className={`group relative rounded-lg border-r-4 transition-colors ${
                    activeConversationId === conversation.id
                      ? 'bg-surface-low border-accent'
                      : 'border-transparent hover:bg-surface-low'
                  }`}
                >
                  {renamingId === conversation.id ? (
                    <form
                      className="p-2 flex items-center gap-1"
                      onSubmit={(e) => {
                        e.preventDefault();
                        const trimmed = renameValue.trim();
                        if (trimmed) renameMutation.mutate({ id: conversation.id, title: trimmed });
                      }}
                    >
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        className="flex-1 min-w-0 text-sm px-2 py-1 rounded border border-border bg-card text-foreground outline-none focus:border-accent"
                        onKeyDown={(e) => { if (e.key === 'Escape') setRenamingId(null); }}
                      />
                      <button type="submit" className="p-1 text-accent hover:text-accent/80" title="Save">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setRenamingId(null)} className="p-1 text-muted-foreground hover:text-foreground" title="Cancel">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : confirmDeleteId === conversation.id ? (
                    <div className="p-3 space-y-2">
                      <p className="text-xs text-foreground">Delete this conversation?</p>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(conversation.id)}
                          disabled={deleteMutation.isPending}
                          className="px-2 py-1 text-xs rounded bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openConversation(conversation)}
                      className="w-full p-3 text-left"
                    >
                      <p className="text-sm font-medium text-foreground truncate pr-12">
                        {conversation.last_question || conversation.title}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {new Date(conversation.updated_at).toLocaleDateString()} · {conversation.message_count} turn
                        {conversation.message_count === 1 ? '' : 's'}
                      </p>
                    </button>
                  )}
                  {renamingId !== conversation.id && confirmDeleteId !== conversation.id && (
                    <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-0.5">
                      <button
                        type="button"
                        title="Rename"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameValue(conversation.title);
                          setRenamingId(conversation.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-surface-low"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDeleteId(conversation.id);
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-surface-low"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
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
                  {activeTitle ?? (isEmpty ? 'New research' : 'Conversation')}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={startNewConversation}
                className="md:hidden"
              >
                <SquarePen className="w-3.5 h-3.5" /> New
              </Button>
            </div>

            {/* Thread */}
            <div ref={threadRef} className="flex-1 overflow-y-auto px-5 py-6 space-y-6">
              {isEmpty && (
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
                        disabled={isBusy}
                        onClick={() => submit(chip)}
                        className="px-4 py-2 rounded-full border border-border bg-card text-sm text-foreground shadow-sm transition-colors hover:border-accent hover:bg-surface-low disabled:opacity-50"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <CorpusStats />
                </div>
              )}

              <MessageList
                turns={activeTurns}
                streamingQuestion={isSearchMode ? (searchMutation.isPending ? (searchMutation.variables ?? null) : null) : stream.question}
                streamingAnswer={isSearchMode ? '' : stream.answer}
                onOpenDocument={setDocumentTarget}
                onAsk={submit}
              />
            </div>

            <Composer
              value={query}
              onChange={setQuery}
              onSubmit={submit}
              streaming={isBusy}
              onStop={stream.stop}
              mode={mode}
              onModeChange={setMode}
              scope={scope}
              onScopeChange={setScope}
            />
          </div>
        </section>
      </main>

      {documentTarget && (
        <DocumentPanel
          target={documentTarget}
          onOpen={setDocumentTarget}
          onClose={() => setDocumentTarget(null)}
          onShowGraph={setGraphSeed}
        />
      )}

      {graphSeed && (
        <CitationGraph
          seed={graphSeed}
          onOpenDocument={(t) => {
            setGraphSeed(null);
            setDocumentTarget(t);
          }}
          onClose={() => setGraphSeed(null)}
        />
      )}
    </div>
  );

  if (!enabled) {
    return (
      <ComingSoonOverlay
        title="Legal Research"
        description="AI-powered search across Nepali constitutional law, civil codes, and criminal precedents."
      >
        {content}
      </ComingSoonOverlay>
    );
  }

  return content;
}
