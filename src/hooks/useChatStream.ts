'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  streamLegalResearchChat,
  type LegalResearchChatRequest,
  type LegalResearchChatResponse,
} from '@/generated/wokil-api';

/**
 * Frames from POST /api/legal-research/chat/stream. They are bare `data:`
 * lines with no `event:` name, discriminated on `type` — see the operation's
 * description in the spec.
 *
 * The generated response type is `string`, because an SSE body is typed as a
 * string in OpenAPI. The runtime JSON-parses each frame, so the values are
 * really these objects; this union is the shape the spec describes in prose.
 */
type ChatFrame =
  | { type: 'conversation'; conversation_id: number; new: boolean }
  | { type: 'token'; text: string }
  | ({ type: 'done' } & LegalResearchChatResponse)
  | { type: 'error'; message: string };

interface UseChatStreamOptions {
  /** The conversation the turn landed in — fires before any token. */
  onConversation: (conversationId: number, isNew: boolean) => void;
  /** Terminal frame: the complete answer, sources and flags. */
  onDone: (question: string, result: LegalResearchChatResponse) => void;
  onError: (message: string) => void;
}

export interface ChatStream {
  /** Whether a question is currently being answered. */
  streaming: boolean;
  /** The question currently being answered, for optimistic rendering. */
  question: string | null;
  /** Answer text so far. Empty until the first token. */
  answer: string;
  ask: (request: LegalResearchChatRequest) => void;
  stop: () => void;
}

/**
 * Streams one chat answer at a time.
 *
 * Unlike useDeployStream this does not hand-roll fetch + SSE parsing: the
 * generated SDK gained a real SSE client with the streaming operation, and it
 * already does the two things EventSource cannot — send the bearer token and
 * abort mid-flight. Retries are capped at one attempt, because the failure
 * being retried is a 15-70s LLM call, and the default is to retry forever.
 */
export function useChatStream({ onConversation, onDone, onError }: UseChatStreamOptions): ChatStream {
  const [question, setQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  // Callers pass fresh closures every render; read through refs so `ask`
  // stays stable and can never run a stale closure. Same reasoning as
  // useDeployStream.
  const cbs = useRef({ onConversation, onDone, onError });
  cbs.current = { onConversation, onDone, onError };

  // Leaving the page must actually cancel the request, not just stop
  // rendering it — the server cancels its upstream RAG call when we hang up.
  useEffect(() => () => abortRef.current?.abort(), []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  const ask = useCallback((request: LegalResearchChatRequest) => {
    if (abortRef.current) return;

    const controller = new AbortController();
    abortRef.current = controller;
    setQuestion(request.question);
    setAnswer('');

    void (async () => {
      try {
        const { stream } = await streamLegalResearchChat({
          body: request,
          signal: controller.signal,
          sseMaxRetryAttempts: 1,
          // Bug fix #1: SSE transport errors (fetch failures, non-2xx) go to
          // onSseError, not the catch block — createSseClient swallows them
          // otherwise and the stream completes silently.
          onSseError: (error) => {
            if (!controller.signal.aborted) {
              cbs.current.onError(
                error instanceof Error ? error.message : 'The research stream was interrupted.',
              );
            }
          },
        });

        for await (const frame of stream as unknown as AsyncIterable<ChatFrame>) {
          if (controller.signal.aborted) return;
          switch (frame.type) {
            case 'conversation':
              cbs.current.onConversation(frame.conversation_id, frame.new);
              break;
            case 'token':
              setAnswer((prev) => prev + frame.text);
              break;
            case 'done':
              cbs.current.onDone(request.question, frame);
              break;
            case 'error':
              cbs.current.onError(frame.message);
              break;
          }
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          cbs.current.onError(
            err instanceof Error ? err.message : 'The research stream was interrupted.',
          );
        }
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setQuestion(null);
          setAnswer('');
        }
      }
    })();
  }, []);

  return { streaming: question !== null, question, answer, ask, stop };
}
