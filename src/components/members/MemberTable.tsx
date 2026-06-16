import { motion } from 'framer-motion';
import { Edit2, Trash2, Shield, Clock, UserCheck, UserX, Users } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Tag } from '../ui/Tag';
import type { Member } from '../../types';
import { MEMBER_STATUS_LABELS } from '../../types';
import { cn } from '../../lib/utils';

interface MemberTableProps {
  members: Member[];
  onEdit?: (member: Member) => void;
  onDelete?: (member: Member) => void;
}

const statusColors: Record<Member['status'], 'gray' | 'green' | 'gold'> = {
  pending: 'gray',
  picked: 'green',
  proxied: 'gold',
};

const statusIcons: Record<Member['status'], typeof UserCheck> = {
  pending: UserX,
  picked: UserCheck,
  proxied: Users,
};

export function MemberTable({ members, onEdit, onDelete }: MemberTableProps) {
  const formatTime = (time: string | null) => {
    if (!time) return '—';
    return new Date(time).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">成员</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">座位区</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">手机号</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">应付金额</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">状态</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">代领权限</th>
              <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">领取时间</th>
              <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-6 py-4">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {members.map((member, index) => {
              const StatusIcon = statusIcons[member.status];
              return (
                <motion.tr
                  key={member.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="hover:bg-white/5 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={member.name} size="sm" />
                      <span className="font-medium text-white">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Tag variant="purple">{member.seatSection}</Tag>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-300">****{member.phoneLastFour}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'font-semibold',
                      member.amountDue === 0 ? 'text-emerald-400' : 'text-gradient'
                    )}>
                      {member.amountDue === 0 ? '已付' : `¥${member.amountDue}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn(
                        'w-4 h-4',
                        member.status === 'pending' && 'text-gray-400',
                        member.status === 'picked' && 'text-emerald-400',
                        member.status === 'proxied' && 'text-amber-400'
                      )} />
                      <Tag variant={statusColors[member.status]}>
                        {MEMBER_STATUS_LABELS[member.status]}
                      </Tag>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Shield className={cn(
                        'w-4 h-4',
                        member.canProxy ? 'text-gold-400' : 'text-gray-600'
                      )} />
                      <span className={member.canProxy ? 'text-gold-400' : 'text-gray-500'}>
                        {member.canProxy ? '可代领' : '不可代领'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{formatTime(member.pickupTime)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onEdit?.(member)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                        title="编辑"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete?.(member)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Users className="w-14 h-14 mb-3 opacity-30" />
          <p className="text-lg">暂无成员数据</p>
          <p className="text-sm mt-1">添加成员开始管理</p>
        </div>
      )}
    </div>
  );
}
