import React, { useState } from 'react';
import { WallMap } from '@/components/WallMap';
import { RouteCard } from '@/components/RouteCard';
import { useRouteStore, useHoldStore, useFeedbackStore } from '@/store';
import type { Hold, Grade, RouteStatus } from '@/types';
import { GRADE_COLORS, STATUS_LABELS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import { Search, Filter, AlertTriangle, MessageSquare, ChevronRight, PanelRight } from 'lucide-react';

export const WallOverview: React.FC = () => {
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
  const { getIssuesByRoute, getUnresolvedIssues } = useHoldStore();
  const { getFeedbackStats, getPendingFeedbacks } = useFeedbackStore();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const filteredRoutes = getFilteredRoutes();
  const selectedRoute = selectedRouteId ? getRouteById(selectedRouteId) : null;
  const unresolvedIssues = getUnresolvedIssues();
  const pendingFeedbacks = getPendingFeedbacks();
  const activeRoutes = routes.filter((r) => r.status === 'active');

  const grades: (Grade | 'all')[] = ['all', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8+'];
  const statuses: (RouteStatus | 'all')[] = ['all', 'active', 'pending_review', 'adjusting', 'retired'];

  const handleHoldClick = (hold: Hold) => {
    if (hold.routeId) {
      setSelectedRoute(hold.routeId);
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
              highlightRouteId={selectedRouteId}
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
                <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl">
                  <div className="text-xs text-orange-400 font-medium mb-2">当前选中</div>
                  <RouteCard route={selectedRoute} isSelected={true} />
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
                    onClick={() => setSelectedRoute(route.id)}
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
