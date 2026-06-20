import React, { useState } from 'react';
import { FeedbackForm } from '@/components/FeedbackForm';
import { RouteCard } from '@/components/RouteCard';
import { useFeedbackStore, useRouteStore } from '@/store';
import type { Route } from '@/types';
import { FEEDBACK_TYPE_LABELS, STATUS_LABELS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import {
  MessageSquare,
  MessageSquarePlus,
  X,
  BarChart3,
  Clock,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';

export const FeedbackPage: React.FC = () => {
  const { feedbacks, getFeedbackStats, getFeedbacksByRoute } = useFeedbackStore();
  const { routes, selectedRouteId, setSelectedRoute, getRouteById } = useRouteStore();

  const [showForm, setShowForm] = useState(false);
  const [selectedRouteForFeedback, setSelectedRouteForFeedback] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'reviewed'>('all');

  const activeRoutes = routes.filter((r) => r.status === 'active' || r.status === 'pending_review');

  const routesWithFeedback = routes
    .filter((r) => r.status !== 'retired')
    .map((route) => ({
      route,
      stats: getFeedbackStats(route.id),
    }))
    .filter((item) => item.stats.total > 0)
    .sort((a, b) => b.stats.total - a.stats.total);

  const pendingCount = feedbacks.filter((f) => f.status === 'pending').length;
  const reviewedCount = feedbacks.filter((f) => f.status === 'reviewed').length;

  const selectedRoute = selectedRouteId ? getRouteById(selectedRouteId) : null;
  const selectedRouteFeedbacks = selectedRouteId ? getFeedbacksByRoute(selectedRouteId) : [];

  const filteredFeedbacks = selectedRouteFeedbacks.filter((f) => {
    if (filterStatus === 'all') return true;
    return f.status === filterStatus;
  });

  const handleRouteClick = (route: Route) => {
    setSelectedRoute(route.id);
  };

  const handleSubmitFeedback = (routeId?: string) => {
    setSelectedRouteForFeedback(routeId || '');
    setShowForm(true);
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div>
          <h1 className="text-xl font-bold text-white">顾客反馈</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            查看和管理线路反馈
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
              <div className="text-xs text-slate-500">待处理</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{reviewedCount}</div>
              <div className="text-xs text-slate-500">已复核</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{feedbacks.length}</div>
              <div className="text-xs text-slate-500">总反馈</div>
            </div>
          </div>

          <button
            onClick={() => handleSubmitFeedback()}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            <MessageSquarePlus size={18} />
            <span>提交反馈</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-800">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <BarChart3 size={18} className="text-blue-400" />
              线路反馈排行
            </h2>
            <p className="text-xs text-slate-500 mt-1">按反馈数量排序</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {routesWithFeedback.map(({ route, stats }) => (
              <div
                key={route.id}
                onClick={() => handleRouteClick(route)}
                className={cn(
                  'p-3 rounded-xl border cursor-pointer transition-all',
                  selectedRouteId === route.id
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-lg shadow flex-shrink-0"
                    style={{ backgroundColor: route.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm truncate">
                      {route.name}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <span>{route.grade}</span>
                      {route.status !== 'active' && (
                        <span className="px-1.5 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                          {STATUS_LABELS[route.status]}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">{stats.total}</div>
                    <div className="text-xs text-slate-500">条反馈</div>
                  </div>
                </div>

                {stats.pending > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-amber-400">
                    <Clock size={12} />
                    <span>{stats.pending} 条待处理</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {!selectedRoute ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare size={36} className="text-slate-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">选择一条线路</h3>
                <p className="text-sm text-slate-500 mb-4">
                  从左侧列表选择线路查看详细反馈
                </p>
                <button
                  onClick={() => handleSubmitFeedback()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                  <MessageSquarePlus size={16} />
                  快速提交反馈
                </button>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <RouteCard route={selectedRoute} isSelected={false} />
              </div>

              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-400" />
                  反馈列表 ({filteredFeedbacks.length})
                </h3>

                <div className="flex items-center gap-2">
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
                  <button
                    onClick={() => setFilterStatus('pending')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
                      filterStatus === 'pending'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    )}
                  >
                    待处理
                  </button>
                  <button
                    onClick={() => setFilterStatus('reviewed')}
                    className={cn(
                      'px-3 py-1.5 text-sm rounded-lg font-medium transition-colors',
                      filterStatus === 'reviewed'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    )}
                  >
                    已复核
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {filteredFeedbacks.length === 0 ? (
                  <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <CheckCircle2 size={40} className="mx-auto mb-3 text-slate-600" />
                    <p className="text-sm text-slate-500">暂无此类反馈</p>
                  </div>
                ) : (
                  filteredFeedbacks.map((feedback) => (
                    <div
                      key={feedback.id}
                      className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-orange-500/20 text-orange-400"
                          >
                            {FEEDBACK_TYPE_LABELS[feedback.type]}
                          </span>
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
                        <span className="text-xs text-slate-500 flex-shrink-0">
                          {new Date(feedback.createdAt).toLocaleDateString('zh-CN')}
                        </span>
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed">
                        {feedback.description}
                      </p>

                      {feedback.reporterName && (
                        <div className="mt-2 text-xs text-slate-500">
                          — {feedback.reporterName}
                        </div>
                      )}

                      {feedback.reviewerNote && (
                        <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                          <div className="text-xs text-blue-400 font-medium mb-1">
                            复核意见
                          </div>
                          <p className="text-sm text-blue-200">{feedback.reviewerNote}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="font-semibold text-white">提交线路反馈</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <FeedbackForm
              defaultRouteId={selectedRouteForFeedback}
              onClose={() => setShowForm(false)}
              compact
            />
          </div>
        </div>
      )}
    </div>
  );
};
