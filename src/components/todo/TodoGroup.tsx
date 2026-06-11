import { useState } from 'react';
import { ChevronDown, ChevronUp, AlertCircle, Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Todo } from '@/types';
import TodoCard from './TodoCard';

export type GroupType = 'overdue' | 'today' | 'this_week' | 'others';

interface TodoGroupProps {
  title: string;
  type: GroupType;
  todos: Todo[];
  defaultCollapsed?: boolean;
  onComplete?: (todo: Todo) => void;
  onViewDetail?: (todo: Todo) => void;
  className?: string;
}

const groupIcons = {
  overdue: AlertCircle,
  today: Clock,
  this_week: CalendarDays,
  others: CalendarDays,
};

const groupColors = {
  overdue: 'text-danger-500 bg-danger-50',
  today: 'text-accent-600 bg-accent-50',
  this_week: 'text-info-600 bg-info-50',
  others: 'text-gray-600 bg-gray-50',
};

export default function TodoGroup({
  title,
  type,
  todos,
  defaultCollapsed = false,
  onComplete,
  onViewDetail,
  className,
}: TodoGroupProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const Icon = groupIcons[type];
  const colorClass = groupColors[type];

  if (todos.length === 0) {
    return null;
  }

  return (
    <div className={cn('mb-6', className)}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors mb-3"
      >
        <div className="flex items-center gap-2.5">
          <div className={cn('p-1.5 rounded', colorClass)}>
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-medium text-gray-900">{title}</span>
          <span className={cn(
            'px-2 py-0.5 rounded-full text-xs font-medium',
            type === 'overdue' ? 'bg-danger-500 text-white' :
            type === 'today' ? 'bg-accent-500 text-white' :
            type === 'this_week' ? 'bg-info-500 text-white' :
            'bg-gray-500 text-white'
          )}>
            {todos.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {!collapsed && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
          {todos.map((todo) => (
            <TodoCard
              key={todo.id}
              todo={todo}
              onComplete={onComplete}
              onViewDetail={onViewDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
