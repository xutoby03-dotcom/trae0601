import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { WaterSample, TastingScore, BrewingParam } from '@/types';
import { getBlindCodeColor, formatTime, calculateAverageScore } from '@/utils/helpers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/common/Card';
import { cn } from '@/lib/utils';

interface RevealCardProps {
  sample: WaterSample;
  score?: TastingScore;
  brewingParam?: BrewingParam;
  isRevealed: boolean;
  rank?: number;
}

export function RevealCard({ sample, score, brewingParam, isRevealed, rank }: RevealCardProps) {
  const [showName, setShowName] = useState(isRevealed);
  const avgScore = score ? calculateAverageScore(score) : 0;

  const getRankBadge = () => {
    if (!rank) return null;
    const colors = [
      'bg-yellow-500 text-yellow-50',
      'bg-gray-400 text-gray-50',
      'bg-amber-700 text-amber-50',
    ];
    const labels = ['第一名', '第二名', '第三名'];
    return (
      <div className={cn(
        'absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm shadow-lg transform rotate-12',
        colors[rank - 1] || colors[2]
      )}>
        {labels[rank - 1]}
      </div>
    );
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-500',
        isRevealed && showName ? 'animate-flip' : ''
      )}
    >
      {getRankBadge()}

      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-white text-2xl shadow-md"
              style={{ backgroundColor: getBlindCodeColor(sample.blindCode) }}
            >
              {sample.blindCode}
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                {isRevealed ? (
                  <>
                    {showName ? (
                      <span className="animate-fade-in">{sample.realName}</span>
                    ) : (
                      <span className="blur-sm select-none">{sample.realName}</span>
                    )}
                    <button
                      onClick={() => setShowName(!showName)}
                      className="p-1 rounded-lg hover:bg-coffee-100 transition-colors"
                    >
                      {showName ? (
                        <EyeOff className="w-4 h-4 text-coffee-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-coffee-500" />
                      )}
                    </button>
                  </>
                ) : (
                  <span>水样 {sample.blindCode}</span>
                )}
              </CardTitle>
              <CardDescription>
                盲编号 {sample.blindCode}
                {score && (
                  <span className="ml-2">
                    · 综合评分 <span className="font-bold text-coffee-700">{avgScore.toFixed(1)}</span>
                  </span>
                )}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-coffee-50 rounded-lg">
            <p className="text-xs text-coffee-500">TDS</p>
            <p className="text-lg font-bold text-coffee-800">{sample.tds}</p>
            <p className="text-xs text-coffee-400">mg/L</p>
          </div>
          <div className="text-center p-3 bg-coffee-50 rounded-lg">
            <p className="text-xs text-coffee-500">硬度</p>
            <p className="text-lg font-bold text-coffee-800">{sample.hardness}</p>
            <p className="text-xs text-coffee-400">mg/L</p>
          </div>
          <div className="text-center p-3 bg-coffee-50 rounded-lg">
            <p className="text-xs text-coffee-500">pH</p>
            <p className="text-lg font-bold text-coffee-800">{sample.ph}</p>
            <p className="text-xs text-coffee-400">—</p>
          </div>
        </div>

        {sample.mineralNotes && (
          <div className="p-3 bg-amber-50 rounded-lg">
            <p className="text-xs text-amber-700 font-medium mb-1">矿物质备注</p>
            <p className="text-sm text-amber-800">{sample.mineralNotes}</p>
          </div>
        )}

        {brewingParam && (
          <div className="border-t border-coffee-100 pt-4">
            <p className="text-sm font-semibold text-coffee-800 mb-2">冲煮参数</p>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-coffee-500">研磨度</span>
                <p className="font-semibold text-coffee-800">{brewingParam.grindSize}</p>
              </div>
              <div>
                <span className="text-coffee-500">水温</span>
                <p className="font-semibold text-coffee-800">{brewingParam.waterTemp}°C</p>
              </div>
              <div>
                <span className="text-coffee-500">时间</span>
                <p className="font-semibold text-coffee-800">{formatTime(brewingParam.brewTime)}</p>
              </div>
            </div>
            <p className="text-xs text-coffee-500 mt-2 text-center">
              {brewingParam.coffeeDose}g → {brewingParam.waterAmount}ml · {brewingParam.pourMethod}
            </p>
          </div>
        )}

        {score && score.flavorTags.length > 0 && (
          <div className="border-t border-coffee-100 pt-4">
            <p className="text-sm font-semibold text-coffee-800 mb-2">风味标签</p>
            <div className="flex flex-wrap gap-1">
              {score.flavorTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-coffee-100 text-coffee-700 rounded-full text-xs font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {score && score.notes && (
          <div className="border-t border-coffee-100 pt-4">
            <p className="text-sm font-semibold text-coffee-800 mb-2">杯测笔记</p>
            <p className="text-sm text-coffee-600 leading-relaxed">{score.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
