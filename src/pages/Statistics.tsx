import { useMemo } from 'react';
import { useStore } from '@/store';
import {
  BarChart3,
  AlertTriangle,
  Clock,
  TrendingUp,
  Trophy,
  Target,
  CalendarDays,
  Sparkles,
  AlertOctagon,
  TrendingDown,
} from 'lucide-react';
import { getHourOfDay, getDayOfWeek, DAY_NAMES, formatDateTime } from '@/utils/helpers';
import { ReservationStatus, DamageLevel } from '@/types';

export default function StatisticsPage() {
  const { reservations, borrowRecords, returnRecords, ladders, getOverdueBorrowRecords } = useStore();

  const stats = useMemo(() => {
    const completedReservations = reservations.filter(
      (r) => r.status === ReservationStatus.COMPLETED || r.status === ReservationStatus.BORROWED
    );

    const totalCompleted = completedReservations.length;
    const overdueList = getOverdueBorrowRecords();
    const overdueCount = overdueList.length;

    const historyOverdue = returnRecords.length > 0
      ? reservations.filter((r) => {
          const borrow = borrowRecords.find((b) => b.reservationId === r.id);
          if (!borrow) return false;
          return new Date(borrow.borrowTime).getTime() >
            new Date(r.expectedEndTime).getTime();
        }).length
      : 0;

    const totalOverdueCount = overdueCount + historyOverdue;

    const purposeCount: Record<string, number> = {};
    completedReservations.forEach((r) => {
      purposeCount[r.purpose] = (purposeCount[r.purpose] || 0) + 1;
    });

    const purposeData = Object.entries(purposeCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const maxPurposeCount = Math.max(1, ...purposeData.map((d) => d.count));

    const hourCount = Array(24).fill(0);
    completedReservations.forEach((r) => {
      const borrow = borrowRecords.find((b) => b.reservationId === r.id);
      if (borrow) {
        const hour = getHourOfDay(borrow.borrowTime);
        hourCount[hour]++;
      } else {
        const hour = getHourOfDay(r.startTime);
        hourCount[hour]++;
      }
    });
    const maxHourCount = Math.max(1, ...hourCount);

    const weekdayCount = Array(7).fill(0);
    completedReservations.forEach((r) => {
      const borrow = borrowRecords.find((b) => b.reservationId === r.id);
      const day = borrow
        ? getDayOfWeek(borrow.borrowTime)
        : getDayOfWeek(r.startTime);
      weekdayCount[day]++;
    });
    const maxWeekdayCount = Math.max(1, ...weekdayCount);

    const personOverdueCount: Record<string, { name: string; count: number; building: string }> = {};
    overdueList.forEach(({ reservation }) => {
      const key = `${reservation.borrowerName}-${reservation.building}`;
      if (!personOverdueCount[key]) {
        personOverdueCount[key] = {
          name: reservation.borrowerName,
          count: 0,
          building: reservation.building,
        };
      }
      personOverdueCount[key].count++;
    });

    const overdueRanking = Object.values(personOverdueCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const damageCount = {
      [DamageLevel.NONE]: 0,
      [DamageLevel.MINOR]: 0,
      [DamageLevel.SEVERE]: 0,
    };
    returnRecords.forEach((r) => {
      damageCount[r.damageLevel] = (damageCount[r.damageLevel] || 0) + 1;
    });

    const mostPopularPurpose = purposeData[0]?.name || '暂无数据';

    const peakHour = hourCount.indexOf(maxHourCount);

    const peakWeekday = weekdayCount.indexOf(maxWeekdayCount);

    return {
      totalCompleted,
      totalOverdueCount,
      overdueCount,
      purposeData,
      maxPurposeCount,
      hourCount,
      maxHourCount,
      weekdayCount,
      maxWeekdayCount,
      overdueRanking,
      damageCount,
      mostPopularPurpose,
      peakHour,
      peakWeekday,
    };
  }, [reservations, borrowRecords, returnRecords, ladders, getOverdueBorrowRecords]);

  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="section-title mb-2">
          数据洞察<span className="gradient-text"> · 一目了然</span>
        </h2>
        <p className="text-sm text-slate-500">共享梯子使用数据全览，帮助优化资源调度</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          icon={Target}
          label="累计借用"
          value={stats.totalCompleted}
          sub="总次数"
          gradient="from-amber-400 via-amber-500 to-amber-600"
        />
        <StatCard
          icon={AlertOctagon}
          label="逾期次数"
          value={stats.totalOverdueCount}
          sub={`当前 ${stats.overdueCount} 项`}
          gradient={
            stats.totalOverdueCount > 0
              ? 'from-danger-400 via-danger-500 to-danger-600'
              : 'from-slate-300 to-slate-500'
          }
        />
        <StatCard
          icon={Sparkles}
          label="最常用途"
          value={stats.mostPopularPurpose}
          sub="热门用途"
          gradient="from-mint-400 via-mint-500 to-mint-600"
          isText
        />
        <StatCard
          icon={Clock}
          label="借用高峰"
          value={`${stats.peakHour}:00`}
          sub={`${DAY_NAMES[stats.peakWeekday]} 最忙`}
          gradient="from-sky-400 via-sky-500 to-sky-600"
          isText
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="card p-5 sm:p-6">
          <CardHeader
            icon={BarChart3}
            title="24 小时借用分布"
            desc="各时段借用频次统计"
            accent="amber"
          />
          <div className="pt-4 pl-2">
            <div className="flex items-end gap-1 h-44 sm:h-52 overflow-x-auto pb-2 -mx-2 px-2">
              {stats.hourCount.map((count, i) => {
                const height = (count / stats.maxHourCount) * 100;
                const isPeak = i === stats.peakHour && count > 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0 min-w-[28px]">
                    <span className={`text-[10px] font-medium ${isPeak ? 'text-amber-600' : 'text-slate-400'}`}>
                      {count > 0 ? count : ''}
                    </span>
                    <div
                      className={`w-4 sm:w-5 rounded-t-md transition-all duration-500 ${
                        isPeak
                          ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                          : count > 0
                          ? 'bg-gradient-to-t from-amber-200 to-amber-100'
                          : 'bg-slate-100'
                      }`}
                      style={{ height: `${Math.max(4, height)}%` }}
                    />
                    <span className={`text-[10px] ${i % 3 === 0 ? 'text-slate-500' : 'text-transparent'}`}>
                      {i}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <CardHeader
            icon={CalendarDays}
            title="一周借用分布"
            desc="各周几使用频次"
            accent="mint"
          />
          <div className="pt-4">
            <div className="flex items-end justify-between gap-2 h-44 sm:h-52 px-2">
              {DAY_NAMES.map((name, i) => {
                const count = stats.weekdayCount[i];
                const height = (count / stats.maxWeekdayCount) * 100;
                const isPeak = i === stats.peakWeekday && count > 0;
                return (
                  <div key={i} className="flex flex-col items-center gap-2 flex-1 min-w-0">
                    <span className={`text-xs font-bold ${isPeak ? 'text-mint-600' : 'text-slate-400'}`}>
                      {count}
                    </span>
                    <div className="w-full max-w-10 flex-1 flex items-end">
                      <div
                        className={`w-full rounded-t-xl transition-all duration-500 ${
                          isPeak
                            ? 'bg-gradient-to-t from-mint-500 to-mint-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                            : count > 0
                            ? 'bg-gradient-to-t from-mint-200 to-mint-100'
                            : 'bg-slate-100'
                        }`}
                        style={{ height: `${Math.max(6, height)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${isPeak ? 'text-mint-700' : 'text-slate-500'}`}>
                      {name.slice(1)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        <div className="card p-5 sm:p-6">
          <CardHeader
            icon={TrendingUp}
            title="借用用途排行"
            desc="按用途分类统计"
            accent="sky"
          />
          <div className="pt-4 space-y-3">
            {stats.purposeData.length === 0 ? (
              <EmptyState text="暂无借用数据，快去预约一把吧~" />
            ) : (
              stats.purposeData.map((item, idx) => {
                const width = (item.count / stats.maxPurposeCount) * 100;
                const colors = [
                  'from-sky-500 to-sky-300',
                  'from-amber-500 to-amber-300',
                  'from-mint-500 to-mint-300',
                  'from-violet-500 to-violet-300',
                  'from-rose-500 to-rose-300',
                  'from-indigo-500 to-indigo-300',
                  'from-teal-500 to-teal-300',
                  'from-orange-500 to-orange-300',
                ];
                const color = colors[idx % colors.length];
                return (
                  <div key={item.name} className="group">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white text-[11px] font-bold shadow-sm`}>
                          {idx + 1}
                        </span>
                        <span className="text-sm font-medium text-slate-700">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-600">{item.count} 次</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden ml-8">
                      <div
                        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-700 group-hover:brightness-110`}
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card p-5 sm:p-6">
          <CardHeader
            icon={AlertTriangle}
            title="逾期排行榜"
            desc="逾期次数人员排行 TOP 5"
            accent="danger"
          />
          <div className="pt-4 space-y-3">
            {stats.overdueRanking.length === 0 ? (
              <EmptyState text="太棒了！暂无逾期记录 🎉" variant="success" />
            ) : (
              stats.overdueRanking.map((item, idx) => {
                const maxCount = Math.max(1, ...stats.overdueRanking.map((r) => r.count));
                const width = (item.count / maxCount) * 100;
                const medalColors = [
                  'from-amber-500 to-amber-600',
                  'from-slate-400 to-slate-500',
                  'from-orange-400 to-orange-500',
                  'from-slate-300 to-slate-400',
                  'from-slate-200 to-slate-300',
                ];
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-100 bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${medalColors[idx]} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                          {idx < 3 ? <Trophy className="w-4 h-4" /> : idx + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{item.name}</div>
                          <div className="text-[11px] text-slate-500">{item.building}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-danger-500" />
                        <span className="font-bold text-danger-600 text-lg">{item.count}</span>
                        <span className="text-xs text-slate-500">次</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden ml-11">
                      <div
                        className="h-full bg-gradient-to-r from-danger-400 to-danger-500 rounded-full transition-all duration-700"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div className="card p-5 sm:p-6">
        <CardHeader icon={TrendingDown} title="归还损坏统计" desc="每次归还的损坏程度分布" accent="violet" />
        <div className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <DamageStat
              label="无损坏"
              count={stats.damageCount[DamageLevel.NONE]}
              total={returnRecords.length}
              color="mint"
            />
            <DamageStat
              label="轻微损坏"
              count={stats.damageCount[DamageLevel.MINOR]}
              total={returnRecords.length}
              color="amber"
            />
            <DamageStat
              label="严重损坏"
              count={stats.damageCount[DamageLevel.SEVERE]}
              total={returnRecords.length}
              color="danger"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  gradient,
  isText,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: number | string;
  sub: string;
  gradient: string;
  isText?: boolean;
}) {
  return (
    <div className="relative overflow-hidden card p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs sm:text-sm text-slate-500 mb-1.5">{label}</div>
          <div
            className={`font-serif font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent leading-tight break-words ${
              isText ? 'text-xl sm:text-2xl' : 'text-3xl sm:text-4xl'
            }`}
          >
            {value}
          </div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-1">{sub}</div>
        </div>
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-md flex-shrink-0`}>
          <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
        </div>
      </div>
      <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${gradient} opacity-5 blur-2xl`} />
    </div>
  );
}

function CardHeader({
  icon: Icon,
  title,
  desc,
  accent,
}: {
  icon: React.ComponentType<any>;
  title: string;
  desc: string;
  accent: 'amber' | 'mint' | 'sky' | 'danger' | 'violet';
}) {
  const accentMap = {
    amber: 'from-amber-400 to-amber-600',
    mint: 'from-mint-400 to-mint-600',
    sky: 'from-sky-400 to-sky-600',
    danger: 'from-danger-400 to-danger-600',
    violet: 'from-violet-400 to-violet-600',
  };
  return (
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${accentMap[accent]} flex items-center justify-center shadow-md`}>
        <Icon className="w-5 h-5 text-white" strokeWidth={2.2} />
      </div>
      <div>
        <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-800 leading-tight">{title}</h3>
        <p className="text-xs text-slate-500">{desc}</p>
      </div>
    </div>
  );
}

function EmptyState({ text, variant = 'default' }: { text: string; variant?: 'default' | 'success' }) {
  return (
    <div className="py-12 text-center">
      <div
        className={`w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
          variant === 'success' ? 'bg-mint-50' : 'bg-slate-50'
        }`}
      >
        {variant === 'success' ? (
          <TrendingUp className="w-7 h-7 text-mint-500" />
        ) : (
          <BarChart3 className="w-7 h-7 text-slate-300" />
        )}
      </div>
      <p className={`text-sm ${variant === 'success' ? 'text-mint-600' : 'text-slate-500'}`}>{text}</p>
    </div>
  );
}

function DamageStat({
  label, count, total, color }: {
  label: string; count: number; total: number; color: 'mint' | 'amber' | 'danger' }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
  const colorMap = {
    mint: {
      bg: 'bg-mint-500',
      text: 'text-mint-700',
      soft: 'bg-mint-50',
      border: 'border-mint-100',
      progress: 'from-mint-400 to-mint-500',
    },
    amber: {
      bg: 'bg-amber-500',
      text: 'text-amber-700',
      soft: 'bg-amber-50',
      border: 'border-amber-100',
      progress: 'from-amber-400 to-amber-500',
    },
    danger: {
      bg: 'bg-danger-500',
      text: 'text-danger-700',
      soft: 'bg-danger-50',
      border: 'border-danger-100',
      progress: 'from-danger-400 to-danger-500',
    },
  }[color];

  return (
    <div className={`p-4 rounded-2xl ${colorMap.soft} border ${colorMap.border} transition-all duration-300 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
      <span className={`text-sm font-medium ${colorMap.text}`}>{label}</span>
        <span className={`text-2xl font-serif font-bold ${colorMap.text}`}>{count}</span>
      </div>
      <div className="h-2 rounded-full bg-white/60 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap.progress} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-xs text-slate-500 text-right">占比 {percentage}%</div>
    </div>
  );
}
