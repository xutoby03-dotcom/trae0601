import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertTriangle,
  PauseCircle,
  Wrench,
  PlayCircle,
  MapPin,
  Zap,
} from 'lucide-react';
import { useAppStore } from '../../store';
import type { CleaningTask, WashingPool, TaskType } from '../../types';

const taskTypeLabels: Record<TaskType, string> = {
  MAT_REPLACEMENT: '地垫更换',
  DRAIN_CLEANING: '排水口清理',
  DISINFECTANT_REFILL: '消毒液补充',
};

const taskTypeIcons: Record<TaskType, typeof Sparkles> = {
  MAT_REPLACEMENT: Sparkles,
  DRAIN_CLEANING: Zap,
  DISINFECTANT_REFILL: AlertTriangle,
};

const priorityColors: Record<'HIGH' | 'MEDIUM' | 'LOW', string> = {
  HIGH: 'bg-red-100 text-red-700 border-red-200',
  MEDIUM: 'bg-orange-100 text-orange-700 border-orange-200',
  LOW: 'bg-gray-100 text-gray-600 border-gray-200',
};

const priorityLabels: Record<'HIGH' | 'MEDIUM' | 'LOW', string> = {
  HIGH: '高',
  MEDIUM: '中',
  LOW: '低',
};

const poolStatusLabels: Record<string, { text: string; color: string }> = {
  IDLE: { text: '空闲中', color: 'bg-green-100 text-green-700' },
  OCCUPIED: { text: '使用中', color: 'bg-blue-100 text-blue-700' },
  CLEANING_PENDING: { text: '待清洁', color: 'bg-yellow-100 text-yellow-700' },
  PAUSED: { text: '暂停使用', color: 'bg-gray-100 text-gray-700' },
  MAINTENANCE: { text: '维修中', color: 'bg-red-100 text-red-700' },
};

export default function CleanerDashboard() {
  const navigate = useNavigate();
  const { cleaningTasks, washingPools, updatePoolStatus, completeTask } = useAppStore();

  const todayCompletedTasks = useMemo(() => {
    const today = new Date().toDateString();
    return cleaningTasks.filter(
      (t) => t.status === 'COMPLETED' && t.completedAt && new Date(t.completedAt).toDateString() === today
    ).length;
  }, [cleaningTasks]);

  const pendingTasks = useMemo(() => {
    return cleaningTasks.filter((t) => t.status === 'PENDING' || t.status === 'IN_PROGRESS');
  }, [cleaningTasks]);

  const sortedPendingTasks = useMemo(() => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...pendingTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [pendingTasks]);

  const handleStartTask = () => {};

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  const handleUpdatePoolStatus = (poolId: string, status: 'PAUSED' | 'MAINTENANCE' | 'IDLE') => {
    updatePoolStatus(poolId, status);
  };

  const renderTaskCard = (task: CleaningTask) => {
    const TaskIcon = taskTypeIcons[task.type];
    const isInProgress = task.status === 'IN_PROGRESS';

    return (
      <div
        key={task.id}
        className="card animate-slide-up hover:scale-[1.01] transition-transform duration-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600">
              <TaskIcon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-semibold text-gray-900 text-base">
                  {taskTypeLabels[task.type]}
                </h4>
                <span
                  className={`status-badge border ${priorityColors[task.priority]}`}
                >
                  {priorityLabels[task.priority]}
                </span>
                {isInProgress && (
                  <span className="status-badge bg-primary-100 text-primary-700 border border-primary-200">
                    处理中
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-sm text-gray-500">
                <MapPin className="w-3.5 h-3.5" />
                <span>{task.poolName}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isInProgress && task.status !== 'COMPLETED' && (
              <button
                onClick={() => handleStartTask()}
                className="btn-secondary text-sm py-2 px-4"
              >
                开始处理
              </button>
            )}
            {task.status !== 'COMPLETED' && (
              <button
                onClick={() => handleCompleteTask(task.id)}
                className="btn-primary text-sm py-2 px-4 flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                完成
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderPoolCard = (pool: WashingPool) => {
    const statusInfo = poolStatusLabels[pool.status];

    return (
      <div key={pool.id} className="card animate-slide-up">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">{pool.name}</h4>
            <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-500">
              <MapPin className="w-3.5 h-3.5" />
              <span>{pool.location}</span>
            </div>
            <div className="mt-3">
              <span className={`status-badge ${statusInfo.color}`}>
                {statusInfo.text}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => handleUpdatePoolStatus(pool.id, 'PAUSED')}
            className="flex-1 btn text-sm py-2 bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-1.5"
          >
            <PauseCircle className="w-4 h-4" />
            暂停使用
          </button>
          <button
            onClick={() => handleUpdatePoolStatus(pool.id, 'MAINTENANCE')}
            className="flex-1 btn text-sm py-2 bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100 flex items-center justify-center gap-1.5"
          >
            <Wrench className="w-4 h-4" />
            维修中
          </button>
          <button
            onClick={() => handleUpdatePoolStatus(pool.id, 'IDLE')}
            className="flex-1 btn text-sm py-2 bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 flex items-center justify-center gap-1.5"
          >
            <PlayCircle className="w-4 h-4" />
            恢复使用
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="container max-w-6xl py-8 px-4">
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/')}
            className="p-2.5 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">清洁员工作台</h1>
            <p className="text-sm text-gray-500 mt-1">管理清洁任务与设备状态</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="card animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">待处理任务</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{pendingTasks.length}</p>
              </div>
              <div className="p-3 rounded-2xl bg-orange-100 text-orange-600">
                <ClipboardList className="w-7 h-7" />
              </div>
            </div>
          </div>
          <div className="card animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">今日已完成</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{todayCompletedTasks}</p>
              </div>
              <div className="p-3 rounded-2xl bg-green-100 text-green-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>
          </div>
          <div className="card animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">工作时长</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">6.5<span className="text-lg font-medium text-gray-500 ml-1">小时</span></p>
              </div>
              <div className="p-3 rounded-2xl bg-primary-100 text-primary-600">
                <Clock className="w-7 h-7" />
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-5">
            <ClipboardList className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">待办任务</h2>
            <span className="status-badge bg-orange-100 text-orange-700">
              {pendingTasks.length} 项
            </span>
          </div>
          {sortedPendingTasks.length === 0 ? (
            <div className="card text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-gray-500">暂无待办任务，干得不错！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedPendingTasks.map((task, idx) => (
                <div key={task.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                  {renderTaskCard(task)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-5">
            <Wrench className="w-5 h-5 text-primary-600" />
            <h2 className="text-xl font-bold text-gray-900">设备管理</h2>
            <span className="status-badge bg-primary-100 text-primary-700">
              {washingPools.length} 台
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {washingPools.map((pool, idx) => (
              <div key={pool.id} style={{ animationDelay: `${idx * 0.05}s` }}>
                {renderPoolCard(pool)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
