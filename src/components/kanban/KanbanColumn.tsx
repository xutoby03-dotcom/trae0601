import { motion } from 'framer-motion';
import type { Member, MemberStatus } from '../../types';
import { MemberCard } from './MemberCard';
import { MEMBER_STATUS_LABELS } from '../../types';

interface KanbanColumnProps {
  title: string;
  status: MemberStatus;
  members: Member[];
  count: number;
  color: string;
  onMemberClick?: (member: Member) => void;
  onPickup?: (member: Member) => void;
  onProxy?: (member: Member) => void;
}

const statusGradients: Record<MemberStatus, string> = {
  pending: 'from-gray-500/20 to-gray-600/5',
  picked: 'from-emerald-500/20 to-emerald-600/5',
  proxied: 'from-amber-500/20 to-amber-600/5',
};

const statusBadgeColors: Record<MemberStatus, string> = {
  pending: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  picked: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  proxied: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export function KanbanColumn({
  title,
  status,
  members,
  count,
  color,
  onMemberClick,
  onPickup,
  onProxy,
}: KanbanColumnProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-full"
    >
      <div className={`flex items-center justify-between p-4 rounded-t-2xl bg-gradient-to-r ${statusGradients[status]} border border-white/10 border-b-0`}>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-semibold text-white">{title}</h3>
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${statusBadgeColors[status]}`}>
            {count}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 rounded-b-2xl border border-t-0 border-white/10 bg-dark-900/30 backdrop-blur-sm">
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <p className="text-sm">暂无{MEMBER_STATUS_LABELS[status]}成员</p>
          </div>
        ) : (
          members.map((member, index) => (
            <MemberCard
              key={member.id}
              member={member}
              index={index}
              onClick={() => onMemberClick?.(member)}
              onPickup={status === 'pending' ? () => onPickup?.(member) : undefined}
              onProxy={status === 'pending' && member.canProxy ? () => onProxy?.(member) : undefined}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}
