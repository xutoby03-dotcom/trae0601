import { Check } from 'lucide-react';
import type { WashingStep } from '@/types';

interface StepProgressProps {
  currentStep: WashingStep;
  steps: { key: WashingStep; label: string }[];
}

const getStepProgress = (step: string): number => {
  const progress: Record<string, number> = {
    idle: 0,
    removal: 25,
    wash: 50,
    dry: 75,
    install: 90,
    complete: 100,
  };
  return progress[step] || 0;
};

export default function StepProgress({ currentStep, steps }: StepProgressProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);
  const progress = getStepProgress(currentStep);

  return (
    <div className="mb-8">
      <div className="relative mb-4">
        <div className="progress-bar h-3">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="flex justify-between">
        {steps.map((step, index) => {
          const isActive = index <= currentIndex;
          const isCurrent = index === currentIndex;

          return (
            <div key={step.key} className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-primary text-white shadow-soft'
                    : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-100 scale-110' : ''}`}
              >
                {index < currentIndex ? (
                  <Check size={18} />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium text-center ${
                  isActive ? 'text-primary-700' : 'text-gray-400'
                }`}
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
