import { useState } from 'react';
import { useStore } from '../store/useStore';
import { TaskCard } from '../components/TaskCard';
import { ListTodo, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import type { Task } from '../types';

type FilterType = 'all' | 'pending' | 'in_progress' | 'completed';

export const Tasks = () => {
  const { tasks, getBathroomById, getSpecById, updateTask } = useStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  const handleStatusChange = (id: string, status: Task['status']) => {
    updateTask(id, { status });
  };

  const filterConfig = [
    { key: 'all' as const, label: '全部', icon: <ListTodo size={18} />, count: tasks.length },
    { key: 'pending' as const, label: '待处理', icon: <AlertCircle size={18} />, count: pendingCount },
    { key: 'in_progress' as const, label: '进行中', icon: <Clock size={18} />, count: inProgressCount },
    { key: 'completed' as const, label: '已完成', icon: <CheckCircle2 size={18} />, count: completedCount },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">更换任务管理</h2>
        <p className="text-gray-600">
          管理所有防滑垫更换任务，及时处理安全隐患
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {filterConfig.map((item) => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${filter === item.key ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {item.icon}
            {item.label}
            <span className={`px-2 py-0.5 rounded-full text-sm ${filter === item.key ? 'bg-white/20' : 'bg-white'}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {filteredTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">暂无任务</h3>
          <p className="text-gray-500">
            {filter === 'all' ? '当前没有需要处理的任务' : `当前没有${filterConfig.find((f) => f.key === filter)?.label}的任务`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredTasks.map((task, index) => (
            <div key={task.id} style={{ animationDelay: `${index * 100}ms` }}>
              <TaskCard
                task={task}
                bathroom={getBathroomById(task.bathroomId)}
                spec={task.procurementSpecId ? getSpecById(task.procurementSpecId) : undefined}
                onStatusChange={handleStatusChange}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
