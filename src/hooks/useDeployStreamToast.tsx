'use client';

import { useEffect } from 'react';
import { toast as sonnerToast } from 'sonner';
import { Loader2, Sparkles, XCircle } from 'lucide-react';

type DeployToastVariant = 'loading' | 'success' | 'error';

// Fixed id: successive renders (loading -> ... -> done) update the same
// toast in place instead of stacking a new one per SSE event.
const TOAST_ID = 'deploy-toast';

function renderDeployToast(variant: DeployToastVariant, message: string) {
  sonnerToast.custom(() => (
    <div className="w-full max-w-sm bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 p-5 flex items-start gap-4 animate-in slide-in-from-bottom-5 fade-in duration-500 ring-1 ring-black/5">
      <div className={`
        mt-0.5 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform duration-300 hover:scale-105
        ${variant === 'loading' ? 'bg-primary/10 text-primary' : ''}
        ${variant === 'success' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : ''}
        ${variant === 'error' ? 'bg-rose-50 text-rose-600 border border-rose-100' : ''}
      `}>
        {variant === 'loading' && <Loader2 className="w-6 h-6 animate-spin" />}
        {variant === 'success' && <Sparkles className="w-6 h-6 animate-bounce" />}
        {variant === 'error' && <XCircle className="w-6 h-6" />}
      </div>
      <div className="flex-1 space-y-1.5 pt-0.5">
        <h3 className="font-heading font-extrabold text-[15px] text-foreground tracking-tight leading-none">
          {variant === 'loading' && 'Deploying Website'}
          {variant === 'success' && 'Deployment Complete'}
          {variant === 'error' && 'Deployment Failed'}
        </h3>
        <p className="text-sm font-medium text-muted-foreground/90 leading-relaxed font-body">
          {message}
        </p>
      </div>
    </div>
  ), { id: TOAST_ID, duration: variant === 'loading' ? Infinity : 5000 });
}

interface DeployStreamEvent {
  type: 'status' | 'done';
  status?: string;
  message: string;
}

interface UseDeployStreamToastOptions {
  /** Subscribes while true; the caller sets this once it knows a deploy is running. */
  active: boolean;
  /** Called once the stream reaches a terminal state (success, failed, or a dropped connection). */
  onDeactivate: () => void;
  /** Called on the terminal 'done' event, before onDeactivate - do cache invalidation/navigation here. */
  onDone: (status: 'success' | 'failed', message: string) => void | Promise<void>;
  /**
   * Confirms a genuine deploy actually happened when the stream 400s with
   * "no ongoing deployment" - ambiguous between "it finished before we
   * subscribed" and "nothing was ever running". Defaults to trusting the
   * ambiguous case as success; pass this to check e.g. the profile's
   * publish state first, so a stray/mistimed subscribe can't report success
   * for a deploy that never ran.
   */
  confirmAlreadyDone?: () => Promise<boolean>;
}

// Subscribes to GET /api/sites/deploy/stream (SSE) while `active` and renders
// the same progress -> success/error toast everywhere a deploy can be
// triggered from (profile builder publish, sites page verify-and-link), so
// the experience doesn't fork per page. Mirrors the backend's step-runner:
// 'status' events are per-step progress (uploading, DNS, custom hostname...),
// 'done' is terminal, firing only after any rollback has finished.
export function useDeployStreamToast({ active, onDeactivate, onDone, confirmAlreadyDone }: UseDeployStreamToastOptions) {
  useEffect(() => {
    if (!active) return;

    const token = localStorage.getItem('token');
    const streamUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/sites/deploy/stream`;
    const abortController = new AbortController();

    const finish = async (status: 'success' | 'failed', message: string) => {
      renderDeployToast(status === 'success' ? 'success' : 'error', message);
      await onDone(status, message);
      onDeactivate();
    };

    // Returns true once a terminal event has been handled, so the caller can
    // stop reading rather than waiting on a stream that's already done.
    const handleEvent = async (event: DeployStreamEvent): Promise<boolean> => {
      if (event.type === 'status') {
        renderDeployToast('loading', event.message || 'Processing...');
        return false;
      }
      if (event.type === 'done') {
        await finish(event.status === 'success' ? 'success' : 'failed', event.message);
        return true;
      }
      return false;
    };

    const startStream = async () => {
      renderDeployToast('loading', 'Initializing deployment...');
      try {
        const response = await fetch(streamUrl, {
          headers: { Authorization: `Bearer ${token}` },
          signal: abortController.signal,
        });

        if (!response.ok) {
          const errorText = await response.text();
          if (errorText.toLowerCase().includes('no ongoing deployment') || response.status === 400) {
            // Ambiguous: either the deploy finished before we subscribed, or
            // nothing was ever running. Ask the caller to disambiguate if it
            // can; otherwise assume the former (deploys are the common case
            // that lands here at all).
            const reallyDone = confirmAlreadyDone ? await confirmAlreadyDone() : true;
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
          renderDeployToast('error', 'The connection was lost.');
          onDeactivate();
        }
      }
    };

    startStream();
    return () => abortController.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
