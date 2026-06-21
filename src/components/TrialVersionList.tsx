import { History, Plus, Archive, CheckCircle } from 'lucide-react';
import type { Trial } from '@/types';
import { fiberDirectionLabels } from '@/types';
import { cn } from '@/lib/utils';

interface TrialVersionListProps {
  trials: Trial[];
  currentTrialId: string | null;
  onSelect: (trialId: string) => void;
  onCreateNew: () => void;
}

const evaluationKeys = [
  'colorDifference',
  'edgeWarping',
  'gluePenetration',
  'touchDifference',
] as const;

function getAverageScore(trial: Trial): string {
  const { evaluation } = trial;
  const sum = evaluationKeys.reduce((acc, key) => acc + evaluation[key], 0);
  return (sum / evaluationKeys.length).toFixed(1);
}

function getFullDryPhoto(trial: Trial) {
  return trial.photos.find((photo) => photo.state === 'full_dry');
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function TrialVersionList({
  trials,
  currentTrialId,
  onSelect,
  onCreateNew,
}: TrialVersionListProps) {
  const sortedTrials = [...trials].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-ochre-500" />
          <h3 className="text-lg font-hei font-bold text-ink-900">试配版本</h3>
        </div>
        <span className="text-sm text-ink-700 font-hei">
          共 {trials.length} 个版本
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-parchment-300" />

        <div className="space-y-4">
          {sortedTrials.map((trial) => {
            const isSelected = trial.id === currentTrialId;
            const averageScore = getAverageScore(trial);
            const fullDryPhoto = getFullDryPhoto(trial);

            return (
              <div key={trial.id} className="relative pl-14">
                <div
                  className={cn(
                    'absolute left-4 w-5 h-5 rounded-full border-4 z-10',
                    isSelected
                      ? 'bg-ochre-500 border-parchment-100'
                      : 'bg-parchment-100 border-parchment-400'
                  )}
                />

                <button
                  type="button"
                  onClick={() => onSelect(trial.id)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl transition-all duration-300',
                    'bg-parchment-100 shadow-card hover:shadow-lg',
                    'relative overflow-hidden',
                    isSelected && 'border-2 border-ochre-500',
                    trial.isArchived && 'ring-2 ring-teal-500/30 bg-teal-500/5'
                  )}
                >
                  {trial.isArchived && (
                    <div className="absolute right-4 top-4 z-10">
                      <div className="px-3 py-1 bg-teal-500 text-white text-xs font-hei font-bold rounded-full flex items-center gap-1">
                        <Archive className="w-3 h-3" />
                        已归档
                      </div>
                    </div>
                  )}

                  {trial.isSelected && !trial.isArchived && (
                    <div className="absolute right-4 top-4 z-10">
                      <div
                        className={cn(
                          'px-4 py-1 border-2 border-red-600 text-red-600',
                          'font-hei font-bold text-lg',
                          'rounded-md bg-white/80',
                          'animate-stamp-in'
                        )}
                        style={{ transform: 'rotate(-8deg)' }}
                      >
                        已入选
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4">
                    {fullDryPhoto && fullDryPhoto.dataUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-parchment-200">
                        <img
                          src={fullDryPhoto.dataUrl}
                          alt="全干照片"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {(!fullDryPhoto || !fullDryPhoto.dataUrl) && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-parchment-200 flex items-center justify-center">
                        <History className="w-6 h-6 text-parchment-400" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-teal-500 text-white rounded-full font-hei font-bold text-sm">
                          版{trial.version}
                        </div>
                        <span className="text-xs text-ink-700 font-hei">
                          {formatDate(trial.createdAt)}
                        </span>
                        <div className="ml-auto flex items-center gap-1 px-3 py-1 bg-ochre-500 text-white rounded-full">
                          <span className="font-hei font-bold">{averageScore}</span>
                          <span className="text-xs opacity-80">分</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className={cn(
                          'px-2 py-1 rounded-md font-hei',
                          'bg-parchment-200 text-ink-700'
                        )}>
                          厚度: {trial.paperThickness}mm
                        </span>
                        <span className={cn(
                          'px-2 py-1 rounded-md font-hei',
                          'bg-parchment-200 text-ink-700'
                        )}>
                          纤维: {fiberDirectionLabels[trial.fiberDirection]}
                        </span>
                        <span className={cn(
                          'px-2 py-1 rounded-md font-hei',
                          'bg-parchment-200 text-ink-700'
                        )}>
                          浓度: {trial.pasteConcentration}%
                        </span>
                      </div>

                      {trial.evaluation.remarks && (
                        <p className="text-xs text-ink-700 font-hei truncate">
                          {trial.evaluation.remarks}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateNew}
        className={cn(
          'w-full py-4 rounded-xl font-hei font-medium',
          'bg-parchment-100 border-2 border-dashed border-parchment-300',
          'text-ink-700 hover:text-ochre-600 hover:border-ochre-400',
          'transition-all duration-300',
          'flex items-center justify-center gap-2'
        )}
      >
        <Plus className="w-5 h-5" />
        新增试配
      </button>
    </div>
  );
}
