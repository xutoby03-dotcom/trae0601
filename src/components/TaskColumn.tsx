import React from 'react';
import { Plus } from 'lucide-react';
import { Task, TaskColumn as TaskColumnType } from '../types';
import { TaskCard } from './TaskCard';

interface ColumnMeta {
  title: string;
  emoji: string;
  gradient: string;
  borderColor: string;
  description: string;
}

interface Props {
  column: TaskColumnType;
  meta: ColumnMeta;
  tasks: Task[];
  index: number;
  onAdd: () => void;
  onEdit: (task: Task) => void;
  dragOver: boolean;
  draggedId: string | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: () => void;
  onTaskDragStart: (e: React.DragEvent, id: string) => void;
  onTaskDragEnd: () => void;
}

export const TaskColumn: React.FC<Props> = ({
  column,
  meta,
  tasks,
  index,
  onAdd,
  onEdit,
  dragOver,
  draggedId,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
}) => {
  const completed = tasks.filter((t) => t.completed).length;

  return (
    <div
      className={`flex flex-col bg-white/60 backdrop-blur-sm rounded-3xl border-2 transition-all duration-300 overflow-hidden animate-fade-in-up ${
        dragOver ? 'scale-[1.02] border-dashed' : 'border-transparent'
      } ${meta.borderColor} ${dragOver ? 'bg-coral-50/50' : ''}`}
      style={{ animationDelay: `${0.15 + index * 0.08}s` }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className={`bg-gradient-to-r ${meta.gradient} px-5 py-4 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{meta.emoji}</span>
            <div>
              <h3 className="font-bold text-lg leading-tight">{meta.title}</h3>
              <p className="text-white/80 text-xs mt-0.5">{meta.description}</p>
            </div>
          </div>
          <button
            onClick={onAdd}
            className="w-9 h-9 flex items-center justify-center bg-white/25 hover:bg-white/40 backdrop-blur-sm rounded-full transition-all hover:scale-110 group"
            title="添加任务"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
            共 {tasks.length} 项
          </span>
          {tasks.length > 0 && (
            <span className="bg-white/20 px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              ✅ {completed}/{tasks.length}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div
            onClick={onAdd}
            className="h-32 flex flex-col items-center justify-center text-slate2-400 text-sm border-2 border-dashed rounded-2xl cursor-pointer hover:border-slate2-300 hover:bg-slate2-50/50 transition-all"
          >
            <Plus className="w-8 h-8 mb-2 opacity-50" />
            <span>点击添加第一个任务</span>
          </div>
        ) : (
          tasks.map((task, i) => (
            <TaskCard
              key={task.id}
              task={task}
              index={i}
              onEdit={() => onEdit(task)}
              isDragging={draggedId === task.id}
              onDragStart={onTaskDragStart}
              onDragEnd={onTaskDragEnd}
            />
          ))
        )}
      </div>
    </div>
  );
};
