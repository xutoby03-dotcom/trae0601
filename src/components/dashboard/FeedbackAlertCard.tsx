import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, Clock, TrendingDown, AlertTriangle } from 'lucide-react';
import { useBatchStore } from '@/store/useBatchStore';
import StatusBadge from '@/components/common/StatusBadge';
import { formatDateTime } from '@/utils/helpers';
import { SOUP_TYPE_LABEL, SOUP_TYPE_COLOR, SOUP_TYPE_CHART_COLOR } from '@/utils/soupConfig';
import type { SoupType, CustomerFeedback, FeedbackType } from '@/types';

interface FeedbackWithBatch extends CustomerFeedback {
  soupType?: SoupType;
  potNumber?: string;
}

const ABNORMAL_TYPES: FeedbackType[] = ['too-salty', 'too-light', 'oily'];

const isAbnormal = (t: FeedbackType) => ABNORMAL_TYPES.includes(t);

export default function FeedbackAlertCard() {
  const navigate = useNavigate();
  const feedbacks = useBatchStore((s) => s.feedbacks);
  const batches = useBatchStore((s) => s.batches);

  const { displayFeedbacks, groupedBySoup, hasSerious, summary } = useMemo(() => {
    const getBatchById = (id: string) => batches.find((b) => b.id === id);

    const withBatch: FeedbackWithBatch[] = feedbacks.map((f) => {
      const batch = getBatchById(f.batchId);
      return { ...f, soupType: batch?.soupType, potNumber: batch?.potNumber };
    });

    const abnormalFeedbacks = withBatch.filter((f) => isAbnormal(f.feedbackType));

    const grouped = new Map<SoupType, FeedbackWithBatch[]>();
    abnormalFeedbacks.forEach((f) => {
      if (f.soupType) {
        const list = grouped.get(f.soupType) || [];
        list.push(f);
        grouped.set(f.soupType, list);
      }
    });

    const hasSeriousIssue = abnormalFeedbacks.some(
      (f) => f.severity === 'serious'
    );

    const totalAbnormal = abnormalFeedbacks.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayAbnormal = abnormalFeedbacks.filter(
      (f) => f.createdAt.startsWith(today)
    ).length;

    return {
      displayFeedbacks: withBatch.slice(0, 6),
      groupedBySoup: grouped,
      hasSerious: hasSeriousIssue,
      summary: { total: totalAbnormal, today: todayAbnormal },
    };
  }, [feedbacks, batches]);

  const soupTypes = Array.from(groupedBySoup.keys());

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${hasSerious ? 'bg-red-50 text-red-500' : 'bg-broth-50 text-broth-500'}`}>
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-broth-800">异常反馈</h3>
            <p className="text-xs text-broth-500">
              今日 {summary.today} 条 · 累计 {summary.total} 条
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/feedback')}
          className="flex items-center gap-1 text-sm text-fire-500 hover:text-fire-600 font-medium transition-colors"
        >
          全部查看 <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {soupTypes.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {soupTypes.map((soupType) => {
            const list = groupedBySoup.get(soupType) || [];
            const seriousCount = list.filter((f) => f.severity === 'serious').length;
            return (
              <div
                key={soupType}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs ${SOUP_TYPE_COLOR[soupType]}`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: SOUP_TYPE_CHART_COLOR[soupType] }}
                />
                <span className="font-medium">{SOUP_TYPE_LABEL[soupType]}</span>
                <span className="opacity-70">·</span>
                <span>{list.length} 条</span>
                {seriousCount > 0 && (
                  <>
                    <span className="opacity-70">·</span>
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-red-600 font-medium">{seriousCount}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {displayFeedbacks.length === 0 ? (
        <div className="py-12 text-center text-broth-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>暂无顾客反馈</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayFeedbacks.map((f) => {
            const fAbnormal = isAbnormal(f.feedbackType);
            return (
              <div
                key={f.id}
                onClick={() => navigate(`/feedback`)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer hover:bg-broth-50/50 ${
                  fAbnormal
                    ? 'border-orange-100 bg-orange-50/30 hover:bg-orange-50/60'
                    : 'border-broth-50 hover:bg-broth-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <StatusBadge type="feedback" value={f.feedbackType} />
                    <StatusBadge type="severity" value={f.severity} />
                    {f.soupType && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          backgroundColor: SOUP_TYPE_CHART_COLOR[f.soupType] + '15',
                          color: SOUP_TYPE_CHART_COLOR[f.soupType],
                        }}
                      >
                        {SOUP_TYPE_LABEL[f.soupType]}
                        {f.potNumber && ` · ${f.potNumber}`}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-broth-400 shrink-0">
                    <Clock className="w-3 h-3" />
                    {formatDateTime(f.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-broth-700 line-clamp-2">{f.remark}</p>
                {fAbnormal && f.soupType && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-orange-600">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>该汤底稳定度可能受影响，建议追溯批次调整配方</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
