import { Droplets, FlaskConical } from 'lucide-react';
import type { Trial } from '@/types';
import { cn } from '@/lib/utils';

interface TrialParamsFormProps {
  trial: Trial;
  onChange: (updates: Partial<Trial>) => void;
}

export default function TrialParamsForm({ trial, onChange }: TrialParamsFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-ink-700 font-hei font-medium mb-2">
          版本号
        </label>
        <div
          className={cn(
            'px-4 py-2 rounded-lg border',
            'bg-parchment-100 border-parchment-300',
            'text-ink-700 font-hei'
          )}
        >
          试配版本 {trial.version}
        </div>
      </div>

      <div>
        <label className="block text-ink-700 font-hei font-medium mb-2">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-ochre-500" />
            <span>染色比例</span>
          </div>
        </label>
        <input
          type="text"
          value={trial.dyeRatio}
          onChange={(e) => onChange({ dyeRatio: e.target.value })}
          placeholder="赭石1:藤黄20"
          className={cn(
            'w-full px-4 py-2 rounded-lg border',
            'bg-parchment-50 border-parchment-300',
            'text-ink-900 font-hei placeholder:text-ink-700/50',
            'focus:outline-none focus:ring-2 focus:ring-ochre-500 focus:border-transparent',
            'transition-all'
          )}
        />
      </div>

      <div>
        <label className="block text-ink-700 font-hei font-medium mb-3">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-ochre-500" />
            <span>浆糊浓度</span>
          </div>
        </label>
        <div className="space-y-3">
          <input
            type="range"
            min="0"
            max="100"
            value={trial.pasteConcentration}
            onChange={(e) => onChange({ pasteConcentration: parseInt(e.target.value) })}
            className={cn(
              'w-full h-2 rounded-lg appearance-none cursor-pointer',
              'bg-parchment-300',
              'accent-ochre-500'
            )}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded-full bg-parchment-400/30 border border-parchment-400" />
                <div className="w-6 h-6 rounded-full bg-parchment-400/50 border border-parchment-400" />
                <div className="w-6 h-6 rounded-full bg-parchment-400/70 border border-parchment-400" />
              </div>
              <span className="text-ink-700 text-sm font-hei">稀薄</span>
            </div>
            <div className="px-3 py-1 bg-ochre-500 text-white rounded-full font-hei font-medium">
              {trial.pasteConcentration}%
            </div>
            <div className="flex items-center gap-2">
              <span className="text-ink-700 text-sm font-hei">粘稠</span>
              <div className="flex gap-1">
                <div className="w-6 h-6 rounded-full bg-ochre-500/70 border border-ochre-500" />
                <div className="w-6 h-6 rounded-full bg-ochre-500/80 border border-ochre-500" />
                <div className="w-6 h-6 rounded-full bg-ochre-500 border border-ochre-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
