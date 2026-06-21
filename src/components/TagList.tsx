import { useState } from 'react';
import { Clock, User, Trash2, ChevronDown, ChevronUp, Check, AlertCircle, Eye, Users } from 'lucide-react';
import type { Tag, TagStatus, Member } from '@/types';
import { TAG_TYPE_LABELS, TAG_TYPE_COLORS, TAG_STATUS_LABELS } from '@/types';
import { formatTimeShort } from '@/utils';

interface TagListProps {
  tags: Tag[];
  members: Member[];
  selectedTagId: string | null;
  onSelectTag: (id: string) => void;
  onDeleteTag: (id: string) => void;
  onUpdateTagStatus: (id: string, status: TagStatus) => void;
  onUpdateTagAssignee: (id: string, assignee: string) => void;
  onUpdateTagDescription: (id: string, description: string) => void;
  onSeekTo: (time: number) => void;
}

const statusColors: Record<TagStatus, string> = {
  pending: 'bg-red-500/20 text-red-400 border-red-500/30',
  reviewing: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const statusIcons: Record<TagStatus, typeof AlertCircle> = {
  pending: AlertCircle,
  reviewing: Eye,
  resolved: Check,
};

export function TagList({
  tags,
  members,
  selectedTagId,
  onSelectTag,
  onDeleteTag,
  onUpdateTagStatus,
  onUpdateTagAssignee,
  onUpdateTagDescription,
  onSeekTo,
}: TagListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [assignPopupTagId, setAssignPopupTagId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
      {tags.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <Clock size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">暂无标签</p>
          <p className="text-xs mt-1">在波形上点击时间点添加标签</p>
        </div>
      ) : (
        tags.map((tag) => {
          const isSelected = tag.id === selectedTagId;
          const isExpanded = expandedId === tag.id;
          const typeColor = TAG_TYPE_COLORS[tag.type];
          const StatusIcon = statusIcons[tag.status];
          const assigneeMember = getMemberById(tag.assignee);
          const showAssignPopup = assignPopupTagId === tag.id;

          return (
            <div
              key={tag.id}
              className={`rounded-lg border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-slate-700/60 border-orange-500/50 shadow-lg shadow-orange-500/10'
                  : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600/50'
              }`}
              onClick={() => {
                onSelectTag(tag.id);
                onSeekTo(tag.time);
              }}
            >
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                    style={{ backgroundColor: typeColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-md"
                        style={{ backgroundColor: `${typeColor}20`, color: typeColor }}
                      >
                        {formatTimeShort(tag.time)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {TAG_TYPE_LABELS[tag.type]}
                      </span>
                    </div>
                    {tag.description ? (
                      <p className="text-sm text-slate-300 truncate">{tag.description}</p>
                    ) : (
                      <p className="text-sm text-slate-500 italic">点击添加描述...</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[tag.status]}`}
                      >
                        <span className="flex items-center gap-1">
                          <StatusIcon size={10} />
                          {TAG_STATUS_LABELS[tag.status]}
                        </span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssignPopupTagId(showAssignPopup ? null : tag.id);
                        }}
                        className="text-xs px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1"
                        style={{
                          backgroundColor: assigneeMember ? `${assigneeMember.color}15` : 'rgba(100,116,139,0.1)',
                          color: assigneeMember ? assigneeMember.color : '#64748b',
                          borderColor: assigneeMember ? `${assigneeMember.color}30` : '#334155',
                        }}
                        title="分配成员"
                      >
                        <User size={10} />
                        {assigneeMember ? assigneeMember.name : '分配'}
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(tag.id);
                        }}
                        className="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {showAssignPopup && (
                <div
                  className="absolute left-3 right-3 top-full z-20 mt-[-4px] p-2 bg-slate-800 border border-slate-600 rounded-lg shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-1 text-xs text-slate-400 mb-1.5 px-1">
                    <Users size={10} />
                    <span>快速分配</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => {
                        onUpdateTagAssignee(tag.id, 'all');
                        setAssignPopupTagId(null);
                      }}
                      className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                        tag.assignee === 'all'
                          ? 'bg-slate-600/50 text-slate-300 border-slate-500/50'
                          : 'border-slate-700 text-slate-500 hover:bg-slate-700/50'
                      }`}
                    >
                      全员
                    </button>
                    {members.map((member) => (
                      <button
                        key={member.id}
                        onClick={() => {
                          onUpdateTagAssignee(tag.id, member.id);
                          setAssignPopupTagId(null);
                        }}
                        className="px-2 py-1 text-xs rounded-md border transition-colors"
                        style={{
                          backgroundColor: tag.assignee === member.id ? `${member.color}20` : 'transparent',
                          color: tag.assignee === member.id ? member.color : '#64748b',
                          borderColor: tag.assignee === member.id ? `${member.color}40` : '#334155',
                        }}
                      >
                        {member.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {isExpanded && (
                <div
                  className="px-3 pb-3 pt-0 border-t border-slate-700/50 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pt-3 space-y-3">
                    <div>
                      <label className="text-xs text-slate-400 mb-1 block">描述</label>
                      <textarea
                        value={tag.description}
                        onChange={(e) => onUpdateTagDescription(tag.id, e.target.value)}
                        placeholder="添加问题描述..."
                        className="w-full px-3 py-2 text-sm bg-slate-900/50 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500/50 resize-none"
                        rows={2}
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">状态</label>
                      <div className="flex gap-1">
                        {(['pending', 'reviewing', 'resolved'] as TagStatus[]).map((status) => (
                          <button
                            key={status}
                            onClick={() => onUpdateTagStatus(tag.id, status)}
                            className={`flex-1 px-2 py-1.5 text-xs rounded-md border transition-colors ${
                              tag.status === status
                                ? statusColors[status]
                                : 'border-slate-700 text-slate-500 hover:bg-slate-700/50'
                            }`}
                          >
                            {TAG_STATUS_LABELS[status]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 mb-2 block">分配给</label>
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => onUpdateTagAssignee(tag.id, 'all')}
                          className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                            tag.assignee === 'all'
                              ? 'bg-slate-600/50 text-slate-300 border-slate-500/50'
                              : 'border-slate-700 text-slate-500 hover:bg-slate-700/50'
                          }`}
                        >
                          全员
                        </button>
                        {members.map((member) => (
                          <button
                            key={member.id}
                            onClick={() => onUpdateTagAssignee(tag.id, member.id)}
                            className={`px-2 py-1 text-xs rounded-md border transition-colors`}
                            style={{
                              backgroundColor:
                                tag.assignee === member.id ? `${member.color}20` : 'transparent',
                              color: tag.assignee === member.id ? member.color : '#64748b',
                              borderColor:
                                tag.assignee === member.id ? `${member.color}40` : '#334155',
                            }}
                          >
                            {member.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteTag(tag.id)}
                      className="w-full flex items-center justify-center gap-1 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 border border-red-500/30 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                      删除标签
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
