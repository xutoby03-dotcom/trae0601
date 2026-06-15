import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { Task } from '../types';
import { Avatar } from './Avatar';
import {
  Calendar,
  Wallet,
  CheckCircle2,
  Circle,
  Eye,
  EyeOff,
  Image,
  ImageOff,
  GripVertical,
  Pencil,
  Trash2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface Props {
  task: Task;
  index: number;
  onEdit: () => void;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

export const TaskCard: React.FC<Props> = ({
  task,
  index,
  onEdit,
  isDragging,
  onDragStart,
  onDragEnd,
}) => {
  const participants = usePlanStore((s) => s.plan.participants);
  const revealSecrets = usePlanStore((s) => s.revealSecrets);
  const toggleTaskComplete = usePlanStore((s) => s.toggleTaskComplete);
  const removeTask = usePlanStore((s) => s.removeTask);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const assignee = participants.find((p) => p.id === task.assigneeId);
  const shouldMask = task.isSecret && !revealSecrets;
  const isOverdue = React.useMemo(() => {
    if (!task.deadline || task.completed) return false;
    return new Date(task.deadline) < new Date(new Date().toDateString());
  }, [task.deadline, task.completed]);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
      className={`relative group bg-gradient-card rounded-2xl p-4 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border ${
        task.completed ? 'border-mint-200 opacity-75' : 'border-white'
      } ${isDragging ? 'opacity-40 scale-95 rotate-2' : ''} animate-scale-in cursor-grab active:cursor-grabbing`}
      style={{ animationDelay: `${index * 0.04}s` }}
    >
      {/* Status strip */}
      <div className={`absolute top-0 left-4 right-4 h-0.5 rounded-b-full ${
        task.completed
          ? 'bg-gradient-to-r from-mint-400 to-mint-500'
          : isOverdue
          ? 'bg-gradient-to-r from-red-400 to-coral-500'
          : 'bg-gradient-to-r from-cream-300 to-cream-500'
      }`}></div>

      {/* Drag handle + top actions */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1 text-slate2-300 group-hover:text-slate2-400 transition-colors">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 hover:bg-slate2-100 rounded-lg text-slate2-400 hover:text-slate2-600 transition-colors"
            title="编辑"
          >
            <Pencil className="w-4 h-4" />
          </button>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 hover:bg-red-50 rounded-lg text-slate2-400 hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center bg-red-50 rounded-lg px-1">
              <span className="text-xs text-red-600 px-1">确认?</span>
              <button
                onClick={() => removeTask(task.id)}
                className="p-1 text-red-600 hover:bg-red-100 rounded font-bold text-sm"
              >
                ✓
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="p-1 text-slate2-500 hover:bg-slate2-100 rounded text-sm"
              >
                ✗
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Secret indicator */}
      {task.isSecret && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
            shouldMask
              ? 'bg-purple-100 text-purple-700 border border-purple-200'
              : 'bg-purple-50 text-purple-500 border border-purple-100'
          }`}>
            {shouldMask ? <EyeOff className="w-3 h-3 inline mr-0.5" /> : <Eye className="w-3 h-3 inline mr-0.5" />}
            保密任务
          </span>
        </div>
      )}

      {/* Title with secret mask */}
      <div className="mt-3 mb-3 relative">
        <button
          onClick={() => toggleTaskComplete(task.id)}
          className="absolute -left-0.5 top-0.5 group-check"
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 text-mint-500" strokeWidth={2.5} />
          ) : (
            <Circle className="w-5 h-5 text-slate2-300 hover:text-coral-400 transition-colors" />
          )}
        </button>
        <div
          onClick={() => !task.completed && onEdit()}
          className={`ml-7 cursor-pointer min-h-[1.75rem] ${
            shouldMask
              ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 rounded-lg px-3 py-1.5 backdrop-blur-sm select-none blur-[1px] hover:blur-0 transition-all duration-300'
              : ''
          } ${task.completed ? 'line-through text-slate2-400' : 'text-slate2-800'}`}
        >
          <div className="font-semibold">
            {shouldMask ? (
              <>
                <span className="text-lg mr-1">🔒</span>
                <span className="tracking-wide">{task.codeName}</span>
              </>
            ) : (
              <span>{task.title}</span>
            )}
          </div>
          {task.notes && !shouldMask && (
            <div className="text-xs text-slate2-500 mt-1 line-clamp-2">{task.notes}</div>
          )}
        </div>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate2-500 mb-3 ml-7">
        {task.deadline && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
            {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
            <span className={isOverdue ? 'font-medium' : ''}>{task.deadline.slice(5)}</span>
          </div>
        )}
        {task.budget > 0 && (
          <div className="flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" />
            <span className={task.isPaid ? 'text-mint-600 font-medium' : ''}>
              {formatCurrency(task.budget)}
              {task.isPaid && <span className="ml-0.5 text-[10px]">已付</span>}
            </span>
          </div>
        )}
        {task.isPaid && task.budget > 0 && (
          <span className="px-1.5 py-0.5 bg-mint-100 text-mint-700 rounded text-[10px] font-semibold">
            ✓ 已垫付
          </span>
        )}
        {task.photoEvidence.length > 0 ? (
          <div className="flex items-center gap-1 text-coral-600">
            <Image className="w-3.5 h-3.5" />
            <span>{task.photoEvidence.length}张</span>
          </div>
        ) : (
          <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${
            task.completed ? 'bg-orange-100 text-orange-700 animate-pulse' : 'bg-amber-50 text-amber-600'
          }`} title="需要补照片证据">
            <ImageOff className="w-3 h-3" />
            <span>缺照片</span>
          </div>
        )}
      </div>

      {/* Assignee */}
      <div className="ml-7">
        {assignee ? (
          <div className="flex items-center gap-2">
            <Avatar participant={assignee} size="sm" />
            <span className="text-xs text-slate2-500">负责</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate2-400 border border-dashed border-slate2-200 rounded-full px-2.5 py-1 w-fit">
            <Clock className="w-3 h-3" />
            <span>待分配</span>
          </div>
        )}
      </div>

      {/* Photo thumbnails */}
      {task.photoEvidence.length > 0 && !shouldMask && (
        <div className="mt-3 ml-7 flex gap-1.5 flex-wrap">
          {task.photoEvidence.slice(0, 4).map((ph, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg overflow-hidden border border-slate2-200 bg-slate2-50"
            >
              <img src={ph} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
          {task.photoEvidence.length > 4 && (
            <div className="w-10 h-10 rounded-lg bg-slate2-100 flex items-center justify-center text-xs text-slate2-500 font-semibold border border-slate2-200">
              +{task.photoEvidence.length - 4}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
