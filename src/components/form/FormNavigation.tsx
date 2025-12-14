import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  isNextDisabled?: boolean;
  nextLabel?: string;
}

export function FormNavigation({
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  isNextDisabled = false,
  nextLabel,
}: FormNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === totalSteps;

  return (
    <div className="flex justify-between pt-8 mt-8 border-t border-border">
      <Button
        variant="ghost"
        onClick={onPrev}
        disabled={isFirstStep}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      
      <Button
        onClick={onNext}
        disabled={isNextDisabled}
        className="gap-2"
      >
        {nextLabel || (isLastStep ? 'Preview' : 'Continue')}
        {!isLastStep && <ArrowRight className="w-4 h-4" />}
      </Button>
    </div>
  );
}
