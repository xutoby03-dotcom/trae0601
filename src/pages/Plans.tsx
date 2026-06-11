import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, MapPin, Calendar, Clock, Trash2, Edit2, ChevronRight, Users, DollarSign, Armchair } from 'lucide-react';
import useStore from '../store/useStore';
import Countdown from '../components/Countdown';
import Modal from '../components/Modal';
import MemberAvatar from '../components/MemberAvatar';
import { formatDate, formatDateTime, generateId } from '../utils/date';
import { formatMoney } from '../utils/money';
import type { ConcertPlan, BudgetTier, SeatArea } from '../types';
import { cn } from '../lib/utils';

interface PlanFormData {
  artist: string;
  artistImage: string;
  city: string;
  venue: string;
  concertDate: string;
  saleStartTime: string;
  budgetTiers: BudgetTier[];
  preferredAreas: SeatArea[];
  memberIds: string[];
}

const initialFormData: PlanFormData = {
  artist: '',
  artistImage: '',
  city: '',
  venue: '',
  concertDate: '',
  saleStartTime: '',
  budgetTiers: [{ id: generateId(), name: '', minPrice: 0, maxPrice: 0 }],
  preferredAreas: [{ id: generateId(), name: '', priority: 1 }],
  memberIds: [],
};

const colors = [
  '#FF2E9D', '#9D4EDD', '#4CC9F0', '#39FF14', '#FF6B35',
  '#00D4FF', '#FFD700', '#FF6B9D', '#7C3AED', '#10B981',
];

