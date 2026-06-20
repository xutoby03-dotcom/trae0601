import React, { useState } from 'react';
import { RouteEditor } from '@/components/RouteEditor';
import { RouteCard } from '@/components/RouteCard';
import { useRouteStore } from '@/store';
import type { Route, Grade, RouteStatus } from '@/types';
import { GRADE_COLORS, STATUS_LABELS } from '@/data/mockData';
import { cn } from '@/utils/helpers';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';

export const RouteManagePage: React.FC = () => {
  const {
    routes,
    filterGrade,
    setFilterGrade,
    filterStatus,
    setFilterStatus,
    searchQuery,
    setSearchQuery,
    getFilteredRoutes,
    getRouteById,
    selectedRouteId,
    setSelectedRoute,
  } = useRouteStore();

  const [showEditor, setShowEditor] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRoutes = getFilteredRoutes();
  const selectedRoute = selectedRouteId ? getRouteById(selectedRouteId) : null;

  const grades: (Grade | 'all')[] = ['all', 'V0', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8+'];
  const statuses: (RouteStatus | 'all')[] = ['all', 'active', 'pending_review', 'adjusting', 'retired'];

  const handleAddRoute = () => {
    setEditingRoute(null);
    setShowEditor(true);
  };

  const handleEditRoute = (route: Route) => {
    setEditingRoute(route);
    setShowEditor(true);
  };

  const activeCount = routes.filter((r) => r.status === 'active').length;
  const pendingCount = routes.filter((r) => r.status === 'pending_review').length;
  const retiredCount = routes.filter((r) => r.status === 'retired').length;

  return (
    <div className="h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur">
        <div>
          <h1 className="text-xl font-bold text-white">线路管理</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            管理所有抱石线路信息
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{activeCount}</div>
              <div className="text-xs text-slate-500">开放中</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
              <div className="text-xs text-slate-500">待复核</div>
            </div>
            <div className="w-px h-10 bg-slate-800" />
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-500">{retiredCount}</div>
              <div className="text-xs text-slate-500">已下线</div>
            </div>
          </div>

          <button
            onClick={handleAddRoute}
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
          >
            <Plus size={18} />
            <span>新建线路</span>
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索线路名称或开线人..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-500" />
              <select
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value as Grade | 'all')}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
              >
                {grades.map((g) => (
                  <option key={g} value={g}>
                    {g === 'all' ? '全部难度' : g}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as RouteStatus | 'all')}
                className="px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {s === 'all' ? '全部状态' : STATUS_LABELS[s]}
                  </option>
                ))}
              </select>

              <div className="flex items-center bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'grid'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-white'
                  )}
                >
                  <Grid size={16} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'p-2 rounded-md transition-colors',
                    viewMode === 'list'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-500 hover:text-white'
                  )}
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-500 mb-4">
            共 {filteredRoutes.length} 条线路
          </div>

          {filteredRoutes.length === 0 ? (
            <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-dashed border-slate-700">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={28} className="text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">没有找到线路</h3>
              <p className="text-sm text-slate-500 mb-4">
                尝试调整筛选条件或创建新线路
              </p>
              <button
                onClick={handleAddRoute}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
              >
                <Plus size={16} />
                创建线路
              </button>
            </div>
          ) : (
            <div
              className={cn(
                'gap-4',
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                  : 'flex flex-col'
              )}
            >
              {filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  onClick={() => handleEditRoute(route)}
                  className="cursor-pointer"
                >
                  <RouteCard
                    route={route}
                    isSelected={selectedRouteId === route.id}
                    compact={viewMode === 'list'}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <RouteEditor
        isOpen={showEditor}
        onClose={() => {
          setShowEditor(false);
          setEditingRoute(null);
        }}
        route={editingRoute}
      />
    </div>
  );
};
