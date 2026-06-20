import { Filter, Users, Tag, Activity } from 'lucide-react';
import type { TagType, TagStatus, Member } from '@/types';
import { TAG_TYPE_LABELS, TAG_TYPE_COLORS, TAG_STATUS_LABELS } from '@/types';

interface TagFiltersProps {
  filterStatus: TagStatus | 'all';
  filterType: TagType | 'all';
  filterAssignee: string;
  members: Member[];
  onStatusChange: (status: TagStatus | 'all') => void;
  onTypeChange: (type: TagType | 'all') => void;
  onAssigneeChange: (assignee: string) => void;
}

export function TagFilters({
  filterStatus,
  filterType,
  filterAssignee,
  members,
  onStatusChange,
  onTypeChange,
  onAssigneeChange,
}: TagFiltersProps) {
  return (
    <div className="space-y-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Filter size={14} />
        <span>筛选</span>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <Activity size={12} />
          <span>状态</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onStatusChange('all')}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              filterStatus === 'all'
                ? 'bg-slate-600/50 text-slate-200 border-slate-500/50'
                : 'border-slate-700 text-slate-500 hover:bg-slate-700/50'
            }`}
          >
            全部
          </button>
          {(['pending', 'reviewing', 'resolved'] as TagStatus[]).map((status) => (
            <button
              key={status}
              onClick={() => onStatusChange(status)}
              className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                filterStatus === status
                  ? 'bg-slate-600/50 text-slate-200 border-slate-500/50'
                  : 'border-slate-700 text-slate-500 hover:bg-slate-700/50'
              }`}
            >
              {TAG_STATUS_LABELS[status]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <Tag size={12} />
          <span>类型</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onTypeChange('all')}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              filterType === 'all'
                ? 'bg-slate-600/50 text-slate-200 border-slate-500/50'
                : 'border-slate-700 text-slate-500 hover:bg-slate-700/50'
            }`}
          >
            全部
          </button>
          {(['pitch', 'rhythm', 'harmony', 'solo'] as TagType[]).map((type) => (
            <button
              key={type}
              onClick={() => onTypeChange(type)}
              className="px-2 py-1 text-xs rounded-md border transition-colors"
              style={{
                backgroundColor: filterType === type ? `${TAG_TYPE_COLORS[type]}20` : 'transparent',
                color: filterType === type ? TAG_TYPE_COLORS[type] : '#64748b',
                borderColor: filterType === type ? `${TAG_TYPE_COLORS[type]}40` : '#334155',
              }}
            >
              {TAG_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1.5">
          <Users size={12} />
          <span>成员</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => onAssigneeChange('all')}
            className={`px-2 py-1 text-xs rounded-md border transition-colors ${
              filterAssignee === 'all'
                ? 'bg-slate-600/50 text-slate-200 border-slate-500/50'
                : 'border-slate-700 text-slate-500 hover:bg-slate-700/50'
            }`}
          >
            全部
          </button>
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => onAssigneeChange(member.id)}
              className="px-2 py-1 text-xs rounded-md border transition-colors"
              style={{
                backgroundColor: filterAssignee === member.id ? `${member.color}20` : 'transparent',
                color: filterAssignee === member.id ? member.color : '#64748b',
                borderColor: filterAssignee === member.id ? `${member.color}40` : '#334155',
              }}
            >
              {member.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
