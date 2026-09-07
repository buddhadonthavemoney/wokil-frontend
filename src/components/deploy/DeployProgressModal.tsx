'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { Check, Loader2, RefreshCw, Sparkles, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DeployPhase, DeployStep } from '@/hooks/useDeployStream';

interface DeployProgressModalProps {
  phase: DeployPhase;
  steps: DeployStep[];
  message: string;
  /** Dismiss handler; only reachable once the deploy has finished. */
  onClose: () => void;
  /** Optional "View Site" action offered on success. */
  siteUrl?: string;
}

// Built on Radix primitives rather than our DialogContent because that wrapper
// always renders a close button - a deploy in flight must not look dismissible.
export function DeployProgressModal({ phase, steps, message, onClose, siteUrl }: DeployProgressModalProps) {
  if (phase === 'idle') return null;

  const isRunning = phase === 'running';
  const isSuccess = phase === 'success';

  return (
    <DialogPrimitive.Root
      open
      // Escape/outside-click resolve to onOpenChange(false); ignoring it while
      // running is what makes the modal genuinely blocking.
      onOpenChange={(open) => {
        if (!open && !isRunning) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          onEscapeKeyDown={(e) => isRunning && e.preventDefault()}
          onPointerDownOutside={(e) => isRunning && e.preventDefault()}
          onInteractOutside={(e) => isRunning && e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/20 bg-card p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={cn(
                'mb-5 flex h-16 w-16 items-center justify-center rounded-2xl shadow-lg',
                isRunning && 'bg-primary/10 text-primary',
                isSuccess && 'border border-success/30 bg-success/10 text-success',
                phase === 'error' && 'border border-rose-100 bg-rose-50 text-rose-600'
              )}
            >
              {isRunning && <Loader2 className="h-8 w-8 animate-spin" />}
              {isSuccess && <Sparkles className="h-8 w-8 animate-bounce" />}
              {phase === 'error' && <XCircle className="h-8 w-8" />}
            </div>

            <DialogPrimitive.Title className="font-heading text-xl font-extrabold tracking-tight text-foreground">
              {isRunning && 'Deploying your site'}
              {isSuccess && 'Deployment complete'}
              {phase === 'error' && 'Deployment failed'}
            </DialogPrimitive.Title>

            <DialogPrimitive.Description className="mt-1.5 text-sm font-medium text-muted-foreground">
              {isRunning && 'This takes a moment. Please keep this tab open.'}
              {!isRunning && message}
            </DialogPrimitive.Description>
          </div>

          {steps.length > 0 && (
            <ul className="mt-6 space-y-2.5 rounded-2xl bg-muted/40 p-4">
              {steps.map((step) => (
                <li key={step.key} className="flex items-center gap-3 text-sm">
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors',
                      step.done ? 'bg-success text-success-foreground' : 'bg-surface text-muted-foreground'
                    )}
                  >
                    {step.done ? (
                      <Check className="h-3 w-3 stroke-[3px]" />
                    ) : (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                  </span>
                  <span
                    className={cn(
                      'font-medium',
                      step.done ? 'text-muted-foreground' : 'text-foreground'
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* The Worker serves the site with `max-age=60,
              stale-while-revalidate=604800`, so a returning visitor's own
              browser can hand back the pre-deploy HTML once before refreshing
              it in the background — the edge purge can't reach that copy. Say
              so rather than let it read as a failed deploy. */}
          {isSuccess && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-muted/40 p-3 text-xs font-medium text-muted-foreground">
              <RefreshCw className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Your browser may show the previous version the first time you open the site.
                Reload the page to see the new theme.
              </span>
            </p>
          )}

          {!isRunning && (
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                {isSuccess ? 'Done' : 'Close'}
              </Button>
              {isSuccess && siteUrl && (
                <Button onClick={() => window.open(siteUrl, '_blank')}>View Site</Button>
              )}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
