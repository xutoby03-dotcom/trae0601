import { useState } from 'react';
import {
  User,
  Calendar,
  Clock,
  CheckCircle,
  RotateCcw,
  PlayCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  Camera,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TASK_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  SOUND_OPTIONS,
  LIGHT_OPTIONS,
  VENTILATION_OPTIONS,
  HOSE_OPTIONS,
  VALVE_OPTIONS,
  BATTERY_OPTIONS,
  type MaintenanceTask,
  type TaskStatus,
  type TaskPriority,
  type TaskType,
} from '@/constants';
import { useAppStore } from '@/store';
import { formatDate, todayStr } from '@/utils/dateUtils';

interface TaskCardProps {
  task: MaintenanceTask;
  onStatusChange?: (status: TaskStatus) => void;
}

const priorityStyles: Record<TaskPriority, string> = {
  high: 'bg-danger-100 text-danger-600 border-danger-200',
  medium: 'bg-warning-100 text-warning-600 border-warning-200',
  low: 'bg-gray-100 text-gray-600 border-gray-200',
};

const typeStyles: Record<string, string> = {
  battery: 'bg-danger-100 text-danger-600 border border-danger-200',
  sound: 'bg-warning-100 text-warning-600 border border-warning-200',
  hose: 'bg-danger-100 text-danger-600 border border-danger-200',
  valve: 'bg-danger-100 text-danger-600 border border-danger-200',
  other: 'bg-gray-100 text-gray-700 border border-gray-200',
};

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

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const updateTask = useAppStore((s) => s.updateTask);
  const getDevice = useAppStore((s) => s.getDevice);
  const getInspectionsByDevice = useAppStore((s) => s.getInspectionsByDevice);
  const device = getDevice(task.device_id);

  const [assignee, setAssignee] = useState(task.assignee);
  const [handleRemark, setHandleRemark] = useState(task.handle_remark);
  const [expanded, setExpanded] = useState(false);

  const inspection = task.inspection_id
    ? getInspectionsByDevice(task.device_id).find(i => i.id === task.inspection_id)
    : undefined;

  const triggerItems = inspection
    ? (taskTypeToFields[task.task_type] || [])
        .filter(f => inspection[f as keyof typeof inspection] !== undefined)
        .map(field => ({
          label: triggerFieldLabels[field] || field,
          value: inspection[field as keyof typeof inspection] as string,
          labelText: optionLabel(inspection[field as keyof typeof inspection] as string),
        }))
    : [];

  const handleAssigneeBlur = () => {
    if (assignee !== task.assignee) {
      updateTask(task.id, { assignee });
    }
  };

  const handleRemarkBlur = () => {
    if (handleRemark !== task.handle_remark) {
      updateTask(task.id, { handle_remark: handleRemark });
    }
  };

  const changeStatus = (newStatus: TaskStatus) => {
    const patch: Partial<MaintenanceTask> = { status: newStatus };
    if (newStatus === 'done' && !task.handle_time) {
      patch.handle_time = todayStr();
    }
    if (newStatus !== 'done') {
      patch.handle_time = undefined;
    }
    updateTask(task.id, patch);
    onStatusChange?.(newStatus);
  };

  return (
    <div className="card card-hover p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span
            className={cn(
              'tag border',
              priorityStyles[task.priority]
            )}
          >
            {task.priority === 'high' ? '🔥 ' : ''}
            优先级：{TASK_PRIORITY_LABELS[task.priority]}
          </span>
          <span className={cn('tag', typeStyles[task.task_type])}>
            {TASK_TYPE_LABELS[task.task_type]}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-700 leading-relaxed font-medium">
        {task.description}
      </p>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-gray-500">
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span className="truncate hover:text-brand-600 cursor-pointer transition-colors">
            {device?.location || task.device_id}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <Calendar className="w-4 h-4 shrink-0" />
          <span>创建于 {formatDate(task.created_at)}</span>
        </div>
        {task.handle_time && (
          <div className="flex items-center gap-2 text-success-500">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>完成于 {formatDate(task.handle_time)}</span>
          </div>
        )}
      </div>

      {inspection && (
        <div className="border-t border-cream-100 pt-2">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
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
              <div className="space-y-2">
                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger-500" />
                  触发项
                </div>
                <div className="space-y-1.5">
                  {triggerItems.map(item => (
                    <div key={item.label} className="flex items-center gap-2 text-sm">
                      <span className="text-gray-500">{item.label}：</span>
                      <span className="text-danger-600 font-medium">{item.labelText}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  巡检日期
                </div>
                <p className="text-sm text-gray-700">{formatDate(inspection.inspect_date)}</p>
              </div>

              {inspection.photo && (
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <Camera className="w-3.5 h-3.5 text-gray-400" />
                    现场照片
                  </div>
                  <img
                    src={inspection.photo}
                    alt="巡检现场照片"
                    className="rounded-lg border border-gray-200 max-h-40 w-full object-cover"
                  />
                </div>
              )}

              {inspection.remark && (
                <div className="space-y-1.5">
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
      )}

      <div className="space-y-2 pt-2 border-t border-cream-100">
        <div>
          <label className="label-text flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            处理人
          </label>
          {task.status === 'pending' ? (
            <input
              type="text"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              onBlur={handleAssigneeBlur}
              placeholder="请输入处理人姓名"
              className="input-field py-2 text-sm"
            />
          ) : (
            <div className="px-3 py-2 bg-cream-50 rounded-xl text-sm text-gray-700">
              {task.assignee || '未指定'}
            </div>
          )}
        </div>

        <div>
          <label className="label-text flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            处理备注
          </label>
          <textarea
            value={handleRemark}
            onChange={(e) => setHandleRemark(e.target.value)}
            onBlur={handleRemarkBlur}
            placeholder="请输入处理备注..."
            rows={2}
            className="input-field py-2 text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {task.status === 'pending' && (
          <button
            onClick={() => changeStatus('processing')}
            className="btn-primary py-2 px-4 text-sm flex-1 min-w-[100px]"
          >
            <PlayCircle className="w-4 h-4" />
            标为处理中
          </button>
        )}
        {task.status !== 'done' && (
          <button
            onClick={() => changeStatus('done')}
            className="btn-danger py-2 px-4 text-sm flex-1 min-w-[100px]"
          >
            <CheckCircle className="w-4 h-4" />
            标为完成
          </button>
        )}
        {task.status !== 'pending' && (
          <button
            onClick={() => changeStatus('pending')}
            className="btn-secondary py-2 px-4 text-sm flex-1 min-w-[100px]"
          >
            <RotateCcw className="w-4 h-4" />
            重置
          </button>
        )}
      </div>
    </div>
  );
}
