import React from 'react';
import { X, Clock, Hash, FileText, User } from 'lucide-react';
import { usePlanStore } from '../store/usePlanStore';
import { TimelineNode } from '../types';
import { Avatar } from './Avatar';

interface Props {
  node?: TimelineNode;
  onClose: () => void;
}

const ICON_OPTIONS = [
  '🚪', '🎈', '🚕', '🕯️', '🎉', '📹', '🎁', '🎂', '🧹', '💰',
  '🍽️', '📸', '🎵', '🚗', '📍', '⏰', '💡', '📝', '🎊', '🥳',
];

export const TimelineModal: React.FC<Props> = ({ node, onClose }) => {
  const participants = usePlanStore((s) => s.plan.participants);
  const addTimelineNode = usePlanStore((s) => s.addTimelineNode);
  const updateTimelineNode = usePlanStore((s) => s.updateTimelineNode);
  const timelineCount = usePlanStore((s) => s.plan.timeline.length);

  const isEdit = !!node;

  const [time, setTime] = React.useState(node?.time || '19:00');
  const [title, setTitle] = React.useState(node?.title || '');
  const [description, setDescription] = React.useState(node?.description || '');
  const [assigneeId, setAssigneeId] = React.useState<string | null>(node?.assigneeId || null);
  const [icon, setIcon] = React.useState(node?.icon || '📍');
  const [order] = React.useState(node?.order ?? timelineCount);

  const handleSubmit = () => {
    const payload = {
      time,
      title: title.trim() || '未命名节点',
      description: description.trim(),
      assigneeId,
      icon,
      order,
    };
    if (isEdit && node) {
      updateTimelineNode(node.id, payload);
    } else {
      addTimelineNode(payload);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate2-900/40 backdrop-blur-sm animate-scale-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-mint-500 via-cream-400 to-coral-500 px-6 py-5 text-white relative">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{icon}</span>
                <h3 className="font-display text-2xl tracking-wide">
                  {isEdit ? '编辑时间节点' : '添加时间节点'}
                </h3>
              </div>
              <p className="text-white/90 text-sm">规划当天的每一步 👇</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Time + Icon */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                时间
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-mint-400 transition-colors font-mono text-lg"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                图标
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 border-2 border-slate2-200 rounded-xl max-h-24 overflow-y-auto">
                {ICON_OPTIONS.map((ic) => (
                  <button
                    key={ic}
                    onClick={() => setIcon(ic)}
                    className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg transition-all ${
                      icon === ic
                        ? 'bg-coral-100 scale-110 shadow-md ring-2 ring-coral-300'
                        : 'hover:bg-slate2-100'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
              <span className="text-base">🏷️</span>
              节点标题
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="比如：惊喜登场、布置场地..."
              className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-mint-400 transition-colors font-medium"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4" />
              详细描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="这个节点要做什么？注意事项..."
              className="w-full px-4 py-2.5 border-2 border-slate2-200 rounded-xl focus:outline-none focus:border-mint-400 transition-colors resize-none"
            />
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-sm font-semibold text-slate2-700 mb-1.5 flex items-center gap-1.5">
              <User className="w-4 h-4" />
              负责人（可选）
            </label>
            <div className="flex flex-wrap gap-2 p-2 border-2 border-slate2-200 rounded-xl">
              {participants.length === 0 ? (
                <span className="text-sm text-slate2-400 px-2">先添加参与人哦</span>
              ) : (
                <>
                  <button
                    onClick={() => setAssigneeId(null)}
                    className={`px-3 py-1 rounded-full text-sm font-medium border-2 transition-all ${
                      !assigneeId
                        ? 'border-mint-400 bg-mint-50 text-mint-700 scale-105'
                        : 'border-transparent hover:bg-slate2-50 text-slate2-500'
                    }`}
                  >
                    👥 全员
                  </button>
                  {participants.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setAssigneeId(assigneeId === p.id ? null : p.id)}
                      className={`flex items-center gap-1.5 rounded-full pr-2 pl-0.5 py-0.5 border-2 transition-all ${
                        assigneeId === p.id
                          ? 'border-mint-400 bg-mint-50 scale-105 shadow-sm'
                          : 'border-transparent hover:bg-slate2-50'
                      }`}
                    >
                      <Avatar participant={p} size="sm" />
                      <span className="text-xs font-medium text-slate2-700">{p.name}</span>
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate2-100 bg-slate2-50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-slate2-600 hover:bg-slate2-200 font-medium transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-mint-500 to-teal-500 text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
          >
            {isEdit ? '保存修改' : '添加节点'} ✨
          </button>
        </div>
      </div>
    </div>
  );
};
