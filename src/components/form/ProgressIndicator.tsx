import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  onStepClick?: (step: number) => void;
}

export function ProgressIndicator({ currentStep, totalSteps, steps, onStepClick }: ProgressIndicatorProps) {
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

          return (
            <div 
              key={step} 
              className={cn(
                "flex flex-col items-center relative z-10 group",
                onStepClick && "cursor-pointer"
              )}
              onClick={() => onStepClick?.(stepNumber)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-500 ease-out",
                  isCompleted && "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100 group-hover:scale-110",
                  isCurrent && "bg-primary text-primary-foreground shadow-xl shadow-primary/30 ring-[6px] ring-primary/10 scale-110",
                  !isCompleted && !isCurrent && "bg-card border border-border text-muted-foreground/60 shadow-sm group-hover:border-primary/50 group-hover:text-primary group-hover:scale-110"
                )}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[3]" /> : stepNumber}
              </div>
              <span className={cn(
                "mt-4 text-[10px] font-bold uppercase tracking-widest text-center transition-colors duration-300",
                isCurrent ? "text-primary px-2 py-0.5 rounded bg-primary/5" : "text-muted-foreground/50 group-hover:text-primary/70",
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
