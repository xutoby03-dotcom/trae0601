import { useTaskStore } from '@/store/taskStore';
import { TaskCard } from './TaskCard';
import { TaskFilter } from './TaskFilter';
import { TaskDetail } from './TaskDetail';
import { TaskForm } from './TaskForm';
import { useMemo, useState } from 'react';

export function TaskBoard() {
  const { tasks, filterStatus, filterPriority, filterCategory, selectedTaskId, setSelectedTaskId } = useTaskStore();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filterStatus !== 'all' && task.status !== filterStatus) return false;
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      return true;
    });
  }, [tasks, filterStatus, filterPriority, filterCategory]);

  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [filteredTasks]);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setTimeout(() => setSelectedTaskId(null), 300);
  };

  return (
    <div className="relative">
      <TaskFilter onAddTask={() => setIsFormOpen(true)} />

      {sortedTasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-warm-500">暂无符合条件的任务</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTasks.map((task, index) => (
            <div
              key={task.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskCard task={task} onClick={() => handleTaskClick(task.id)} />
            </div>
          ))}
        </div>
      )}

      {selectedTaskId && (
        <TaskDetail taskId={selectedTaskId} isOpen={isDetailOpen} onClose={handleCloseDetail} />
      )}

      <TaskForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
