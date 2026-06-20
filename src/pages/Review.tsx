import React, { useState } from 'react';
import { ReviewPanel } from '@/components/ReviewPanel';
import { RouteCard } from '@/components/RouteCard';
import { useFeedbackStore, useRouteStore } from '@/store';
import type { Route } from '@/types';
import { FEEDBACK_TYPE_LABELS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  BarChart3,
  TrendingUp,
} from 'lucide-react';

export const ReviewPage: React.FC = () => {
  const {
    feedbacks,
    getPendingFeedbacks,
    getReviewedFeedbacks,
    getFeedbackStats,
    getFeedbacksByDecision,
  } = useFeedbackStore();
  const { routes, selectedRouteId, setSelectedRoute, getRouteById } = useRouteStore();

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('pending');
  const [selectedRouteForFilter, setSelectedRouteForFilter] = useState<string>('all');

  const pendingFeedbacks = getPendingFeedbacks();
  const reviewedFeedbacks = getReviewedFeedbacks();

  const keepCount = getFeedbacksByDecision('keep').length;
  const adjustCount = getFeedbacksByDecision('adjust').length;
  const retireCount = getFeedbacksByDecision('retire').length;

  const displayFeedbacks = (() => {
    let list = feedbacks;

    if (filterStatus === 'pending') {
      list = pendingFeedbacks;
    } else if (filterStatus === 'reviewed') {
      list = reviewedFeedbacks;
    }

    if (selectedRouteForFilter !== 'all') {
      list = list.filter((f) => f.routeId === selectedRouteForFilter);
    }

    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  })();

  const selectedRoute = selectedRouteId ? getRouteById(selectedRouteId) : null;

  const routesWithFeedback = routes
    .map((route) => ({
      route,
      stats: getFeedbackStats(route.id),
    }))
    .filter((item) => item.stats.total > 0)
    .sort((a, b) => b.stats.pending - a.stats.pending);

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div>
          <h1 className="text-xl font-bold text-white">反馈复核</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            开线人审核顾客反馈并做出决策
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 px-4 py-2 bg-slate-800/50 rounded-xl">
            <div className="text-center">
              <div className="text-xl font-bold text-amber-400">{pendingFeedbacks.length}</div>
              <div className="text-xs text-slate-500">待复核</div>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div className="text-center">
              <div className="text-xl font-bold text-green-400">{reviewedFeedbacks.length}</div>
              <div className="text-xs text-slate-500">已复核</div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-purple-400" />
              线路反馈统计
            </h2>
            <p className="text-xs text-slate-500 mt-1">点击筛选反馈</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <button
              onClick={() => setSelectedRouteForFilter('all')}
              className={cn(
                'w-full p-3 rounded-xl border text-left transition-all',
                selectedRouteForFilter === 'all'
                  ? 'bg-orange-500/10 border-orange-500/50'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
              )}
            >
              <div className="font-medium text-white text-sm">全部线路</div>
              <div className="text-xs text-slate-500 mt-0.5">
                显示所有反馈
              </div>
            </button>

            {routesWithFeedback.map(({ route, stats }) => (
              <button
                key={route.id}
                onClick={() => {
                  setSelectedRouteForFilter(route.id);
                  setSelectedRoute(route.id);
                }}
                className={cn(
                  'w-full p-3 rounded-xl border text-left transition-all',
                  selectedRouteForFilter === route.id
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: route.color }}
                  />
                  <span className="font-medium text-white text-sm truncate">
                    {route.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{route.grade}</span>
                  <span className="flex items-center gap-1">
                    {stats.pending > 0 && (
                      <span className="text-amber-400">{stats.pending} 待处理</span>
                    )}
                    {stats.pending === 0 && stats.total > 0 && (
                      <span className="text-green-400">全部处理</span>
                    )}
                  </span>
                </div>

                <div className="mt-2 flex gap-1">
                  {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => (
                    <span
                      key={type}
                      className="px-1.5 py-0.5 text-xs bg-slate-700/50 rounded text-slate-400"
                    >
                      {FEEDBACK_TYPE_LABELS[type]} {count}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-slate-800">
            <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" />
              决策分布
            </h3>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-green-500/10 rounded-lg">
                <div className="text-lg font-bold text-green-400">{keepCount}</div>
                <div className="text-xs text-green-400/70">保留</div>
              </div>
              <div className="text-center p-2 bg-blue-500/10 rounded-lg">
                <div className="text-lg font-bold text-blue-400">{adjustCount}</div>
                <div className="text-xs text-blue-400/70">微调</div>
              </div>
              <div className="text-center p-2 bg-red-500/10 rounded-lg">
                <div className="text-lg font-bold text-red-400">{retireCount}</div>
                <div className="text-xs text-red-400/70">下线</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <ClipboardCheck size={20} className="text-orange-400" />
                反馈列表
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilterStatus('pending')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5',
                    filterStatus === 'pending'
                      ? 'bg-amber-500/20 text-amber-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  <Clock size={14} />
                  待复核
                </button>
                <button
                  onClick={() => setFilterStatus('reviewed')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors flex items-center gap-1.5',
                    filterStatus === 'reviewed'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  <CheckCircle size={14} />
                  已复核
                </button>
                <button
                  onClick={() => setFilterStatus('all')}
                  className={cn(
                    'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
                    filterStatus === 'all'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  )}
                >
                  全部
                </button>
              </div>
            </div>

            {displayFeedbacks.length === 0 ? (
              <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {filterStatus === 'pending' ? (
                    <AlertTriangle size={28} className="text-slate-600" />
                  ) : (
                    <CheckCircle size={28} className="text-slate-600" />
                  )}
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  {filterStatus === 'pending'
                    ? '没有待复核的反馈'
                    : filterStatus === 'reviewed'
                    ? '没有已复核的反馈'
                    : '暂无反馈'}
                </h3>
                <p className="text-sm text-slate-500">
                  {selectedRouteForFilter !== 'all'
                    ? '该线路暂无此类反馈'
                    : '继续保持好工作'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayFeedbacks.map((feedback) => (
                  <ReviewPanel key={feedback.id} feedback={feedback} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
