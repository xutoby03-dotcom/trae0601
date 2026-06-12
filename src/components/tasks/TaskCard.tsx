import { MapPin, Clock, Package, AlertCircle, Check } from 'lucide-react';
import type { Task, Person } from '@/types';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { useTaskStore } from '@/store/taskStore';
import { formatTime } from '@/utils/timeUtils';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { people } = useTaskStore();

  const assignee = people.find((p) => p.id === task.assigneeId);
  const backup = people.find((p) => p.id === task.backupId);

  const checkedItems = task.itemList.filter((item) => item.isChecked).length;
  const totalItems = task.itemList.length;

  const isHighPriority = task.priority === 'high';
  const isCompleted = task.isCompleted;

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative bg-white rounded-2xl p-5 shadow-card border transition-all duration-300 cursor-pointer',
        'hover:shadow-card-hover hover:-translate-y-1',
        isHighPriority && 'border-wine/30',
        !isHighPriority && 'border-rose-gold/10',
        isCompleted && 'opacity-75'
      )}
    >
      {isHighPriority && (
        <div className="absolute -top-1 -right-1">
          <div className="w-6 h-6 bg-wine rounded-full flex items-center justify-center animate-pulse-soft">
            <AlertCircle className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className={cn(
            'font-semibold text-warm-900 mb-1.5',
            isCompleted && 'line-through text-warm-400'
          )}>
            {task.title}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="priority" value={task.priority} />
            <Badge variant="category" value={task.category} />
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <Clock className="w-4 h-4 text-rose-gold" />
          <span className="font-mono">
            {formatTime(task.startTime)}
            {task.endTime && ` - ${formatTime(task.endTime)}`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-warm-600">
          <MapPin className="w-4 h-4 text-rose-gold" />
          <span className="truncate">{task.location}</span>
        </div>
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-sm text-warm-600">
            <Package className="w-4 h-4 text-rose-gold" />
            <span>
              物品 {checkedItems}/{totalItems}
              {checkedItems === totalItems && totalItems > 0 && (
                <Check className="w-3.5 h-3.5 inline ml-1 text-emerald-500" />
              )}
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-rose-gold/20 to-transparent my-3" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {assignee ? (
            <div className="flex items-center gap-2">
              <Avatar person={assignee} size="sm" />
              <span className="text-xs text-warm-600">{assignee.name}</span>
            </div>
          ) : (
            <span className="text-xs text-warm-400">待认领</span>
          )}
          {backup && (
            <div className="flex items-center gap-1.5 opacity-60">
              <Avatar person={backup} size="sm" />
              <span className="text-xs text-warm-500">备</span>
            </div>
          )}
        </div>
        <Badge variant="status" value={task.status} />
      </div>

      {task.changeLogs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-warm-50">
          <span className="text-xs text-warm-400">
            有 {task.changeLogs.length} 条变更记录
          </span>
        </div>
      )}
    </div>
  );
}
