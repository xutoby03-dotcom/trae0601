import { CHECKLIST_GROUPS } from '@/data/checklistItems';
import { Camera, Eye, Aperture, Focus, Target, Image, Check } from 'lucide-react';

const iconMap: Record<string, typeof Camera> = {
  camera: Camera,
  eye: Eye,
  aperture: Aperture,
  focus: Focus,
  target: Target,
  image: Image,
};

interface Props {
  currentStep: number;
  onStepClick?: (index: number) => void;
  completedSteps?: boolean[];
}

export default function StepIndicator({ currentStep, onStepClick, completedSteps }: Props) {
  return (
    <div className="w-full overflow-x-auto scrollbar-thin pb-2">
      <div className="flex items-center min-w-max gap-0">
        {CHECKLIST_GROUPS.map((group, index) => {
          const Icon = iconMap[group.icon] || Camera;
          const isActive = index === currentStep;
          const isCompleted = completedSteps?.[index];
          const isPast = completedSteps ? index < currentStep || completedSteps[index] : index < currentStep;

          return (
            <div key={group.category} className="flex items-center">
              <button
                onClick={() => onStepClick?.(index)}
                className={`group flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all
                  ${isActive ? 'scale-100' : 'opacity-80 hover:opacity-100'}`}
              >
                <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300
                  ${isActive
                    ? 'bg-gradient-to-br from-copper-500 to-copper-600 text-ink-950 shadow-glow scale-105'
                    : isPast || isCompleted
                      ? 'bg-jade-500/20 text-jade-400 border border-jade-500/30'
                      : 'bg-ink-800 text-gray-400 border border-ink-700'
                  }`}>
                  {isCompleted ? (
                    <Check className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  )}
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-copper-500/20 blur-md -z-10" />
                  )}
                </div>
                <div className="text-center">
                  <p className={`text-[11px] font-semibold leading-tight whitespace-nowrap
                    ${isActive ? 'text-copper-400' : isPast ? 'text-jade-400' : 'text-gray-500'}`}>
                    {group.title}
                  </p>
                  <p className="text-[9px] text-gray-600 leading-tight whitespace-nowrap">
                    {group.subtitle}
                  </p>
                </div>
              </button>
              {index < CHECKLIST_GROUPS.length - 1 && (
                <div className={`step-connector -mt-4
                  ${isPast || completedSteps?.[index] ? 'bg-jade-500/50' : 'bg-ink-700'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
