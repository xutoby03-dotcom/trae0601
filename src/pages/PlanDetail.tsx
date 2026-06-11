import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, MapPin, Calendar, Clock, DollarSign, Users,
  Armchair, Edit2, Trash2, Ticket
} from 'lucide-react';
import useStore from '../store/useStore';
import Countdown from '../components/Countdown';
import MemberAvatar from '../components/MemberAvatar';
import PlatformIcon from '../components/PlatformIcon';
import { formatDate, formatDateTime } from '../utils/date';
import { formatMoney } from '../utils/money';
import { PLATFORM_INFO } from '../types';

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { plans, members, tickets, deletePlan } = useStore();

  const plan = plans.find((p) => p.id === id);
  const planMembers = members.filter((m) => plan?.memberIds.includes(m.id));
  const planTickets = tickets.filter((t) => t.planId === id);
  const successTickets = planTickets.filter((t) => t.status === 'success');
  const pendingTickets = planTickets.filter((t) => t.status === 'pending_transfer');

  if (!plan) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-12 text-center"
      >
        <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">演出计划不存在</h3>
        <p className="text-gray-500 mb-6">该计划可能已被删除或不存在</p>
        <button
          onClick={() => navigate('/plans')}
          className="neon-btn inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          返回计划列表
        </button>
      </motion.div>
    );
  }

  const handleDelete = () => {
    if (confirm('确定删除这个演出计划吗？相关的抢票记录也会被删除。')) {
      deletePlan(plan.id);
      navigate('/plans');
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
      <motion.div variants={itemVariants} className="flex items-center gap-4">
        <button
          onClick={() => navigate('/plans')}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">{plan.artist}</h1>
          <p className="text-gray-400">{plan.city} · {plan.venue}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/tickets')}
            className="neon-btn-secondary flex items-center gap-2"
          >
            <Ticket className="w-4 h-4" />
            抢票记录
          </button>
          <button
            onClick={() => {
              useStore.getState().updatePlan(plan.id, {});
            }}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
          >
            <Edit2 className="w-5 h-5 text-gray-400" />
          </button>
          <button
            onClick={handleDelete}
            className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </motion.div>

      {/* Hero Section */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl glass-card neon-border">
        {plan.artistImage && (
          <div className="absolute inset-0">
            <img
              src={plan.artistImage}
              alt={plan.artist}
              className="w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyber-dark/80 to-cyber-dark" />
          </div>
        )}
        
        <div className="relative z-10 p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink text-sm font-medium">
                  演出详情
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-pink/20">
                    <MapPin className="w-5 h-5 text-neon-pink" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">演出城市</p>
                    <p className="font-semibold text-lg">{plan.city}</p>
                  </div>
                </div>
                
                {plan.venue && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-neon-purple/20">
                      <MapPin className="w-5 h-5 text-neon-purple" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">演出场馆</p>
                      <p className="font-semibold">{plan.venue}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-neon-blue/20">
                    <Calendar className="w-5 h-5 text-neon-blue" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">演出日期</p>
                    <p className="font-semibold">{formatDate(plan.concertDate)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-neon-green/20 text-neon-green text-sm font-medium">
                  开票倒计时
                </span>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-neon-orange/20">
                    <Clock className="w-5 h-5 text-neon-orange" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">开票时间</p>
                    <p className="font-semibold">{formatDateTime(plan.saleStartTime)}</p>
                  </div>
                </div>
                
                <div className="text-center">
                  <Countdown targetDate={plan.saleStartTime} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
        <div className="glass-card p-6 text-center">
          <Ticket className="w-8 h-8 text-neon-blue mx-auto mb-3" />
          <div className="text-3xl font-bold font-orbitron text-neon-blue">
            {planTickets.length}
          </div>
          <p className="text-gray-400 text-sm mt-1">总抢票次数</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Ticket className="w-8 h-8 text-neon-green mx-auto mb-3" />
          <div className="text-3xl font-bold font-orbitron text-neon-green">
            {successTickets.length}
          </div>
          <p className="text-gray-400 text-sm mt-1">成功票数</p>
        </div>
        <div className="glass-card p-6 text-center">
          <Clock className="w-8 h-8 text-neon-orange mx-auto mb-3" />
          <div className="text-3xl font-bold font-orbitron text-neon-orange">
            {pendingTickets.length}
          </div>
          <p className="text-gray-400 text-sm mt-1">待转票</p>
        </div>
      </motion.div>

      {/* Budget Tiers */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h2 className="section-title">
          <DollarSign className="w-5 h-5 text-neon-purple" />
          预算档位
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.budgetTiers.map((tier) => (
            <div
              key={tier.id}
              className="p-4 rounded-xl bg-gradient-to-br from-neon-purple/10 to-neon-pink/10 border border-neon-purple/30"
            >
              <h3 className="font-semibold text-lg mb-2">{tier.name}</h3>
              <p className="text-2xl font-bold font-orbitron text-neon-green">
                ¥{tier.minPrice} - ¥{tier.maxPrice}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                均价 ¥{Math.round((tier.minPrice + tier.maxPrice) / 2)}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Preferred Areas */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h2 className="section-title">
          <Armchair className="w-5 h-5 text-neon-blue" />
          想坐区域（按优先级）
        </h2>
        <div className="space-y-3">
          {plan.preferredAreas.map((area) => (
            <div
              key={area.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-neon-blue/30 transition-all"
            >
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-neon-blue/20 text-neon-blue font-bold">
                {area.priority}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{area.name}</h3>
                <p className="text-sm text-gray-400">优先级 {area.priority}</p>
              </div>
              <Armchair className="w-5 h-5 text-gray-500" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Team Members */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h2 className="section-title">
          <Users className="w-5 h-5 text-neon-pink" />
          参与成员
          <span className="ml-2 text-sm font-normal text-gray-400">
            共 {planMembers.length} 人
          </span>
        </h2>
        {planMembers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无参与成员</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
              >
                <MemberAvatar name={member.name} color={member.color} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{member.name}</h3>
                  <p className="text-sm text-gray-400">
                    最多买 {member.maxTickets} 张
                  </p>
                  {member.platformClaims.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {member.platformClaims.slice(0, 3).map((claim) => (
                        <div
                          key={claim.id}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5"
                        >
                          <PlatformIcon platform={claim.platform} size="sm" />
                          <span className="text-xs text-gray-400">
                            {PLATFORM_INFO[claim.platform].name}
                          </span>
                        </div>
                      ))}
                      {member.platformClaims.length > 3 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{member.platformClaims.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h2 className="section-title">快捷操作</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/tickets')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-green/50 transition-all text-left"
          >
            <div className="p-2 rounded-lg bg-neon-green/20">
              <Ticket className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <h3 className="font-semibold">录入抢票</h3>
              <p className="text-sm text-gray-400">记录抢到的门票</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/team')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-purple/50 transition-all text-left"
          >
            <div className="p-2 rounded-lg bg-neon-purple/20">
              <Users className="w-5 h-5 text-neon-purple" />
            </div>
            <div>
              <h3 className="font-semibold">分工管理</h3>
              <p className="text-sm text-gray-400">管理团队成员</p>
            </div>
          </button>
          
          <button
            onClick={() => navigate('/stats')}
            className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-neon-blue/50 transition-all text-left"
          >
            <div className="p-2 rounded-lg bg-neon-blue/20">
              <DollarSign className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-semibold">查看统计</h3>
              <p className="text-sm text-gray-400">分析抢票数据</p>
            </div>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
