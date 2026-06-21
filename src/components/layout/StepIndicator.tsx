import { Check } from 'lucide-react';
import { STEPS, type Step } from '@/types';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  currentStep: Step;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.key === currentStep);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-coffee-100 -z-10" />
        <div
          className="absolute top-5 left-0 h-1 bg-coffee-700 transition-all duration-500 -z-10"
          style={{
            width: `${(currentIndex / (STEPS.length - 1)) * 100}%`,
          }}
        />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;

          return (
            <div
              key={step.key}
              className="flex flex-col items-center"
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300',
                  isCompleted && 'step-completed',
                  isActive && 'step-active scale-110 shadow-lg',
                  !isCompleted && !isActive && 'step-pending'
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-medium transition-colors',
                  isActive ? 'text-coffee-900' : 'text-coffee-400',
                  'hidden sm:block'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
