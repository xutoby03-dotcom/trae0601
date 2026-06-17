import { useMemo } from 'react';
import { usePetStore } from '../store/usePetStore';
import TaskCard from '../components/TaskCard';
import { ClipboardList, Calendar } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function TaskList() {
  const { tasks, abnormalities } = usePetStore();

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof tasks> = {};
    const sortedTasks = [...tasks].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    
    sortedTasks.forEach((task) => {
      if (!groups[task.date]) {
        groups[task.date] = [];
      }
      groups[task.date].push(task);
    });
    
    return groups;
  }, [tasks]);

  const getAbnormalitiesCountForTask = (taskId: string) => {
    return abnormalities.filter((a) => a.taskId === taskId).length;
  };

  const stats = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      total: tasks.length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      today: tasks.filter((t) => t.date === today).length,
    };
  }, [tasks]);

  return (
    <div className="space-y-8">
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-3xl font-bold text-[#2D2A26] mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          代喂任务清单 📋
        </h1>
        <p className="text-gray-500">按时完成每一项，让{usePetStore.getState().pet.name}健康快乐</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideUp">
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-3xl font-bold text-[#FF8A3D]">{stats.total}</p>
          <p className="text-sm text-gray-500">总任务数</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-3xl font-bold text-orange-500">{stats.today}</p>
          <p className="text-sm text-gray-500">今日任务</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-3xl font-bold text-green-500">{stats.completed}</p>
          <p className="text-sm text-gray-500">已完成</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-md border border-gray-100">
          <p className="text-3xl font-bold text-gray-400">{stats.pending}</p>
          <p className="text-sm text-gray-500">待执行</p>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([date, dateTasks]) => (
          <div key={date} className="animate-slideUp">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-[#FF8A3D]" />
              <h2 className="text-lg font-bold text-[#2D2A26]">
                {formatDate(date)}
              </h2>
              <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {dateTasks.length} 项任务
              </span>
            </div>
            
            <div className="space-y-3">
              {dateTasks.map((task, index) => (
                <div
                  key={task.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                  className="animate-slideUp"
                >
                  <TaskCard
                    task={task}
                    abnormalitiesCount={getAbnormalitiesCountForTask(task.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-16 animate-fadeIn">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <ClipboardList size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">暂无代喂任务</h3>
          <p className="text-gray-400">添加新的代喂任务开始使用</p>
        </div>
      )}
    </div>
  );
}
