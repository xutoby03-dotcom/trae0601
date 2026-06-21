import { useState, useMemo } from 'react';
import { History, Plus, Archive, CheckCircle, Droplets, Sun, CloudSun, Filter } from 'lucide-react';
import type { Trial } from '@/types';
import { fiberDirectionLabels } from '@/types';
import { cn } from '@/lib/utils';

type FilterKey = 'all' | 'missing_notes' | 'selected' | 'archived';

interface FilterOption {
  key: FilterKey;
  label: string;
  icon: React.ReactNode;
}

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: '全部', icon: null },
  { key: 'missing_notes', label: '小记有空', icon: <Droplets className="w-3.5 h-3.5" /> },
  { key: 'selected', label: '已入选', icon: <CheckCircle className="w-3.5 h-3.5" /> },
  { key: 'archived', label: '已归档', icon: <Archive className="w-3.5 h-3.5" /> },
];

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

function hasMissingNotes(trial: Trial): boolean {
  return trial.photos.some((photo) => !photo.note || photo.note.trim().length === 0);
}

function matchesFilter(trial: Trial, filter: FilterKey): boolean {
  switch (filter) {
    case 'missing_notes':
      return hasMissingNotes(trial);
    case 'selected':
      return trial.isSelected && !trial.isArchived;
    case 'archived':
      return trial.isArchived;
    default:
      return true;
  }
}

function getFilterCount(trials: Trial[], filter: FilterKey): number {
  if (filter === 'all') return trials.length;
  return trials.filter((t) => matchesFilter(t, filter)).length;
}

export default function TrialVersionList({
  trials,
  currentTrialId,
  onSelect,
  onCreateNew,
}: TrialVersionListProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const sortedTrials = useMemo(
    () => [...trials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [trials]
  );

  const filteredTrials = useMemo(
    () => sortedTrials.filter((t) => matchesFilter(t, activeFilter)),
    [sortedTrials, activeFilter]
  );

  const filterCounts = useMemo(() => {
    const counts: Record<FilterKey, number> = {
      all: trials.length,
      missing_notes: 0,
      selected: 0,
      archived: 0,
    };
    trials.forEach((t) => {
      if (hasMissingNotes(t)) counts.missing_notes++;
      if (t.isSelected && !t.isArchived) counts.selected++;
      if (t.isArchived) counts.archived++;
    });
    return counts;
  }, [trials]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <History className="w-6 h-6 text-ochre-500" />
          <h3 className="text-lg font-hei font-bold text-ink-900">试配版本</h3>
        </div>
        <span className="text-sm text-ink-700 font-hei">
          {activeFilter === 'all'
            ? `共 ${trials.length} 个版本`
            : `筛选 ${filteredTrials.length} / ${trials.length}`
          }
        </span>
      </div>

      {/* 筛选栏 */}
      <div className="flex items-center gap-1.5 p-1 bg-parchment-200/80 rounded-lg">
        <Filter className="w-4 h-4 text-ink-700/50 ml-2 flex-shrink-0" />
        {FILTER_OPTIONS.map((opt) => {
          const count = filterCounts[opt.key];
          const isActive = activeFilter === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => setActiveFilter(opt.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-hei font-medium',
                'transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-parchment-50 text-ink-900 shadow-sm'
                  : 'text-ink-700/70 hover:text-ink-900 hover:bg-parchment-100'
              )}
            >
              {opt.icon}
              <span>{opt.label}</span>
              <span className={cn(
                'ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-hei',
                isActive
                  ? 'bg-ochre-500/15 text-ochre-600'
                  : 'bg-parchment-300/60 text-ink-700/60'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 版本列表 */}
      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-parchment-300" />

        <div className="space-y-4">
          {filteredTrials.length === 0 && (
            <div className="pl-14 py-8 text-center">
              <p className="text-ink-700/50 font-hei text-sm">此筛选条件下暂无版本</p>
            </div>
          )}

          {filteredTrials.map((trial) => {
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

                      {/* 三态小记完成状态 */}
                      <div className="flex flex-wrap gap-1.5">
                        {trial.photos.map((photo) => {
                          const hasNote = photo.note && photo.note.trim().length > 0;
                          const iconMap: Record<string, React.ReactNode> = {
                            wet: <Droplets className="w-3 h-3" />,
                            half_dry: <CloudSun className="w-3 h-3" />,
                            full_dry: <Sun className="w-3 h-3" />,
                          };
                          const labelMap: Record<string, string> = {
                            wet: '湿',
                            half_dry: '半干',
                            full_dry: '全干',
                          };
                          return (
                            <span
                              key={photo.state}
                              className={cn(
                                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-hei transition-colors',
                                hasNote
                                  ? 'bg-teal-500/15 text-teal-600'
                                  : 'bg-ochre-500/10 text-ochre-600'
                              )}
                              title={hasNote ? photo.note : `还未记录${labelMap[photo.state]}观察小记`}
                            >
                              {iconMap[photo.state]}
                              {labelMap[photo.state]}
                              {hasNote ? (
                                <CheckCircle className="w-2.5 h-2.5 ml-0.5" />
                              ) : (
                                <span className="w-2.5 h-2.5 ml-0.5 rounded-full bg-current opacity-60" />
                              )}
                            </span>
                          );
                        })}
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
