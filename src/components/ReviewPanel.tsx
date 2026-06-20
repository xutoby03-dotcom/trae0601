import React, { useState } from 'react';
import { useFeedbackStore, useRouteStore, useUserStore } from '@/store';
import type { Feedback, ReviewDecision } from '@/types';
import { FEEDBACK_TYPE_LABELS, STATUS_LABELS } from '@/data/mockData';
import { formatDateTime, cn } from '@/utils/helpers';
import {
  CheckCircle,
  Wrench,
  Trash2,
  AlertTriangle,
  User,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ReviewPanelProps {
  feedback: Feedback;
  expanded?: boolean;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ feedback, expanded = false }) => {
  const { reviewFeedback } = useFeedbackStore();
  const { getRouteById, updateRouteStatus } = useRouteStore();
  const { userName } = useUserStore();

  const [isExpanded, setIsExpanded] = useState(expanded);
  const [reviewerNote, setReviewerNote] = useState('');
  const [showDecisionButtons, setShowDecisionButtons] = useState(feedback.status === 'pending');

  const route = getRouteById(feedback.routeId);

  const decisionToStatus: Record<ReviewDecision, import('@/types').RouteStatus> = {
    keep: 'active',
    adjust: 'adjusting',
    retire: 'retired',
    escalate: 'pending_review',
  };

  const handleDecision = (decision: ReviewDecision) => {
    reviewFeedback(feedback.id, decision, reviewerNote, userName);
    if (feedback.routeId) {
      updateRouteStatus(feedback.routeId, decisionToStatus[decision]);
    }
    setShowDecisionButtons(false);
  };

  const decisionLabels: Record<ReviewDecision, string> = {
    keep: '保留',
    adjust: '微调',
    retire: '下线',
    escalate: '上报',
  };

  const decisionColors: Record<ReviewDecision, string> = {
    keep: 'text-green-400 bg-green-500/20',
    adjust: 'text-blue-400 bg-blue-500/20',
    retire: 'text-red-400 bg-red-500/20',
    escalate: 'text-amber-400 bg-amber-500/20',
  };

  const decisionIcons: Record<ReviewDecision, React.ReactNode> = {
    keep: <CheckCircle size={16} />,
    adjust: <Wrench size={16} />,
    retire: <Trash2 size={16} />,
    escalate: <AlertTriangle size={16} />,
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
      <div
        className="p-4 cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: route ? route.color : '#64748b' }}
          >
            <MessageSquare size={18} className="text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-white truncate">
                {route?.name || '未知线路'}
              </h4>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full',
                  feedback.status === 'pending'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-green-500/20 text-green-400'
                )}
              >
                {feedback.status === 'pending' ? '待复核' : '已复核'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-sm text-slate-400">
              <span className="text-orange-400">{FEEDBACK_TYPE_LABELS[feedback.type]}</span>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {formatDateTime(feedback.createdAt)}
              </span>
            </div>

            {!isExpanded && (
              <p className="text-sm text-slate-500 mt-2 line-clamp-1">
                {feedback.description}
              </p>
            )}

            {feedback.decision && (
              <div
                className={cn(
                  'inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-sm font-medium',
                  decisionColors[feedback.decision]
                )}
              >
                {decisionIcons[feedback.decision]}
                <span>{decisionLabels[feedback.decision]}</span>
              </div>
            )}
          </div>

          <button className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-4 space-y-4">
          <div className="bg-slate-700/30 rounded-lg p-3">
            <p className="text-sm text-white leading-relaxed">{feedback.description}</p>
            {feedback.reporterName && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                <User size={12} />
                <span>反馈人：{feedback.reporterName}</span>
              </div>
            )}
          </div>

          {feedback.reviewerNote && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <div className="text-xs text-blue-400 font-medium mb-1">复核意见</div>
              <p className="text-sm text-blue-200">{feedback.reviewerNote}</p>
              {feedback.reviewer && (
                <div className="text-xs text-blue-400/70 mt-2">
                  — {feedback.reviewer}
                </div>
              )}
            </div>
          )}

          {showDecisionButtons && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  复核备注
                </label>
                <textarea
                  value={reviewerNote}
                  onChange={(e) => setReviewerNote(e.target.value)}
                  placeholder="输入复核意见..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleDecision('keep')}
                  className="flex flex-col items-center gap-1 px-3 py-3 bg-green-500/10 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors"
                >
                  <CheckCircle size={20} />
                  <span className="text-sm font-medium">保留</span>
                </button>
                <button
                  onClick={() => handleDecision('adjust')}
                  className="flex flex-col items-center gap-1 px-3 py-3 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors"
                >
                  <Wrench size={20} />
                  <span className="text-sm font-medium">微调</span>
                </button>
                <button
                  onClick={() => handleDecision('retire')}
                  className="flex flex-col items-center gap-1 px-3 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 size={20} />
                  <span className="text-sm font-medium">下线</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
