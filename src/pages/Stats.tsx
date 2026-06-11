import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, TrendingUp, AlertTriangle, Trophy, Target,
  DollarSign, Ticket, Users, Crown, Medal, Award
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import useStore from '../store/useStore';
import PlatformIcon from '../components/PlatformIcon';
import { formatMoney } from '../utils/money';
import { PLATFORM_INFO } from '../types';
import type { PlatformStat } from '../types';

const CHART_COLORS = ['#FF2E9D', '#9D4EDD', '#4CC9F0', '#39FF14', '#FF6B35'];

export default function Stats() {
  const { tickets, plans, members, calculateStats } = useStore();
  
  const stats = useMemo(() => calculateStats(), [calculateStats]);

  const successTickets = tickets.filter((t) => t.status === 'success');
  const totalSpent = successTickets.reduce((sum, t) => sum + t.price, 0);

  const rankedPlatforms = useMemo(() => {
    return [...stats.platformStats]
      .filter((p) => p.attempts > 0)
      .sort((a, b) => b.successRate - a.successRate);
  }, [stats.platformStats]);

  const barChartData = useMemo(() => {
    return stats.platformStats
      .filter((p) => p.attempts > 0)
      .map((p) => ({
        name: PLATFORM_INFO[p.platform].name,
        成功: p.success,
        失败: p.attempts - p.success,
        platform: p.platform,
      }));
  }, [stats.platformStats]);

  const pieChartData = useMemo(() => {
    return stats.platformStats
      .filter((p) => p.success > 0)
      .map((p) => ({
        name: PLATFORM_INFO[p.platform].name,
        value: p.success,
        platform: p.platform,
      }));
  }, [stats.platformStats]);

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

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold">{index + 1}</span>;
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants}>
        <h1 className="page-title">统计分析</h1>
        <p className="text-gray-400">查看抢票成功率、预算执行和平台表现</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-pink/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-neon-pink/20">
                <Target className="w-5 h-5 text-neon-pink" />
              </div>
              <span className="text-gray-400 text-sm">总抢票次数</span>
            </div>
            <div className="text-4xl font-bold font-orbitron">{stats.totalAttempts}</div>
          </div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-neon-green/20">
                <Trophy className="w-5 h-5 text-neon-green" />
              </div>
              <span className="text-gray-400 text-sm">成功次数</span>
            </div>
            <div className="text-4xl font-bold font-orbitron text-neon-green">{stats.successCount}</div>
          </div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-neon-purple/20">
                <TrendingUp className="w-5 h-5 text-neon-purple" />
              </div>
              <span className="text-gray-400 text-sm">成功率</span>
            </div>
            <div className="text-4xl font-bold font-orbitron text-neon-purple">
              {(stats.successRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="glass-card p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-neon-orange/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-neon-orange/20">
                <AlertTriangle className="w-5 h-5 text-neon-orange" />
              </div>
              <span className="text-gray-400 text-sm">超预算金额</span>
            </div>
            <div className="text-4xl font-bold font-orbitron text-neon-orange">
              {formatMoney(stats.overBudgetAmount)}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Additional Stats */}
      <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-4">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-neon-blue" />
            <h3 className="font-semibold">总花费</h3>
          </div>
          <div className="text-3xl font-bold text-neon-blue">{formatMoney(totalSpent)}</div>
          <p className="text-sm text-gray-500 mt-1">已成功 {successTickets.length} 张票</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Ticket className="w-5 h-5 text-neon-pink" />
            <h3 className="font-semibold">平均票价</h3>
          </div>
          <div className="text-3xl font-bold text-neon-pink">
            {successTickets.length > 0 ? formatMoney(totalSpent / successTickets.length) : formatMoney(0)}
          </div>
          <p className="text-sm text-gray-500 mt-1">基于成功抢票计算</p>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-neon-green" />
            <h3 className="font-semibold">团队规模</h3>
          </div>
          <div className="text-3xl font-bold text-neon-green">{members.length} 人</div>
          <p className="text-sm text-gray-500 mt-1">{plans.length} 个演出计划</p>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="section-title">
            <BarChart3 className="w-5 h-5 text-neon-purple" />
            各平台抢票统计
          </h3>
          <div className="h-80">
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#12121A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="成功" fill="#39FF14" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="失败" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                暂无数据
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="section-title">
            <Trophy className="w-5 h-5 text-neon-pink" />
            成功票来源分布
          </h3>
          <div className="h-80">
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={{ stroke: '#9CA3AF' }}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#12121A',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                暂无成功记录
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Platform Ranking */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="section-title">
          <Trophy className="w-5 h-5 text-yellow-400" />
          平台成功率排行榜
        </h3>
        {rankedPlatforms.length > 0 ? (
          <div className="space-y-3">
            {rankedPlatforms.map((platformStat: PlatformStat, index: number) => {
              const info = PLATFORM_INFO[platformStat.platform];
              const successRatePercent = (platformStat.successRate * 100).toFixed(1);
              return (
                <div
                  key={platformStat.platform}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                >
                  <div className="w-10 h-10 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  
                  <PlatformIcon platform={platformStat.platform} size="md" showName />
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">
                        尝试 {platformStat.attempts} 次 · 成功 {platformStat.success} 次
                      </span>
                      <span className="text-2xl font-bold font-orbitron" style={{ color: info.color }}>
                        {successRatePercent}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${successRatePercent}%`,
                          background: `linear-gradient(90deg, ${info.color}, ${info.color}88)`,
                          boxShadow: `0 0 10px ${info.color}60`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无抢票数据，开始抢票后这里会显示排行榜
          </div>
        )}
      </motion.div>

      {/* Budget Analysis */}
      <motion.div variants={itemVariants} className="glass-card p-6">
        <h3 className="section-title">
          <DollarSign className="w-5 h-5 text-neon-orange" />
          预算执行分析
        </h3>
        {plans.length > 0 ? (
          <div className="space-y-4">
            {plans.map((plan) => {
              const planTickets = tickets.filter((t) => t.planId === plan.id && t.status === 'success');
              const planTotal = planTickets.reduce((sum, t) => sum + t.price, 0);
              const maxBudget = plan.budgetTiers.length > 0
                ? Math.max(...plan.budgetTiers.map((b) => b.maxPrice)) * planTickets.length
                : 0;
              const overBudget = maxBudget > 0 ? Math.max(0, planTotal - maxBudget) : 0;

              return (
                <div
                  key={plan.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {plan.artistImage && (
                        <img
                          src={plan.artistImage}
                          alt={plan.artist}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <h4 className="font-semibold">{plan.artist}</h4>
                        <p className="text-sm text-gray-400">{plan.city}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatMoney(planTotal)}</p>
                      {overBudget > 0 && (
                        <p className="text-sm text-red-400">超支 {formatMoney(overBudget)}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {plan.budgetTiers.map((tier) => (
                      <span
                        key={tier.id}
                        className="badge bg-white/5 text-gray-300 border border-white/10"
                      >
                        {tier.name}: ¥{tier.minPrice}-{tier.maxPrice}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            暂无演出计划
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
