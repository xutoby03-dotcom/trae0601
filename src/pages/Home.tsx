import { useEffect, useRef } from 'react';
import { CheckCircle2, UserCheck, Coffee, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { SeatStatus, SEAT_STATUS_LABELS, SEAT_STATUS_COLORS } from '../types';
import { SeatCard } from '../components/SeatCard';
import { StatsCard } from '../components/StatsCard';
import { FilterBar } from '../components/FilterBar';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function Home() {
  const {
    seats,
    loading,
    error,
    loadSeats,
    statusCounts,
    groupedSeats,
    filteredSeats,
    isAdmin,
  } = useAppStore();

  const loadedRef = useRef(false);
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadSeats();
    }
    const timer = setInterval(loadSeats, 30000);
    return () => clearInterval(timer);
  }, [loadSeats]);

  const sections: { status: SeatStatus; icon: any; color: string; title: string; from: string; to: string; iconBg: string; label: string }[] = [
    { status: SeatStatus.EMPTY, icon: CheckCircle2, color: 'text-emerald-700', title: '空座可使用', from: 'from-emerald-500', to: 'to-teal-500', iconBg: 'bg-white/25', label: '空座' },
    { status: SeatStatus.IN_USE, icon: UserCheck, color: 'text-sky-700', title: '正在学习中', from: 'from-sky-500', to: 'to-blue-500', iconBg: 'bg-white/25', label: '使用中' },
    { status: SeatStatus.TEMP_LEAVE, icon: Coffee, color: 'text-amber-700', title: '短暂离开', from: 'from-amber-500', to: 'to-orange-500', iconBg: 'bg-white/25', label: '短暂离开' },
    { status: SeatStatus.SUSPECTED, icon: AlertTriangle, color: 'text-rose-700', title: '疑似占座可举报', from: 'from-rose-500', to: 'to-pink-500', iconBg: 'bg-white/25', label: '疑似占座' },
  ];

  const totalSeats = seats.length || filteredSeats.length || statusCounts[SeatStatus.EMPTY] + statusCounts[SeatStatus.IN_USE] + statusCounts[SeatStatus.TEMP_LEAVE] + statusCounts[SeatStatus.SUSPECTED];
  const usageRate = totalSeats > 0 ? Math.round(((statusCounts[SeatStatus.IN_USE] + statusCounts[SeatStatus.TEMP_LEAVE]) / totalSeats) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 via-teal-600 to-cyan-700 p-6 md:p-8 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-400/20 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-400/20 rounded-full translate-y-1/3 -translate-x-1/3 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-medium mb-3 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                实时座位状态
              </div>
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-2">
                自习室实时座位板
              </h2>
              <p className="text-teal-100 text-sm md:text-base max-w-xl">
                实时查看所有自习室座位状态，合理安排学习计划，共同维护良好的学习环境
              </p>
              {isAdmin && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-amber-400/20 border border-amber-300/30 rounded-lg text-amber-100 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-300" />
                  您当前以管理员身份登录
                </div>
              )}
            </div>
            <div className="flex flex-col items-start md:items-end gap-4">
              <div className="flex items-baseline gap-2">
                <div className="text-6xl font-bold tracking-tight">{totalSeats}</div>
                <div className="text-teal-200 text-sm">总座位</div>
              </div>
              <div className="w-full md:w-48">
                <div className="flex justify-between text-xs text-teal-200 mb-1">
                  <span>整体使用率</span>
                  <span className="font-semibold text-white">{usageRate}%</span>
                </div>
                <div className="h-2 bg-white/15 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-700"
                    style={{ width: `${usageRate}%` }}
                  />
                </div>
              </div>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-xl font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all hover:-translate-y-0.5"
              >
                <span>立即登记座位</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {sections.map((s) => (
            <StatsCard
              key={s.status}
              icon={s.icon}
              label={s.label}
              count={statusCounts[s.status]}
              gradientFrom={s.from}
              gradientTo={s.to}
              iconBg={s.iconBg}
            />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex-1">
            <FilterBar />
          </div>
          <button
            onClick={loadSeats}
            disabled={loading}
            className="shrink-0 p-2.5 rounded-xl bg-white shadow-sm border border-slate-100 hover:bg-slate-50 text-slate-600 transition disabled:opacity-50"
            title="刷新"
          >
            <RefreshCw className={cn('w-5 h-5', loading && 'animate-spin')} />
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        {loading && seats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            <p className="mt-4 text-slate-500 text-sm">加载座位数据中...</p>
          </div>
        ) : (
          <div className="space-y-6 md:space-y-8">
            {sections.map((section) => {
              const items = groupedSeats[section.status];
              const colors = SEAT_STATUS_COLORS[section.status];
              return (
                <section key={section.status} className="scroll-mt-28">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', colors.bg)}>
                        <section.icon className={cn('w-5 h-5', colors.text)} />
                      </div>
                      <div>
                        <h3 className={cn('font-bold text-lg', colors.text)}>
                          {SEAT_STATUS_LABELS[section.status]}
                        </h3>
                        <p className="text-xs text-slate-500">{section.title}</p>
                      </div>
                    </div>
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-bold',
                      colors.bg,
                      colors.text,
                      'border',
                      colors.border,
                    )}>
                      {items.length}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className={cn(
                      'rounded-2xl border-2 border-dashed py-10 flex flex-col items-center justify-center',
                      colors.bg,
                      colors.border,
                    )}>
                      <section.icon className={cn('w-10 h-10 opacity-40', colors.text)} />
                      <p className={cn('mt-3 text-sm font-medium opacity-70', colors.text)}>
                        暂无{SEAT_STATUS_LABELS[section.status]}的座位
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                      {items.map((seat) => (
                        <SeatCard key={seat.id} seat={seat} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
