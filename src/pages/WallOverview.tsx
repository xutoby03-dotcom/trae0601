import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WallMap } from '@/components/WallMap';
import { RouteCard } from '@/components/RouteCard';
import { useRouteStore, useHoldStore, useFeedbackStore } from '@/store';
import type { Hold, Grade, RouteStatus } from '@/types';
import { GRADE_COLORS, STATUS_LABELS, ISSUE_TYPE_LABELS, SEVERITY_LABELS, FEEDBACK_TYPE_LABELS } from '@/data/mockData';
import { formatDateTime, cn } from '@/utils/helpers';
import { Search, Filter, AlertTriangle, MessageSquare, ChevronRight, PanelRight, Clock, ArrowRight, MapPin } from 'lucide-react';

export const WallOverview: React.FC = () => {
  const navigate = useNavigate();
  const {
    routes,
    selectedRouteId,
    setSelectedRoute,
    filterGrade,
    setFilterGrade,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    getFilteredRoutes,
    getRouteById,
  } = useRouteStore();
  const { getIssuesByRoute, getUnresolvedIssues, getHoldById } = useHoldStore();
  const { getFeedbackStats, getPendingFeedbacks, getFeedbacksByRoute } = useFeedbackStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [highlightedHoldId, setHighlightedHoldId] = useState<string | null>(null);

  const selectRoute = useCallback((routeId: string) => {
    setSelectedRoute(routeId);
    setHighlightedHoldId(null);
  }, [setSelectedRoute]);

  useEffect(() => {
    setHighlightedHoldId(null);
  }, [selectedRouteId]);

  const filteredRoutes = getFilteredRoutes();
  const selectedRoute = selectedRouteId ? getRouteById(selectedRouteId) : null;
  const unresolvedIssues = getUnresolvedIssues();
  const pendingFeedbacks = getPendingFeedbacks();
  const activeRoutes = routes.filter((r) => r.status === 'active');

  const routeIssues = selectedRouteId ? getIssuesByRoute(selectedRouteId) : [];
  const routeFeedbackStats = selectedRouteId ? getFeedbackStats(selectedRouteId) : null;
  const routePendingFeedbacks = selectedRouteId
    ? getFeedbacksByRoute(selectedRouteId)
        .filter((f) => f.status === 'pending')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];
  const recentIssues = [...routeIssues]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 2);
  const issuesByType: Record<string, number> = {};
  routeIssues.forEach((i) => {
    issuesByType[i.type] = (issuesByType[i.type] || 0) + 1;
  });
  const feedbackByType: Record<string, number> = {};
  routePendingFeedbacks.forEach((f) => {
    feedbackByType[f.type] = (feedbackByType[f.type] || 0) + 1;
  });

  const grades: (Grade | 'all')[] = ['all', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8+'];
  const statuses: (RouteStatus | 'all')[] = ['all', 'active', 'pending_review', 'adjusting', 'retired'];

  const handleHoldClick = (hold: Hold) => {
    if (hold.routeId) {
      selectRoute(hold.routeId);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div>
          <h1 className="text-xl font-bold text-white">墙面总览</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            查看所有线路和岩点状态
          </p>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{activeRoutes.length}</div>
              <div className="text-xs text-slate-500">开放线路</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{pendingFeedbacks.length}</div>
              <div className="text-xs text-slate-500">待复核</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">{unresolvedIssues.length}</div>
              <div className="text-xs text-slate-500">待修问题</div>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              'p-2.5 rounded-lg transition-colors',
              sidebarOpen
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            )}
          >
            <PanelRight size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-auto">
          <div className="h-full min-h-[500px]">
            <WallMap
              mode="view"
              onHoldClick={handleHoldClick}
              highlightRouteId={highlightedHoldId ? null : selectedRouteId}
              highlightHoldId={highlightedHoldId}
              showGrid={true}
            />
          </div>
        </div>

        {sidebarOpen && (
          <aside className="w-80 border-l border-slate-800 bg-slate-900/50 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-800">
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索线路..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 mt-3 text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Filter size={14} />
                <span>筛选条件</span>
                <ChevronRight
                  size={14}
                  className={cn('transition-transform', showFilters && 'rotate-90')}
                />
              </button>

              {showFilters && (
                <div className="mt-3 space-y-3 pt-3 border-t border-slate-700/50">
                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">难度</label>
                    <div className="flex flex-wrap gap-1.5">
                      {grades.map((g) => (
                        <button
                          key={g}
                          onClick={() => setFilterGrade(g)}
                          className={cn(
                            'px-2 py-1 text-xs rounded-md font-medium transition-colors',
                            filterGrade === g
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          )}
                        >
                          {g === 'all' ? '全部' : g}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-500 mb-1.5 block">状态</label>
                    <div className="flex flex-wrap gap-1.5">
                      {statuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => setFilterStatus(s)}
                          className={cn(
                            'px-2 py-1 text-xs rounded-md font-medium transition-colors',
                            filterStatus === s
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          )}
                        >
                          {s === 'all' ? '全部' : STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedRoute && (
                <div className="mb-4 space-y-3">
                  <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                    <div className="text-xs text-orange-400 font-medium mb-2">
                      当前选中
                    </div>
                    <RouteCard route={selectedRoute} isSelected={true} />
                  </div>

                  {routeIssues.length > 0 && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-red-400">
                          <AlertTriangle size={14} />
                          岩点问题
                        </div>
                        <span className="text-xs text-red-400/70">
                          {routeIssues.length} 项未处理
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(issuesByType).map(([type, count]) => (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-red-500/10 text-red-300"
                          >
                            {ISSUE_TYPE_LABELS[type]} {count}
                          </span>
                        ))}
                      </div>

                      {recentIssues.map((issue) => {
                        const issueHold = getHoldById(issue.holdId);
                        return (
                          <div
                            key={issue.id}
                            onClick={() => setHighlightedHoldId(
                              highlightedHoldId === issue.holdId ? null : issue.holdId
                            )}
                            className={cn(
                              'text-xs text-slate-400 pl-3 border-l-2 cursor-pointer transition-all',
                              highlightedHoldId === issue.holdId
                                ? 'border-orange-500 bg-orange-500/5 rounded-r-md'
                                : 'border-red-500/30 hover:bg-slate-700/30 rounded-r-md'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <span
                                className={cn(
                                  'px-1 py-0.5 rounded text-xs font-medium',
                                  issue.severity === 'high'
                                    ? 'bg-red-500/20 text-red-400'
                                    : issue.severity === 'medium'
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'bg-green-500/20 text-green-400'
                                )}
                              >
                                {SEVERITY_LABELS[issue.severity]}
                              </span>
                              <span className="text-slate-500">
                                {ISSUE_TYPE_LABELS[issue.type]}
                              </span>
                            </div>
                            {issueHold && (
                              <div className="flex items-center gap-2 text-slate-500 mb-0.5">
                                <MapPin size={10} />
                                <span>#{issue.holdId.replace('hold-', '')}</span>
                                <span>({issueHold.x}, {issueHold.y})</span>
                                <span className="text-slate-600">· {issueHold.type}</span>
                              </div>
                            )}
                            <p className="text-slate-500 leading-relaxed">
                              {issue.note || '无备注'}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5 text-slate-600">
                              <Clock size={10} />
                              {formatDateTime(issue.createdAt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {routePendingFeedbacks.length > 0 && (
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm font-medium text-amber-400">
                          <MessageSquare size={14} />
                          待复核反馈
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-400/70">
                            {routePendingFeedbacks.length} 条待处理
                          </span>
                          <button
                            onClick={() => navigate(`/review?routeId=${selectedRouteId}`)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-md hover:bg-amber-500/20 transition-colors"
                          >
                            去复核
                            <ArrowRight size={12} />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(feedbackByType).map(([type, count]) => (
                          <span
                            key={type}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-md bg-amber-500/10 text-amber-300"
                          >
                            {FEEDBACK_TYPE_LABELS[type]} {count}
                          </span>
                        ))}
                      </div>

                      {routePendingFeedbacks.slice(0, 2).map((fb) => (
                        <div
                          key={fb.id}
                          className="text-xs text-slate-400 pl-3 border-l-2 border-amber-500/30"
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="px-1 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400">
                              {FEEDBACK_TYPE_LABELS[fb.type]}
                            </span>
                          </div>
                          <p className="text-slate-500 leading-relaxed line-clamp-2">
                            {fb.description}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5 text-slate-600">
                            <Clock size={10} />
                            {formatDateTime(fb.createdAt)}
                            {fb.reporterName && (
                              <span className="ml-1">— {fb.reporterName}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {routeIssues.length === 0 && routePendingFeedbacks.length === 0 && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 text-center">
                      <p className="text-xs text-green-400/70">
                        该线路暂无待处理问题
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="text-xs text-slate-500 font-medium px-1">
                线路列表 ({filteredRoutes.length})
              </div>

              {filteredRoutes.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">没有找到匹配的线路</p>
                </div>
              ) : (
                filteredRoutes.map((route) => (
                  <RouteCard
                    key={route.id}
                    route={route}
                    isSelected={selectedRouteId === route.id}
                    onClick={() => selectRoute(route.id)}
                    compact
                  />
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};
