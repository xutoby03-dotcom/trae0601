import { useState } from 'react';
import { ListTodo, Filter, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import TaskCard from '@/components/TaskCard';
import { TASK_STATUS_LABELS } from '@/utils/constants';
import type { TaskStatus } from '@/types';

const filters: (TaskStatus | 'all')[] = ['all', 'pending', 'in_progress', 'completed'];

export default function TaskList() {
  const navigate = useNavigate();
  const { tasks } = useAppStore();
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const filteredTasks = tasks.filter((t) => (filter === 'all' ? true : t.status === filter));

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filters.map((f) => {
          const isActive = filter === f;
          const label = f === 'all' ? '全部任务' : TASK_STATUS_LABELS[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`p-5 rounded-xl text-left transition-all ${
                isActive
                  ? 'bg-primary-700 text-white shadow-lg shadow-primary-700/20'
                  : 'bg-white border border-slate-100 hover:border-primary-200'
              }`}
            >
              <p className={`text-sm ${isActive ? 'text-white/70' : 'text-slate-500'}`}>{label}</p>
              <p className={`text-3xl font-bold mt-1 font-mono ${isActive ? '' : 'text-slate-800'}`}>
                {counts[f]}
              </p>
            </button>
          );
        })}
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Filter className="w-4 h-4" />
            当前显示 {filteredTasks.length} 个任务
          </div>
          <button
            onClick={() => {
              alert('请在巡检或库存页面触发补给任务生成');
            }}
            className="btn btn-secondary btn-sm"
          >
            <Plus className="w-4 h-4" />
            手动创建任务
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="card p-16 text-center">
          <ListTodo className="w-16 h-16 mx-auto text-slate-200 mb-4" />
          <h3 className="text-lg font-medium text-slate-600 mb-2">暂无任务</h3>
          <p className="text-slate-400">当前筛选条件下没有补给任务</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
