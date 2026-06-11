import { Calendar, User, Building, MessageSquare, FileText, CheckCircle2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types';
import { getPriorityBadgeClass, getPriorityLabel, getStatusColor, getStatusLabel } from '@/utils/statusUtils';
import { formatDate, getRelativeDate } from '@/utils/dateUtils';

interface TodoCardProps {
  todo: Todo;
  onComplete?: (todo: Todo) => void;
  onViewDetail?: (todo: Todo) => void;
  className?: string;
}

export default function TodoCard({ todo, onComplete, onViewDetail, className }: TodoCardProps) {
  const isCompleted = todo.status === 'completed';

  return (
    <div
      className={cn(
        'group bg-white rounded-lg border border-gray-200 p-4 shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5',
        isCompleted && 'opacity-70',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3
          className={cn(
            'text-base font-medium text-gray-900 line-clamp-2 flex-1',
            isCompleted && 'line-through text-gray-500'
          )}
        >
          {todo.title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getPriorityBadgeClass(todo.priority))}>
            {getPriorityLabel(todo.priority)}
          </span>
          <span className={cn('px-2 py-0.5 rounded text-xs font-medium', getStatusColor(todo.status))}>
            {getStatusLabel(todo.status)}
          </span>
        </div>
      </div>

      {todo.relatedTopic && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MessageSquare className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="line-clamp-1">{todo.relatedTopic}</span>
        </div>
      )}

      {todo.deliverable && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
          <span className="line-clamp-1">{todo.deliverable}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1.5">
          <User className="w-4 h-4 text-gray-400" />
          <span>{todo.assignee}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Building className="w-4 h-4 text-gray-400" />
          <span>{todo.department}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={cn(
            todo.status === 'overdue' && 'text-danger-500 font-medium',
            todo.status !== 'overdue' && todo.status !== 'completed' && getRelativeDate(todo.dueDate).includes('今天') && 'text-accent-600 font-medium'
          )}>
            {isCompleted && todo.completedAt ? `完成于 ${formatDate(todo.completedAt)}` : getRelativeDate(todo.dueDate)}
          </span>
        </div>
      </div>

      {todo.resultNote && isCompleted && (
        <div className="bg-success-50 border border-success-100 rounded p-3 mb-4">
          <p className="text-sm text-success-700">
            <span className="font-medium">完成结果：</span>
            {todo.resultNote}
          </p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => onViewDetail?.(todo)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
        >
          <Eye className="w-4 h-4" />
          详情
        </button>
        {!isCompleted && (
          <button
            onClick={() => onComplete?.(todo)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-white bg-accent-500 hover:bg-accent-600 rounded transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            完成
          </button>
        )}
      </div>
    </div>
  );
}
