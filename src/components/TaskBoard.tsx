import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { COLUMN_META, TaskColumn as TaskColumnType, Task } from '../types';
import { TaskColumn } from './TaskColumn';
import { TaskModal } from './TaskModal';

export const TaskBoard: React.FC = () => {
  const tasks = usePlanStore((s) => s.plan.tasks);
  const [editingTask, setEditingTask] = React.useState<{ task?: Task; column?: TaskColumnType } | null>(null);
  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOver, setDragOver] = React.useState<TaskColumnType | null>(null);

  const columns: TaskColumnType[] = ['secret', 'same_day', 'advance'];

  const getTasksForColumn = (col: TaskColumnType) => tasks.filter((t) => t.column === col);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOver(null);
  };

  const handleDrop = (targetCol: TaskColumnType) => {
    if (draggedId) {
      usePlanStore.getState().moveTask(draggedId, targetCol);
    }
    setDraggedId(null);
    setDragOver(null);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalBudget = tasks.reduce((s, t) => s + (t.budget || 0), 0);
  const paidBudget = tasks.filter((t) => t.isPaid).reduce((s, t) => s + (t.budget || 0), 0);

  return (
    <section className="mb-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl text-slate2-800 flex items-center gap-2">
            <span>📋</span>
            <span>任务看板</span>
            <span className="ml-2 text-base font-body font-normal text-slate2-500 bg-slate2-100 px-3 py-1 rounded-full">
              已完成 {completedCount}/{tasks.length}
            </span>
          </h2>
          <p className="mt-1 text-slate2-500 text-sm">
            拖拽卡片移动分区 · 明确分工不翻车 🚗
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate2-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-mint-500"></span>
            <span>任务预算 ¥{totalBudget.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cream-500"></span>
            <span>已垫付 ¥{paidBudget.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {columns.map((col, idx) => (
          <TaskColumn
            key={col}
            column={col}
            meta={COLUMN_META[col]}
            tasks={getTasksForColumn(col)}
            index={idx}
            onAdd={() => setEditingTask({ column: col })}
            onEdit={(task) => setEditingTask({ task })}
            dragOver={dragOver === col}
            draggedId={draggedId}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(col);
            }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col)}
            onTaskDragStart={handleDragStart}
            onTaskDragEnd={handleDragEnd}
          />
        ))}
      </div>

      {editingTask && (
        <TaskModal
          task={editingTask.task}
          defaultColumn={editingTask.column}
          onClose={() => setEditingTask(null)}
        />
      )}
    </section>
  );
};
