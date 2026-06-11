import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, BarChart3, TrendingUp, AlertTriangle, CheckCircle2,
  Building2, Clock, Activity, Loader2, Trophy, Flame, CalendarDays,
} from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { apiClient } from '../api/client';
import type { StatsData } from '../types';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid, Cell,
} from 'recharts';
import { cn } from '../lib/utils';

export default function Statistics() {
  const { loadStats, stats: storeStats } = useAppStore();
  const [stats, setStats] = useState<StatsData | null>(storeStats);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      fetchStats();
    }
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const s = await apiClient.getStats();
      setStats(s);
    } finally {
      setLoading(false);
    }
    loadStats();
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div className="p-8 text-center">暂无数据</div>;
  }

  // 教学楼数据
  const buildingData = Object.entries(stats.seatsByBuilding)
    .map(([name, v]) => ({
      name,
      total: v.total,
      inUse: v.inUse,
      suspected: v.suspected,
      usage: v.total > 0 ? Math.round((v.inUse / v.total) * 100) : 0,
    }))
    .sort((a, b) => b.usage - a.usage);

  const maxUsage = Math.max(...buildingData.map((d) => d.usage), 1);

  // 时段数据
  const hourData = stats.suspectedByHour.map((count, hour) => ({
    hour: `${String(hour).padStart(2, '0')}:00`,
    hourNum: hour,
    count,
  }));
  const peakHour = hourData.reduce((a, b) => (a.count > b.count ? a : b));

  // 恢复趋势数据（7天）
  const recoveryData = stats.recoveredByDay.slice(-7).map((d) => ({
    date: d.date.slice(5),
    count: d.count,
  }));
  const totalRecovery7d = recoveryData.reduce((s, d) => s + d.count, 0);

  // 紧张度颜色
  const tensionColor = (rate: number) => {
    if (rate >= 80) return 'from-rose-500 to-pink-500';
    if (rate >= 60) return 'from-amber-500 to-orange-500';
    if (rate >= 40) return 'from-sky-500 to-blue-500';
    return 'from-emerald-500 to-teal-500';
  };
  const tensionBadge = (rate: number) => {
    if (rate >= 80) return { text: '极度紧张', bg: 'bg-rose-100', color: 'text-rose-700' };
    if (rate >= 60) return { text: '较紧张', bg: 'bg-amber-100', color: 'text-amber-700' };
    if (rate >= 40) return { text: '适中', bg: 'bg-sky-100', color: 'text-sky-700' };
    return { text: '宽松', bg: 'bg-emerald-100', color: 'text-emerald-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 py-6 md:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-700 text-sm font-medium mb-6 transition">
          <ArrowLeft className="w-4 h-4" />
          返回座位板
        </Link>

        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800 via-indigo-900 to-teal-900 p-6 md:p-8 text-white shadow-2xl mb-6 md:mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-cyan-400/15 rounded-full blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 rounded-full text-xs font-medium mb-4 backdrop-blur">
              <Activity className="w-3.5 h-3.5" />
              数据分析面板
            </div>
            <h1 className="text-2xl md:text-4xl font-bold mb-2">自习室运营数据</h1>
            <p className="text-slate-300 text-sm md:text-base max-w-xl">
              整体使用情况、占座数据分析，帮助优化自习室管理
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-6 md:mt-8">
              <StatTile icon={Building2} label="覆盖自习室" value={Object.keys(stats.seatsByBuilding).length} unit="栋" />
              <StatTile icon={BarChart3} label="总座位数" value={stats.totalSeats} unit="个" />
              <StatTile icon={AlertTriangle} label="累计恢复座位" value={stats.totalRecovered} unit="个" accent />
              <StatTile icon={TrendingUp} label="近7日恢复" value={totalRecovery7d} unit="个" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <section className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <SectionHeader
              icon={Trophy}
              title="自习室紧张度排行"
              subtitle="按使用率从高到低排序"
            />
            <div className="p-5 md:p-6 space-y-4 max-h-[480px] overflow-y-auto">
              {buildingData.map((b, idx) => {
                const t = tensionBadge(b.usage);
                return (
                  <div key={b.name} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={cn(
                          'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0',
                          idx === 0 ? 'bg-amber-100 text-amber-700' :
                          idx === 1 ? 'bg-slate-200 text-slate-700' :
                          idx === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500',
                        )}>
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{b.name}</p>
                          <p className="text-xs text-slate-500">使用中 {b.inUse} / 共 {b.total} 个座位</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className={cn('px-2.5 py-1 rounded-lg text-xs font-bold', t.bg, t.color)}>
                          {t.text}
                        </span>
                        <span className="text-2xl font-black text-slate-800 tabular-nums w-14 text-right">
                          {b.usage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden ml-10">
                      <div
                        className={cn('h-full bg-gradient-to-r rounded-full transition-all duration-700', tensionColor(b.usage))}
                        style={{ width: `${(b.usage / maxUsage) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
            <SectionHeader
              icon={Flame}
              title="占座高发时段"
              subtitle={`24小时疑似占座分布 · 高峰时段 ${peakHour.hour}`}
            />
            <div className="p-5 md:p-6 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#FB923C" />
                    </linearGradient>
                    <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EF4444" />
                      <stop offset="100%" stopColor="#F87171" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="hour"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: '#FEF3C7', opacity: 0.5 }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={24} name="疑似占座数">
                    {hourData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.count === peakHour.count && entry.count > 0 ? 'url(#peakGradient)' : 'url(#barGradient)'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden lg:col-span-2">
            <SectionHeader
              icon={CalendarDays}
              title="座位恢复趋势"
              subtitle="最近7天通过管理员处理恢复的座位数量"
              right={
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500" />
                  <span className="text-sm text-slate-500">恢复座位数</span>
                </div>
              }
            />
            <div className="p-5 md:p-6 h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recoveryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      fontSize: '13px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="恢复座位"
                    stroke="#0D9488"
                    strokeWidth={3}
                    dot={{ fill: '#FFFFFF', stroke: '#0D9488', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: '#0D9488', stroke: '#FFFFFF', strokeWidth: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden lg:col-span-2">
            <SectionHeader
              icon={CheckCircle2}
              title="各教学楼详细数据"
              subtitle="完整的数据明细"
            />
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 text-left">
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">教学楼</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">总座位</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">使用中</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">疑似占座</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">使用率</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">紧张程度</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {buildingData.map((b) => {
                    const t = tensionBadge(b.usage);
                    return (
                      <tr key={b.name} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100 flex items-center justify-center">
                              <Building2 className="w-4.5 h-4.5 text-teal-600" />
                            </div>
                            <span className="font-bold text-slate-800">{b.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-center font-semibold text-slate-700 tabular-nums">{b.total}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-100 text-sky-700 rounded-lg text-sm font-bold">
                            {b.inUse}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold',
                            b.suspected > 0 ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500',
                          )}>
                            {b.suspected}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={cn('h-full bg-gradient-to-r rounded-full', tensionColor(b.usage))}
                                style={{ width: `${b.usage}%` }}
                              />
                            </div>
                            <span className="font-bold text-slate-800 tabular-nums w-12 text-right">{b.usage}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={cn('px-3 py-1 rounded-lg text-xs font-bold', t.bg, t.color)}>
                            {t.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="mt-10 text-center text-slate-500 text-xs">
          <p>数据每30秒自动刷新 · 管理员可通过后台处理争议以恢复被占座位</p>
        </div>
      </div>
    </div>
  );
}

function StatTile({
  icon: Icon, label, value, unit, accent = false,
}: {
  icon: any; label: string; value: number; unit: string; accent?: boolean;
}) {
  return (
    <div className={cn(
      'rounded-2xl p-4 md:p-5 backdrop-blur',
      accent ? 'bg-amber-400/15 border border-amber-300/30' : 'bg-white/10 border border-white/10',
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon className={cn('w-4 h-4', accent ? 'text-amber-300' : 'text-slate-300')} />
        <p className={cn('text-xs font-medium', accent ? 'text-amber-200' : 'text-slate-300')}>{label}</p>
      </div>
      <p className="flex items-baseline gap-1">
        <span className="text-2xl md:text-3xl font-black text-white tabular-nums">{value}</span>
        <span className={cn('text-xs font-medium', accent ? 'text-amber-200' : 'text-slate-400')}>{unit}</span>
      </p>
    </div>
  );
}

function SectionHeader({
  icon: Icon, title, subtitle, right,
}: {
  icon: any; title: string; subtitle?: string; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-4 md:py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/20 shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h2 className="font-bold text-slate-800 text-base md:text-lg truncate">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}
