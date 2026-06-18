import { useState, useMemo } from 'react';
import { MessageSquare, Filter, ListChecks } from 'lucide-react';
import FeedbackForm from '@/components/feedback/FeedbackForm';
import TraceChain from '@/components/feedback/TraceChain';
import { useBatchStore } from '@/store/useBatchStore';
import { FEEDBACK_TYPE_LABEL, FEEDBACK_TYPE_COLOR } from '@/utils/soupConfig';
import type { FeedbackType } from '@/types';

const FILTER_OPTIONS: Array<{ value: FeedbackType | 'all'; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'too-salty', label: '太咸' },
  { value: 'too-light', label: '太淡' },
  { value: 'oily', label: '油腻' },
  { value: 'other', label: '其他' },
];

export default function Feedback() {
  const [filter, setFilter] = useState<FeedbackType | 'all'>('all');
  const feedbacks = useBatchStore((s) => s.feedbacks);

  const filteredCount = useMemo(() => {
    if (filter === 'all') return feedbacks.length;
    return feedbacks.filter((f) => f.feedbackType === filter).length;
  }, [feedbacks, filter]);

  const abnormalCount = useMemo(() => {
    return feedbacks.filter((f) => f.feedbackType !== 'other').length;
  }, [feedbacks]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-broth-800 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-fire-500" />
          顾客反馈与追溯
        </h1>
        <p className="text-broth-500 mt-1">录入反馈信息并追溯对应熬制批次</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FeedbackForm />
        </div>
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-fire-50 flex items-center justify-center text-fire-500">
                <Filter className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-broth-800">反馈追溯链</h2>
                <p className="text-xs text-broth-500">
                  共 <span className="font-semibold text-broth-700">{filteredCount}</span> 条记录
                  {filter === 'all' && <span className="ml-1">· 异常 {abnormalCount} 条</span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map((opt) => {
                const isActive = filter === opt.value;
                const colorClass = isActive && opt.value !== 'all'
                  ? FEEDBACK_TYPE_COLOR[opt.value as FeedbackType]
                  : '';
                return (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      isActive
                        ? opt.value === 'all'
                          ? 'bg-broth-800 text-white border-broth-800 shadow-md'
                          : `${colorClass} border-transparent shadow-sm`
                        : 'bg-white text-broth-500 border-broth-100 hover:border-broth-200 hover:text-broth-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
          <TraceChain filterType={filter} />
        </div>
      </div>
    </div>
  );
}
