import { useState } from 'react';
import { AlertCircle, Check, ArrowRightLeft, Users, XCircle, ChevronDown, ChevronUp, History } from 'lucide-react';
import { useFeedbackStore } from '@/store/useFeedbackStore';
import { HandleStatusBadge } from './StatusBadge';
import type { Feedback, HandleResult } from '@/types';
import { NOISE_TYPE_LABELS, FLOOR_LABELS, ZONE_LABELS } from '@/types';
import { formatTime, isHighFrequency } from '@/utils/seatStatus';

interface AdminListProps {
  statusFilter: 'all' | 'pending';
}

const handleActions: { value: HandleResult; label: string; icon: typeof AlertCircle; color: string }[] = [
  { value: 'reminded', label: '已提醒', icon: AlertCircle, color: 'bg-blue-500 hover:bg-blue-600' },
  { value: 'moved', label: '建议换座', icon: ArrowRightLeft, color: 'bg-purple-500 hover:bg-purple-600' },
  { value: 'cleared', label: '已清场', icon: Users, color: 'bg-green-500 hover:bg-green-600' },
  { value: 'false_alarm', label: '误报', icon: XCircle, color: 'bg-slate-500 hover:bg-slate-600' },
];

export function AdminList({ statusFilter }: AdminListProps) {
  const { feedbacks, handleFeedback } = useFeedbackStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [recordsExpandedId, setRecordsExpandedId] = useState<string | null>(null);

  const getRecentSeatFeedbacks = (feedback: Feedback): Feedback[] => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    return feedbacks
      .filter(
        (f) =>
          f.seatId === feedback.seatId &&
          f.id !== feedback.id &&
          new Date(f.submitTime).getTime() > twoHoursAgo
      )
      .sort((a, b) => new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime());
  };

  const filteredFeedbacks = feedbacks
    .filter((f) => (statusFilter === 'pending' ? f.status === 'pending' : true))
    .sort((a, b) => {
      const highA = isHighFrequency(a.seatId, feedbacks);
      const highB = isHighFrequency(b.seatId, feedbacks);
      if (highA && !highB) return -1;
      if (!highA && highB) return 1;
      return new Date(b.submitTime).getTime() - new Date(a.submitTime).getTime();
    });

  const handleAction = (feedbackId: string, result: HandleResult) => {
    handleFeedback(feedbackId, result);
    setExpandedId(null);
  };

  if (filteredFeedbacks.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Check className="w-12 h-12 mx-auto mb-3 text-green-500" />
        <p>暂无{statusFilter === 'pending' ? '待处理' : ''}反馈记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredFeedbacks.map((feedback) => {
        const highFreq = isHighFrequency(feedback.seatId, feedbacks);
        const isExpanded = expandedId === feedback.id;

        return (
          <div
            key={feedback.id}
            className={`bg-white rounded-xl border overflow-hidden transition-all ${
              highFreq ? 'border-l-4 border-l-red-500' : 'border-slate-200'
            }`}
          >
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => setExpandedId(isExpanded ? null : feedback.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {highFreq && (
                    <div className="mt-1">
                      <AlertCircle className="w-5 h-5 text-red-500 animate-pulse" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-800">
                        {FLOOR_LABELS[feedback.floor]} {ZONE_LABELS[feedback.zone]}{' '}
                        {feedback.deskNumber}号桌 {feedback.seatNumber}号座
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                        {NOISE_TYPE_LABELS[feedback.noiseType]}
                      </span>
                      {highFreq && (
                        <span className="px-2 py-0.5 bg-red-100 rounded text-xs text-red-600 font-medium">
                          高频
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      提交：{formatTime(feedback.submitTime)}
                      <span className="mx-2">|</span>
                      举报人：{feedback.reporterName}
                    </div>
                  </div>
                </div>
                <HandleStatusBadge status={feedback.status} />
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-slate-100">
                <div className="pt-4 space-y-3">
                  <div className="text-sm text-slate-600">
                    <span className="text-slate-500">发生时间：</span>
                    {formatTime(feedback.occurTime)}
                  </div>
                  {feedback.photos.length > 0 && (
                    <div className="flex gap-2">
                      {feedback.photos.map((photo, i) => (
                        <img
                          key={i}
                          src={photo}
                          alt={`证据 ${i + 1}`}
                          className="w-20 h-20 rounded-lg object-cover"
                        />
                      ))}
                    </div>
                  )}

                  <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setRecordsExpandedId(
                          recordsExpandedId === feedback.id ? null : feedback.id
                        );
                      }}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <History className="w-4 h-4 text-slate-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-700 shrink-0">
                          近 2 小时同座位记录
                        </span>
                        {getRecentSeatFeedbacks(feedback).length > 0 ? (
                          <>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium shrink-0">
                              {getRecentSeatFeedbacks(feedback).length} 条
                            </span>
                            <span className="text-xs text-slate-400 truncate">
                              最近 {formatTime(getRecentSeatFeedbacks(feedback)[0].submitTime)}
                            </span>
                          </>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            0 条
                          </span>
                        )}
                      </div>
                      {recordsExpandedId === feedback.id ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>

                    {recordsExpandedId === feedback.id && (
                      <div className="border-t border-slate-200">
                        {getRecentSeatFeedbacks(feedback).length === 0 ? (
                          <div className="px-3 py-4 text-center text-sm text-slate-500">
                            近 2 小时暂无其他反馈记录
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-200">
                            {getRecentSeatFeedbacks(feedback).map((record) => (
                              <div
                                key={record.id}
                                className="px-3 py-2.5 flex items-center justify-between gap-3"
                              >
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-xs font-medium shrink-0">
                                    {NOISE_TYPE_LABELS[record.noiseType]}
                                  </span>
                                  <span className="text-sm text-slate-600 truncate">
                                    {record.reporterName}
                                  </span>
                                </div>
                                <span className="text-xs text-slate-400 shrink-0">
                                  {formatTime(record.submitTime)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {feedback.status === 'pending' && (
                    <div className="pt-2">
                      <p className="text-sm text-slate-500 mb-2">处理结果：</p>
                      <div className="flex flex-wrap gap-2">
                        {handleActions.map((action) => {
                          const Icon = action.icon;
                          return (
                            <button
                              key={action.value}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(feedback.id, action.value);
                              }}
                              className={`px-4 py-2 text-white rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${action.color}`}
                            >
                              <Icon className="w-4 h-4" />
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {feedback.status !== 'pending' && feedback.handleTime && (
                    <div className="pt-2 border-t border-slate-100">
                      <p className="text-sm text-slate-500">
                        处理人：{feedback.handlerName} · {formatTime(feedback.handleTime)}
                      </p>
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
