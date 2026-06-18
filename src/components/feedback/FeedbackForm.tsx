import { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import type { FeedbackType, Severity, SoupType } from '@/types';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import { FEEDBACK_TYPE_LABEL, SEVERITY_LABEL, SOUP_TYPE_LABEL } from '@/utils/soupConfig';

const FEEDBACK_TYPES: FeedbackType[] = ['too-salty', 'too-light', 'oily', 'other'];
const SEVERITIES: Severity[] = ['mild', 'moderate', 'serious'];

export default function FeedbackForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const addFeedback = useBatchStore((s) => s.addFeedback);
  const batches = useBatchStore((s) => s.batches).filter((b) => b.saleWindow);

  const [feedbackType, setFeedbackType] = useState<FeedbackType>('too-salty');
  const [severity, setSeverity] = useState<Severity>('mild');
  const [batchId, setBatchId] = useState(batches[0]?.id || '');
  const [remark, setRemark] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchId) return;
    addFeedback({
      batchId,
      feedbackType,
      severity,
      remark,
    });
    setRemark('');
    onSubmitted?.();
  };

  return (
    <div className="card">
      <h3 className="font-display text-lg font-bold text-broth-800 mb-4 flex items-center gap-2">
        <Plus className="w-5 h-5 text-fire-500" />
        录入顾客反馈
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">关联批次 / 汤底</label>
          <select
            className="input-field"
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {SOUP_TYPE_LABEL[b.soupType]} · {b.potNumber} · {b.saleWindow?.windowName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">反馈类型</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {FEEDBACK_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setFeedbackType(t)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                  feedbackType === t
                    ? 'bg-fire-500 text-white shadow-warm'
                    : 'bg-broth-50 text-broth-600 hover:bg-broth-100'
                }`}
              >
                {FEEDBACK_TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">严重程度</label>
          <div className="grid grid-cols-3 gap-2">
            {SEVERITIES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeverity(s)}
                className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                  severity === s
                    ? 'bg-fire-500 text-white shadow-warm'
                    : 'bg-broth-50 text-broth-600 hover:bg-broth-100'
                }`}
              >
                {SEVERITY_LABEL[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">备注</label>
          <textarea
            className="input-field min-h-[80px] resize-y"
            placeholder="详细描述顾客反馈..."
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4" />
          提交反馈
        </button>
      </form>
    </div>
  );
}
