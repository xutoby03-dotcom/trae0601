import React, { useState } from 'react';
import { useFeedbackStore, useRouteStore } from '@/store';
import type { FeedbackType } from '@/types';
import { FEEDBACK_TYPE_LABELS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import { MessageSquarePlus, CheckCircle, X } from 'lucide-react';

interface FeedbackFormProps {
  defaultRouteId?: string;
  onClose?: () => void;
  compact?: boolean;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  defaultRouteId = '',
  onClose,
  compact = false,
}) => {
  const { routes } = useRouteStore();
  const { addFeedback } = useFeedbackStore();

  const [routeId, setRouteId] = useState(defaultRouteId);
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('too_hard');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const activeRoutes = routes.filter((r) => r.status === 'active' || r.status === 'pending_review');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!routeId) return;

    addFeedback({
      routeId,
      type: feedbackType,
      description,
      reporterName: reporterName || '匿名用户',
    });

    setSubmitted(true);
    setTimeout(() => {
      if (onClose) onClose();
      setSubmitted(false);
      setDescription('');
      setReporterName('');
    }, 2000);
  };

  const feedbackTypes: FeedbackType[] = ['too_hard', 'too_easy', 'bad_flow', 'dangerous', 'other'];

  if (submitted) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-green-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">反馈已提交</h3>
        <p className="text-slate-400">感谢您的反馈，开线人会尽快查看</p>
      </div>
    );
  }

  return (
    <div className={compact ? '' : 'p-4'}>
      {!compact && (
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
            <MessageSquarePlus size={20} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">提交线路反馈</h3>
            <p className="text-xs text-slate-400">帮助我们改进线路体验</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            选择线路
          </label>
          <select
            value={routeId}
            onChange={(e) => setRouteId(e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
          >
            <option value="">请选择线路...</option>
            {activeRoutes.map((route) => (
              <option key={route.id} value={route.id}>
                {route.name} ({route.grade})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            反馈类型
          </label>
          <div className="grid grid-cols-2 gap-2">
            {feedbackTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFeedbackType(type)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium border transition-all',
                  feedbackType === type
                    ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20'
                    : 'bg-slate-700/50 text-slate-300 border-slate-600 hover:bg-slate-700'
                )}
              >
                {FEEDBACK_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            详细描述
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请描述具体情况和建议..."
            rows={4}
            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            您的称呼 <span className="text-slate-500 font-normal">(可选)</span>
          </label>
          <input
            type="text"
            value={reporterName}
            onChange={(e) => setReporterName(e.target.value)}
            placeholder="匿名用户"
            className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
            >
              取消
            </button>
          )}
          <button
            type="submit"
            disabled={!routeId || !description.trim()}
            className={cn(
              'flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors',
              routeId && description.trim()
                ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-500/20'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            )}
          >
            提交反馈
          </button>
        </div>
      </form>
    </div>
  );
};
