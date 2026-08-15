import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  onStepClick?: (step: number) => void;
  /**
   * 1-based steps that can no longer be edited. They stay in the bar — the
   * subdomain step still shows the live address — but stop being clickable.
   */
  lockedSteps?: readonly number[];
}

export function ProgressIndicator({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
  lockedSteps = [],
}: ProgressIndicatorProps) {
  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between relative px-2">
        {/* Progress line */}
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-border/50" />
        <div
          className="absolute top-5 left-0 h-[2px] bg-primary transition-all duration-700 ease-in-out shadow-[0_0_8px_rgba(var(--primary),0.2)]"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isLocked = lockedSteps.includes(stepNumber);

          return (
            <div
              key={step}
              className={cn(
                "flex flex-col items-center relative z-10 group",
                onStepClick && !isLocked && "cursor-pointer"
              )}
              onClick={isLocked ? undefined : () => onStepClick?.(stepNumber)}
              aria-disabled={isLocked || undefined}
              // Same wording the step body uses once a site is deployed.
              title={isLocked ? 'Locked after deployment' : undefined}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500 ease-out",
                  isCompleted && "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100 group-hover:scale-110",
                  isCurrent && "bg-primary text-primary-foreground shadow-xl shadow-primary/30 ring-[6px] ring-primary/10 scale-110",
                  !isCompleted && !isCurrent && "bg-card border border-border text-muted-foreground/60 shadow-sm group-hover:border-primary/50 group-hover:text-primary group-hover:scale-110",
                  // Last, so it overrides the states above: a locked step is
                  // settled rather than pending, but nothing to reach for.
                  isLocked && "bg-muted text-muted-foreground/70 border border-border shadow-none scale-100 ring-0 group-hover:scale-100 group-hover:border-border group-hover:text-muted-foreground/70"
                )}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {isLocked ? (
                  <Lock className="w-4 h-4 stroke-[2.5]" />
                ) : isCompleted ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  stepNumber
                )}
              </div>
              <span className={cn(
                "mt-4 text-[10px] label-caps text-center transition-colors duration-300",
                isCurrent ? "text-primary px-2 py-0.5 rounded bg-primary/5" : "text-muted-foreground/50 group-hover:text-primary/70",
                isLocked && "text-muted-foreground/40 group-hover:text-muted-foreground/40",
                "hidden sm:block"
              )}>
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
