import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
  /**
   * Whether Next finishes the wizard. Defaults to the last step, but a wizard
   * with locked steps at the end finishes earlier — see `lastReachableStep`.
   */
  isLastStep?: boolean;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  isNextDisabled = false,
  nextLabel,
  isLastStep = currentStep === totalSteps,
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;

  return (
    <div className="flex justify-between pt-10 mt-10 border-t border-border/60">
      <Button
        variant="ghost"
        onClick={onPrev}
        disabled={isFirstStep}
        className="gap-2 font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="gap-2 font-bold text-xs uppercase tracking-widest px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:translate-y-[-1px]"
      >
        {nextLabel || (isLastStep ? 'Preview Website' : 'Continue')}
        {!isLastStep && <ArrowRight className="w-4 h-4" />}
      </Button>
    </div>
  );
}
