import { useAppStore } from '@/store';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BellRing,
  AlertTriangle,
  Clock,
  CheckCircle,
  PlayCircle,
  Wrench,
  Filter,
  Phone,
  ChevronDown,
  ChevronUp,
  FileText,
  Camera,
  ClipboardList,
  Calendar,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_TYPE_LABELS,
  SOUND_OPTIONS,
  LIGHT_OPTIONS,
  VENTILATION_OPTIONS,
  HOSE_OPTIONS,
  VALVE_OPTIONS,
  BATTERY_OPTIONS,
  type TaskStatus,
  type TaskType,
  type Inspection,
} from '@/constants';
import { formatDate, todayStr } from '@/utils/dateUtils';

const taskTypeToFields: Record<TaskType, string[]> = {
  battery: ['battery_level'],
  sound: ['sound_status', 'light_status'],
  hose: ['hose_status'],
  valve: ['valve_status'],
  other: [],
};

const triggerFieldLabels: Record<string, string> = {
  sound_status: '声响测试',
  light_status: '指示灯状态',
  ventilation: '通风情况',
  hose_status: '灶具软管',
  valve_status: '阀门状态',
  battery_level: '电池电量',
};

const allOpts = [...SOUND_OPTIONS, ...LIGHT_OPTIONS, ...VENTILATION_OPTIONS, ...HOSE_OPTIONS, ...VALVE_OPTIONS, ...BATTERY_OPTIONS];
const optionLabel = (value: string): string => allOpts.find(o => o.value === value)?.label || value;
const isDangerLevel = (value: string): boolean => allOpts.find(o => o.value === value)?.level === 'danger';

