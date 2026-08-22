'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Gavel, History, SquarePen, Loader2, Scale } from 'lucide-react';
import { toast } from 'sonner';

import {
  listLegalResearchConversations,
  listLegalResearchConversationMessages,
  type LegalResearchChatResponse,
  type LegalResearchConversation,
  type LegalResearchFile,
  type LegalResearchMessage,
  type LegalResearchScope,
  type LegalResearchSource,
} from '@/generated/wokil-api';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { useChatStream } from '@/hooks/useChatStream';

import { Composer, type ChatMode } from './components/Composer';
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

export default function LegalResearchPage() {
  const [query, setQuery] = useState('');
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [mode, setMode] = useState<ChatMode>('ask');
  const [scope, setScope] = useState<LegalResearchScope>({});
  const [documentTarget, setDocumentTarget] = useState<DocumentTarget | null>(null);
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
          mode,
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

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: 'smooth' });
  }, [transcript, stream.answer, stream.question]);

  const submit = (question: string) => {
    if (stream.streaming) return;
    setQuery('');
    stream.ask({
      question,
      conversation_id: activeConversationId ?? undefined,
      mode,
      // An empty scope object would read as a filter matching nothing; the
      // whole corpus is expressed by omitting it.
      scope: isWholeCorpus(scope) ? undefined : scope,
    });
  };

  const startNewConversation = () => {
    stream.stop();
    setActiveConversationId(null);
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

  const activeTitle =
    conversationsQuery.data?.find((c) => c.id === activeConversationId)?.title ?? null;
  const isEmpty = transcript.length === 0 && stream.question == null;

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
                    {new Date(conversation.updated_at).toLocaleDateString()} · {conversation.message_count} turn
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
                        disabled={stream.streaming}
                        onClick={() => submit(chip)}
                        className="px-4 py-2 rounded-full border border-border bg-card text-sm text-foreground shadow-sm transition-colors hover:border-accent hover:bg-surface-low disabled:opacity-50"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <MessageList
                turns={transcript}
                streamingQuestion={stream.question}
                streamingAnswer={stream.answer}
                onOpenDocument={setDocumentTarget}
                onAsk={submit}
              />
            </div>

            <Composer
              value={query}
              onChange={setQuery}
              onSubmit={submit}
              streaming={stream.streaming}
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
        />
      )}
    </div>
  );
}
