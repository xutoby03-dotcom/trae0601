import { useMemo } from 'react';
import {
  BarChart3,
  Users,
  Clock,
  TrendingUp,
  Calendar,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import { useQueueStore } from '@/store/queueStore';
import {
  getServedToday,
  getWaitingList,
  getPassedList,
  calculateAverageWaitTime,
  getHourlyDistribution,
  getPeakHour,
  formatWaitTime,
} from '@/utils/helpers';

export default function Stats() {
  const { queue, tickets } = useQueueStore();

  const stats = useMemo(() => {
    const servedToday = getServedToday(tickets);
    const waitingList = getWaitingList(tickets);
    const passedList = getPassedList(tickets);
    const avgWaitTime = calculateAverageWaitTime(tickets);
    const hourlyDist = getHourlyDistribution(tickets);
    const peakHour = getPeakHour(hourlyDist);
    const totalToday = tickets.filter((t) =>
      t.createdAt.startsWith(new Date().toISOString().split('T')[0])
    ).length;

    return {
      servedToday: servedToday.length,
      waiting: waitingList.length,
      passed: passedList.length,
      avgWaitTime,
      hourlyDist,
      peakHour,
      totalToday,
      passRate: totalToday > 0 ? Math.round((passedList.length / totalToday) * 100) : 0,
    };
  }, [tickets]);

  const maxCount = Math.max(...Object.values(stats.hourlyDist), 1);

  const formatHour = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  if (!queue) return null;

  return (
    <div className="min-h-screen">
      <NavHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold font-display mb-1">
            今日统计
          </h1>
          <p className="text-white/60 text-sm">
            <Calendar className="w-4 h-4 inline mr-1" />
            {new Date().toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="text-white/60 text-sm">今日接待</div>
            </div>
            <div className="text-3xl font-bold font-display text-gradient-green">
              {stats.servedToday}
            </div>
            <div className="text-xs text-white/40 mt-1">已完成服务</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
                <Timer className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-white/60 text-sm">当前排队</div>
            </div>
            <div className="text-3xl font-bold font-display text-gradient">
              {stats.waiting}
            </div>
            <div className="text-xs text-white/40 mt-1">等待中</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-white/60 text-sm">平均等待</div>
            </div>
            <div className="text-3xl font-bold font-display text-gradient-yellow">
              {stats.avgWaitTime || '--'}
            </div>
            <div className="text-xs text-white/40 mt-1">分钟</div>
          </div>

          <div className="glass rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-white/60 text-sm">过号率</div>
            </div>
            <div className="text-3xl font-bold font-display text-red-400">
              {stats.passRate}%
            </div>
            <div className="text-xs text-white/40 mt-1">{stats.passed} 人过号</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 glass rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              <h2 className="text-lg font-semibold">时段分布</h2>
            </div>

            <div className="flex items-end justify-between gap-1 h-64 px-2">
              {Object.entries(stats.hourlyDist).map(([hour, count]) => {
                const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                const isPeak = parseInt(hour) === stats.peakHour && count > 0;
                return (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-xs text-white/40 font-mono">
                      {count > 0 ? count : ''}
                    </div>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-t from-primary-600 to-primary-400'
                          : 'bg-gradient-to-t from-primary-900/50 to-primary-700/30'
                      }`}
                      style={{ height: `${Math.max(height, 2)}%` }}
                    />
                    <div className={`text-xs ${
                      isPeak ? 'text-primary-400 font-semibold' : 'text-white/40'
                    }`}>
                      {formatHour(parseInt(hour))}
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.peakHour && (
              <div className="mt-6 pt-6 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-400" />
                  <span className="text-white/60">最忙时段：</span>
                  <span className="font-semibold text-primary-400">
                    {formatHour(stats.peakHour)} - {formatHour(stats.peakHour + 1)}
                  </span>
                  <span className="text-white/40 text-sm ml-auto">
                    共 {stats.hourlyDist[stats.peakHour]} 人取号
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-white/60" />
                <h2 className="text-lg font-semibold">今日概览</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/60">总取号数</span>
                  <span className="font-semibold text-white">{stats.totalToday} 人</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/60">已完成</span>
                  <span className="font-semibold text-emerald-400">{stats.servedToday} 人</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/60">等待中</span>
                  <span className="font-semibold text-white">{stats.waiting} 人</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/60">已过号</span>
                  <span className="font-semibold text-amber-400">{stats.passed} 人</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/60">服务效率</span>
                  <span className="font-semibold text-white">
                    {stats.servedToday > 0
                      ? `${Math.round(stats.servedToday / ((Date.now() - new Date().setHours(8, 0, 0, 0)) / 3600000))} 人/小时`
                      : '--'}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass rounded-3xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Timer className="w-5 h-5 text-white/60" />
                <h2 className="text-lg font-semibold">时间统计</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/60">平均等待</span>
                  <span className="font-semibold text-primary-400">
                    {formatWaitTime(stats.avgWaitTime)}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-white/60">预计单人</span>
                  <span className="font-semibold text-white">
                    {queue.estimatedTimePerPerson} 分钟
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-white/60">预计总等待</span>
                  <span className="font-semibold text-amber-400">
                    {formatWaitTime(stats.waiting * queue.estimatedTimePerPerson)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-400" />
            <h2 className="text-lg font-semibold">营业分析</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-orange rounded-2xl p-5">
              <div className="text-white/60 text-sm mb-2">当前状态</div>
              <div className={`text-xl font-semibold ${
                queue.isPaused ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {queue.isPaused ? '⏸ 暂停接单' : '▶ 营业中'}
              </div>
              <div className="text-white/40 text-sm mt-1">
                {queue.businessName}
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="text-white/60 text-sm mb-2">今日号码</div>
              <div className="text-xl font-semibold text-white">
                A{queue.currentNumber.toString().padStart(3, '0')}
              </div>
              <div className="text-white/40 text-sm mt-1">
                当前最大号码
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <div className="text-white/60 text-sm mb-2">预估产能</div>
              <div className="text-xl font-semibold text-white">
                {queue.estimatedTimePerPerson > 0
                  ? `${Math.round(8 * 60 / queue.estimatedTimePerPerson)} 人/天`
                  : '--'}
              </div>
              <div className="text-white/40 text-sm mt-1">
                按8小时营业计算
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