export default function Plans() {
  const { plans, members, addPlan, deletePlan } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [editingPlan, setEditingPlan] = useState<ConcertPlan | null>(null);

  const sortedPlans = [...plans].sort(
    (a, b) => new Date(a.saleStartTime).getTime() - new Date(b.saleStartTime).getTime()
  );

  const openCreateModal = () => {
    setEditingPlan(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const openEditModal = (plan: ConcertPlan) => {
    setEditingPlan(plan);
    setFormData({
      artist: plan.artist,
      artistImage: plan.artistImage || '',
      city: plan.city,
      venue: plan.venue,
      concertDate: plan.concertDate.slice(0, 16),
      saleStartTime: plan.saleStartTime.slice(0, 16),
      budgetTiers: plan.budgetTiers,
      preferredAreas: plan.preferredAreas,
      memberIds: plan.memberIds,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const planData: Omit<ConcertPlan, 'id' | 'createdAt'> = {
      ...formData,
      status: 'upcoming',
    };

    if (editingPlan) {
      useStore.getState().updatePlan(editingPlan.id, planData);
    } else {
      addPlan(planData);
    }

    setIsModalOpen(false);
    setFormData(initialFormData);
  };

  const addBudgetTier = () => {
    setFormData({
      ...formData,
      budgetTiers: [
        ...formData.budgetTiers,
        { id: generateId(), name: '', minPrice: 0, maxPrice: 0 },
      ],
    });
  };

  const removeBudgetTier = (id: string) => {
    if (formData.budgetTiers.length > 1) {
      setFormData({
        ...formData,
        budgetTiers: formData.budgetTiers.filter((t) => t.id !== id),
      });
    }
  };

  const updateBudgetTier = (id: string, field: keyof BudgetTier, value: string | number) => {
    setFormData({
      ...formData,
      budgetTiers: formData.budgetTiers.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    });
  };

  const addSeatArea = () => {
    setFormData({
      ...formData,
      preferredAreas: [
        ...formData.preferredAreas,
        { id: generateId(), name: '', priority: formData.preferredAreas.length + 1 },
      ],
    });
  };

  const removeSeatArea = (id: string) => {
    if (formData.preferredAreas.length > 1) {
      setFormData({
        ...formData,
        preferredAreas: formData.preferredAreas
          .filter((a) => a.id !== id)
          .map((a, i) => ({ ...a, priority: i + 1 })),
      });
    }
  };

  const updateSeatArea = (id: string, field: keyof SeatArea, value: string | number) => {
    setFormData({
      ...formData,
      preferredAreas: formData.preferredAreas.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  };

  const toggleMember = (memberId: string) => {
    setFormData({
      ...formData,
      memberIds: formData.memberIds.includes(memberId)
        ? formData.memberIds.filter((id) => id !== memberId)
        : [...formData.memberIds, memberId],
    });
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
          <h1 className="page-title">演出计划</h1>
          <p className="text-gray-400">管理所有抢票计划和演出信息</p>
        </div>
        <button onClick={openCreateModal} className="neon-btn flex items-center gap-2">
          <Plus className="w-5 h-5" />
          新建计划
        </button>
      </motion.div>

      {/* Plans List */}
      <div className="grid gap-4">
        {sortedPlans.map((plan, index) => {
          const planMembers = members.filter((m) => plan.memberIds.includes(m.id));
          return (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              transition={{ delay: index * 0.05 }}
              className="group relative overflow-hidden glass-card p-6 hover:border-neon-purple/50 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Artist Image */}
                {plan.artistImage && (
                  <div className="relative w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={plan.artistImage}
                      alt={plan.artist}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="text-2xl font-bold font-orbitron">{plan.artist}</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModal(plan);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('确定删除这个计划吗？')) {
                            deletePlan(plan.id);
                          }
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neon-pink" />
                      {plan.city} · {plan.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neon-purple" />
                      {formatDate(plan.concertDate)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neon-blue" />
                      {formatDateTime(plan.saleStartTime)}
                    </div>
                  </div>

                  {/* Countdown */}
                  <div className="mb-4">
                    <Countdown targetDate={plan.saleStartTime} size="sm" showLabel={false} />
                  </div>

                  {/* Budget Tiers */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {plan.budgetTiers.map((tier) => (
                      <span
                        key={tier.id}
                        className="badge bg-neon-purple/10 text-neon-purple border border-neon-purple/30"
                      >
                        <DollarSign className="w-3 h-3" />
                        {tier.name}: ¥{tier.minPrice}-{tier.maxPrice}
                      </span>
                    ))}
                  </div>

                  {/* Seat Areas */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {plan.preferredAreas.map((area) => (
                      <span
                        key={area.id}
                        className="badge bg-neon-blue/10 text-neon-blue border border-neon-blue/30"
                      >
                        <Armchair className="w-3 h-3" />
                        {area.priority}. {area.name}
                      </span>
                    ))}
                  </div>

                  {/* Members */}
                  {planMembers.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <div className="flex -space-x-2">
                        {planMembers.map((member) => (
                          <MemberAvatar
                            key={member.id}
                            name={member.name}
                            color={member.color}
                            size="sm"
                            className="border-2 border-cyber-dark"
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">
                        {planMembers.length} 人参与
                      </span>
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="hidden md:block w-6 h-6 text-gray-600 group-hover:text-neon-purple transition-colors" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {plans.length === 0 && (
        <motion.div variants={itemVariants} className="glass-card p-12 text-center">
          <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">还没有演出计划</h3>
          <p className="text-gray-500 mb-6">创建你的第一个抢票计划，开始和朋友们一起协作</p>
          <button onClick={openCreateModal} className="neon-btn inline-flex items-center gap-2">
            <Plus className="w-5 h-5" />
            创建计划
          </button>
        </motion.div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? '编辑演出计划' : '新建演出计划'}
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                艺人名称 *
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="input-field"
                placeholder="例如：周杰伦"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                艺人海报链接
              </label>
              <input
                type="url"
                value={formData.artistImage}
                onChange={(e) => setFormData({ ...formData, artistImage: e.target.value })}
                className="input-field"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                城市 *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="input-field"
                placeholder="例如：上海"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                场馆
              </label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                className="input-field"
                placeholder="例如：梅赛德斯奔驰文化中心"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                演出日期 *
              </label>
              <input
                type="datetime-local"
                value={formData.concertDate}
                onChange={(e) => setFormData({ ...formData, concertDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                开票时间 *
              </label>
              <input
                type="datetime-local"
                value={formData.saleStartTime}
                onChange={(e) => setFormData({ ...formData, saleStartTime: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          {/* Budget Tiers */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">预算档位</label>
              <button
                type="button"
                onClick={addBudgetTier}
                className="text-sm text-neon-purple hover:text-neon-pink transition-colors"
              >
                + 添加档位
              </button>
            </div>
            <div className="space-y-3">
              {formData.budgetTiers.map((tier, index) => (
                <div key={tier.id} className="flex gap-3 items-start">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updateBudgetTier(tier.id, 'name', e.target.value)}
                    className="input-field flex-1"
                    placeholder="档位名称（如：内场VIP）"
                  />
                  <input
                    type="number"
                    value={tier.minPrice || ''}
                    onChange={(e) => updateBudgetTier(tier.id, 'minPrice', Number(e.target.value))}
                    className="input-field w-28"
                    placeholder="最低价"
                  />
                  <span className="text-gray-500 py-3">-</span>
                  <input
                    type="number"
                    value={tier.maxPrice || ''}
                    onChange={(e) => updateBudgetTier(tier.id, 'maxPrice', Number(e.target.value))}
                    className="input-field w-28"
                    placeholder="最高价"
                  />
                  <button
                    type="button"
                    onClick={() => removeBudgetTier(tier.id)}
                    disabled={formData.budgetTiers.length <= 1}
                    className={cn(
                      'p-3 rounded-lg transition-colors',
                      formData.budgetTiers.length <= 1
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-red-400 hover:bg-red-500/20'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Preferred Areas */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-300">想坐区域（按优先级）</label>
              <button
                type="button"
                onClick={addSeatArea}
                className="text-sm text-neon-purple hover:text-neon-pink transition-colors"
              >
                + 添加区域
              </button>
            </div>
            <div className="space-y-3">
              {formData.preferredAreas.map((area) => (
                <div key={area.id} className="flex gap-3 items-center">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-neon-purple/20 text-neon-purple font-bold text-sm">
                    {area.priority}
                  </span>
                  <input
                    type="text"
                    value={area.name}
                    onChange={(e) => updateSeatArea(area.id, 'name', e.target.value)}
                    className="input-field flex-1"
                    placeholder="区域名称（如：内场前区）"
                  />
                  <button
                    type="button"
                    onClick={() => removeSeatArea(area.id)}
                    disabled={formData.preferredAreas.length <= 1}
                    className={cn(
                      'p-3 rounded-lg transition-colors',
                      formData.preferredAreas.length <= 1
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-red-400 hover:bg-red-500/20'
                    )}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              参与成员
            </label>
            {members.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无成员，请先在分工管理页面添加成员</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {members.map((member) => {
                  const isSelected = formData.memberIds.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => toggleMember(member.id)}
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
              {editingPlan ? '保存修改' : '创建计划'}
            </button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
}
