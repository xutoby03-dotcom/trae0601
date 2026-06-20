import { memo, useCallback } from 'react';
import { Star, Download, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { calculateOverallScore } from '../utils/audio';

export const FavoritesList = memo(function FavoritesList() {
  const takes = useStore((s) => s.takes);
  const setSelectedTake = useStore((s) => s.setSelectedTake);
  const setShowExportModal = useStore((s) => s.setShowExportModal);
  const starredTakes = takes.filter((t) => t.starred);

  const handleSelect = useCallback(
    (id: string) => {
      setSelectedTake(id);
    },
    [setSelectedTake]
  );

  if (starredTakes.length === 0) return null;

  return (
    <div className="bg-studio-panel border-b border-studio-border">
      <div className="container px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-accent-amber fill-accent-amber" />
            <h2 className="font-display font-semibold text-studio-text">收藏候选</h2>
            <span className="text-xs text-studio-textDim">({starredTakes.length})</span>
          </div>
          {starredTakes.length >= 1 && (
            <button
              onClick={() => setShowExportModal(true, starredTakes[0].id)}
              className="btn-primary text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              生成推荐报告
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {starredTakes.map((take) => {
            const score = calculateOverallScore(take.annotations);
            return (
              <button
                key={take.id}
                onClick={() => handleSelect(take.id)}
                className="flex-shrink-0 min-w-[240px] bg-studio-card border border-accent-amber/30 rounded-lg p-3 hover:bg-studio-hover hover:border-accent-amber/50 transition-all group text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-studio-text truncate">{take.name}</h4>
                    <p className="text-xs text-studio-textDim font-mono truncate">
                      {take.microphone.split(' ')[0]} + {take.preamp.split(' ')[0]}
                    </p>
                  </div>
                  <div
                    className={`text-sm font-bold px-2 py-0.5 rounded ml-2 ${
                      score >= 8
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : score >= 6
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {score}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-studio-textDim">
                  <span className="text-mono">{take.distance}cm</span>
                  <span>·</span>
                  <span className="text-mono">{take.gain > 0 ? '+' : ''}{take.gain}dB</span>
                  <span>·</span>
                  <span className="text-mono truncate">{take.roomPosition.split(' ')[0]}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
