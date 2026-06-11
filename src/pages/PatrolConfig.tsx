import { useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Clock, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { usePatrolStore } from '@/store/usePatrolStore';
import { getRiskLevelText, getRiskLevelColor } from '@/utils/helpers';
import type { PatrolRoute, PatrolPoint, RiskLevel } from '@/types/patrol';
import RouteModal from '@/components/modals/RouteModal';
import PointModal from '@/components/modals/PointModal';

export default function PatrolConfig() {
  const { routes, addRoute, updateRoute, deleteRoute, addPoint, updatePoint, deletePoint } = usePatrolStore();
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(routes[0]?.id || null);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [pointModalOpen, setPointModalOpen] = useState(false);
  const [editRoute, setEditRoute] = useState<PatrolRoute | null>(null);
  const [editPoint, setEditPoint] = useState<PatrolPoint | null>(null);
  const [activeRouteId, setActiveRouteId] = useState<string | null>(null);

  const handleRouteSubmit = (name: string, description: string) => {
    if (editRoute) {
      updateRoute(editRoute.id, name, description);
    } else {
      addRoute(name, description);
    }
    setEditRoute(null);
  };

  const handlePointSubmit = (data: {
    name: string;
    riskLevel: RiskLevel;
    suggestedTime: string;
    photoUrl: string;
  }) => {
    if (!activeRouteId) return;
    if (editPoint) {
      updatePoint(editPoint.id, data);
    } else {
      addPoint(activeRouteId, data);
    }
    setEditPoint(null);
  };

  const openAddPoint = (routeId: string) => {
    setActiveRouteId(routeId);
    setEditPoint(null);
    setPointModalOpen(true);
  };

  const openEditPoint = (routeId: string, point: PatrolPoint) => {
    setActiveRouteId(routeId);
    setEditPoint(point);
    setPointModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">巡逻配置</h1>
          <p className="text-slate-400 text-sm mt-1">配置巡逻路线和点位信息</p>
        </div>
        <button
          onClick={() => { setEditRoute(null); setRouteModalOpen(true); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4" />
          新增路线
        </button>
      </div>

      <div className="space-y-4">
        {routes.length === 0 ? (
          <div className="card p-16 text-center">
            <MapPin className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg mb-4">还没有巡逻路线</p>
            <button
              onClick={() => { setEditRoute(null); setRouteModalOpen(true); }}
              className="btn-primary"
            >
              <Plus className="w-4 h-4" />
              创建第一条路线
            </button>
          </div>
        ) : (
          routes.map((route) => {
            const isExpanded = expandedRouteId === route.id;
            const sortedPoints = [...route.points].sort((a, b) => a.orderIndex - b.orderIndex);
            const maxRisk = route.points.reduce(
              (max, p) => {
                const levels: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
                return levels.indexOf(p.riskLevel) > levels.indexOf(max) ? p.riskLevel : max;
              },
              'low' as RiskLevel
            );

            return (
              <div key={route.id} className="card overflow-hidden animate-fade-in-up">
                <div
                  className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-colors"
                  onClick={() => setExpandedRouteId(isExpanded ? null : route.id)}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-lg shadow-primary-700/20">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-white font-semibold text-lg">{route.name}</h3>
                        <span className={`tag ${getRiskLevelColor(maxRisk)}`}>
                          <AlertTriangle className="w-3 h-3" />
                          {getRiskLevelText(maxRisk)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-0.5">{route.description}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <MapPin className="w-4 h-4" />
                        {route.points.length} 个点位
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditRoute(route);
                        setRouteModalOpen(true);
                      }}
                      className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`确定删除路线「${route.name}」吗？`)) {
                          deleteRoute(route.id);
                        }
                      }}
                      className="p-2 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-slate-700/50 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">点位列表</h4>
                      <button
                        onClick={() => openAddPoint(route.id)}
                        className="btn-primary !py-1.5 !px-3 text-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        添加点位
                      </button>
                    </div>
                    {sortedPoints.length === 0 ? (
                      <div className="py-12 text-center text-slate-500">
                        <MapPin className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无点位，点击右上角添加</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {sortedPoints.map((point, idx) => (
                          <div
                            key={point.id}
                            className="p-4 rounded-xl bg-slate-900/40 border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                  {idx + 1}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-white font-medium text-sm truncate">{point.name}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className={`tag ${getRiskLevelColor(point.riskLevel)} !text-[10px] !py-px`}>
                                      {getRiskLevelText(point.riskLevel)}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                      <Clock className="w-3 h-3" />
                                      {point.suggestedTime}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button
                                  onClick={() => openEditPoint(route.id, point)}
                                  className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`确定删除点位「${point.name}」吗？`)) {
                                      deletePoint(point.id);
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-red-900/30 text-slate-400 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <RouteModal
        open={routeModalOpen}
        onClose={() => { setRouteModalOpen(false); setEditRoute(null); }}
        onSubmit={handleRouteSubmit}
        editRoute={editRoute}
      />
      <PointModal
        open={pointModalOpen}
        onClose={() => { setPointModalOpen(false); setEditPoint(null); }}
        onSubmit={handlePointSubmit}
        editPoint={editPoint}
      />
    </div>
  );
}
