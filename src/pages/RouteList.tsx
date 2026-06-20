import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Trash2, X } from 'lucide-react';
import Header from '@/components/layout/Header';
import RouteCard from '@/components/route/RouteCard';
import { useGuideStore } from '@/store/useGuideStore';
import type { TourRoute } from '@/types';

export default function RouteList() {
  const navigate = useNavigate();
  const { routes, loadRoutes, deleteRoute, duplicateRoute, startSession } = useGuideStore();
  const [routeToDelete, setRouteToDelete] = useState<TourRoute | null>(null);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleStartGuide = (routeId: string) => {
    const session = startSession(routeId);
    if (session) {
      navigate(`/guide/${session.id}`);
    }
  };

  const handleDelete = () => {
    if (routeToDelete) {
      deleteRoute(routeToDelete.id);
      setRouteToDelete(null);
    }
  };

  const handleDuplicate = (routeId: string) => {
    const newId = duplicateRoute(routeId);
    if (newId) {
      navigate(`/routes/${newId}/edit`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-deep-900">路线管理</h1>
            <p className="text-deep-600 mt-1">管理您的所有讲解路线</p>
          </div>
          <Link to="/routes/new" className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            新建路线
          </Link>
        </div>

        {routes.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <MapPin className="w-16 h-16 text-deep-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-deep-900 mb-2">还没有路线</h3>
            <p className="text-deep-600 mb-6">创建您的第一条讲解路线，开始规划讲解内容</p>
            <Link to="/routes/new" className="btn-primary inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建路线
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onStartGuide={() => handleStartGuide(route.id)}
                onEdit={() => navigate(`/routes/${route.id}/edit`)}
                onDelete={() => setRouteToDelete(route)}
                onDuplicate={() => handleDuplicate(route.id)}
                showManageActions
              />
            ))}
          </div>
        )}
      </main>

      {routeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-coral-500/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-coral-500" />
                </div>
                <h3 className="text-lg font-semibold text-deep-900">删除路线</h3>
              </div>
              <button
                onClick={() => setRouteToDelete(null)}
                className="text-deep-400 hover:text-deep-600 transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-deep-600 mb-2">
              确定要删除路线 <span className="font-medium text-deep-900">"{routeToDelete.name}"</span> 吗？
            </p>
            <p className="text-sm text-deep-500 mb-6">
              此操作不可撤销，该路线的所有点位信息将被永久删除。
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setRouteToDelete(null)}
                className="btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="btn-primary !bg-coral-500 hover:!bg-coral-600"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
