'use client';

import { useEffect } from 'react';
import { Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProgressIndicator } from '@/components/form/ProgressIndicator';
import { FormNavigation } from '@/components/form/FormNavigation';

/**
 * One step of a wizard: which group of `T` it edits, what the progress bar
 * calls it, and the component that renders it.
 *
 * `onUpdate` is deliberately loose here. Pinning it to the payload of `key`
 * would make the array element type a union over every key, and indexing that
 * union by a runtime step number loses the pairing anyway. The type safety that
 * matters is at the *definition* site instead — see `defineStep`.
 */
export interface WizardStepDef<T, K extends Extract<keyof T, string> = Extract<keyof T, string>> {
  key: K;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Component: React.ComponentType<{ profile: T; onUpdate: (fields: any) => void }>;
}

/**
 * Declares a wizard step with its `key` and `Component` checked against each
 * other: `Component` must accept exactly `Partial<T[K]>`, so listing a step
 * under the wrong key fails to compile.
 */
export function defineStep<T, K extends Extract<keyof T, string>>(step: {
  key: K;
  label: string;
  Component: React.ComponentType<{ profile: T; onUpdate: (fields: Partial<T[K]>) => void }>;
}): WizardStepDef<T, K> {
  return step as WizardStepDef<T, K>;
}

interface WizardShellProps<T, K extends Extract<keyof T, string>> {
  icon: React.ReactNode;
  title: string;
  description: string;

  steps: readonly WizardStepDef<T, K>[];
  currentStep: number;
  data: T;
  onUpdate: (category: K, fields: object) => void;

  onNext: () => void;
  onPrev: () => void;
  onStepClick: (step: number) => void;
  onFillSample?: () => void;
  onClear?: () => void;

  /**
   * 1-based steps that can no longer be edited. They stay visible but are not
   * navigable, and the wizard finishes at the last step before them.
   */
  lockedSteps?: readonly number[];

  /** The right-hand preview column. */
  children: React.ReactNode;
}

/**
 * The chrome both wizards share: header, progress bar, the step card with its
 * Fill Sample / Clear row, the nav buttons and the Enter-to-advance handler.
 *
 * Only the step list, the data being edited and the preview column differ
 * between the individual and firm wizards, so those are props; everything else
 * would otherwise be a 350-line copy-paste that drifts on the first bug fix.
 */
export function WizardShell<T, K extends Extract<keyof T, string>>({
  icon,
  title,
  description,
  steps,
  currentStep,
  data,
  onUpdate,
  onNext,
  onPrev,
  onStepClick,
  onFillSample,
  onClear,
  lockedSteps = [],
  children,
}: WizardShellProps<T, K>) {
  const totalSteps = steps.length;
  const step = steps[currentStep - 1];
  // Where "Continue" turns into "Preview Website". Same decision the builder
  // pages make, so the button and the handler cannot disagree. Locked steps
  // are always the tail (the deployed subdomain), so never more than one.
  const finishStep = lockedSteps.includes(totalSteps) ? totalSteps - 1 : totalSteps;
  const isLastStep = currentStep >= finishStep;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Enter') return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'TEXTAREA' || target.hasAttribute('data-prevent-navigation')) return;
      onNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <div className="min-h-screen bg-[hsl(210,20%,98%)]/50 pb-10">
      <main className="container mx-auto px-6 py-6 max-w-7xl">
        <PageHeader icon={icon} title={title} description={description} className="mb-8" />

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Form Builder */}
          <div className="lg:col-span-7 space-y-6">
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              steps={steps.map((s) => s.label)}
              onStepClick={onStepClick}
              lockedSteps={lockedSteps}
            />

            <div className="bg-card border-none rounded-xl p-6 md:p-8 shadow-premium animate-fade-in relative overflow-hidden min-h-[400px] max-h-[calc(100vh-8rem)] flex flex-col">
              <div className="flex items-center justify-end gap-3 mb-4 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onFillSample}
                  disabled={!onFillSample || currentStep === totalSteps}
                  className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Fill Sample Data
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClear}
                  disabled={!onClear || currentStep === totalSteps}
                  className="h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear
                </Button>
              </div>

              <div className="relative overflow-y-auto flex-1 px-1.5">
                {step && (
                  <step.Component
                    profile={data}
                    onUpdate={(fields: object) => onUpdate(step.key, fields)}
                  />
                )}
              </div>

              <div className="shrink-0">
                <FormNavigation
                  currentStep={currentStep}
                  totalSteps={totalSteps}
                  onNext={onNext}
                  onPrev={onPrev}
                  isLastStep={isLastStep}
                />
              </div>
            </div>

            <p className="text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">
              {/* Counted against the reachable steps, so a locked tail doesn't
                  read as progress the user still owes. Clamped for the case of
                  landing on a locked step by URL. */}
              Step {Math.min(currentStep, finishStep)} of {finishStep} • Your progress is saved automatically
            </p>
          </div>

          <div className="lg:col-span-5 w-full sticky top-6 hidden lg:block">{children}</div>
        </div>
      </main>
    </div>
  );
}
