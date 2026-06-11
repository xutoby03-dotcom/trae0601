import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus, Users, Shield, Key, AlertTriangle, CheckCircle,
  Trash2, Edit2, Ticket, X, Bookmark, Crown
} from 'lucide-react';
import useStore from '../store/useStore';
import Modal from '../components/Modal';
import MemberAvatar from '../components/MemberAvatar';
import PlatformIcon from '../components/PlatformIcon';
import { generateId } from '../utils/date';
import { cn } from '../lib/utils';
import type { Member, PlatformClaim, PlatformType, AccountStatus } from '../types';
import { PLATFORM_INFO } from '../types';

interface MemberFormData {
  name: string;
  color: string;
  maxTickets: number;
  backupPlan: string;
  platformClaims: PlatformClaim[];
}

const colors = [
  '#FF2E9D', '#9D4EDD', '#4CC9F0', '#39FF14', '#FF6B35',
  '#00D4FF', '#FFD700', '#FF6B9D', '#7C3AED', '#10B981',
];

const platforms: PlatformType[] = ['damai', 'maoyan', 'piaoxingqiu', 'fenwandao', 'others'];

const initialFormData: MemberFormData = {
  name: '',
  color: colors[0],
  maxTickets: 2,
  backupPlan: '',
  platformClaims: [],
};

