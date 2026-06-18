import { Link } from 'react-router-dom';
import { Clock, User, ArrowRight } from 'lucide-react';
import type { Task } from '@/types';
import {
  TASK_PRIORITY_LABELS,
  TASK_PRIORITY_COLORS,
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_SOURCE_LABELS,
  SUPPLY_TYPE_LABELS,
} from '@/utils/constants';
import { useAppStore } from '@/store';
import { formatDateTime } from '@/utils/helpers';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const rooms = useAppStore((state) => state.rooms);
  const room = rooms.find((r) => r.id === task.roomId);

  return (
    <Link
      to={`/tasks/${task.id}`}
      className="card p-5 block animate-slide-up group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`badge ${TASK_PRIORITY_COLORS[task.priority]}`}>
            {TASK_PRIORITY_LABELS[task.priority]}优先级
          </span>
          <span className={`badge ${TASK_STATUS_COLORS[task.status]}`}>
            {TASK_STATUS_LABELS[task.status]}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
      </div>
      <h4 className="font-medium text-slate-800 mb-2 line-clamp-2">{task.description}</h4>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">会议室</span>
          <span className="font-medium text-slate-700">{room?.name || '未知'}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">用品类型</span>
          <span className="font-medium text-slate-700">{SUPPLY_TYPE_LABELS[task.supplyType]}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">来源</span>
          <span className="font-medium text-slate-700">{TASK_SOURCE_LABELS[task.source]}</span>
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{formatDateTime(task.createdAt)}</span>
        </div>
        {task.assignee && (
          <div className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            <span>{task.assignee}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
