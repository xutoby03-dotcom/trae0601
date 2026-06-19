import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ClipboardList, Loader2, CheckCircle2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  TASK_STATUS_LABELS,
  type MaintenanceTask,
  type TaskStatus,
} from '@/constants';
import { useAppStore } from '@/store';
import { todayStr } from '@/utils/dateUtils';
import TaskCard from './TaskCard';

interface BoardColumn {
  status: TaskStatus;
  title: string;
  icon: typeof ClipboardList;
  accent: string;
  bgAccent: string;
  tasks: MaintenanceTask[];
}

export default function TaskBoard() {
  const tasks = useAppStore((s) => s.tasks);
  const updateTask = useAppStore((s) => s.updateTask);

  const pendingTasks = tasks.filter((t) => t.status === 'pending');
  const processingTasks = tasks.filter((t) => t.status === 'processing');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  const columns: BoardColumn[] = [
    {
      status: 'pending',
      title: TASK_STATUS_LABELS.pending,
      icon: ClipboardList,
      accent: 'text-danger-600',
      bgAccent: 'bg-danger-500',
      tasks: pendingTasks,
    },
    {
      status: 'processing',
      title: TASK_STATUS_LABELS.processing,
      icon: Loader2,
      accent: 'text-warning-600',
      bgAccent: 'bg-warning-500',
      tasks: processingTasks,
    },
    {
      status: 'done',
      title: TASK_STATUS_LABELS.done,
      icon: CheckCircle2,
      accent: 'text-success-500',
      bgAccent: 'bg-success-500',
      tasks: doneTasks,
    },
  ];

  const allStatuses: TaskStatus[] = ['pending', 'processing', 'done'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {columns.map((col) => (
        <BoardColumnView
          key={col.status}
          column={col}
          allStatuses={allStatuses}
          onUpdateStatus={(taskId, newStatus) => {
            const patch: Partial<MaintenanceTask> = { status: newStatus };
            if (newStatus === 'done') {
              patch.handle_time = todayStr();
            } else {
              patch.handle_time = undefined;
            }
            updateTask(taskId, patch);
          }}
        />
      ))}
    </div>
  );
}

interface BoardColumnViewProps {
  column: BoardColumn;
  allStatuses: TaskStatus[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

function BoardColumnView({ column, allStatuses, onUpdateStatus }: BoardColumnViewProps) {
  const Icon = column.icon;

  return (
    <div className="flex flex-col bg-cream-50/60 rounded-2xl border border-cream-200/80 min-h-[400px]">
      <div className="px-4 py-3 border-b border-cream-200/60 flex items-center gap-3">
        <div className={cn('w-2.5 h-2.5 rounded-full', column.bgAccent)} />
        <Icon className={cn('w-5 h-5', column.accent)} />
        <h3 className="font-bold text-gray-800 flex-1">{column.title}</h3>
        <span
          className={cn(
            'tag font-semibold',
            column.status === 'pending' && 'bg-danger-100 text-danger-600',
            column.status === 'processing' && 'bg-warning-100 text-warning-600',
            column.status === 'done' && 'bg-success-100 text-success-600'
          )}
        >
          {column.tasks.length}
        </span>
      </div>

      <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-380px)]">
        {column.tasks.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-xl flex items-center justify-center border border-dashed border-gray-200">
              <Icon className="w-6 h-6 text-gray-300" />
            </div>
            暂无任务
          </div>
        ) : (
          column.tasks.map((task) => (
            <TaskCardWithMenu
              key={task.id}
              task={task}
              currentStatus={column.status}
              allStatuses={allStatuses}
              onUpdateStatus={onUpdateStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TaskCardWithMenuProps {
  task: MaintenanceTask;
  currentStatus: TaskStatus;
  allStatuses: TaskStatus[];
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
}

function TaskCardWithMenu({ task, currentStatus, allStatuses, onUpdateStatus }: TaskCardWithMenuProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative">
      <div className="absolute top-3 right-3 z-10" ref={menuRef}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
            menuOpen
              ? 'bg-brand-100 text-brand-600'
              : 'text-gray-400 hover:bg-white hover:text-gray-600'
          )}
        >
          {menuOpen ? <ChevronDown className="w-4 h-4" /> : <MoreHorizontal className="w-4 h-4" />}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-9 w-44 bg-white rounded-xl shadow-lg border border-cream-200 py-1.5 z-20 animate-fade-in-up">
            <div className="px-3 py-1.5 text-xs text-gray-400 font-medium">
              切换状态
            </div>
            {allStatuses.map((status) => (
              <button
                key={status}
                onClick={() => {
                  if (status !== currentStatus) {
                    onUpdateStatus(task.id, status);
                  }
                  setMenuOpen(false);
                }}
                disabled={status === currentStatus}
                className={cn(
                  'w-full px-3 py-2 text-left text-sm flex items-center gap-2 transition-colors',
                  status === currentStatus
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-700 hover:bg-cream-50'
                )}
              >
                <span
                  className={cn(
                    'w-2 h-2 rounded-full',
                    status === 'pending' && 'bg-danger-500',
                    status === 'processing' && 'bg-warning-500',
                    status === 'done' && 'bg-success-500'
                  )}
                />
                {TASK_STATUS_LABELS[status]}
                {status === currentStatus && (
                  <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-brand-500" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <TaskCard task={task} />
    </div>
  );
}
