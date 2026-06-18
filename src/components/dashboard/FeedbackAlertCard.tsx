import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/helpers';
import { SOUP_TYPE_LABEL } from '@/utils/soupConfig';

export default function FeedbackAlertCard() {
  const navigate = useNavigate();
  const feedbacks = useBatchStore((s) => s.feedbacks).slice(0, 5);
  const batches = useBatchStore((s) => s.batches);
  const hasSerious = feedbacks.some((f) => f.severity === 'serious' || f.feedbackType !== 'other');

  const getBatchById = (id: string) => batches.find((b) => b.id === id);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${hasSerious ? 'bg-red-50 text-red-500' : 'bg-broth-50 text-broth-500'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <h3 className="font-display text-lg font-bold text-broth-800">异常反馈</h3>
        </div>
        <button
          onClick={() => navigate('/feedback')}
          className="flex items-center gap-1 text-sm text-fire-500 hover:text-fire-600 font-medium transition-colors"
        >
          全部查看 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {feedbacks.length === 0 ? (
        <div className="py-12 text-center text-broth-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>暂无顾客反馈</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map((f) => {
            const batch = getBatchById(f.batchId);
            return (
              <div
                key={f.id}
                onClick={() => navigate(`/feedback`)}
                className="p-3 rounded-xl border border-broth-50 hover:bg-broth-50/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge type="feedback" value={f.feedbackType} />
                    <StatusBadge type="severity" value={f.severity} />
                    {batch && (
                      <span className="text-xs text-broth-500">{SOUP_TYPE_LABEL[batch.soupType]} · {batch.potNumber}</span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-broth-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(f.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-broth-700 line-clamp-2">{f.remark}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
