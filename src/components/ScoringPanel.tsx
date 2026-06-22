import { Star, Hand, Navigation2, Route, Smile, Info } from 'lucide-react';
import { usePracticeStore } from '@/store/practiceStore';
import type { ScoreDimension } from '@/types';
import { DIMENSION_LABELS } from '@/types';
import { calculateOverallScore, getScoreLevel } from '@/utils';

const dimensionIcons = {
  handShape: Hand,
  orientation: Navigation2,
  trajectory: Route,
  expression: Smile,
};

const dimensionColors = {
  handShape: { from: 'from-rose-500', to: 'to-rose-400', text: 'text-rose-500', bg: 'bg-rose-50' },
  orientation: { from: 'from-blue-500', to: 'to-blue-400', text: 'text-blue-500', bg: 'bg-blue-50' },
  trajectory: { from: 'from-purple-500', to: 'to-purple-400', text: 'text-purple-500', bg: 'bg-purple-50' },
  expression: { from: 'from-amber-500', to: 'to-amber-400', text: 'text-amber-500', bg: 'bg-amber-50' },
};

const dimensionWeights: Record<ScoreDimension, number> = {
  handShape: 35,
  orientation: 25,
  trajectory: 25,
  expression: 15,
};

interface Props {
  standardPoints?: {
    handShape: string;
    orientation: string;
    trajectory: string;
    expression: string;
  };
}

export default function ScoringPanel({ standardPoints }: Props) {
  const { scores, setScore, setComment, currentSignWordId } = usePracticeStore();

  const overallScore = calculateOverallScore(scores);
  const scoreLevel = getScoreLevel(overallScore);

  const dimensions: ScoreDimension[] = ['handShape', 'orientation', 'trajectory', 'expression'];

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title mb-0">
          <Star className="w-5 h-5 text-primary-600" />
          多维度评分
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl ${scoreLevel.bgColor}`}>
          <span className={`text-xl font-bold font-mono ${scoreLevel.color}`}>
            {overallScore.toFixed(1)}
          </span>
          <span className={`text-xs font-medium ${scoreLevel.color}`}>
            {scoreLevel.label}
          </span>
        </div>
      </div>

      {!currentSignWordId ? (
        <div className="text-center py-8 text-gray-400">
          <Star className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">请先选择词条开始评分</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-2 mb-4">
            {dimensions.map((dim) => {
              const Icon = dimensionIcons[dim];
              const colors = dimensionColors[dim];
              return (
                <div key={dim} className={`p-2 rounded-xl ${colors.bg} text-center`}>
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${colors.text}`} />
                  <div className={`text-lg font-bold font-mono ${colors.text}`}>
                    {scores[dim]}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {DIMENSION_LABELS[dim]}
                    <span className="text-gray-300 ml-0.5">({dimensionWeights[dim]}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-5">
            {dimensions.map((dim) => {
              const Icon = dimensionIcons[dim];
              const colors = dimensionColors[dim];
              const score = scores[dim];
              const comment = scores.comments[dim];

              return (
                <div key={dim} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center`}>
                        <Icon className={`w-4 h-4 ${colors.text}`} />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-700">
                          {DIMENSION_LABELS[dim]}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          权重 {dimensionWeights[dim]}%
                        </div>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold font-mono ${colors.text}`}>
                      {score}
                    </span>
                  </div>

                  <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute inset-y-0 left-0 bg-gradient-to-r ${colors.from} ${colors.to} rounded-full transition-all duration-300`}
                      style={{ width: `${score}%` }}
                    />
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={score}
                    onChange={(e) => setScore(dim, parseInt(e.target.value))}
                    className="score-slider w-full"
                  />

                  {standardPoints?.[dim] && (
                    <div className="flex items-start gap-1.5 text-[11px] text-gray-500 bg-gray-50 rounded-lg px-2 py-1.5 leading-relaxed">
                      <Info className="w-3 h-3 flex-shrink-0 mt-0.5 text-primary-400" />
                      <span className="text-gray-600">标准：{standardPoints[dim]}</span>
                    </div>
                  )}

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(dim, e.target.value)}
                    placeholder={`输入${DIMENSION_LABELS[dim]}点评...`}
                    className="textarea-field text-sm py-2 text-xs"
                    rows={2}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
