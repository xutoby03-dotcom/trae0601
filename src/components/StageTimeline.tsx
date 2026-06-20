import { Check, Clock } from 'lucide-react';
import type { Stage } from '@/types';
import { STAGE_NAMES, STAGE_COLORS, STAGE_ORDER } from '@/types';
import { formatDateTime } from '@/utils/time';

interface StageTimelineProps {
  stages: Stage[];
  onStageComplete?: () => void;
  canAdvance: boolean;
}

export const StageTimeline = ({ stages, onStageComplete, canAdvance }: StageTimelineProps) => {
  const sortedStages = STAGE_ORDER.map(
    (stageName) => stages.find((s) => s.name === stageName)!
  ).filter(Boolean);

  return (
    <div className="bg-studio-card rounded-xl border border-studio-border p-6">
      <h3 className="font-display text-lg font-semibold text-studio-text mb-6">涂装进度</h3>
      
      <div className="relative">
        <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-studio-border" />
        
        <div className="space-y-4">
          {sortedStages.map((stage, index) => {
            const isActive = stage.status === 'active';
            const isCompleted = stage.status === 'completed';
            const isPending = stage.status === 'pending';
            const color = STAGE_COLORS[stage.name];

            return (
              <div key={stage.id} className="relative flex items-start gap-4 pl-12">
                <div
                  className={`absolute left-0 w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                    isActive ? 'scale-110 shadow-lg' : ''
                  }`}
                  style={{
                    backgroundColor: isCompleted || isActive ? color : '#3A3A42',
                    borderColor: isActive ? color : '#1A1A1E',
                    boxShadow: isActive ? `0 0 20px ${color}40` : 'none',
                  }}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : isActive ? (
                    <Clock className="w-5 h-5 text-white animate-pulse" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-studio-muted" />
                  )}
                </div>

                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <h4
                      className={`font-medium transition-colors ${
                        isCompleted || isActive ? 'text-studio-text' : 'text-studio-muted'
                      }`}
                    >
                      {STAGE_NAMES[stage.name]}
                    </h4>
                    {isActive && canAdvance && (
                      <button
                        onClick={onStageComplete}
                        className="px-3 py-1 bg-studio-copper hover:bg-studio-copperDark text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        标记完成
                      </button>
                    )}
                  </div>
                  
                  {stage.startedAt && (
                    <p className="text-xs text-studio-muted mt-1">
                      开始于 {formatDateTime(stage.startedAt)}
                      {stage.completedAt && ` · 完成于 ${formatDateTime(stage.completedAt)}`}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
