import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Ticket, BarChart3, MapPin, Calendar } from 'lucide-react';
import useStore from '../store/useStore';
import Countdown from '../components/Countdown';
import StatusCard from '../components/StatusCard';
import { formatDate } from '../utils/date';
import { cn } from '../lib/utils';

export default function Dashboard() {
  const navigate = useNavigate();
  const { plans, tickets } = useStore();

  const upcomingPlans = plans.filter((p) => {
    const saleTime = new Date(p.saleStartTime).getTime();
    return saleTime > Date.now();
  });

  const ongoingPlans = plans.filter((p) => {
    const saleTime = new Date(p.saleStartTime).getTime();
    const concertTime = new Date(p.concertDate).getTime();
    return saleTime <= Date.now() && concertTime > Date.now();
  });

  const successTickets = tickets.filter((t) => t.status === 'success');
  const pendingTickets = tickets.filter((t) => t.status === 'pending_transfer');

  const nextPlan = upcomingPlans.length > 0
    ? upcomingPlans.sort((a, b) =>
        new Date(a.saleStartTime).getTime() - new Date(b.saleStartTime).getTime()
      )[0]
    : null;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
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
      className="space-y-8"
    >
      {/* Hero Section with Countdown */}
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-3xl glass-card neon-border p-8 md:p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/10 via-neon-purple/10 to-neon-blue/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-pink/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-neon-pink/20 text-neon-pink text-sm font-medium">
              下一场开票
            </span>
          </div>

          {nextPlan ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold font-orbitron mb-2">
                    {nextPlan.artist}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-300">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neon-pink" />
                      <span>{nextPlan.city} · {nextPlan.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neon-purple" />
                      <span>{formatDate(nextPlan.concertDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10">
                <div className="text-center mb-4">
                  <p className="text-gray-400 mb-2">距离开票还有</p>
                  <Countdown targetDate={nextPlan.saleStartTime} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {nextPlan.budgetTiers.map((tier) => (
                  <span
                    key={tier.id}
                    className="badge bg-white/5 text-gray-300 border border-white/10"
                  >
                    {tier.name}: ¥{tier.minPrice}-{tier.maxPrice}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-4 text-gray-300">
                暂无开票计划
              </h2>
              <p className="text-gray-500 mb-6">点击下方按钮创建你的第一个抢票计划</p>
              <button
                onClick={() => navigate('/plans')}
                className="neon-btn inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                创建计划
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Status Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatusCard
          type="upcoming"
          count={upcomingPlans.length}
          label="开票准备"
          onClick={() => navigate('/plans')}
        />
        <StatusCard
          type="ongoing"
          count={ongoingPlans.length}
          label="正在抢"
          onClick={() => navigate('/plans')}
        />
        <StatusCard
          type="success"
          count={successTickets.length}
          label="已成功"
          onClick={() => navigate('/tickets')}
        />
        <StatusCard
          type="pending"
          count={pendingTickets.length}
          label="待转票"
          onClick={() => navigate('/tickets')}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => navigate('/plans')}
          className="group relative overflow-hidden rounded-2xl p-6 glass-card border border-white/10 hover:border-neon-pink/50 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6 text-neon-pink" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">新建计划</h3>
              <p className="text-sm text-gray-400">添加新的演出抢票计划</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/tickets')}
          className="group relative overflow-hidden rounded-2xl p-6 glass-card border border-white/10 hover:border-neon-green/50 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-neon-green/20 to-emerald-500/20 group-hover:scale-110 transition-transform">
              <Ticket className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">录入抢票</h3>
              <p className="text-sm text-gray-400">记录抢到的门票信息</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/stats')}
          className="group relative overflow-hidden rounded-2xl p-6 glass-card border border-white/10 hover:border-neon-blue/50 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-neon-blue/20 to-cyan-500/20 group-hover:scale-110 transition-transform">
              <BarChart3 className="w-6 h-6 text-neon-blue" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">查看统计</h3>
              <p className="text-sm text-gray-400">分析抢票成功率和数据</p>
            </div>
          </div>
        </button>
      </motion.div>

      {/* Recent Plans */}
      {plans.length > 0 && (
        <motion.div variants={itemVariants} className="glass-card p-6">
          <h2 className="section-title">
            <Calendar className="w-5 h-5 text-neon-purple" />
            最近演出计划
          </h2>
          <div className="space-y-3">
            {plans.slice(0, 3).map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/plans/${plan.id}`)}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl',
                  'bg-white/5 hover:bg-white/10 cursor-pointer transition-all',
                  'border border-white/5 hover:border-white/20'
                )}
              >
                <div className="flex items-center gap-4">
                  {plan.artistImage && (
                    <img
                      src={plan.artistImage}
                      alt={plan.artist}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{plan.artist}</h3>
                    <p className="text-sm text-gray-400">
                      {plan.city} · {formatDate(plan.concertDate)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">开票时间</p>
                  <p className="font-mono text-sm text-neon-pink">
                    {formatDate(plan.saleStartTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
