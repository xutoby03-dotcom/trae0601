import { useMemo } from 'react';
import { Lightbulb } from 'lucide-react';
import { aggregateSuggestions } from '@/utils/statistics';

interface SuggestionWallProps {
  sampleId?: string;
}

const BG_COLORS = [
  'bg-cream-100',
  'bg-champagne-100',
  'bg-moss-50',
];

const ROTATIONS = ['-rotate-1', 'rotate-0.5', '-rotate-0.5', 'rotate-1', 'rotate-0', '-rotate-1.5', 'rotate-1.5'];

function getFontSize(count: number, max: number): string {
  if (max === 0) return 'text-sm';
  const ratio = count / max;
  if (ratio >= 0.8) return 'text-xl font-semibold';
  if (ratio >= 0.6) return 'text-lg font-semibold';
  if (ratio >= 0.4) return 'text-base font-medium';
  if (ratio >= 0.2) return 'text-sm font-medium';
  return 'text-sm';
}

function getTextColor(count: number, max: number): string {
  if (max === 0) return 'text-charcoal-500';
  const ratio = count / max;
  if (ratio >= 0.8) return 'text-charcoal-900';
  if (ratio >= 0.6) return 'text-charcoal-800';
  if (ratio >= 0.4) return 'text-charcoal-700';
  if (ratio >= 0.2) return 'text-charcoal-600';
  return 'text-charcoal-500';
}

export default function SuggestionWall({ sampleId }: SuggestionWallProps) {
  const suggestions = useMemo(() => aggregateSuggestions(sampleId), [sampleId]);

  const maxCount = useMemo(() => {
    return suggestions.length > 0 ? Math.max(...suggestions.map((s) => s.count)) : 0;
  }, [suggestions]);

  if (suggestions.length === 0) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-5 h-5 text-champagne-500" />
          <h3 className="text-base font-semibold text-charcoal-800 font-display">修改建议</h3>
        </div>
        <div className="h-48 flex items-center justify-center text-charcoal-400 text-sm">
          暂无修改建议
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-5 h-5 text-champagne-500" />
        <h3 className="text-base font-semibold text-charcoal-800 font-display">修改建议</h3>
        <span className="text-sm text-charcoal-400">共 {suggestions.length} 条</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {suggestions.map((suggestion, index) => {
          const bgColor = BG_COLORS[index % BG_COLORS.length];
          const rotation = ROTATIONS[index % ROTATIONS.length];
          const fontSize = getFontSize(suggestion.count, maxCount);
          const textColor = getTextColor(suggestion.count, maxCount);

          return (
            <div
              key={`${suggestion.text}-${index}`}
              className={`
                relative p-4 rounded-lg shadow-soft border border-cream-200
                ${bgColor} ${rotation}
                transition-all duration-300 hover:shadow-hover hover:scale-[1.02]
                hover:rotate-0
              `}
              style={{ transform: `rotate(${(index % 5 - 2) * 0.4}deg)` }}
            >
              <div className={`${fontSize} ${textColor} leading-relaxed`}>
                {suggestion.text}
              </div>
              <div className="flex items-center justify-end mt-3">
                <span className="inline-flex items-center px-2 py-0.5 bg-white/60 rounded-full text-xs text-charcoal-500">
                  被提及 {suggestion.count} 次
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
