import React from 'react';
import { usePlanStore } from '../store/usePlanStore';
import { TimelineNode as TimelineNodeType } from '../types';
import { Avatar } from './Avatar';
import {
  CheckCircle2,
  Circle,
  Clock,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  Users,
} from 'lucide-react';

interface Props {
  node: TimelineNodeType;
  index: number;
  isLast: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const NODE_COLORS = [
  'from-coral-400 to-coral-600',
  'from-cream-400 to-amber-500',
  'from-mint-400 to-teal-500',
  'from-purple-400 to-indigo-500',
  'from-pink-400 to-rose-500',
  'from-sky-400 to-blue-500',
];

export const TimelineItem: React.FC<Props> = ({
  node,
  index,
  isLast,
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}) => {
  const participants = usePlanStore((s) => s.plan.participants);
  const toggleTimelineComplete = usePlanStore((s) => s.toggleTimelineComplete);
  const removeTimelineNode = usePlanStore((s) => s.removeTimelineNode);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const assignee = participants.find((p) => p.id === node.assigneeId);
  const colorClass = NODE_COLORS[index % NODE_COLORS.length];

  const isCurrent = React.useMemo(() => {
    if (node.completed) return false;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const [h, m] = node.time.split(':').map(Number);
    const nodeMin = h * 60 + m;
    const diff = nodeMin - nowMin;
    return diff >= 0 && diff <= 60;
  }, [node.time, node.completed]);

  return (
    <div
      className={`relative transition-all duration-300 ${
        node.completed ? 'opacity-60' : ''
      }`}
    >
      {/* Node dot */}
      <div className="absolute -left-10 md:-left-12 top-4 flex flex-col items-center">
        <button
          onClick={() => toggleTimelineComplete(node.id)}
          className={`relative w-10 h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br ${colorClass} text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform ${
            isCurrent ? 'animate-pulse-soft ring-4 ring-coral-200' : ''
          }`}
        >
          {node.completed ? (
            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={3} />
          ) : (
            <span className="text-lg md:text-xl">{node.icon}</span>
          )}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-mono font-bold text-slate2-600 whitespace-nowrap bg-white/80 backdrop-blur-sm px-1.5 py-0.5 rounded-full border border-slate2-200 shadow-sm">
            {node.time}
          </div>
        </button>
      </div>

      {/* Card */}
      <div
        onClick={() => !node.completed && onEdit()}
        className={`bg-white rounded-2xl p-4 md:p-5 shadow-card hover:shadow-card-hover transition-all cursor-pointer border ${
          node.completed
            ? 'border-mint-200 bg-gradient-to-br from-white to-mint-50/50'
            : 'border-slate2-100 hover:-translate-y-0.5'
        } ${isCurrent ? 'ring-2 ring-coral-300' : ''}`}
      >
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4
                className={`font-bold text-lg text-slate2-800 ${
                  node.completed ? 'line-through text-slate2-400' : ''
                }`}
              >
                {node.title}
              </h4>
              {isCurrent && (
                <span className="text-xs px-2 py-0.5 bg-coral-100 text-coral-700 rounded-full font-semibold flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" />
                  即将开始
                </span>
              )}
            </div>
            {node.description && (
              <p
                className={`text-sm mt-1 ${
                  node.completed ? 'text-slate2-400' : 'text-slate2-600'
                }`}
              >
                {node.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {canMoveUp && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveUp();
                }}
                className="p-1.5 hover:bg-slate2-100 rounded-lg text-slate2-400 hover:text-slate2-600"
                title="上移"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
            {canMoveDown && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveDown();
                }}
                className="p-1.5 hover:bg-slate2-100 rounded-lg text-slate2-400 hover:text-slate2-600"
                title="下移"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 hover:bg-slate2-100 rounded-lg text-slate2-400 hover:text-slate2-600"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
            {!showDeleteConfirm ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="p-1.5 hover:bg-red-50 rounded-lg text-slate2-400 hover:text-red-500"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <div
                className="flex items-center bg-red-50 rounded-lg px-1"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-xs text-red-600 px-1">确认?</span>
                <button
                  onClick={() => removeTimelineNode(node.id)}
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

        {assignee && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate2-100/50">
            <Users className="w-3.5 h-3.5 text-slate2-400" />
            <Avatar participant={assignee} size="sm" showName />
            <span className="text-xs text-slate2-400">负责</span>
          </div>
        )}
      </div>
    </div>
  );
};
