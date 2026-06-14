import { Link } from 'react-router-dom';
import {
  Activity,
  Wallet,
  Package,
  Zap,
  Flame,
  AlertTriangle,
  AlertCircle,
  Plus,
  ChevronRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAppStore } from '@/store';
import {
  getOverdueEquipment,
  getUpcomingEquipment,
  computeMonthlyStats,
  getReplacementSuggestions,
  getThisMonthUsageCount,
  getThisMonthCost,
  getActiveEquipmentCount,
} from '@/utils/maintenance';
import { AlertCard } from '@/components/AlertCard';
import { StatCard } from '@/components/StatCard';
import { SPORT_TYPE_LABELS, MAINTENANCE_ACTION_LABELS } from '@/types';
import { SportIcon } from '@/components/SportIcon';
import { MaintenanceIcon } from '@/components/MaintenanceIcon';
import { formatDuration } from '@/utils/date';

export default function Dashboard() {
  const equipment = useAppStore((s) => s.equipment);
  const usageRecords = useAppStore((s) => s.usageRecords);

  const overdue = getOverdueEquipment(equipment, usageRecords);
  const upcoming = getUpcomingEquipment(equipment, usageRecords);
  const monthlyStats = computeMonthlyStats(usageRecords);
  const replacementSuggestions = getReplacementSuggestions(equipment, usageRecords).slice(0, 3);

  const thisMonthUsage = getThisMonthUsageCount(usageRecords);
  const lastMonthUsage = monthlyStats.length >= 2
    ? (monthlyStats[monthlyStats.length - 2]?.usageCount || 0)
    : 0;
  const usageTrend = lastMonthUsage > 0
    ? Math.round(((thisMonthUsage - lastMonthUsage) / lastMonthUsage) * 100)
    : thisMonthUsage > 0 ? 100 : 0;

  const thisMonthCost = getThisMonthCost(usageRecords);
  const lastMonthCost = monthlyStats.length >= 2
    ? (monthlyStats[monthlyStats.length - 2]?.totalCost || 0)
    : 0;
  const costTrend = lastMonthCost > 0
    ? Math.round(((thisMonthCost - lastMonthCost) / lastMonthCost) * 100)
    : thisMonthCost > 0 ? 100 : 0;

  const activeCount = getActiveEquipmentCount(equipment);

  const chartData = monthlyStats.map((m) => ({
    name: m.month,
    使用次数: m.usageCount,
    时长_小时: Math.round(m.totalMinutes / 60),
    花费_元: m.totalCost,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-warm-900">
            装备总览
          </h1>
          <p className="text-warm-500 mt-1">
            {overdue.length > 0
              ? `有 ${overdue.length} 件装备已超期需要处理`
              : upcoming.length > 0
              ? `${upcoming.length} 件装备即将需要保养`
              : '所有装备状态良好，继续保持！'}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/equipment/new" className="btn-secondary">
            <Plus size={16} />
            添加装备
          </Link>
          <Link to="/usage/new" className="btn-primary">
            <Zap size={16} />
            记录使用
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="本月使用次数"
          value={thisMonthUsage}
          subtitle="次运动记录"
          icon={<Activity size={22} />}
          iconBg="bg-brand-50"
          iconColor="text-brand-600"
          trend={{ value: Math.abs(usageTrend), isPositive: usageTrend >= 0 }}
          delay={0}
        />
        <StatCard
          label="本月维护花费"
          value={`¥${thisMonthCost}`}
          subtitle="装备维护与耗材"
          icon={<Wallet size={22} />}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
          trend={{ value: Math.abs(costTrend), isPositive: costTrend <= 0 }}
          delay={80}
        />
        <StatCard
          label="活跃装备"
          value={activeCount}
          subtitle={`共 ${equipment.length} 件装备`}
          icon={<Package size={22} />}
          iconBg="bg-violet-50"
          iconColor="text-violet-600"
          delay={160}
        />
        <StatCard
          label="待处理提醒"
          value={overdue.length + upcoming.length}
          subtitle={overdue.length > 0 ? `${overdue.length} 件超期` : `${upcoming.length} 件即将到期`}
          icon={<Flame size={22} />}
          iconBg={overdue.length > 0 ? 'bg-red-50' : 'bg-amber-50'}
          iconColor={overdue.length > 0 ? 'text-red-600' : 'text-amber-600'}
          delay={240}
        />
      </div>

      {/* Alerts */}
      <div className="space-y-6">
        {/* Overdue */}
        {overdue.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                  <AlertCircle size={18} className="text-red-600" />
                </div>
                <h2 className="section-title">已超期</h2>
                <span className="badge bg-red-100 text-red-700 border border-red-200">
                  {overdue.length} 件
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overdue.map((item, i) => (
                <AlertCard
                  key={item.equipment.id}
                  equipment={item.equipment}
                  status={item.status}
                  isOverdue={true}
                  delay={i * 80}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <AlertTriangle size={18} className="text-amber-600" />
                </div>
                <h2 className="section-title">即将到期</h2>
                <span className="badge bg-amber-100 text-amber-700 border border-amber-200">
                  {upcoming.length} 件 · 7天内
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {upcoming.map((item, i) => (
                <AlertCard
                  key={item.equipment.id}
                  equipment={item.equipment}
                  status={item.status}
                  isOverdue={false}
                  delay={i * 80}
                />
              ))}
            </div>
          </section>
        )}

        {overdue.length === 0 && upcoming.length === 0 && (
          <div className="card-base p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center mb-4">
              <Activity size={32} className="text-emerald-600" />
            </div>
            <h3 className="font-display text-xl font-semibold text-warm-900">
              一切正常
            </h3>
            <p className="text-warm-500 mt-2 max-w-md mx-auto">
              所有装备状态良好，没有需要立即处理的提醒。记得定期记录使用情况哦！
            </p>
          </div>
        )}
      </div>

      {/* Charts + Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '320ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">月度运动统计</h2>
            <div className="text-xs text-warm-500">近 6 个月</div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E5DC" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#787163', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="left"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#787163', fontSize: 12 }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#787163', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #E8E5DC',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '13px',
                  }}
                  cursor={{ fill: '#FAF9F6' }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
                />
                <Bar
                  yAxisId="left"
                  dataKey="使用次数"
                  fill="#FF6B35"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="left"
                  dataKey="时长_小时"
                  fill="#004E64"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  yAxisId="right"
                  dataKey="花费_元"
                  fill="#968E7D"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly summary */}
          <div className="mt-6 pt-6 border-t border-warm-100 grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-warm-500 mb-1">累计使用</p>
              <p className="font-display text-xl font-bold text-warm-900">
                {monthlyStats.reduce((s, m) => s + m.usageCount, 0)} 次
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-warm-500 mb-1">累计时长</p>
              <p className="font-display text-xl font-bold text-warm-900">
                {formatDuration(monthlyStats.reduce((s, m) => s + m.totalMinutes, 0))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-warm-500 mb-1">累计花费</p>
              <p className="font-display text-xl font-bold text-warm-900">
                ¥{monthlyStats.reduce((s, m) => s + m.totalCost, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Replacement Suggestions */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '400ms' }}>
          <h2 className="section-title mb-1">最该替换</h2>
          <p className="text-sm text-warm-500 mb-5">根据使用情况智能推荐</p>

          {replacementSuggestions.length > 0 ? (
            <div className="space-y-4">
              {replacementSuggestions.map((item, i) => (
                <Link
                  key={item.equipment.id}
                  to={`/equipment/${item.equipment.id}`}
                  className="group block p-4 rounded-xl bg-warm-50 hover:bg-warm-100 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <SportIcon type={item.equipment.sportType} size={20} className="text-warm-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold text-warm-900 truncate group-hover:text-brand-600 transition-colors">
                          {item.equipment.name}
                        </h4>
                        <span
                          className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.urgencyScore >= 80
                              ? 'bg-red-100 text-red-700'
                              : item.urgencyScore >= 60
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-warm-200 text-warm-700'
                          }`}
                        >
                          {item.urgencyScore}
                        </span>
                      </div>
                      <p className="text-xs text-warm-500 mt-0.5">
                        {SPORT_TYPE_LABELS[item.equipment.sportType]}
                      </p>
                      <p className="text-sm text-warm-600 mt-2 line-clamp-2">
                        {item.reason}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="inline-flex items-center gap-1 text-xs text-brand-600 font-medium">
                          <MaintenanceIcon
                            action={item.maintenanceStatus.suggestedAction}
                            size={12}
                          />
                          {MAINTENANCE_ACTION_LABELS[item.maintenanceStatus.suggestedAction]}
                        </div>
                        <ChevronRight
                          size={14}
                          className="text-warm-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-warm-400">
              <Package size={40} className="mx-auto mb-3 opacity-50" />
              <p className="text-sm">暂时没有需要替换的装备</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
