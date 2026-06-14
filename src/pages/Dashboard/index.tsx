import { useAppStore } from '@/store/useAppStore';
import {
  MapPin,
  CheckCircle2,
  AlertTriangle,
  PackageOpen,
  CloudRain,
  CloudSun,
  TrendingUp,
  Clock,
  Droplets,
  Wind,
} from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const {
    points,
    tasks,
    layingRecords,
    issues,
    recoveryRecords,
    currentTaskId,
    createRainTask,
    setCurrentTask,
  } = useAppStore();

  const activePoints = points.filter((p) => p.status === 'active');
  const currentTask = tasks.find((t) => t.id === currentTaskId);
  const currentRecords = layingRecords.filter(
    (r) => r.taskId === currentTaskId
  );
  const laidCount = currentRecords.filter(
    (r) => r.status === 'laid' || r.status === 'checked'
  ).length;
  const pendingIssues = issues.filter((i) => i.status !== 'resolved').length;
  const unrecoveredCount =
    currentTask?.status === 'in_progress' || currentTask?.status === 'completed'
      ? currentRecords.filter((r) => r.status !== 'pending').length -
        recoveryRecords.filter((r) => r.taskId === currentTaskId).length
      : 0;

  const issueTypeCounts = {
    curled: issues.filter((i) => i.type === 'curled').length,
    water: issues.filter((i) => i.type === 'water').length,
    dirty: issues.filter((i) => i.type === 'dirty').length,
  };

  const buildings = [...new Set(points.map((p) => p.building))];
  const buildingCompletion = buildings.map((building) => {
    const buildingPoints = activePoints.filter((p) => p.building === building);
    const buildingRecords = currentRecords.filter((r) =>
      buildingPoints.some((p) => p.id === r.pointId)
    );
    const laid = buildingRecords.filter(
      (r) => r.status === 'laid' || r.status === 'checked'
    ).length;
    return {
      building,
      total: buildingPoints.length,
      laid,
      rate: buildingPoints.length > 0 ? (laid / buildingPoints.length) * 100 : 0,
    };
  });

  const handleCreateTask = () => {
    const task = createRainTask();
    setCurrentTask(task.id);
  };

  const recentIssues = issues.slice(0, 5);

  const statCards = [
    {
      label: '点位总数',
      value: activePoints.length,
      icon: MapPin,
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-500',
    },
    {
      label: '今日已铺设',
      value: laidCount,
      icon: CheckCircle2,
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-500',
    },
    {
      label: '待处理问题',
      value: pendingIssues,
      icon: AlertTriangle,
      color: 'bg-amber-50 text-amber-600',
      bgColor: 'bg-amber-500',
    },
    {
      label: '未回收垫子',
      value: Math.max(0, unrecoveredCount),
      icon: PackageOpen,
      color: 'bg-red-50 text-red-600',
      bgColor: 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">总览看板</h1>
          <p className="text-sm text-slate-500 mt-1">
            实时监控防滑垫铺设状态和问题处理进度
          </p>
        </div>
        <button
          onClick={handleCreateTask}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm"
        >
          <CloudRain className="w-4 h-4" />
          生成雨天任务
        </button>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">
                    {card.label}
                  </p>
                  <p className="text-3xl font-bold text-slate-800 mt-2">
                    {card.value}
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>较昨日 +2</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-slate-800">
              各楼栋铺设进度
            </h3>
            <StatusBadge variant="info">
              共 {activePoints.length} 个点位
            </StatusBadge>
          </div>
          <div className="space-y-4">
            {buildingCompletion.map((item) => (
              <div key={item.building}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-slate-700">
                    {item.building}
                  </span>
                  <span className="text-sm text-slate-500">
                    {item.laid}/{item.total}
                  </span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-5">
            问题类型分布
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-sm text-slate-600 flex-1">卷边问题</span>
              <span className="text-sm font-semibold text-slate-800">
                {issueTypeCounts.curled}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm text-slate-600 flex-1">积水问题</span>
              <span className="text-sm font-semibold text-slate-800">
                {issueTypeCounts.water}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-slate-500" />
              <span className="text-sm text-slate-600 flex-1">脏污问题</span>
              <span className="text-sm font-semibold text-slate-800">
                {issueTypeCounts.dirty}
              </span>
            </div>
          </div>
          <div className="mt-5 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock className="w-4 h-4" />
              <span>平均处理时间：2.5小时</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">
            当前天气
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center">
              <CloudRain className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">22°C</p>
              <p className="text-sm text-slate-500">中雨转小雨</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Droplets className="w-3.5 h-3.5" />
                湿度
              </div>
              <p className="text-lg font-semibold text-slate-700">85%</p>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <Wind className="w-3.5 h-3.5" />
                风力
              </div>
              <p className="text-lg font-semibold text-slate-700">3级</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">
              最近问题
            </h3>
            <button
              onClick={() => navigate('/issues')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              查看全部
            </button>
          </div>
          <div className="space-y-3">
            {recentIssues.map((issue) => {
              const point = points.find((p) => p.id === issue.pointId);
              const typeLabels = {
                curled: { label: '卷边', variant: 'warning' as const },
                water: { label: '积水', variant: 'danger' as const },
                dirty: { label: '脏污', variant: 'default' as const },
              };
              const typeInfo = typeLabels[issue.type];
              return (
                <div
                  key={issue.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/issues')}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      issue.status === 'resolved'
                        ? 'bg-green-500'
                        : issue.status === 'processing'
                        ? 'bg-blue-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">
                      {point?.name || '未知点位'}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {issue.description}
                    </p>
                  </div>
                  <StatusBadge variant={typeInfo.variant}>
                    {typeInfo.label}
                  </StatusBadge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
