import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, MapPin, Clock, BarChart3 } from 'lucide-react';
import Header from '@/components/layout/Header';
import RouteCard from '@/components/route/RouteCard';
import { useGuideStore } from '@/store/useGuideStore';
import { formatDurationChinese } from '@/utils/time';

export default function Home() {
  const navigate = useNavigate();
  const { routes, pastSessions, loadRoutes, startSession } = useGuideStore();

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

  const handleStartGuide = (routeId: string) => {
    const session = startSession(routeId);
    if (session) {
      navigate(`/guide/${session.id}`);
    }
  };

  const recentSessions = pastSessions.slice(0, 3);
  const totalSessions = pastSessions.length;
  const totalTime = pastSessions.reduce((sum, s) => sum + s.totalActualDuration, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-gradient-to-br from-deep-900 via-deep-800 to-deep-900 text-white py-16 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-museum-500 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-jade-500 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight">
                精准掌控每一次<span className="text-museum-400">讲解</span>
              </h1>
              <p className="text-lg text-deep-200 mb-8 leading-relaxed">
                展言是一款专为展馆讲解员设计的路线计时器，帮助您规划讲解路线、控制时间节奏、记录讲解数据，
                让每一场讲解都更加专业从容。
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/routes/new" className="btn-primary !bg-museum-500 !text-deep-900 hover:!bg-museum-400 flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  开始使用
                </Link>
                <Link to="/routes" className="btn-secondary flex items-center gap-2">
                  查看路线
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-12 max-w-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-museum-400">{routes.length}</div>
                <div className="text-sm text-deep-300 mt-1">讲解路线</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-museum-400">{totalSessions}</div>
                <div className="text-sm text-deep-300 mt-1">完成讲解</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-museum-400">{formatDurationChinese(totalTime)}</div>
                <div className="text-sm text-deep-300 mt-1">累计时长</div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-serif font-bold text-deep-900">讲解路线</h2>
              <p className="text-deep-600 mt-1">选择一条路线开始您的讲解</p>
            </div>
            <Link to="/routes/new" className="btn-primary flex items-center gap-2">
              <Plus className="w-4 h-4" />
              新建路线
            </Link>
          </div>

          {routes.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <MapPin className="w-12 h-12 text-deep-300 mx-auto mb-4" />
              <p className="text-deep-600 mb-4">还没有讲解路线，创建您的第一条路线吧</p>
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
                />
              ))}
            </div>
          )}
        </section>

        <section className="container mx-auto px-6 py-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-serif font-bold text-deep-900">最近讲解记录</h2>
            {totalSessions > 0 && (
              <span className="text-sm text-deep-500">共 {totalSessions} 条记录</span>
            )}
          </div>

          {recentSessions.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <Clock className="w-10 h-10 text-deep-300 mx-auto mb-3" />
              <p className="text-deep-500">暂无讲解记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <Link
                  key={session.id}
                  to={`/report/${session.id}`}
                  className="glass-card p-4 flex items-center justify-between hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-jade-500/10 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-jade-500" />
                    </div>
                    <div>
                      <div className="font-medium text-deep-900">{session.routeName}</div>
                      <div className="text-sm text-deep-500">
                        {session.startedAt ? new Date(session.startedAt).toLocaleString('zh-CN') : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-deep-900">
                      {formatDurationChinese(session.totalActualDuration)}
                    </div>
                    <div className="text-sm text-deep-500">
                      {session.pointSessions.filter((p) => p.isCompleted).length} / {session.pointSessions.length} 点位
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
