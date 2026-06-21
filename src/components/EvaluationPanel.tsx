import { ClipboardList } from 'lucide-react';
import type { Trial, Evaluation } from '@/types';
import { evaluationLabels } from '@/types';
import ScoreSelector from './ScoreSelector';

interface EvaluationPanelProps {
  trial: Trial;
  onChange: (updates: Partial<Evaluation>) => void;
}

export default function EvaluationPanel({ trial, onChange }: EvaluationPanelProps) {
  const { evaluation } = trial;

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <ClipboardList className="w-5 h-5 text-ochre-600" />
        <h3 className="text-lg font-semibold text-ink-900">效果评估</h3>
      </div>
      <div className="space-y-4">
        {(['colorDifference', 'edgeWarping', 'gluePenetration', 'touchDifference'] as const).map((key) => (
          <ScoreSelector
            key={key}
            label={evaluationLabels[key]}
            value={evaluation[key]}
            onChange={(value) => onChange({ [key]: value })}
          />
        ))}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-ink-800">
            备注
          </label>
          <textarea
            value={evaluation.remarks || ''}
            onChange={(e) => onChange({ remarks: e.target.value })}
            placeholder="请输入评估备注..."
            rows={3}
            className="w-full px-4 py-3 rounded-lg border bg-parchment-50 border-parchment-300 text-ink-900 font-hei placeholder:text-ink-700/50 focus:outline-none focus:ring-2 focus:ring-ochre-500 focus:border-transparent transition-all resize-none"
          />
        </div>
      </div>
    </div>
  );
}
