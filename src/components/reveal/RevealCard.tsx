import { useState } from 'react';
import { Eye, EyeOff, Lightbulb } from 'lucide-react';
import type { WaterSample, TastingScore, BrewingParam } from '@/types';
import { getBlindCodeColor, formatTime, calculateAverageScore } from '@/utils/helpers';
import { generateSampleSuggestion } from '@/utils/suggestions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { cn } from '@/lib/utils';

interface RevealCardProps {
  sample: WaterSample;
  score?: TastingScore;
  brewingParam?: BrewingParam;
  isRevealed: boolean;
  rank?: number;
  badgeMode?: 'rank' | 'blindCode';
}

const DIMENSIONS = [
  { key: 'acidity' as const, label: '酸质', color: '#2E7D32', bg: 'bg-green-100', text: 'text-green-700' },
  { key: 'sweetness' as const, label: '甜感', color: '#F57F17', bg: 'bg-amber-100', text: 'text-amber-700' },
  { key: 'bitterness' as const, label: '苦感', color: '#424242', bg: 'bg-gray-100', text: 'text-gray-700' },
  { key: 'aftertaste' as const, label: '余韵', color: '#6A1B9A', bg: 'bg-purple-100', text: 'text-purple-700' },
  { key: 'cleanliness' as const, label: '干净度', color: '#0277BD', bg: 'bg-blue-100', text: 'text-blue-700' },
];

export function RevealCard({ sample, score, brewingParam, isRevealed, rank, badgeMode = 'rank' }: RevealCardProps) {
  const [showName, setShowName] = useState(isRevealed);
  const avgScore = score ? calculateAverageScore(score) : 0;

  const getRankBadge = () => {
    if (badgeMode === 'blindCode') {
      return (
        <div
          className="absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-lg transform rotate-12"
          style={{ backgroundColor: getBlindCodeColor(sample.blindCode) }}
        >
          {sample.blindCode}
        </div>
      );
    }

    if (!rank) return null;
    const colors = [
      'bg-yellow-500 text-yellow-50',
      'bg-gray-400 text-gray-50',
      'bg-amber-700 text-amber-50',
    ];
    const labels = ['第 1', '第 2', '第 3'];
    return (
      <div className={cn(
        'absolute -top-3 -right-3 px-3 py-1 rounded-full font-bold text-sm shadow-lg',
        colors[rank - 1] || colors[2]
      )}>
        {labels[rank - 1]}
      </div>
    );
  };

  const sampleSuggestion = score ? generateSampleSuggestion(sample, score, brewingParam) : '';

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-500',
        isRevealed && showName ? 'animate-flip' : ''
      )}
    >
      {getRankBadge()}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-md"
              style={{ backgroundColor: getBlindCodeColor(sample.blindCode) }}
            >
              {sample.blindCode}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                {isRevealed ? (
                  <>
                    {showName ? (
                      <span className="animate-fade-in truncate">{sample.realName}</span>
                    ) : (
                      <span className="blur-sm select-none">{sample.realName}</span>
                    )}
                    <button
                      onClick={() => setShowName(!showName)}
                      className="p-1 rounded-lg hover:bg-coffee-100 transition-colors flex-shrink-0"
                    >
                      {showName ? (
                        <EyeOff className="w-3.5 h-3.5 text-coffee-500" />
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-coffee-500" />
                      )}
                    </button>
                  </>
                ) : (
                  <span>水样 {sample.blindCode}</span>
                )}
              </CardTitle>
              {score && (
                <p className="text-xs text-coffee-500 mt-0.5">
                  综合 <span className="font-bold text-coffee-700">{avgScore.toFixed(1)}</span>
                  {score.flavorTags.length > 0 && (
                    <span className="ml-2">{score.flavorTags.slice(0, 3).join(' · ')}</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2.5 bg-coffee-50 rounded-lg">
            <p className="text-[10px] text-coffee-500 uppercase tracking-wide">TDS</p>
            <p className="text-lg font-bold text-coffee-800 leading-tight">{sample.tds}</p>
            <p className="text-[10px] text-coffee-400">mg/L</p>
          </div>
          <div className="text-center p-2.5 bg-coffee-50 rounded-lg">
            <p className="text-[10px] text-coffee-500 uppercase tracking-wide">硬度</p>
            <p className="text-lg font-bold text-coffee-800 leading-tight">{sample.hardness}</p>
            <p className="text-[10px] text-coffee-400">mg/L</p>
          </div>
          <div className="text-center p-2.5 bg-coffee-50 rounded-lg">
            <p className="text-[10px] text-coffee-500 uppercase tracking-wide">pH</p>
            <p className="text-lg font-bold text-coffee-800 leading-tight">{sample.ph}</p>
            <p className="text-[10px] text-coffee-400">—</p>
          </div>
        </div>

        {score && (
          <div className="space-y-2">
            {DIMENSIONS.map((dim) => {
              const val = score[dim.key];
              return (
                <div key={dim.key} className="flex items-center gap-2">
                  <span className="w-12 text-xs font-medium text-coffee-600 flex-shrink-0">{dim.label}</span>
                  <div className="flex-1 h-2.5 bg-coffee-50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${val * 10}%`,
                        backgroundColor: dim.color,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs font-bold" style={{ color: dim.color }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {brewingParam && (
          <div className="flex items-center gap-3 text-xs text-coffee-500 py-1">
            <span>{brewingParam.grindSize} 刻度</span>
            <span className="text-coffee-200">|</span>
            <span>{brewingParam.waterTemp}°C</span>
            <span className="text-coffee-200">|</span>
            <span>{formatTime(brewingParam.brewTime)}</span>
            <span className="text-coffee-200">|</span>
            <span>{brewingParam.coffeeDose}g→{brewingParam.waterAmount}ml</span>
          </div>
        )}

        {score && sampleSuggestion && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-amber-800 mb-0.5">下次冲煮建议</p>
                <p className="text-xs text-amber-700 leading-relaxed">{sampleSuggestion}</p>
              </div>
            </div>
          </div>
        )}

        {score && score.flavorTags.length > 3 && (
          <div className="flex flex-wrap gap-1">
            {score.flavorTags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-coffee-100 text-coffee-700 rounded-full text-[10px] font-medium"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {score && score.notes && (
          <p className="text-xs text-coffee-500 italic leading-relaxed border-t border-coffee-100 pt-3">
            {score.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
