import { useMemo } from 'react';
import {
  Shield,
  Footprints,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  MapPin,
  User,
  Clock,
  ChevronRight,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePatrolStore } from '@/store/usePatrolStore';
import {
  formatDateTime,
  getExceptionStatusText,
  getExceptionStatusColor,
  getRiskLevelText,
  getRiskLevelColor,
} from '@/utils/helpers';

export default function Dashboard() {
  const {
    routes,
    patrolRecords,
    exceptionEvents,
    getMissedCheckIns,
    officers,
    currentOfficerId,
  } = usePatrolStore();

  const stats = useMemo(() => {
    const completedRecords = patrolRecords.filter((r) => r.status === 'completed');
    const inProgress = patrolRecords.filter((r) => r.status === 'in_progress');
    const missed = getMissedCheckIns();
    const pendingExceptions = exceptionEvents.filter((e) => e.status === 'pending');
    const processingExceptions = exceptionEvents.filter(
      (e) => e.status === 'assigned' || e.status === 'processing'
    );

    return {
      totalRoutes: routes.length,
      completedPatrols: completedRecords.length,
      inProgress: inProgress.length,
      missedCount: missed.length,
      pendingExceptions: pendingExceptions.length,
      processingExceptions: processingExceptions.length,
      totalOfficers: officers.filter((o) => o.role === 'officer').length,
    };
  }, [routes, patrolRecords, exceptionEvents, getMissedCheckIns, officers]);

  const recentExceptions = useMemo(
    () =>
      [...exceptionEvents]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [exceptionEvents]
  );

  const recentMissed = useMemo(() => getMissedCheckIns().slice(0, 3), [getMissedCheckIns]);

  const currentOfficer = officers.find((o) => o.id === currentOfficerId);

  const quickLinks = [
    { path: '/patrol', icon: Footprints, label: '开始巡逻', color: 'from-emerald-500 to-teal-600' },
    { path: '/config', icon: MapPin, label: '路线配置', color: 'from-primary-500 to-primary-700' },
    { path: '/exceptions', icon: AlertTriangle, label: '异常事件', color: 'from-orange-500 to-red-600' },
    { path: '/statistics', icon: BarChart3, label: '数据统计', color: 'from-blue-500 to-indigo-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Shield className="w-7 h-7 text-primary-400" />
            夜间巡逻指挥中心
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            欢迎回来，{currentOfficer?.name}。今天是 {new Date().toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-900/40 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">巡逻路线</p>
              <p className="text-2xl font-bold text-white">{stats.totalRoutes}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-900/40 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">已完成巡逻</p>
              <p className="text-2xl font-bold text-emerald-400">{stats.completedPatrols}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-900/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">进行中</p>
              <p className="text-2xl font-bold text-blue-400">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-orange-900/40 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">漏打卡</p>
              <p className="text-2xl font-bold text-orange-400">{stats.missedCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-red-900/40 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">待分派异常</p>
              <p className="text-2xl font-bold text-red-400">{stats.pendingExceptions}</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-900/40 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-xs">巡逻员</p>
              <p className="text-2xl font-bold text-amber-400">{stats.totalOfficers}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="card card-hover p-5 flex flex-col items-center text-center gap-3 animate-fade-in-up"
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${link.color} flex items-center justify-center shadow-lg`}
                >
                  <link.icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-white font-medium text-sm">{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/30">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">最近异常事件</h3>
              </div>
              <Link
                to="/exceptions"
                className="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-0.5"
              >
                查看全部 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {recentExceptions.length === 0 ? (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
                <p className="text-slate-400">暂无异常事件</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {recentExceptions.map((event) => (
                  <div key={event.id} className="p-4 flex items-center gap-4 hover:bg-slate-800/30 transition-colors animate-fade-in-up">
                    <div className="w-10 h-10 rounded-xl bg-red-900/40 flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{event.description}</p>
                      <p className="text-slate-400 text-xs mt-0.5">
                        {event.routeName} · {event.pointName}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className={`tag ${getExceptionStatusColor(event.status)}`}>
                        {getExceptionStatusText(event.status)}
                      </span>
                      <span className="text-xs text-slate-500 whitespace-nowrap">
                        {formatDateTime(event.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card overflow-hidden border-orange-500/20">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/30 bg-orange-950/10">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-orange-400" />
                <h3 className="text-white font-semibold">漏打卡提醒</h3>
                {stats.missedCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">
                    {stats.missedCount}
                  </span>
                )}
              </div>
              <Link
                to="/missed"
                className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-0.5"
              >
                查看全部 <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            {recentMissed.length === 0 ? (
              <div className="p-10 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-700 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">无漏打卡</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-700/30">
                {recentMissed.map(({ point, route, officer }, idx) => (
                  <div key={idx} className="p-4 hover:bg-orange-950/10 transition-colors animate-fade-in-up">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-white text-sm font-medium">{point.name}</p>
                      <span className={`tag ${getRiskLevelColor(point.riskLevel)} !text-[10px] !py-px`}>
                        {getRiskLevelText(point.riskLevel)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {route.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {officer.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <h3 className="text-white font-semibold">快速概览</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40">
                <span className="text-slate-300 text-sm">异常处理率</span>
                <span className="text-emerald-400 font-bold">
                  {exceptionEvents.length > 0
                    ? Math.round(
                        (exceptionEvents.filter((e) => e.status === 'resolved').length /
                          exceptionEvents.length) *
                          100
                      )
                    : 100}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40">
                <span className="text-slate-300 text-sm">进行中任务</span>
                <span className="text-blue-400 font-bold">{stats.inProgress}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40">
                <span className="text-slate-300 text-sm">待处理异常</span>
                <span className="text-red-400 font-bold">
                  {stats.pendingExceptions + stats.processingExceptions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
