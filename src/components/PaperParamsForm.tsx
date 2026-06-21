import type { Trial, FiberDirection } from '@/types';
import { fiberDirectionLabels } from '@/types';
import { cn } from '@/lib/utils';

interface PaperParamsFormProps {
  trial: Trial;
  onChange: (updates: Partial<Trial>) => void;
}

const fiberDirections: FiberDirection[] = ['vertical', 'horizontal', 'diagonal'];

export default function PaperParamsForm({ trial, onChange }: PaperParamsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-ink-700 font-hei font-medium mb-2">
          纸张厚度
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={trial.paperThickness}
            onChange={(e) => onChange({ paperThickness: parseFloat(e.target.value) || 0 })}
            step="0.01"
            min="0"
            className={cn(
              'w-full px-4 py-2 rounded-lg border',
              'bg-parchment-50 border-parchment-300',
              'text-ink-900 font-hei',
              'focus:outline-none focus:ring-2 focus:ring-ochre-500 focus:border-transparent',
              'transition-all'
            )}
          />
          <span className="text-ink-700 font-hei whitespace-nowrap">mm</span>
        </div>
      </div>

      <div>
        <label className="block text-ink-700 font-hei font-medium mb-3">
          纤维方向
        </label>
        <div className="flex gap-3">
          {fiberDirections.map((direction) => (
            <button
              key={direction}
              type="button"
              onClick={() => onChange({ fiberDirection: direction })}
              className={cn(
                'flex-1 px-4 py-2 rounded-lg font-hei font-medium',
                'border transition-all',
                trial.fiberDirection === direction
                  ? 'bg-ochre-500 text-white border-ochre-500'
                  : 'bg-parchment-50 border-parchment-300 text-ink-700 hover:border-ochre-400'
              )}
            >
              {fiberDirectionLabels[direction]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
