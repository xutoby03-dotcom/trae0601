import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Ticket, Trash2, Edit2, CheckCircle, Clock, User,
  DollarSign, Upload, Check, X, Image as ImageIcon
} from 'lucide-react';
import useStore from '../store/useStore';
import Modal from '../components/Modal';
import PlatformIcon from '../components/PlatformIcon';
import MemberAvatar from '../components/MemberAvatar';
import { formatDateTime } from '../utils/date';
import { formatMoney, calculateEqualSplit } from '../utils/money';
import { cn } from '../lib/utils';
import type { TicketRecord, PlatformType, SplitRecord, TicketStatus } from '../types';
import { PLATFORM_INFO } from '../types';

interface TicketFormData {
  planId: string;
  platform: PlatformType;
  memberId: string;
  seatInfo: string;
  price: number;
  paymentScreenshot: string;
  status: TicketStatus;
  splitType: 'equal' | 'custom';
  splitMemberIds: string[];
  customSplits: Record<string, number>;
}

const platforms: PlatformType[] = ['damai', 'maoyan', 'piaoxingqiu', 'fenwandao', 'others'];

const initialFormData: TicketFormData = {
  planId: '',
  platform: 'damai',
  memberId: '',
  seatInfo: '',
  price: 0,
  paymentScreenshot: '',
  status: 'success',
  splitType: 'equal',
  splitMemberIds: [],
  customSplits: {},
};

