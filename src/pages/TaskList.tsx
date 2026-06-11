import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ClipboardList } from 'lucide-react';
import { useAppStore } from '@/store';
import TaskCard from '@/components/TaskCard';
import type { TaskStatus } from '@/types';
import { getTodayStr } from '@/utils';

export default function TaskList() {
  const { tasks, pets, getPetById, getTaskStatus, getMissedItems } = useAppStore();
  const [filter, setFilter] = useState<TaskStatus | 'all'>('all');

  const tasksWithStatus = tasks
    .map((task) => ({
      task,
      status: getTaskStatus(task),
      pet: getPetById(task.petId),
      missedCount: getMissedItems(task.id, getTodayStr()).length,
    }))
    .filter((t) => filter === 'all' || t.status === filter)
    .sort((a, b) => {
      const statusOrder: Record<string, number> = { active: 0, pending: 1, completed: 2 };
      return statusOrder[a.status] - statusOrder[b.status];
    });

  const tabs = [
    { key: 'all' as const, label: '全部', count: tasks.length },
    { key: 'active' as const, label: '进行中', count: tasks.filter((t) => getTaskStatus(t) === 'active').length },
    { key: 'pending' as const, label: '待开始', count: tasks.filter((t) => getTaskStatus(t) === 'pending').length },
    { key: 'completed' as const, label: '已结束', count: tasks.filter((t) => getTaskStatus(t) === 'completed').length },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ClipboardList className="text-brand-500" size={28} />
            寄养任务
          </h1>
          <p className="text-slate-500 mt-1">管理所有寄养交接任务</p>
        </div>
        <Link to="/tasks/new" className="btn-primary">
          <Plus size={18} />
          新建寄养
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              filter === tab.key
                ? 'bg-brand-500 text-white shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {tab.label}
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {tasksWithStatus.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无寄养任务</h3>
          <p className="text-slate-500 mb-6">创建第一个寄养任务，开始系统化管理交接流程</p>
          <Link to="/tasks/new" className="btn-primary">
            <Plus size={18} />
            新建寄养
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasksWithStatus.map(({ task, status, pet, missedCount }) => (
            <TaskCard
              key={task.id}
              task={{ ...task, status }}
              pet={pet}
              showMissedAlert={status === 'active'}
              missedItemsCount={missedCount}
            />
          ))}
        </div>
      )}
    </div>
  );
}
