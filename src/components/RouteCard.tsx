import React from 'react';
import { useRouteStore, useFeedbackStore, useHoldStore } from '@/store';
import type { Route } from '@/types';
import { GRADE_COLORS, STATUS_LABELS } from '@/data/mockData';
import { formatDate, daysUntil, isExpiringSoon, cn } from '@/utils/helpers';
import { Calendar, User, MessageSquare, AlertTriangle, ChevronRight } from 'lucide-react';

interface RouteCardProps {
  route: Route;
  isSelected?: boolean;
  onClick?: () => void;
  compact?: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  isSelected = false,
  onClick,
  compact = false,
}) => {
  const { setSelectedRoute } = useRouteStore();
  const { getFeedbackStats } = useFeedbackStore();
  const { getIssuesByRoute } = useHoldStore();

  const feedbackStats = getFeedbackStats(route.id);
  const issues = getIssuesByRoute(route.id);
  const expiringSoon = isExpiringSoon(route.removeDate);
  const daysLeft = daysUntil(route.removeDate);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setSelectedRoute(route.id);
    }
  };

  const statusColors: Record<string, string> = {
    active: 'bg-green-500/10 text-green-400 border-green-500/30',
    pending_review: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    adjusting: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    retired: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          'p-3 rounded-xl border cursor-pointer transition-all duration-200',
          'bg-slate-800/50 hover:bg-slate-800',
          isSelected ? 'border-orange-500 ring-1 ring-orange-500/50' : 'border-slate-700/50'
        )}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-4 h-4 rounded-full shadow-inner flex-shrink-0"
            style={{ backgroundColor: route.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-white text-sm truncate">{route.name}</div>
            <div
              className="text-xs font-medium"
              style={{ color: GRADE_COLORS[route.grade] || '#94a3b8' }}
            >
              {route.grade}
            </div>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'p-4 rounded-xl border cursor-pointer transition-all duration-200',
        'bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600',
        isSelected
          ? 'border-orange-500 ring-1 ring-orange-500/50 shadow-lg shadow-orange-500/10'
          : 'border-slate-700/50'
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center"
          style={{ backgroundColor: route.color }}
        >
          <span className="text-white font-bold text-sm drop-shadow">{route.grade}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-white truncate">{route.name}</h3>
            <span
              className={cn(
                'text-xs px-2 py-0.5 rounded-full border flex-shrink-0',
                statusColors[route.status]
              )}
            >
              {STATUS_LABELS[route.status]}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-2 text-sm text-slate-400">
            <User size={14} />
            <span>{route.setter}</span>
          </div>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <Calendar size={12} />
            <span>
              {formatDate(route.setDate)} - {formatDate(route.removeDate)}
            </span>
          </div>

          {expiringSoon && daysLeft >= 0 && (
            <div className="mt-2 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md inline-flex items-center gap-1">
              <AlertTriangle size={12} />
              <span>还有 {daysLeft} 天下线</span>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-700/50">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MessageSquare size={12} />
              <span>
                {feedbackStats.total} 反馈
                {feedbackStats.pending > 0 && (
                  <span className="text-amber-400"> ({feedbackStats.pending} 待处理)</span>
                )}
              </span>
            </div>
            {issues.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertTriangle size={12} />
                <span>{issues.length} 问题</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
