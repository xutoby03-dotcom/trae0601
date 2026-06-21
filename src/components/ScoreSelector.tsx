import { useCallback, useEffect, useRef } from 'react';
import { Circle, CircleDot } from 'lucide-react';
import { scoreDescriptions } from '@/types';

interface ScoreSelectorProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  description?: string;
}

const scoreColors: Record<number, string> = {
  1: '#22c55e',
  2: '#84cc16',
  3: '#eab308',
  4: '#f97316',
  5: '#ef4444',
};

export default function ScoreSelector(
  { value, onChange, label, description }: ScoreSelectorProps
) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onChange(Math.max(1, value - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onChange(Math.min(5, value + 1));
    }
  }, [value, onChange]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('keydown', handleKeyDown);
      return () => container.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ink-800">{label}</label>
        {description && (
          <span className="text-xs text-parchment-400">{description}</span>
        )}
      </div>
      <div
        ref={containerRef}
        tabIndex={0}
        className="flex items-center justify-between gap-2 p-3 bg-parchment-50 rounded-lg outline-none focus:ring-2 focus:ring-ochre-500/50"
      >
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((score) => (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className="p-1 transition-all duration-300 ease-out hover:scale-110 focus:outline-none"
              style={{ color: scoreColors[score] }}
            >
              {value === score ? (
                <CircleDot
                  className="w-6 h-6 transition-transform duration-300 ease-out"
                  style={{ transform: 'scale(1.2)' }}
                />
              ) : (
                <Circle className="w-6 h-6 opacity-50 hover:opacity-100 transition-opacity duration-200" />
              )}
            </button>
          ))}
        </div>
        <div
          className="text-sm font-medium px-3 py-1 rounded-full transition-all duration-300"
          style={{
            color: scoreColors[value],
            backgroundColor: `${scoreColors[value]}15`,
          }}
        >
          {scoreDescriptions[value]}
        </div>
      </div>
    </div>
  );
}
