import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, User, Flame, Clock, ChefHat } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import { SOUP_TYPE_LABEL } from '@/utils/soupConfig';
import { formatDateTime } from '@/utils/helpers';
import type { FeedbackType } from '@/types';

interface TraceChainProps {
  filterType?: FeedbackType | 'all';
}

export default function TraceChain({ filterType = 'all' }: TraceChainProps) {
  const navigate = useNavigate();
  const feedbacks = useBatchStore((s) => s.feedbacks);
  const getBatchById = useBatchStore((s) => s.getBatchById);

  const filteredFeedbacks = useMemo(() => {
    if (filterType === 'all') return feedbacks;
    return feedbacks.filter((f) => f.feedbackType === filterType);
  }, [feedbacks, filterType]);

  if (filteredFeedbacks.length === 0) {
    return (
      <div className="card text-center py-16 text-broth-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
        <p>暂无{filterType !== 'all' ? '该类型' : ''}反馈记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredFeedbacks.map((f) => {
        const batch = getBatchById(f.batchId);
        return (
          <div key={f.id} className="card">
            <div className="flex items-start justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge type="feedback" value={f.feedbackType} />
                <StatusBadge type="severity" value={f.severity} />
                {batch && <StatusBadge type="soup" value={batch.soupType} />}
              </div>
              <span className="text-xs text-broth-400">{formatDateTime(f.createdAt)}</span>
            </div>

            <p className="text-broth-700 mb-4">{f.remark || '无详细描述'}</p>

            {batch && (
              <div
                onClick={() => navigate(`/batches/${batch.id}`)}
                className="relative pl-8 pt-2 border-t border-broth-50 cursor-pointer group"
              >
                <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-fire-300 to-soup-300" />
                <div className="absolute left-0 top-2 w-5 h-5 rounded-full bg-fire-100 border-2 border-white flex items-center justify-center">
                  <ChefHat className="w-3 h-3 text-fire-500" />
                </div>
                <div className="p-3 rounded-xl bg-soup-50/60 hover:bg-soup-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-soup-200 to-soup-300 flex items-center justify-center font-bold text-broth-700">
                        {batch.potNumber.replace('号锅', '')}
                      </div>
                      <div>
                        <p className="font-semibold text-broth-800">{SOUP_TYPE_LABEL[batch.soupType]}</p>
                        <div className="flex items-center gap-3 text-xs text-broth-500 mt-0.5 flex-wrap">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />{batch.operator}
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />{batch.cookingRecords.length} 次记录
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatDateTime(batch.startTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-broth-400 group-hover:text-fire-500 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {batch.cookingRecords.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-broth-100/60 text-xs text-broth-600 italic">
                      最后试味：「{batch.cookingRecords[batch.cookingRecords.length - 1].tasteComment}」
                      （盐度 {batch.cookingRecords[batch.cookingRecords.length - 1].salinity.toFixed(2)}%）
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
