'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export type DeployPhase = 'idle' | 'running' | 'success' | 'error';

export interface DeployStep {
  /** Stable machine key (deployStep.key on the backend, e.g. "uploading"). */
  key: string;
  /** Display label as reported by the backend (e.g. "Uploading Assets to R2"). */
  label: string;
  done: boolean;
}

interface DeployPlanStep {
  step: string;
  label: string;
}

interface DeployStreamEvent {
  type: 'plan' | 'status' | 'done';
  status?: string;
  /** The deployStep.key this event is about; absent on 'plan' and 'done'. */
  step?: string;
  message: string;
  /** Present only on 'plan': the full checklist for this deploy, in order. */
  plan?: DeployPlanStep[];
}

interface UseDeployStreamOptions {
  /** Subscribes while true; the caller sets this once it knows a deploy is running. */
  active: boolean;
  /** Called once the stream reaches a terminal state (success, failed, or a dropped connection). */
  onDeactivate: () => void;
  /** Called on the terminal 'done' event - do cache invalidation/refetch here. */
  onDone: (status: 'success' | 'failed', message: string) => void | Promise<void>;
  /**
   * Confirms a genuine deploy actually happened when the stream 400s with
   * "no ongoing deployment" - ambiguous between "it finished before we
   * subscribed" and "nothing was ever running". Defaults to trusting the
   * ambiguous case as success.
   */
  confirmAlreadyDone?: () => Promise<boolean>;
}

interface DeployStreamState {
  phase: DeployPhase;
  /** Ordered steps, oldest first. The last one is in-flight while phase === 'running'. */
  steps: DeployStep[];
  /** Terminal message from the backend, once phase is success/error. */
  message: string;
  /** Clears state so the UI can dismiss a finished run. */
  reset: () => void;
}

// Subscribes to GET /api/sites/deploy/stream (SSE) while `active`, exposing the
// backend step-runner's progress as state. Rendering is left to the caller
// (see DeployProgressModal) so the same stream can drive different surfaces.
//
// The backend emits one 'plan' event up front listing every step this deploy
// will run (a redeploy of an already-live site skips DNS/hostname/route
// entirely, so the plan differs per deploy - the client never hardcodes it),
// then one 'status' event per step as it *starts*, keyed by the same stable
// `step` key as the plan entry, then a single terminal 'done'. Matching on
// `step` rather than the display label means a reworded step name can never
// silently break which entry the client marks in-progress.
export function useDeployStream({
  active,
  onDeactivate,
  onDone,
  confirmAlreadyDone,
}: UseDeployStreamOptions): DeployStreamState {
  const [phase, setPhase] = useState<DeployPhase>('idle');
  const [steps, setSteps] = useState<DeployStep[]>([]);
  const [message, setMessage] = useState('');

  const reset = useCallback(() => {
    setPhase('idle');
    setSteps([]);
    setMessage('');
  }, []);

  // Callers pass fresh closures every render (none of the three are
  // memoized with useCallback), so the effect below reads through refs
  // updated on every render instead of depending on them directly - that
  // way it only needs to depend on `active`, and can't ever run a stale
  // closure that captured last render's props no matter what a future
  // caller passes in.
  const onDeactivateRef = useRef(onDeactivate);
  const onDoneRef = useRef(onDone);
  const confirmAlreadyDoneRef = useRef(confirmAlreadyDone);
  onDeactivateRef.current = onDeactivate;
  onDoneRef.current = onDone;
  confirmAlreadyDoneRef.current = confirmAlreadyDone;

  useEffect(() => {
    if (!active) return;

    const abortController = new AbortController();
    const token = localStorage.getItem('token');
    const streamUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sites/deploy/stream`;

    setPhase('running');
    setSteps([]);
    setMessage('');

    const applyPlan = (plan: DeployPlanStep[]) => {
      setSteps(plan.map((p) => ({ key: p.step, label: p.label, done: false })));
    };

    // A new step starting means every earlier plan entry has finished -
    // that's what marks them done. Matched by key, not array position, so
    // an out-of-order or duplicate event (retry) can't corrupt the list.
    const markStepStarted = (key: string) => {
      setSteps((prev) => {
        const idx = prev.findIndex((s) => s.key === key);
        if (idx === -1) return prev; // Unknown key: server/client plan drifted, ignore rather than corrupt state.
        return prev.map((s, i) => ({ ...s, done: i < idx ? true : s.done }));
      });
    };

    const finish = async (status: 'success' | 'failed', doneMessage: string) => {
      setSteps((prev) => prev.map((s) => ({ ...s, done: true })));
      setPhase(status === 'success' ? 'success' : 'error');
      setMessage(doneMessage);
      await onDoneRef.current(status, doneMessage);
      onDeactivateRef.current();
    };

    // Returns true once a terminal event has been handled.
    const handleEvent = async (event: DeployStreamEvent): Promise<boolean> => {
      if (event.type === 'plan') {
        applyPlan(event.plan ?? []);
        return false;
      }
      if (event.type === 'status') {
        if (event.step) markStepStarted(event.step);
        return false;
      }
      if (event.type === 'done') {
        await finish(event.status === 'success' ? 'success' : 'failed', event.message);
        return true;
      }
      return false;
    };

    const startStream = async () => {
      try {
        const response = await fetch(streamUrl, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (errorText.toLowerCase().includes('no ongoing deployment') || response.status === 400) {
            const reallyDone = confirmAlreadyDoneRef.current ? await confirmAlreadyDoneRef.current() : true;
            if (reallyDone) {
              await finish('success', 'Deployment complete!');
              return;
            }
          }
          throw new Error(`Stream request failed: ${response.status} ${errorText}`);
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        if (!reader) return;

        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(trimmed.slice(6));
              if (await handleEvent(event)) return;
            } catch (e) {
              console.error('Failed to parse deploy event:', e);
            }
          }
        }

        // A 'done' frame can arrive in the final unterminated chunk.
        if (buffer.trim()) {
          for (const line of buffer.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            try {
              const event = JSON.parse(trimmed.slice(6));
              await handleEvent(event);
            } catch {
              // Malformed trailing frame - nothing more to read anyway.
            }
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Deployment stream error:', err);
          setPhase('error');
          setMessage('The connection was lost. Your deployment may still be running.');
          onDeactivateRef.current();
        }
      }
    };

    startStream();
    return () => abortController.abort();
  }, [active]);

  return { phase, steps, message, reset };
}
