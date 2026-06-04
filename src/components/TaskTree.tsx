import React, { useState, useRef } from 'react';
import { TaskNode } from '../types';

interface TaskTreeProps {
  tasks: TaskNode[];
  onToggleExpand: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<TaskNode>) => void;
  onDeleteTask: (taskId: string) => void;
  onAddSubTask: (parentId: string) => void;
  onReorderTask: (
    draggedId: string,
    targetId: string,
    position: 'before' | 'after' | 'inside'
  ) => void;
  selectedTaskId: string | null;
  onSelectTask: (taskId: string | null) => void;
}

const TaskTree: React.FC<TaskTreeProps> = ({
  tasks,
  onToggleExpand,
  onUpdateTask,
  onDeleteTask,
  onAddSubTask,
  onReorderTask,
  selectedTaskId,
  onSelectTask,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<'before' | 'after' | 'inside'>('after');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDoubleClick = (task: TaskNode) => {
    setEditingId(task.id);
    setEditName(task.name);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleBlur = () => {
    if (editingId && editName.trim()) {
      onUpdateTask(editingId, { name: editName.trim() });
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, taskId: string, hasChildren: boolean) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(taskId);

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;

    if (y < height * 0.25) {
      setDragPosition('before');
    } else if (y > height * 0.75) {
      setDragPosition('after');
    } else if (hasChildren) {
      setDragPosition('inside');
    } else {
      setDragPosition('after');
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedId && draggedId !== targetId && dragOverId === targetId) {
      onReorderTask(draggedId, targetId, dragPosition);
    }
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  const renderTask = (task: TaskNode) => {
    const hasChildren = task.children && task.children.length > 0;
    const isDragging = draggedId === task.id;
    const isDragOver = dragOverId === task.id;
    const isSelected = selectedTaskId === task.id;

    let dragClass = '';
    if (isDragOver) {
      if (dragPosition === 'before') dragClass = 'drag-over-before';
      else if (dragPosition === 'after') dragClass = 'drag-over-after';
      else if (dragPosition === 'inside') dragClass = 'drag-over-inside';
    }

    return (
      <div key={task.id}>
        <div
          className={`task-row ${isDragging ? 'dragging' : ''} ${isDragOver ? 'drag-over' : ''} ${isSelected ? 'selected' : ''}`}
          draggable
          onDragStart={(e) => handleDragStart(e, task.id)}
          onDragOver={(e) => handleDragOver(e, task.id, hasChildren)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, task.id)}
          onDragEnd={handleDragEnd}
          onClick={() => onSelectTask(task.id)}
          style={{ paddingLeft: `${task.depth * 20 + 8}px` }}
          data-task-id={task.id}
          data-row-height={36}
        >
          {hasChildren ? (
            <button
              className="task-expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand(task.id);
              }}
            >
              {task.expanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="task-indent" />
          )}

          {editingId === task.id ? (
            <input
              ref={inputRef}
              className="task-name-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span
              className="task-name"
              onDoubleClick={() => handleDoubleClick(task)}
            >
              {task.name}
              {task.isMilestone && <span style={{ color: '#fa8c16', marginLeft: '4px' }}>◆</span>}
            </span>
          )}

          <span className="task-progress">{task.progress}%</span>

          <button
            className="task-delete-btn"
            title="删除任务"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`确定要删除任务"${task.name}"及其所有子任务吗？`)) {
                onDeleteTask(task.id);
              }
            }}
          >
            ×
          </button>
        </div>

        {task.expanded && task.children.map((child) => renderTask(child))}
      </div>
    );
  };

  return (
    <div className="gantt-left">
      <div className="gantt-left-header">
        <span style={{ flex: 1 }}>任务列表</span>
        <button
          className="toolbar-btn"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={() => onAddSubTask('')}
          title="添加任务"
        >
          + 添加
        </button>
      </div>
      <div className="gantt-task-list">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">暂无任务，点击上方"添加"按钮创建</div>
          </div>
        ) : (
          tasks.map((task) => renderTask(task))
        )}
      </div>
    </div>
  );
};

export default TaskTree;
