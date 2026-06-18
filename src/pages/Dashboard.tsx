import { useNavigate } from 'react-router-dom';
import { Building2, Package, ListTodo, ClipboardCheck, Plus, ArrowRight, MessageSquare } from 'lucide-react';
import StatCard from '@/components/StatCard';
import TaskCard from '@/components/TaskCard';
import { useAppStore } from '@/store';
import { LOW_STOCK_THRESHOLDS, SUPPLY_TYPE_LABELS, FEEDBACK_TYPE_LABELS } from '@/utils/constants';
import { formatDateTime } from '@/utils/helpers';

export default function Dashboard() {
  const navigate = useNavigate();
  const { rooms, supplies, tasks, inspections, feedbacks } = useAppStore();

  const totalSupplyQuantity = supplies.reduce((sum, s) => sum + s.quantity, 0);

  const lowStockCount = supplies.filter((s) => {
    const threshold = LOW_STOCK_THRESHOLDS[s.type];
    return s.type === 'cleaner'
      ? (s.remainingPercent ?? 0) <= threshold
      : s.quantity <= threshold;
  }).length;

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const todayInspections = inspections.filter((i) => {
    const today = new Date().toDateString();
    return new Date(i.inspectionDate).toDateString() === today;
  });

  const pendingFeedbacks = feedbacks.filter((f) => f.status === 'pending');

  const recentActivities = [
    ...tasks.slice(0, 3).map((t) => ({
      id: t.id,
      type: 'task' as const,
      title: `补给任务：${SUPPLY_TYPE_LABELS[t.supplyType]}`,
      time: t.createdAt,
      description: t.description,
    })),
    ...feedbacks.slice(0, 3).map((f) => ({
      id: f.id,
      type: 'feedback' as const,
      title: `员工反馈：${FEEDBACK_TYPE_LABELS[f.type]}`,
      time: f.createdAt,
      description: f.description,
    })),
    ...inspections.slice(0, 3).map((i) => ({
      id: i.id,
      type: 'inspection' as const,
      title: `巡检记录`,
      time: i.inspectionDate,
      description: i.notes,
    })),
  ]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="会议室总数"
          value={rooms.length}
          icon={Building2}
          color="primary"
          trend="运行正常"
          trendUp
        />
        <StatCard
          title="用品库存总量"
          value={totalSupplyQuantity}
          icon={Package}
          color="blue"
          trend={`${lowStockCount}项库存告警`}
          trendUp={false}
        />
        <StatCard
          title="待处理任务"
          value={pendingTasks.length}
          icon={ListTodo}
          color="accent"
          trend="需及时处理"
          trendUp={false}
        />
        <StatCard
          title="今日巡检"
          value={todayInspections.length}
          icon={ClipboardCheck}
          color="green"
          trend="已完成"
          trendUp
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-800">待处理补给任务</h3>
              <button
                onClick={() => navigate('/tasks')}
                className="text-sm text-primary-700 hover:text-primary-800 font-medium inline-flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {pendingTasks.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <ListTodo className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无待处理任务</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTasks.slice(0, 4).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-800">最近动态</h3>
            </div>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={`${activity.type}-${activity.id}`}
                  className="flex gap-4 pb-4 border-b border-slate-50 last:border-0 last:pb-0"
                >
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'task'
                        ? 'bg-accent-100 text-accent-600'
                        : activity.type === 'feedback'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {activity.type === 'task' ? (
                      <ListTodo className="w-4 h-4" />
                    ) : activity.type === 'feedback' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : (
                      <ClipboardCheck className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-700">{activity.title}</p>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0 whitespace-nowrap">
                    {formatDateTime(activity.time)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">快捷操作</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/rooms/new')}
                className="w-full btn btn-primary justify-start"
              >
                <Plus className="w-4 h-4" />
                新增会议室
              </button>
              <button
                onClick={() => navigate('/inspection')}
                className="w-full btn btn-secondary justify-start"
              >
                <ClipboardCheck className="w-4 h-4" />
                开始巡检
              </button>
              <button
                onClick={() => navigate('/feedback')}
                className="w-full btn btn-secondary justify-start"
              >
                <MessageSquare className="w-4 h-4" />
                员工反馈入口
              </button>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-800">待处理反馈</h3>
              <span className="badge bg-blue-100 text-blue-700">{pendingFeedbacks.length}</span>
            </div>
            <div className="space-y-3">
              {pendingFeedbacks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">暂无待处理反馈</p>
              ) : (
                pendingFeedbacks.slice(0, 5).map((fb) => {
                  const room = rooms.find((r) => r.id === fb.roomId);
                  return (
                    <div key={fb.id} className="p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700">{room?.name}</span>
                        <span className="text-xs text-slate-400">{fb.reporter}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{fb.description}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {lowStockCount > 0 && (
            <div className="card p-6 border-accent-200 bg-gradient-to-br from-accent-50 to-white">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-800">库存告警</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                当前有 <span className="font-bold text-accent-600">{lowStockCount}</span> 项用品库存不足
              </p>
              <button onClick={() => navigate('/inventory')} className="w-full btn btn-accent">
                查看详情
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
