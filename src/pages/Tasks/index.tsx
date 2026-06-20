import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Wrench,
  ShoppingCart,
  ArrowLeft,
  Clock,
  CheckCircle2,
  User as UserIcon,
  MapPin,
  Package,
  AlertTriangle,
  Save,
  ChevronRight,
  LifeBuoy,
  Ruler,
  TriangleAlert,
  Heart,
  Camera,
} from 'lucide-react';
import { useAppStore } from '@/store/appStore';
import StatusBadge, { TypeBadge, EmptyState } from '@/components/StatusBadge';
import {
  Task,
  TaskStatus,
  TaskType,
  TaskStatusLabels,
  TaskTypeLabels,
  EquipmentType,
} from '@/types';
import { formatDate } from '@/utils/dateUtils';

const typeIcons: Record<EquipmentType, typeof LifeBuoy> = {
  lifebuoy: LifeBuoy,
  rescue_pole: Ruler,
  warning_sign: TriangleAlert,
  first_aid_kit: Heart,
  camera: Camera,
};

interface TaskColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  color: string;
  bgColor: string;
  icon: typeof Clock;
  onTaskClick: (id: string) => void;
}

function TaskColumn({ title, status, tasks, color, bgColor, icon: Icon, onTaskClick }: TaskColumnProps) {
  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-3 rounded-xl ${bgColor} flex items-center justify-between mb-4`}>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${color}`} />
          <h3 className={`font-bold ${color}`}>{title}</h3>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-sm font-bold ${bgColor} ${color} border border-current`}>
          {tasks.length}
        </span>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto pr-1 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-slate-400 text-sm">
            暂无任务
          </div>
        ) : (
          tasks.map((task) => {
            const equipment = useAppStore.getState().equipments.find((e) => e.id === task.equipmentId);
            const TypeIcon = equipment ? typeIcons[equipment.type] : Package;
            return (
              <div
                key={task.id}
                onClick={() => onTaskClick(task.id)}
                className="card p-4 cursor-pointer hover:shadow-card-hover transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`px-2.5 py-1 rounded-lg text-xs font-medium ${
                    task.type === 'repair'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                  }`}>
                    {task.type === 'repair' ? (
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3 h-3" />
                        {TaskTypeLabels[task.type]}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-3 h-3" />
                        {TaskTypeLabels[task.type]}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </div>

                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 mb-1">{task.equipmentName}</p>
                    <p className="text-xs text-slate-500">{task.equipmentCode}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>

                {task.decisionReason && (
                  <p className="text-xs text-slate-500 mb-3 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                    <span className="font-medium text-slate-600">判定：</span>
                    {task.decisionReason}
                  </p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {task.abnormalItems.map((item, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100 flex items-center gap-1"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      {item}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-3 h-3" />
                    {task.assignee}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.createdAt)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default function TasksPage() {
  const navigate = useNavigate();
  const tasks = useAppStore((state) => state.tasks);

  const { pendingTasks, processingTasks, completedTasks, totalTasks, completedRate } = useMemo(
    () => {
      const pending = tasks.filter((t) => t.status === 'pending');
      const processing = tasks.filter((t) => t.status === 'processing');
      const completed = tasks.filter((t) => t.status === 'completed');
      const total = tasks.length;
      const rate = total > 0 ? Math.round((completed.length / total) * 100) : 0;
      return {
        pendingTasks: pending,
        processingTasks: processing,
        completedTasks: completed,
        totalTasks: total,
        completedRate: rate,
      };
    },
    [tasks]
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">待处理</p>
              <p className="text-2xl font-bold text-orange-600">{pendingTasks.length}</p>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">处理中</p>
              <p className="text-2xl font-bold text-blue-600">{processingTasks.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Wrench className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">已完成</p>
              <p className="text-2xl font-bold text-green-600">{completedTasks.length}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card p-5 border-l-4 border-primary-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 mb-1">完成率</p>
              <p className="text-2xl font-bold text-primary-600">{completedRate}%</p>
            </div>
            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-primary-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5">
          <TaskColumn
            title="待处理"
            status="pending"
            tasks={pendingTasks}
            color="text-orange-700"
            bgColor="bg-orange-50"
            icon={Clock}
            onTaskClick={(id) => navigate(`/tasks/${id}`)}
          />
        </div>
        <div className="card p-5">
          <TaskColumn
            title="处理中"
            status="processing"
            tasks={processingTasks}
            color="text-blue-700"
            bgColor="bg-blue-50"
            icon={Wrench}
            onTaskClick={(id) => navigate(`/tasks/${id}`)}
          />
        </div>
        <div className="card p-5">
          <TaskColumn
            title="已完成"
            status="completed"
            tasks={completedTasks}
            color="text-green-700"
            bgColor="bg-green-50"
            icon={CheckCircle2}
            onTaskClick={(id) => navigate(`/tasks/${id}`)}
          />
        </div>
      </div>
    </div>
  );
}

export function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tasks = useAppStore((state) => state.tasks);
  const updateTask = useAppStore((state) => state.updateTask);
  const getEquipment = useAppStore((state) => state.getEquipment);

  const task = tasks.find((t) => t.id === id);
  const equipment = task ? getEquipment(task.equipmentId) : undefined;

  const [handleRecord, setHandleRecord] = useState(task?.handleRecord || '');
  const [newAssignee, setNewAssignee] = useState(task?.assignee || '');
  const [newStatus, setNewStatus] = useState<TaskStatus>(task?.status || 'pending');

  if (!task) {
    return (
      <div className="card p-12 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">任务不存在</h3>
        <button onClick={() => navigate('/tasks')} className="btn-primary mt-4">
          返回任务列表
        </button>
      </div>
    );
  }

  const TypeIcon = equipment ? typeIcons[equipment.type] : Package;

  const handleSave = () => {
    const updates: Partial<Task> = {
      assignee: newAssignee,
      status: newStatus,
      handleRecord: handleRecord || undefined,
    };
    if (newStatus === 'completed' && !task.completedAt) {
      updates.completedAt = new Date().toISOString().split('T')[0];
    }
    updateTask(task.id, updates);
    navigate('/tasks');
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/tasks')}
        className="flex items-center gap-2 text-slate-600 hover:text-primary-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回任务列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-5">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-800">
                    {task.type === 'repair' ? '维修任务' : '补采任务'}
                  </h2>
                  <StatusBadge type="task" status={task.status} />
                  <span className={`px-2.5 py-1 rounded-lg text-sm font-medium ${
                    task.type === 'repair'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-orange-50 text-orange-700 border border-orange-200'
                  }`}>
                    {task.type === 'repair' ? (
                      <span className="flex items-center gap-1">
                        <Wrench className="w-4 h-4" />
                        维修
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="w-4 h-4" />
                        补采
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-sm text-slate-500">任务编号：{task.id}</p>
              </div>
              <div className="text-right text-sm text-slate-500">
                <p>创建时间</p>
                <p className="font-medium text-slate-700">{formatDate(task.createdAt)}</p>
                {task.completedAt && (
                  <>
                    <p className="mt-2">完成时间</p>
                    <p className="font-medium text-green-600">{formatDate(task.completedAt)}</p>
                  </>
                )}
              </div>
            </div>

            <div className="p-4 bg-red-50 rounded-xl border border-red-100 mb-5">
              <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                异常项目
              </h3>
              <div className="flex flex-wrap gap-2">
                {task.abnormalItems.map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white rounded-lg text-sm text-red-700 border border-red-200 font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {task.abnormalItemSources && task.abnormalItemSources.length > 0 && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
                <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary-600" />
                  判定依据
                </h3>
                <div className="space-y-3">
                  {task.abnormalItemSources.map((source, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-3 border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-700">{source.itemName}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          source.type === 'replace'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {source.type === 'replace' ? '补采' : '维修'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-slate-500">异常值：</span>
                          <span className="text-slate-700 font-medium">{source.itemValue}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">原始值：</span>
                          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono text-xs">
                            {source.rawValue}
                          </code>
                        </div>
                      </div>
                      {source.reason && (
                        <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-100">
                          <span className="text-slate-500">判定：</span>
                          {source.reason}
                        </p>
                      )}
                      {source.description && (
                        <p className="text-xs text-slate-500 mt-1">
                          <span className="text-slate-500">备注：</span>
                          {source.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                {task.decisionReason && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-700">判定理由：</span>
                      {task.decisionReason}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-5">
              <h3 className="font-semibold text-slate-700 mb-2">问题描述</h3>
              <p className="text-slate-600 bg-slate-50 rounded-xl p-4">{task.description}</p>
            </div>

            {task.handleRecord && (
              <div className="mb-5">
                <h3 className="font-semibold text-slate-700 mb-2">处理记录</h3>
                <p className="text-slate-600 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  {task.handleRecord}
                </p>
              </div>
            )}

            <div>
              <label className="label-text">更新处理记录</label>
              <textarea
                className="input-field"
                rows={3}
                value={handleRecord}
                onChange={(e) => setHandleRecord(e.target.value)}
                placeholder="请填写处理进度..."
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary-600" />
              关联器材
            </h3>
            {equipment ? (
              <div
                className="p-4 rounded-xl border border-slate-200 hover:border-primary-300 cursor-pointer transition-colors"
                onClick={() => navigate(`/equipment/${equipment.id}`)}
              >
                <div className="flex items-start gap-3 mb-3">
                  {equipment.photo ? (
                    <img src={equipment.photo} alt={equipment.name} className="w-14 h-14 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-14 bg-primary-50 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-7 h-7 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{equipment.name}</p>
                    <p className="text-sm text-slate-500">{equipment.code}</p>
                    <div className="mt-1">
                      <TypeBadge type={equipment.type} />
                    </div>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <p className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {task.equipmentLocation}
                  </p>
                  <p className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4 text-slate-400" />
                    {equipment.responsiblePerson}
                  </p>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Package className="w-8 h-8" />}
                title="器材信息不可用"
                description="该器材可能已被删除"
              />
            )}
          </div>

          <div className="card p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-primary-600" />
              任务管理
            </h3>
            <div className="space-y-4">
              <div>
                <label className="label-text">处理人</label>
                <input
                  type="text"
                  className="input-field"
                  value={newAssignee}
                  onChange={(e) => setNewAssignee(e.target.value)}
                />
              </div>
              <div>
                <label className="label-text">任务状态</label>
                <select
                  className="select-field"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as TaskStatus)}
                >
                  {(Object.keys(TaskStatusLabels) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {TaskStatusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => navigate('/tasks')} className="btn-secondary flex-1">
                  取消
                </button>
                <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  保存
                </button>
              </div>
              {newStatus === 'completed' && task.status !== 'completed' && (
                <p className="text-xs text-green-600 bg-green-50 rounded-lg p-3">
                  <CheckCircle2 className="w-4 h-4 inline mr-1" />
                  标记为完成后，器材状态将自动更新为"正常"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
