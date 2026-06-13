import { useEffect, useState } from 'react';
import {
  CalendarDays,
  ClipboardCheck,
  BedDouble,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { statisticsApi } from '@/api/client';
import type { OverviewStats } from '#shared/types';

function StatCard({
  title,
  value,
  icon: Icon,
  gradient,
  delay,
}: {
  title: string;
  value: number;
  icon: any;
  gradient: string;
  delay: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 30;
    const stepValue = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += stepValue;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);

  return (
    <div
      className="glass-card rounded-3xl p-6 relative overflow-hidden animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full ${gradient} opacity-20 blur-2xl`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-2xl ${gradient} flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-4xl font-bold font-display text-gray-800">{display}</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { overview, fetchOverview } = useAppStore();
  const [todayVacancyRate, setTodayVacancyRate] = useState(0);

  useEffect(() => {
    fetchOverview();
    statisticsApi.vacancy().then((d) => setTodayVacancyRate(d.rate));
  }, [fetchOverview]);

  const stats: Array<{ key: keyof OverviewStats | 'rate'; title: string; icon: any; gradient: string }> = [
    { key: 'todayReservations', title: '今日预约', icon: CalendarDays, gradient: 'bg-gradient-to-br from-primary-500 to-primary-700' },
    { key: 'todayCheckedIn', title: '今日已签到', icon: ClipboardCheck, gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-700' },
    { key: 'todayVacant', title: '今日空床数', icon: BedDouble, gradient: 'bg-gradient-to-br from-sky-500 to-sky-700' },
    { key: 'pendingDisinfection', title: '待消毒床位', icon: AlertTriangle, gradient: 'bg-gradient-to-br from-accent-500 to-accent-700' },
  ];

  const today = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-gray-800 mb-1">欢迎回来 👋</h1>
          <p className="text-gray-500">{today}</p>
        </div>
        <button onClick={fetchOverview} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          刷新数据
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => {
          const val = s.key === 'rate' ? todayVacancyRate : overview[s.key as keyof OverviewStats];
          return <StatCard key={String(s.key)} title={s.title} value={val} icon={s.icon} gradient={s.gradient} delay={i * 80} />;
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">今日空床率</h2>
          <div className="flex items-end gap-8">
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-bold font-display text-primary-600">{todayVacancyRate}%</span>
                <span className="text-sm text-gray-500">空床率</span>
              </div>
              <div className="h-4 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${100 - todayVacancyRate}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">已使用 {100 - todayVacancyRate}% 的床位资源</p>
            </div>
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快速操作</h2>
          <div className="space-y-3">
            <a href="/reservations/new" className="block w-full btn-primary">
              <CalendarDays className="w-4 h-4" />
              新增预约
            </a>
            <a href="/beds" className="block w-full btn-secondary">
              <BedDouble className="w-4 h-4" />
              管理床位
            </a>
            <a href="/check-in" className="block w-full btn-secondary">
              <ClipboardCheck className="w-4 h-4" />
              开始签到
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
