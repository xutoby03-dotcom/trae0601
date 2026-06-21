import { useState, memo } from 'react';
import { UserPlus, Volume2, Music, Award } from 'lucide-react';
import type { Member, VoicePart } from '@/types';
import { VOICE_PART_CONFIG, VOICE_PARTS } from '@/utils/constants';
import { getInitial } from '@/utils/helpers';
import { useMembersStore } from '@/stores/membersStore';

interface MemberCardProps {
  member: Member;
  isPlaced?: boolean;
  onEdit?: () => void;
}

export const MemberCard = memo(function MemberCard({ member, isPlaced, onEdit }: MemberCardProps) {
  const cfg = VOICE_PART_CONFIG[member.voicePart];

  const handleDragStart = (e: React.DragEvent) => {
    const data = {
      type: 'member',
      memberId: member.id,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(data));
    e.dataTransfer.effectAllowed = 'copyMove';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={onEdit}
      style={{
        borderLeftColor: cfg.color,
        boxShadow: isPlaced ? `inset 0 0 0 1px ${cfg.borderColor}` : undefined,
      }}
      className={`group relative cursor-grab rounded-lg border-l-[3px] border border-white/5 bg-white/[0.03] p-2 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.08] hover:shadow-lg active:cursor-grabbing
        ${isPlaced ? 'opacity-50 grayscale' : ''}
      `}
    >
      <div className="flex items-start gap-2">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold shadow-md"
          style={{
            borderColor: cfg.color,
            backgroundColor: `linear-gradient(135deg, ${cfg.color}33, ${cfg.color}11)`,
            border: `2px solid ${cfg.borderColor}`,
            color: cfg.textColor,
          }}
        >
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            getInitial(member.name)
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span
              className="flex h-3.5 w-3.5 items-center justify-center rounded text-[9px] font-bold text-white"
              style={{ backgroundColor: cfg.color }}
            >
              {cfg.shortLabel}
            </span>
            <span className="truncate text-xs font-semibold text-white">{member.name}</span>
          </div>
          <div className="flex flex-wrap gap-1 pt-0.5">
            <div className="flex items-center gap-0.5 text-[10px] text-white/50">
              <Volume2 className="h-2.5 w-2.5" />
              <span>{member.vocalPower}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-white/50">
              <Music className="h-2.5 w-2.5" />
              <span>{member.vocalRange}</span>
            </div>
            <div className="flex items-center gap-0.5 text-[10px] text-white/50">
              <Award className="h-2.5 w-2.5" />
              <span>{member.experience}</span>
            </div>
          </div>
        </div>
      </div>
      {isPlaced && (
        <div className="absolute right-2 top-2 rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-medium text-amber-300">
          已摆放
        </div>
      )}
    </div>
  );
});

interface MemberPanelProps {
  onAddMember: () => void;
  onEditMember: (member: Member) => void;
  placedMemberIds: Set<string>;
}

export function MemberPanel({ onAddMember, onEditMember, placedMemberIds }: MemberPanelProps) {
  const members = useMembersStore((s) => s.members);
  const [activePart, setActivePart] = useState<VoicePart | 'all'>('all');

  const filtered = activePart === 'all' ? members : members.filter((m) => m.voicePart === activePart);

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white/90">合唱团成员</h3>
        <button
          onClick={onAddMember}
          className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500/90 to-yellow-500/90 px-2.5 py-1.5 text-[11px] font-semibold text-[#1a1a2e] shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-yellow-400"
        >
          <UserPlus className="h-3.5 w-3.5" />
          添加成员
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setActivePart('all')}
          className={`rounded-md px-2 py-1 text-[11px] font-medium transition ${
            activePart === 'all'
              ? 'bg-white/20 text-white'
              : 'bg-white/[0.03] text-white/50 hover:bg-white/10 hover:text-white/80'
          }`}
        >
          全部 ({members.length})
        </button>
        {VOICE_PARTS.map((part) => {
          const cfg = VOICE_PART_CONFIG[part];
          const count = members.filter((m) => m.voicePart === part).length;
          return (
            <button
              key={part}
              onClick={() => setActivePart(part)}
              style={{
                backgroundColor: activePart === part ? `${cfg.color}33` : undefined,
                borderColor: activePart === part ? cfg.borderColor : undefined,
              }}
              className={`flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] font-medium transition ${
                activePart === part ? 'text-white' : 'border-white/5 bg-white/[0.03] text-white/50 hover:text-white/80'
              }`}
            >
              <span
                className="flex h-3 w-3 items-center justify-center rounded text-[8px] font-bold text-white"
                style={{ backgroundColor: cfg.color }}
              >
                {cfg.shortLabel}
              </span>
              {cfg.label}
              <span className="text-white/60">({count})</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center text-white/30">
            <UserPlus className="mb-2 h-8 w-8 opacity-50" />
            <p className="text-xs">暂无成员</p>
            <p className="mt-1 text-[10px]">点击右上角添加按钮</p>
          </div>
        ) : (
          filtered.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              isPlaced={placedMemberIds.has(member.id)}
              onEdit={() => onEditMember(member)}
            />
          ))
        )}
      </div>

      <div className="rounded-lg border border-white/5 bg-white/[0.02] p-2 text-[10px] text-white/40 leading-relaxed">
        💡 提示：拖拽成员卡片到舞台网格即可摆放；点击已在舞台的成员卡片可编辑属性。
      </div>
    </div>
  );
}
