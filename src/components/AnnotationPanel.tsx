import { memo, useCallback } from 'react';
import { X, Waves, Wind, Zap, VolumeX, Heart, FileText, Download, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import {
  ANNOTATION_LABELS,
  ANNOTATION_DESCRIPTIONS,
  ANNOTATION_LOW_BETTER,
  type AnnotationKey,
} from '../types';
import { calculateOverallScore } from '../utils/audio';

const ANNOTATION_COLORS: Record<AnnotationKey, string> = {
  sibilance: 'bg-annotation-sibilance',
  nasality: 'bg-annotation-nasality',
  plosives: 'bg-annotation-plosives',
  noiseFloor: 'bg-annotation-noiseFloor',
  emotion: 'bg-annotation-emotion',
};

const ANNOTATION_ICONS: Record<AnnotationKey, React.ReactNode> = {
  sibilance: <Waves className="w-4 h-4" />,
  nasality: <Wind className="w-4 h-4" />,
  plosives: <Zap className="w-4 h-4" />,
  noiseFloor: <VolumeX className="w-4 h-4" />,
  emotion: <Heart className="w-4 h-4" />,
};

export const AnnotationPanel = memo(function AnnotationPanel() {
  const selectedTakeId = useStore((s) => s.selectedTakeId);
  const setSelectedTake = useStore((s) => s.setSelectedTake);
  const takes = useStore((s) => s.takes);
  const updateAnnotation = useStore((s) => s.updateAnnotation);
  const updateNotes = useStore((s) => s.updateNotes);
  const toggleStar = useStore((s) => s.toggleStar);
  const setShowExportModal = useStore((s) => s.setShowExportModal);

  const take = takes.find((t) => t.id === selectedTakeId);

  const handleClose = useCallback(() => {
    setSelectedTake(null);
  }, [setSelectedTake]);

  const handleAnnotationChange = useCallback(
    (key: AnnotationKey, value: number) => {
      if (take) {
        updateAnnotation(take.id, key, value);
      }
    },
    [take, updateAnnotation]
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (take) {
        updateNotes(take.id, e.target.value);
      }
    },
    [take, updateNotes]
  );

  if (!take) return null;

  const overallScore = calculateOverallScore(take.annotations);
  const annotationKeys = Object.keys(ANNOTATION_LABELS) as AnnotationKey[];

  return (
    <div className="fixed top-0 right-0 h-full w-full md:w-96 bg-studio-panel border-l border-studio-border z-50 animate-slide-in-right shadow-2xl flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-studio-border">
        <div className="flex-1 min-w-0">
          <h2 className="font-display font-semibold text-lg text-studio-text truncate">{take.name}</h2>
          <p className="text-xs text-studio-textDim font-mono mt-0.5">
            {take.microphone} + {take.preamp}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStar(take.id)}
            className="p-2 rounded-full hover:bg-studio-hover transition-colors"
          >
            <Star
              className={`w-5 h-5 ${
                take.starred
                  ? 'text-accent-amber fill-accent-amber'
                  : 'text-studio-textDim'
              }`}
            />
          </button>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-studio-hover transition-colors"
          >
            <X className="w-5 h-5 text-studio-textDim" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="flex items-center justify-center py-4 bg-gradient-to-br from-studio-card to-studio-panel rounded-lg">
          <div className="text-center">
            <p className="label-dim mb-1">综合评分</p>
            <div
              className={`text-5xl font-display font-bold ${
                overallScore >= 8
                  ? 'text-emerald-400'
                  : overallScore >= 6
                    ? 'text-yellow-400'
                    : 'text-red-400'
              }`}
            >
              {overallScore}
            </div>
            <p className="text-xs text-studio-textDim mt-1">/ 10</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display font-semibold text-studio-text flex items-center gap-2">
            <Waves className="w-4 h-4 text-accent-amber" />
            音质标注
          </h3>

          <div className="space-y-4">
            {annotationKeys.map((key) => {
              const value = take.annotations[key];
              const lowBetter = ANNOTATION_LOW_BETTER[key];
              const isGood = lowBetter ? value <= 3 : value >= 7;
              const isBad = lowBetter ? value >= 7 : value <= 3;

              return (
                <div key={key} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-studio-textDim">{ANNOTATION_ICONS[key]}</span>
                      <span className="text-sm font-medium text-studio-text">{ANNOTATION_LABELS[key]}</span>
                    </div>
                    <span
                      className={`text-sm font-mono font-bold px-2 py-0.5 rounded ${
                        isGood
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isBad
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {value}/10
                    </span>
                  </div>
                  <p className="text-xs text-studio-textDim">{ANNOTATION_DESCRIPTIONS[key]}</p>
                  <input
                    type="range"
                    min={0}
                    max={10}
                    step={1}
                    value={value}
                    onChange={(e) => handleAnnotationChange(key, parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="h-1.5 bg-studio-border rounded-full overflow-hidden">
                    <div
                      className={`h-full ${ANNOTATION_COLORS[key]} transition-all duration-200`}
                      style={{ width: `${value * 10}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-display font-semibold text-studio-text flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent-amber" />
            备注
          </h3>
          <textarea
            value={take.notes}
            onChange={handleNotesChange}
            placeholder="记录你的听感和想法..."
            className="w-full h-24 bg-studio-card border border-studio-border rounded-lg p-3 text-sm text-studio-text placeholder-studio-textDim resize-none focus:outline-none focus:border-accent-amber/50 transition-colors"
          />
        </div>

        <div className="space-y-2 p-3 bg-studio-card rounded-lg border border-studio-border">
          <h4 className="text-sm font-medium text-studio-text">设备参数</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-studio-textDim">麦克风</span>
              <span className="font-mono">{take.microphone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-textDim">前级</span>
              <span className="font-mono">{take.preamp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-textDim">距离</span>
              <span className="font-mono">{take.distance} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-textDim">增益</span>
              <span className="font-mono">{take.gain > 0 ? '+' : ''}{take.gain} dB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-textDim">位置</span>
              <span className="font-mono">{take.roomPosition}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-studio-textDim">防喷罩</span>
              <span className={`font-mono ${take.popFilter ? 'text-emerald-400' : 'text-red-400'}`}>
                {take.popFilter ? '开启' : '关闭'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-studio-border">
        <button
          onClick={() => setShowExportModal(true, take.id)}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <Download className="w-4 h-4" />
          生成推荐链路报告
        </button>
      </div>
    </div>
  );
});