export default function Team() {
  const { members, addMember, updateMember, deleteMember } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<MemberFormData>(initialFormData);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [platformModalOpen, setPlatformModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<PlatformClaim | null>(null);
  const [platformForm, setPlatformForm] = useState({
    platform: 'damai' as PlatformType,
    isVerified: false,
    hasPrivilegeCode: false,
    accountStatus: 'normal' as AccountStatus,
  });

  const openCreateModal = () => {
    setEditingMember(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      color: member.color,
      maxTickets: member.maxTickets,
      backupPlan: member.backupPlan || '',
      platformClaims: [...member.platformClaims],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const memberData: Omit<Member, 'id'> = {
      ...formData,
    };

    if (editingMember) {
      updateMember(editingMember.id, memberData);
    } else {
      addMember(memberData);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  const openAddPlatform = () => {
    setEditingPlatform(null);
    setPlatformForm({
      platform: 'damai',
      isVerified: false,
      hasPrivilegeCode: false,
      accountStatus: 'normal',
    });
    setPlatformModalOpen(true);
  };

  const openEditPlatform = (claim: PlatformClaim) => {
    setEditingPlatform(claim);
    setPlatformForm({
      platform: claim.platform,
      isVerified: claim.isVerified,
      hasPrivilegeCode: claim.hasPrivilegeCode,
      accountStatus: claim.accountStatus,
    });
    setPlatformModalOpen(true);
  };

  const handleSavePlatform = () => {
    const newClaim: PlatformClaim = {
      id: editingPlatform?.id || generateId(),
      ...platformForm,
    };

    if (editingPlatform) {
      setFormData({
        ...formData,
        platformClaims: formData.platformClaims.map((c) =>
          c.id === editingPlatform.id ? newClaim : c
        ),
      });
    } else {
      setFormData({
        ...formData,
        platformClaims: [...formData.platformClaims, newClaim],
      });
    }

    setPlatformModalOpen(false);
  };

  const removePlatform = (claimId: string) => {
    setFormData({
      ...formData,
      platformClaims: formData.platformClaims.filter((c) => c.id !== claimId),
    });
  };

  const getStatusIcon = (status: AccountStatus) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'blocked':
        return <X className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = (status: AccountStatus) => {
    switch (status) {
      case 'normal':
        return '正常';
      case 'warning':
        return '异常';
      case 'blocked':
        return '封禁';
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
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">分工管理</h1>
          <p className="text-gray-400">管理团队成员、平台认领和账号状态</p>
        </div>
        <button onClick={openCreateModal} className="neon-btn flex items-center gap-2">
          <Plus className="w-5 h-5" />
          添加成员
        </button>
      </motion.div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member, index) => (
          <motion.div
            key={member.id}
            variants={itemVariants}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-6 relative overflow-hidden"
          >
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20"
              style={{ background: member.color }}
            />

            {/* Header */}
            <div className="flex items-start justify-between mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <MemberAvatar name={member.name} color={member.color} size="lg" />
                <div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Ticket className="w-4 h-4" />
                    最多可买 {member.maxTickets} 张
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(member)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('确定删除这个成员吗？')) {
                      deleteMember(member.id);
                    }
                  }}
                  className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>

            {/* Platform Claims */}
            <div className="space-y-3 relative z-10">
              <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-neon-purple" />
                已认领平台
              </h4>
              {member.platformClaims.length === 0 ? (
                <p className="text-sm text-gray-500">暂无认领平台</p>
              ) : (
                <div className="space-y-2">
                  {member.platformClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <PlatformIcon platform={claim.platform} size="sm" />
                        <div>
                          <p className="font-medium text-sm">
                            {PLATFORM_INFO[claim.platform].name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            {claim.isVerified && (
                              <span className="flex items-center gap-1 text-green-400">
                                <Shield className="w-3 h-3" /> 已实名
                              </span>
                            )}
                            {claim.hasPrivilegeCode && (
                              <span className="flex items-center gap-1 text-yellow-400">
                                <Key className="w-3 h-3" /> 特权码
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              {getStatusIcon(claim.accountStatus)}
                              {getStatusText(claim.accountStatus)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Backup Plan */}
            {member.backupPlan && (
              <div className="mt-4 relative z-10">
                <h4 className="text-sm font-medium text-gray-300 flex items-center gap-2 mb-2">
                  <Bookmark className="w-4 h-4 text-neon-blue" />
                  候补方案
                </h4>
                <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-xl border border-white/10">
                  {member.backupPlan}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {members.length === 0 && (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">还没有团队成员</h3>
          <p className="text-gray-500 mb-6">添加成员，开始分工协作抢票</p>
          <button onClick={openCreateModal} className="neon-btn inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            添加成员
          </button>
        </motion.div>
      )}

      {/* Create/Edit Member Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMember ? '编辑成员' : '添加成员'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                成员昵称 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="例如：小明"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                最多可买张数
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.maxTickets}
                onChange={(e) => setFormData({ ...formData, maxTickets: Number(e.target.value) })}
                className="input-field"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              选择颜色
            </label>
            <div className="flex flex-wrap gap-3">
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    'w-10 h-10 rounded-full transition-all duration-300',
                    formData.color === color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-cyber-dark scale-110'
                      : 'hover:scale-110'
                  )}
                  style={{ backgroundColor: color, boxShadow: `0 0 15px ${color}60` }}
                />
              ))}
            </div>
          </div>

          {/* Platform Claims */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">
                认领平台
              </label>
              <button
                type="button"
                onClick={openAddPlatform}
                className="text-sm text-neon-purple hover:text-neon-pink transition-colors"
              >
                + 添加平台
              </button>
            </div>
            {formData.platformClaims.length === 0 ? (
              <p className="text-sm text-gray-500">暂无认领平台</p>
            ) : (
              <div className="space-y-2">
                {formData.platformClaims.map((claim) => (
                  <div
                    key={claim.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <PlatformIcon platform={claim.platform} size="sm" />
                      <div>
                        <p className="font-medium text-sm">
                          {PLATFORM_INFO[claim.platform].name}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {claim.isVerified && (
                            <span className="flex items-center gap-1 text-green-400">
                              <Shield className="w-3 h-3" /> 已实名
                            </span>
                          )}
                          {claim.hasPrivilegeCode && (
                            <span className="flex items-center gap-1 text-yellow-400">
                              <Key className="w-3 h-3" /> 特权码
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEditPlatform(claim)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removePlatform(claim.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Backup Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              候补方案
            </label>
            <textarea
              value={formData.backupPlan}
              onChange={(e) => setFormData({ ...formData, backupPlan: e.target.value })}
              className="input-field min-h-[100px] resize-none"
              placeholder="例如：猫眼抢不到就转战纷玩岛，优先抢内场..."
            />
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
              {editingMember ? '保存修改' : '添加成员'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Platform Edit Modal */}
      <Modal
        isOpen={platformModalOpen}
        onClose={() => setPlatformModalOpen(false)}
        title={editingPlatform ? '编辑平台' : '添加平台'}
        size="md"
      >
        <div className="space-y-6">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              选择平台
            </label>
            <div className="grid grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setPlatformForm({ ...platformForm, platform })}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                    platformForm.platform === platform
                      ? 'border-neon-purple bg-neon-purple/20'
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  )}
                >
                  <PlatformIcon platform={platform} size="md" />
                  <span className="text-sm font-medium">
                    {PLATFORM_INFO[platform].name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Account Status */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              账号状态
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['normal', 'warning', 'blocked'] as AccountStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setPlatformForm({ ...platformForm, accountStatus: status })}
                  className={cn(
                    'flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all',
                    platformForm.accountStatus === status
                      ? status === 'normal'
                        ? 'border-green-500 bg-green-500/20 text-green-400'
                        : status === 'warning'
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                        : 'border-red-500 bg-red-500/20 text-red-400'
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  )}
                >
                  {getStatusIcon(status)}
                  <span className="text-sm">{getStatusText(status)}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <span>已实名认证</span>
              </div>
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-all relative cursor-pointer',
                  platformForm.isVerified ? 'bg-green-500' : 'bg-white/20'
                )}
                onClick={() =>
                  setPlatformForm({ ...platformForm, isVerified: !platformForm.isVerified })
                }
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                    platformForm.isVerified ? 'left-7' : 'left-1'
                  )}
                />
              </div>
            </label>

            <label className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 cursor-pointer">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-yellow-400" />
                <span>有特权码/优先购</span>
              </div>
              <div
                className={cn(
                  'w-12 h-6 rounded-full transition-all relative cursor-pointer',
                  platformForm.hasPrivilegeCode ? 'bg-yellow-500' : 'bg-white/20'
                )}
                onClick={() =>
                  setPlatformForm({
                    ...platformForm,
                    hasPrivilegeCode: !platformForm.hasPrivilegeCode,
                  })
                }
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                    platformForm.hasPrivilegeCode ? 'left-7' : 'left-1'
                  )}
                />
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setPlatformModalOpen(false)}
              className="neon-btn-secondary"
            >
              取消
            </button>
            <button type="button" onClick={handleSavePlatform} className="neon-btn">
              {editingPlatform ? '保存修改' : '添加平台'}
            </button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
