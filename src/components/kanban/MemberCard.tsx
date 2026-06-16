import { motion } from 'framer-motion';
import { UserCheck, UserX, Shield, Clock } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import type { Member } from '../../types';
import { MEMBER_STATUS_LABELS } from '../../types';

interface MemberCardProps {
  member: Member;
  onClick?: () => void;
  index?: number;
  onPickup?: () => void;
  onProxy?: () => void;
}

const statusColors = {
  pending: 'gray',
  picked: 'green',
  proxied: 'gold',
} as const;

export function MemberCard({ member, onClick, index = 0, onPickup, onProxy }: MemberCardProps) {
  const statusLabel = MEMBER_STATUS_LABELS[member.status];
  const statusColor = statusColors[member.status];

  const formatTime = (time: string | null) => {
    if (!time) return '';
    return new Date(time).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-4 cursor-pointer card-hover"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar name={member.name} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white truncate">{member.name}</h4>
            {member.canProxy && (
              <Shield className="w-3.5 h-3.5 text-gold-400 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Tag variant="purple" className="text-xs">
              {member.seatSection}
            </Tag>
            <span className="text-xs text-gray-500">
              尾号 {member.phoneLastFour}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-gradient">
                ¥{member.amountDue}
              </span>
              {member.amountDue === 0 && (
                <Tag variant="green" className="text-xs">已付</Tag>
              )}
            </div>
            <Tag variant={statusColor} className="text-xs">
              {statusLabel}
            </Tag>
          </div>
          {member.pickupTime && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(member.pickupTime)} 领取</span>
            </div>
          )}
        </div>
      </div>

      {member.status === 'pending' && (onPickup || onProxy) && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
          {onPickup && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPickup();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              领取
            </button>
          )}
          {onProxy && member.canProxy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProxy();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors"
            >
              <UserX className="w-4 h-4" />
              代领
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