export default function AlertsPage() {
  const { tasks, devices, inspections, updateTask, getInspectionsByDevice } = useAppStore();
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get('status') as TaskStatus) || 'all';
  const [filter, setFilter] = useState<TaskStatus | 'all'>(initialFilter);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const status = searchParams.get('status') as TaskStatus | null;
    if (status && ['pending', 'processing', 'done'].includes(status)) {
      setFilter(status);
    }
  }, [searchParams]);

  const toggleTask = (taskId: string) => {
    setExpandedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const getInspection = (task: { inspection_id?: string; device_id: string }): Inspection | undefined => {
    if (!task.inspection_id) return undefined;
    return getInspectionsByDevice(task.device_id).find(i => i.id === task.inspection_id);
  };

  const getTriggerItems = (task: { task_type: TaskType; inspection_id?: string; device_id: string }) => {
    const inspection = getInspection(task);
    if (!inspection) return [];
    return (taskTypeToFields[task.task_type] || [])
      .filter(f => inspection[f as keyof Inspection] !== undefined)
      .map(field => ({
        field,
        label: triggerFieldLabels[field] || field,
        value: inspection[field as keyof Inspection] as string,
        labelText: optionLabel(inspection[field as keyof Inspection] as string),
        isDanger: isDangerLevel(inspection[field as keyof Inspection] as string),
      }))
      .filter(item => item.isDanger);
  };

  const filteredTasks = tasks
    .filter(t => filter === 'all' ? true : t.status === filter)
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const processingCount = tasks.filter(t => t.status === 'processing').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const handleStatusChange = (taskId: string, newStatus: TaskStatus, remark?: string) => {
    const patch: any = { status: newStatus };
    if (newStatus === 'done') {
      patch.handle_time = todayStr();
      if (remark) patch.handle_remark = remark;
    }
    updateTask(taskId, patch);
  };

  const statusTabs = [
    { value: 'all', label: '全部', count: tasks.length, color: 'gray' },
    { value: 'pending', label: '待处理', count: pendingCount, color: 'danger' },
    { value: 'processing', label: '处理中', count: processingCount, color: 'warning' },
    { value: 'done', label: '已完成', count: doneCount, color: 'success' },
  ] as const;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">异常维修</h1>
        <p className="text-sm text-gray-500 mt-1">管理所有设备异常和维修任务</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-brand-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Wrench className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">任务总数</p>
              <p className="text-2xl font-bold text-gray-800">{tasks.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-danger-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">待处理</p>
              <p className="text-2xl font-bold text-danger-600">{pendingCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-warning-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <PlayCircle className="w-5 h-5 text-warning-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">处理中</p>
              <p className="text-2xl font-bold text-warning-600">{processingCount}</p>
            </div>
          </div>
        </div>
        <div className="card p-5 bg-gradient-to-br from-success-50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <CheckCircle className="w-5 h-5 text-success-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">已完成</p>
              <p className="text-2xl font-bold text-success-600">{doneCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-2">
        <div className="flex items-center gap-1 overflow-x-auto">
          {statusTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                filter === tab.value
                  ? `bg-${tab.color}-500 text-white shadow-md`
                  : 'text-gray-600 hover:bg-cream-100'
              }`}
              style={filter === tab.value ? {
                backgroundColor: tab.color === 'gray' ? '#374151' :
                                 tab.color === 'danger' ? '#C1121F' :
                                 tab.color === 'warning' ? '#F4A261' : '#2E8B57',
                color: 'white'
              } : {}}
            >
              <Filter className="w-4 h-4" />
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs ${
                  filter === tab.value ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const device = devices.find(d => d.id === task.device_id);
            return (
              <div
                key={task.id}
                className={`card p-5 transition-all duration-200 hover:shadow-md ${
                  task.status === 'done'
                    ? 'opacity-75'
                    : task.priority === 'high'
                    ? 'border-l-4 border-l-danger-500 border-pulse'
                    : task.priority === 'medium'
                    ? 'border-l-4 border-l-warning-500'
                    : 'border-l-4 border-l-brand-500'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className={`tag ${
                        task.priority === 'high' ? 'bg-danger-100 text-danger-600' :
                        task.priority === 'medium' ? 'bg-warning-100 text-warning-600' :
                        'bg-brand-100 text-brand-600'
                      }`}>
                        <AlertTriangle className="w-3 h-3" />
                        {TASK_PRIORITY_LABELS[task.priority]}优先级
                      </span>
                      <span className="tag bg-cream-100 text-gray-600">
                        {TASK_TYPE_LABELS[task.task_type]}
                      </span>
                      <span className={`tag ${
                        task.status === 'done' ? 'bg-success-100 text-success-600' :
                        task.status === 'processing' ? 'bg-warning-100 text-warning-600' :
                        'bg-danger-100 text-danger-600'
                      }`}>
                        {TASK_STATUS_LABELS[task.status]}
                      </span>
                    </div>

                    <h3 className={`font-bold text-gray-800 mb-1 ${task.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                      {task.description}
                    </h3>

                    {task.handle_remark && task.status === 'done' && (
                      <p className="text-sm text-gray-500 mb-2 bg-cream-50 p-2 rounded-lg">
                        处理结果：{task.handle_remark}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      {device && (
                        <Link to={`/devices/${device.id}`} className="inline-flex items-center gap-1 text-brand-500 hover:underline font-medium">
                          <BellRing className="w-4 h-4" />
                          {device.location}
                        </Link>
                      )}
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {task.created_at}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Wrench className="w-4 h-4" />
                        {task.assignee || '未指派'}
                      </span>
                      {device && (
                        <a href={`tel:${device.maintenance_phone}`} className="inline-flex items-center gap-1 text-success-600 hover:underline">
                          <Phone className="w-4 h-4" />
                          报修
                        </a>
                      )}
                    </div>
                  </div>

                  {(() => {
                    const inspection = getInspection(task);
                    const triggerItems = getTriggerItems(task);
                    const expanded = expandedTasks.has(task.id);
                    if (!inspection) return null;
                    return (
                      <div className="mt-4 pt-4 border-t border-cream-200">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          className="w-full flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-cream-50 transition-colors"
                        >
                          <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                            <ClipboardList className="w-4 h-4 text-brand-500" />
                            <span>自检来源</span>
                            {triggerItems.length > 0 && (
                              <span className="text-xs text-danger-500 bg-danger-50 px-1.5 py-0.5 rounded-full">
                                {triggerItems.length} 项异常
                              </span>
                            )}
                          </div>
                          {expanded ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                          )}
                        </button>

                        {expanded && (
                          <div className="pl-6 pt-3 space-y-3 animate-fade-in-up">
                            {triggerItems.length > 0 && (
                              <div className="space-y-1.5">
                                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                  <AlertTriangle className="w-3.5 h-3.5 text-danger-500" />
                                  触发项
                                </div>
                                <div className="space-y-1">
                                  {triggerItems.map(item => (
                                    <div key={item.field} className="flex items-center gap-2 text-sm">
                                      <span className="text-gray-500">{item.label}：</span>
                                      <span className="text-danger-600 font-medium">{item.labelText}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                巡检日期
                              </div>
                              <p className="text-sm text-gray-700">{formatDate(inspection.inspect_date)}</p>
                            </div>

                            <div className="space-y-1">
                              <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                <Camera className="w-3.5 h-3.5 text-gray-400" />
                                现场照片
                              </div>
                              {inspection.photo ? (
                                <img
                                  src={inspection.photo}
                                  alt="巡检现场照片"
                                  className="rounded-lg border border-gray-200 max-h-40 w-full object-cover"
                                />
                              ) : (
                                <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 text-center">
                                  <Camera className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                                  <p className="text-xs text-gray-400">本次巡检未拍摄照片</p>
                                </div>
                              )}
                            </div>

                            {inspection.remark && (
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                                  <FileText className="w-3.5 h-3.5 text-gray-400" />
                                  备注
                                </div>
                                <p className="text-sm text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                  {inspection.remark}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  <div className="flex sm:flex-col gap-2 sm:w-32 shrink-0">
                    {task.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'processing')}
                        className="flex-1 sm:flex-none btn-primary py-2 text-xs"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        开始处理
                      </button>
                    )}
                    {(task.status === 'pending' || task.status === 'processing') && (
                      <button
                        onClick={() => {
                          const remark = prompt('请填写处理结果备注：', '已完成维修');
                          if (remark !== null) {
                            handleStatusChange(task.id, 'done', remark);
                          }
                        }}
                        className="flex-1 sm:flex-none btn-secondary py-2 text-xs"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        标记完成
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <BellRing className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            {filter === 'all' ? '暂无维修任务' : '暂无该状态任务'}
          </h3>
          <p className="text-gray-500 mb-6">
            {filter === 'all'
              ? '所有设备运行正常，继续保持定期巡检'
              : '切换筛选条件查看其他状态任务'}
          </p>
          <Link to="/devices" className="btn-primary">
            去巡检设备
          </Link>
        </div>
      )}
    </div>
  );
}
