import { useState } from 'react';
import { User, Calendar, Clock, CheckCircle, RotateCcw, PlayCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TASK_TYPE_LABELS,
  TASK_PRIORITY_LABELS,
  type MaintenanceTask,
  type TaskStatus,
  type TaskPriority,
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

export default function TaskCard({ task, onStatusChange }: TaskCardProps) {
  const updateTask = useAppStore((s) => s.updateTask);
  const getDevice = useAppStore((s) => s.getDevice);
  const device = getDevice(task.device_id);

  const [assignee, setAssignee] = useState(task.assignee);
  const [handleRemark, setHandleRemark] = useState(task.handle_remark);

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
