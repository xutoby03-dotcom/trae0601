import { useState } from 'react';
import { TrendingUp, Users, ShoppingCart, UserCheck, Calendar, BarChart3 } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function StatsPage() {
  const { stats, fetchStats } = useStore();
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  const handlePeriodChange = (p: 'today' | 'week' | 'month') => {
    setPeriod(p);
    fetchStats(p);
  };

  const mainStats = stats ? [
    {
      label: '总排队人数',
      value: stats.totalQueue,
      icon: Users,
      color: 'text-champagne-500',
      bgColor: 'bg-champagne-500/10',
    },
    {
      label: '试衣人数',
      value: stats.totalEntered,
      icon: UserCheck,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: '购买人数',
      value: stats.totalPurchased,
      icon: ShoppingCart,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: '整体转化率',
      value: `${stats.overallRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-burgundy-500',
      bgColor: 'bg-burgundy-500/10',
    },
  ] : [];

  const conversionStats = stats ? [
    { label: '试衣转化率', value: stats.fittingRate, desc: '排队→试衣', color: 'from-blue-500 to-blue-400' },
    { label: '购买转化率', value: stats.purchaseRate, desc: '试衣→购买', color: 'from-green-500 to-green-400' },
    { label: '整体转化率', value: stats.overallRate, desc: '排队→购买', color: 'from-burgundy-500 to-burgundy-400' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-cream-100">数据统计</h2>
          <p className="text-cream-400 mt-1">各时段转化率、试衣间利用率、导购业绩</p>
        </div>

        <div className="flex bg-charcoal-700/50 rounded-lg p-1">
          {(['today', 'week', 'month'] as const).map(p => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-4 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                period === p
                  ? 'bg-burgundy-700 text-white'
                  : 'text-cream-300 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              {p === 'today' ? '今日' : p === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {mainStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-charcoal-500 text-sm">{stat.label}</p>
                  <p className={`font-display text-5xl font-bold mt-3 ${stat.color} animate-number-change`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`w-14 h-14 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {conversionStats.map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-charcoal-800">{stat.label}</h3>
              <span className="text-sm text-charcoal-500">{stat.desc}</span>
            </div>
            <div className="relative">
              <div className={`text-5xl font-display font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.value.toFixed(1)}%
              </div>
              <div className="mt-4 h-3 bg-cream-300 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
                  style={{ width: `${Math.min(stat.value, 100)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="font-display text-xl text-charcoal-800 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-champagne-500" />
          各时段转化率趋势
        </h3>
        <div className="h-64">
          {stats && (
            <div className="flex items-end justify-between h-full gap-2">
              {stats.hourlyData.filter(h => h.queueCount > 0).map(hour => {
                const rate = hour.enteredCount > 0 ? (hour.purchasedCount / hour.enteredCount) * 100 : 0;
                const maxHeight = Math.max(...stats.hourlyData.map(h => h.queueCount), 1);
                const queueHeight = (hour.queueCount / maxHeight) * 100;
                const enteredHeight = (hour.enteredCount / maxHeight) * 100;
                const purchasedHeight = (hour.purchasedCount / maxHeight) * 100;

                return (
                  <div key={hour.hour} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="w-full flex items-end justify-center gap-1 h-48 relative">
                      <div className="relative flex-1 max-w-8">
                        <div
                          className="absolute bottom-0 w-full bg-champagne-200 rounded-t transition-all duration-500 group-hover:bg-champagne-300"
                          style={{ height: `${queueHeight}%` }}
                        />
                        <div
                          className="absolute bottom-0 w-full bg-blue-400 rounded-t transition-all duration-500 group-hover:bg-blue-500"
                          style={{ height: `${enteredHeight}%` }}
                        />
                        <div
                          className="absolute bottom-0 w-full bg-green-500 rounded-t transition-all duration-500 group-hover:bg-green-600"
                          style={{ height: `${purchasedHeight}%` }}
                        />
                      </div>

                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        排队: {hour.queueCount} | 试衣: {hour.enteredCount} | 购买: {hour.purchasedCount} | 转化: {rate.toFixed(0)}%
                      </div>
                    </div>
                    <div className="text-xs text-charcoal-600 font-medium">{hour.hour}</div>
                    <div className="text-xs font-bold text-burgundy-600">{rate.toFixed(0)}%</div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-champagne-200 rounded"></div>
              <span className="text-sm text-charcoal-600">排队</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded"></div>
              <span className="text-sm text-charcoal-600">试衣</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-charcoal-600">购买</span>
            </div>
          </div>
        </div>
      </div>

      {stats && (
        <div className="card p-6">
          <h3 className="font-display text-xl text-charcoal-800 mb-4 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-champagne-500" />
            导购业绩排名
          </h3>
          <div className="space-y-3">
            {stats.assistantStats
              .filter(a => a.queueCount > 0)
              .sort((a, b) => b.conversionRate - a.conversionRate)
              .map((a, index) => (
                <div key={a.assistantId} className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-champagne-400 text-white' :
                    index === 1 ? 'bg-gray-300 text-white' :
                    index === 2 ? 'bg-amber-600 text-white' :
                    'bg-cream-300 text-charcoal-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-charcoal-800">{a.assistantName}</span>
                      <span className="text-sm text-charcoal-500">
                        接待{a.queueCount}人 · 试衣{a.enteredCount}人 · 成交{a.purchasedCount}人
                      </span>
                    </div>
                    <div className="h-2 bg-cream-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-burgundy-600 to-champagne-500 transition-all duration-500"
                        style={{ width: `${a.conversionRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="font-display text-2xl font-bold text-burgundy-600 w-16 text-right">
                    {a.conversionRate.toFixed(1)}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
