import { useTaskStore } from '@/store/taskStore';
import { cn } from '@/lib/utils';
import type { TaskStatus, Priority, TaskCategory } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS, CATEGORY_LABELS } from '@/types';
import { Filter, Plus } from 'lucide-react';

interface TaskFilterProps {
  onAddTask?: () => void;
}

export function TaskFilter({ onAddTask }: TaskFilterProps) {
  const {
    filterStatus,
    filterPriority,
    filterCategory,
    setFilterStatus,
    setFilterPriority,
    setFilterCategory,
  } = useTaskStore();

  const statusOptions: ('all' | TaskStatus)[] = ['all', 'pending', 'claimed', 'confirmed', 'in_progress', 'completed'];
  const priorityOptions: ('all' | Priority)[] = ['all', 'high', 'medium', 'low'];
  const categoryOptions: ('all' | TaskCategory)[] = ['all', 'pickup', 'ceremony', 'banquet', 'logistics', 'photo', 'other'];

  const getStatusLabel = (status: string) => {
    if (status === 'all') return '全部';
    return STATUS_LABELS[status as TaskStatus];
  };

  const getPriorityLabel = (priority: string) => {
    if (priority === 'all') return '全部';
    return PRIORITY_LABELS[priority as Priority];
  };

  const getCategoryLabel = (category: string) => {
    if (category === 'all') return '全部分类';
    return CATEGORY_LABELS[category as TaskCategory];
  };

  return (
    <div className="bg-white rounded-2xl shadow-card p-4 mb-6 border border-rose-gold/5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-warm-400" />
          <span className="text-sm text-warm-500 font-medium">筛选</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full transition-all',
                  filterStatus === status
                    ? 'bg-wine text-white'
                    : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                )}
              >
                {getStatusLabel(status)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-warm-100">
        <div className="flex-1 min-w-[120px]">
          <label className="text-xs text-warm-500 mb-1.5 block">优先级</label>
          <div className="flex flex-wrap gap-1.5">
            {priorityOptions.map((priority) => (
              <button
                key={priority}
                onClick={() => setFilterPriority(priority)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full transition-all',
                  filterPriority === priority
                    ? 'bg-rose-gold text-white'
                    : 'bg-warm-50 text-warm-600 hover:bg-warm-100'
                )}
              >
                {getPriorityLabel(priority)}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="text-xs text-warm-500 mb-1.5 block">分类</label>
          <div className="flex flex-wrap gap-1.5">
            {categoryOptions.map((category) => (
              <button
                key={category}
                onClick={() => setFilterCategory(category)}
                className={cn(
                  'px-2.5 py-1 text-xs rounded-full transition-all',
                  filterCategory === category
                    ? 'bg-wine/10 text-wine border border-wine/20'
                    : 'bg-warm-50 text-warm-600 hover:bg-warm-100 border border-transparent'
                )}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {onAddTask && (
        <div className="mt-4 pt-4 border-t border-warm-100">
          <button
            onClick={onAddTask}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-gold to-rose-goldDark text-white rounded-xl text-sm font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            新建任务
          </button>
        </div>
      )}
    </div>
  );
}
