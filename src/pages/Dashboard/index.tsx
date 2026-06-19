import { Link } from 'react-router-dom';
import {
  MapPin,
  CloudRain,
  AlertTriangle,
  Wrench,
  ChevronRight,
  ClipboardCheck,
  Droplets,
  Activity,
} from 'lucide-react';
import { useAreaStore } from '../../store/useAreaStore';
import { useInspectionStore } from '../../store/useInspectionStore';
import { useTaskStore } from '../../store/useTaskStore';
import { useRainEventStore } from '../../store/useRainEventStore';
import { getAnomalyAreas } from '../../utils/anomaly';
import { formatDate } from '../../utils/date';
import Timeline from '../../components/Timeline';
import AnomalyCard from '../../components/AnomalyCard';
import StatusBadge from '../../components/StatusBadge';

export default function Dashboard() {
  const { areas } = useAreaStore();
  const { inspections } = useInspectionStore();
  const { tasks } = useTaskStore();
  const { rainEvents, getLatestRainEvent } = useRainEventStore();

  const latestRain = getLatestRainEvent();
  const checkedAreaIds = latestRain
    ? inspections.filter((i) => i.rainEventId === latestRain.id).map((i) => i.areaId)
    : [];
  const uncheckedAreas = areas.filter((a) => !checkedAreaIds.includes(a.id));
  const anomalyAreaIds = getAnomalyAreas(inspections);
  const anomalyAreas = areas.filter((a) => anomalyAreaIds.includes(a.id));

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const reviewTasks = tasks.filter((t) => t.status === 'review');
  const activeTasksCount = pendingTasks.length + inProgressTasks.length + reviewTasks.length;

  const stats = [
    {
      label: '待检查区域',
      value: uncheckedAreas.length,
      total: areas.length,
      icon: ClipboardCheck,
      gradient: 'from-amber-500 to-orange-600',
      link: '/inspections',
    },
    {
      label: '最近暴雨',
      value: latestRain ? formatDate(latestRain.date).slice(5) : '-',
      icon: CloudRain,
      gradient: 'from-blue-500 to-primary-600',
      link: null,
    },
    {
      label: '重复渗水点',
      value: anomalyAreas.length,
      icon: AlertTriangle,
      gradient: 'from-red-500 to-danger-600',
      link: '/tasks',
    },
    {
      label: '进行中维修',
      value: activeTasksCount,
      total: tasks.length,
      icon: Wrench,
      gradient: 'from-teal-500 to-success-600',
      link: '/tasks',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="animate-slide-up">
        <h2 className="font-serif text-2xl font-bold text-gray-800 mb-1">概览仪表盘</h2>
        <p className="text-gray-500 text-sm">掌握露台防水整体状况</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const StatWrapper = stat.link ? Link : 'div';
          return (
            <StatWrapper
              key={stat.label}
              to={stat.link || '#'}
              className="relative bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all overflow-hidden group animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute -right-8 -top-8 w-32 h-32 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
              />
              <div className="relative">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-3 shadow-md`}
                >
                  <Icon className="w-5.5 h-5.5 text-white" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-800">{stat.value}</span>
                  {stat.total !== undefined && (
                    <span className="text-sm text-gray-400">/ {stat.total}</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            </StatWrapper>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-primary-500" />
                最近暴雨记录
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">暴雨时间线与检查完成情况</p>
            </div>
          </div>
          <Timeline events={rainEvents.slice(0, 5)} />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '500ms' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-warning-500" />
                待检查区域
              </h3>
              {uncheckedAreas.length > 0 && (
                <Link
                  to="/inspections"
                  className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-0.5"
                >
                  全部 <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>

            {uncheckedAreas.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 mx-auto rounded-full bg-success-50 flex items-center justify-center mb-3">
                  <Droplets className="w-7 h-7 text-success-500" />
                </div>
                <p className="text-sm text-gray-500">所有区域已完成检查</p>
              </div>
            ) : (
              <div className="space-y-2">
                {uncheckedAreas.slice(0, 4).map((area) => (
                  <Link
                    key={area.id}
                    to={`/inspections/${area.id}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-warning-50 hover:bg-warning-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-warning-500/10 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-warning-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">{area.name}</p>
                        <p className="text-xs text-gray-500">朝向 {area.orientation} · {area.areaSize}㎡</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-warning-600 transition-colors" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {inProgressTasks.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm animate-slide-up" style={{ animationDelay: '600ms' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary-500" />
                  维修进度
                </h3>
                <Link
                  to="/tasks"
                  className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-0.5"
                >
                  详情 <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-4">
                {inProgressTasks.slice(0, 3).map((task) => {
                  const area = areas.find((a) => a.id === task.areaId);
                  return (
                    <div key={task.id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                          {task.title}
                        </span>
                        <StatusBadge type="task" value={task.status} />
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{area?.name}</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all"
                          style={{ width: task.actualCost && task.estimatedCost ? `${Math.min(100, (task.actualCost / task.estimatedCost) * 100)}%` : '50%' }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {anomalyAreas.length > 0 && (
        <div className="animate-slide-up" style={{ animationDelay: '700ms' }}>
          <h3 className="font-serif text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-danger-500" />
            重复渗水预警
            <span className="text-sm font-normal text-danger-500">（连续两次检查异常）</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {anomalyAreas.map((area) => {
              const areaInspections = inspections
                .filter((i) => i.areaId === area.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .slice(0, 2);
              const areaTasks = tasks.filter(
                (t) => t.areaId === area.id && t.status !== 'completed'
              );

              return (
                <AnomalyCard
                  key={area.id}
                  title={area.name}
                  description={`朝向${area.orientation} · ${area.areaSize}㎡ · 地漏${area.drainCount}个`}
                >
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">
                      最近两次检查均发现异常：
                    </p>
                    <ul className="text-xs text-gray-500 space-y-1">
                      {areaInspections.map((insp) => (
                        <li key={insp.id} className="flex items-start gap-1.5">
                          <span className="text-danger-500">•</span>
                          <span>
                            {formatDate(insp.inspectionDate)} - {insp.waterPoints.length > 0 && `积水${insp.waterPoints.length}处`}
                            {insp.thresholdLeak && ' · 门槛渗水'}
                            {insp.notes && ` · ${insp.notes}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                    {areaTasks.length > 0 ? (
                      <Link
                        to={`/tasks/${areaTasks[0].id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium mt-2"
                      >
                        查看维修任务 <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <Link
                        to={`/tasks/new?areaId=${area.id}`}
                        className="inline-flex items-center gap-1 text-xs text-danger-600 hover:text-danger-700 font-medium mt-2"
                      >
                        立即创建维修任务 <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </AnomalyCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