export default function Tickets() {
  const { tickets, plans, members, addTicket, updateTicket, deleteTicket } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<TicketFormData>(initialFormData);
  const [editingTicket, setEditingTicket] = useState<TicketRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');

  const filteredTickets = useMemo(() => {
    if (filterStatus === 'all') return tickets;
    return tickets.filter((t) => t.status === filterStatus);
  }, [tickets, filterStatus]);

  const sortedTickets = [...filteredTickets].sort(
    (a, b) => new Date(b.obtainedAt).getTime() - new Date(a.obtainedAt).getTime()
  );

  const openCreateModal = () => {
    setEditingTicket(null);
    setFormData({
      ...initialFormData,
      planId: plans[0]?.id || '',
      memberId: members[0]?.id || '',
      splitMemberIds: members.map((m) => m.id),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (ticket: TicketRecord) => {
    setEditingTicket(ticket);
    const plan = plans.find((p) => p.id === ticket.planId);
    const splitMemberIds = ticket.splitRecords.map((s) => s.memberId);
    const customSplits: Record<string, number> = {};
    ticket.splitRecords.forEach((s) => {
      customSplits[s.memberId] = s.amount;
    });

    setFormData({
      planId: ticket.planId,
      platform: ticket.platform,
      memberId: ticket.memberId,
      seatInfo: ticket.seatInfo,
      price: ticket.price,
      paymentScreenshot: ticket.paymentScreenshot || '',
      status: ticket.status,
      splitType: 'equal',
      splitMemberIds,
      customSplits,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let splitRecords: SplitRecord[];
    if (formData.splitType === 'equal') {
      splitRecords = calculateEqualSplit(formData.price, formData.splitMemberIds);
    } else {
      splitRecords = Object.entries(formData.customSplits).map(([memberId, amount]) => {
        const existing = editingTicket?.splitRecords.find((s) => s.memberId === memberId);
        return {
          memberId,
          amount,
          isPaid: existing?.isPaid || false,
        };
      });
    }

    const ticketData: Omit<TicketRecord, 'id' | 'obtainedAt'> = {
      planId: formData.planId,
      platform: formData.platform,
      memberId: formData.memberId,
      seatInfo: formData.seatInfo,
      price: formData.price,
      paymentScreenshot: formData.paymentScreenshot || undefined,
      status: formData.status,
      splitRecords,
    };

    if (editingTicket) {
      updateTicket(editingTicket.id, ticketData);
    } else {
      addTicket(ticketData);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  const toggleSplitMember = (memberId: string) => {
    const newSplitMemberIds = formData.splitMemberIds.includes(memberId)
      ? formData.splitMemberIds.filter((id) => id !== memberId)
      : [...formData.splitMemberIds, memberId];

    const newCustomSplits = { ...formData.customSplits };
    if (!formData.splitMemberIds.includes(memberId)) {
      newCustomSplits[memberId] = formData.price / newSplitMemberIds.length;
    } else {
      delete newCustomSplits[memberId];
    }

    setFormData({
      ...formData,
      splitMemberIds: newSplitMemberIds,
      customSplits: newCustomSplits,
    });
  };

  const updateCustomSplit = (memberId: string, amount: number) => {
    setFormData({
      ...formData,
      customSplits: {
        ...formData.customSplits,
        [memberId]: amount,
      },
    });
  };

  const toggleSplitPaid = (ticketId: string, memberId: string) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    const newSplitRecords = ticket.splitRecords.map((s) =>
      s.memberId === memberId ? { ...s, isPaid: !s.isPaid } : s
    );

    updateTicket(ticketId, { splitRecords: newSplitRecords });
  };

  const getStatusConfig = (status: TicketStatus) => {
    switch (status) {
      case 'success':
        return {
          label: '已成功',
          icon: CheckCircle,
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          border: 'border-green-500/30',
        };
      case 'pending_transfer':
        return {
          label: '待转票',
          icon: Clock,
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
        };
      case 'failed':
        return {
          label: '失败',
          icon: X,
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          border: 'border-red-500/30',
        };
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="page-title">抢票录入</h1>
          <p className="text-gray-400">记录抢票结果、座位信息和分摊详情</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-xl p-1">
            {(['all', 'success', 'pending_transfer', 'failed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                  filterStatus === status
                    ? 'bg-neon-purple text-white'
                    : 'text-gray-400 hover:text-white'
                )}
              >
                {status === 'all' ? '全部' : getStatusConfig(status).label}
              </button>
            ))}
          </div>
          <button onClick={openCreateModal} className="neon-btn flex items-center gap-2">
            <Plus className="w-5 h-5" />
            录入抢票
          </button>
        </div>
      </motion.div>

      {/* Tickets List */}
      <div className="space-y-4">
        {sortedTickets.map((ticket, index) => {
          const plan = plans.find((p) => p.id === ticket.planId);
          const payer = members.find((m) => m.id === ticket.memberId);
          const statusConfig = getStatusConfig(ticket.status);
          const StatusIcon = statusConfig.icon;
          const totalPaid = ticket.splitRecords.filter((s) => s.isPaid).length;
          const totalUnpaid = ticket.splitRecords.length - totalPaid;

          return (
            <motion.div
              key={ticket.id}
              variants={itemVariants}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-6 overflow-hidden"
            >
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-xl', statusConfig.bg)}>
                    <Ticket className={cn('w-6 h-6', statusConfig.text)} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold">{plan?.artist || '未知演出'}</h3>
                      <span className={cn('badge', statusConfig.bg, statusConfig.text, statusConfig.border)}>
                        <StatusIcon className="w-3 h-3" />
                        {statusConfig.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{plan?.city}</span>
                      <span>·</span>
                      <span>{formatDateTime(ticket.obtainedAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(ticket)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('确定删除这条记录吗？')) {
                        deleteTicket(ticket.id);
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>

              {/* Ticket Info */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <PlatformIcon platform={ticket.platform} size="sm" />
                    购票平台
                  </div>
                  <p className="font-semibold">{PLATFORM_INFO[ticket.platform].name}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Ticket className="w-4 h-4" />
                    座位信息
                  </div>
                  <p className="font-semibold">{ticket.seatInfo}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <DollarSign className="w-4 h-4" />
                    票价
                  </div>
                  <p className="font-semibold text-neon-green">{formatMoney(ticket.price)}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <User className="w-4 h-4" />
                    付款人
                  </div>
                  <div className="flex items-center gap-2">
                    {payer && (
                      <MemberAvatar name={payer.name} color={payer.color} size="sm" />
                    )}
                    <span className="font-semibold">{payer?.name || '未知'}</span>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              {ticket.paymentScreenshot && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                    <ImageIcon className="w-4 h-4" />
                    付款截图
                  </div>
                  <img
                    src={ticket.paymentScreenshot}
                    alt="付款截图"
                    className="max-w-xs rounded-xl border border-white/10"
                  />
                </div>
              )}

              {/* Split Records */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-neon-purple" />
                    分摊明细
                  </h4>
                  <div className="text-sm text-gray-400">
                    {totalPaid > 0 && <span className="text-green-400">{totalPaid} 人已付款</span>}
                    {totalUnpaid > 0 && (
                      <span className="text-yellow-400"> · {totalUnpaid} 人待付款</span>
                    )}
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {ticket.splitRecords.map((split) => {
                    const member = members.find((m) => m.id === split.memberId);
                    return (
                      <div
                        key={split.memberId}
                        className={cn(
                          'flex items-center justify-between p-3 rounded-xl border transition-all',
                          split.isPaid
                            ? 'bg-green-500/10 border-green-500/30'
                            : 'bg-white/5 border-white/10'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          {member && (
                            <MemberAvatar name={member.name} color={member.color} size="sm" />
                          )}
                          <div>
                            <p className="font-medium text-sm">{member?.name || '未知'}</p>
                            <p className={cn(
                              'text-xs font-mono',
                              split.isPaid ? 'text-green-400' : 'text-yellow-400'
                            )}>
                              {formatMoney(split.amount)}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => toggleSplitPaid(ticket.id, split.memberId)}
                          className={cn(
                            'p-2 rounded-lg transition-all',
                            split.isPaid
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-white/10 text-gray-400 hover:bg-white/20'
                          )}
                        >
                          {split.isPaid ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {tickets.length === 0 && (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <Ticket className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">还没有抢票记录</h3>
          <p className="text-gray-500 mb-6">录入你的第一条抢票结果，开始追踪分摊状态</p>
          <button onClick={openCreateModal} className="neon-btn inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            录入抢票
          </button>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTicket ? '编辑抢票记录' : '录入抢票结果'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                演出计划 *
              </label>
              <select
                value={formData.planId}
                onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                className="input-field"
                required
              >
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id} className="bg-cyber-dark">
                    {plan.artist} - {plan.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                购票平台 *
              </label>
              <select
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value as PlatformType })}
                className="input-field"
                required
              >
                {platforms.map((platform) => (
                  <option key={platform} value={platform} className="bg-cyber-dark">
                    {PLATFORM_INFO[platform].name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                付款人 *
              </label>
              <select
                value={formData.memberId}
                onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                className="input-field"
                required
              >
                {members.map((member) => (
                  <option key={member.id} value={member.id} className="bg-cyber-dark">
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                票价 (元) *
              </label>
              <input
                type="number"
                min="0"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="input-field"
                placeholder="例如：1880"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                座位信息 *
              </label>
              <input
                type="text"
                value={formData.seatInfo}
                onChange={(e) => setFormData({ ...formData, seatInfo: e.target.value })}
                className="input-field"
                placeholder="例如：内场前区 12排 25座"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                付款截图链接
              </label>
              <input
                type="url"
                value={formData.paymentScreenshot}
                onChange={(e) => setFormData({ ...formData, paymentScreenshot: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
              {formData.paymentScreenshot && (
                <img
                  src={formData.paymentScreenshot}
                  alt="预览"
                  className="mt-2 max-w-xs rounded-xl border border-white/10"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TicketStatus })}
                className="input-field"
              >
                <option value="success" className="bg-cyber-dark">已成功</option>
                <option value="pending_transfer" className="bg-cyber-dark">待转票</option>
                <option value="failed" className="bg-cyber-dark">失败</option>
              </select>
            </div>
          </div>

          {/* Split Settings */}
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-neon-purple" />
              分摊设置
            </h4>

            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, splitType: 'equal' })}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium transition-all',
                  formData.splitType === 'equal'
                    ? 'bg-neon-purple text-white'
                    : 'bg-white/10 text-gray-400 hover:text-white'
                )}
              >
                等额分摊
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, splitType: 'custom' })}
                className={cn(
                  'px-4 py-2 rounded-xl font-medium transition-all',
                  formData.splitType === 'custom'
                    ? 'bg-neon-purple text-white'
                    : 'bg-white/10 text-gray-400 hover:text-white'
                )}
              >
                自定义分摊
              </button>
            </div>

            <div>
              <p className="text-sm text-gray-400 mb-3">选择参与分摊的成员</p>
              <div className="flex flex-wrap gap-3 mb-4">
                {members.map((member) => {
                  const isSelected = formData.splitMemberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleSplitMember(member.id)}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-xl transition-all',
                        isSelected
                          ? 'bg-neon-purple/30 border-2 border-neon-purple'
                          : 'bg-white/5 border-2 border-transparent hover:border-white/20'
                      )}
                    >
                      <MemberAvatar name={member.name} color={member.color} size="sm" />
                      <span>{member.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {formData.splitMemberIds.length > 0 && formData.price > 0 && (
              <div className="space-y-2">
                {formData.splitType === 'equal' ? (
                  <div className="p-4 rounded-xl bg-neon-purple/10 border border-neon-purple/30">
                    <p className="text-center">
                      每人应付 <span className="text-2xl font-bold text-neon-green">
                        {formatMoney(formData.price / formData.splitMemberIds.length)}
                      </span>
                    </p>
                  </div>
                ) : (
                  formData.splitMemberIds.map((memberId) => {
                    const member = members.find((m) => m.id === memberId);
                    return (
                      <div key={memberId} className="flex items-center gap-3">
                        {member && (
                          <MemberAvatar name={member.name} color={member.color} size="sm" />
                        )}
                        <span className="flex-1">{member?.name}</span>
                        <input
                          type="number"
                          value={formData.customSplits[memberId] || ''}
                          onChange={(e) => updateCustomSplit(memberId, Number(e.target.value))}
                          className="input-field w-32 text-right"
                          placeholder="金额"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="neon-btn-secondary"
            >
              取消
            </button>
            <button type="submit" className="neon-btn">
              {editingTicket ? '保存修改' : '录入抢票'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
