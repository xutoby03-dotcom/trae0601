import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MonitorCheck,
  MonitorPlay,
  Wrench,
  PackageX,
  TrendingUp,
  Clock3,
  AlertOctagon,
  ShoppingCart,
  ChevronRight,
  Sparkles,
  Layers,
  CalendarRange,
  ArrowUpRight,
} from 'lucide-react';
import { useStore } from '../store';
import { StatusBadge } from '../components/Badges';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import {
  eachDayOfInterval,
  subDays,
  format,
  formatISO,
  parseISO,
  isSameDay,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function DashboardPage() {
  const navigate = useNavigate();
  const displays = useStore((s) => s.displays);
  const reservations = useStore((s) => s.reservations);

  const available = displays.filter((d) => d.status === 'available').length;
  const borrowed = displays.filter((d) => d.status === 'borrowed'
    || reservations.some(r => r.displayId === d.id && (r.status === 'using' || r.status === 'reserved'))
  ).length;
  const maintenance = displays.filter((d) => d.status === 'maintenance').length;
  const missing = displays.filter((d) => d.status === 'missing').length;

  const today = new Date();
  const todayStr = formatISO(today, { representation: 'date' });
  const todayReservations = reservations.filter((r) => r.useDate === todayStr && r.status !== 'cancelled').length;
  const overdue = reservations.filter((r) => {
    if (r.status === 'returned' || r.status === 'cancelled') return false;
    return parseISO(r.useDate) < parseISO(todayStr);
  }).length;

  const usageTrend = useMemo(() => {
    const days = eachDayOfInterval({
      start: subDays(today, 6),
      end: today,
    });
    return days.map((day) => {
      const ds = formatISO(day, { representation: 'date' });
      const dayRes = reservations.filter((r) => r.useDate === ds && r.status !== 'cancelled');
      const slotsUsed = dayRes.reduce((sum, r) => sum + (r.timeSlot === 'allday' ? 2 : 1), 0);
      const totalSlots = displays.length * 2;
      const rate = totalSlots > 0 ? Math.round((slotsUsed / totalSlots) * 100) : 0;
      return {
        date: format(day, 'M月d日', { locale: zhCN }),
        weekday: format(day, 'EEE', { locale: zhCN }),
        使用率: rate,
        预约数: dayRes.length,
      };
    });
  }, [reservations, displays.length, today]);

  const busyHours = useMemo(() => {
    const hours = Array.from({ length: 9 }, (_, i) => i + 9);
    const counts = new Array(9).fill(0);
    reservations.forEach((r) => {
      if (r.status === 'cancelled') return;
      if (r.timeSlot === 'morning') {
        for (let h = 9; h < 12; h++) counts[h - 9]++;
      } else if (r.timeSlot === 'afternoon') {
        for (let h = 13; h < 18; h++) counts[h - 9]++;
      } else {
        for (let h = 9; h < 18; h++) counts[h - 9]++;
      }
    });
    const max = Math.max(...counts, 1);
    return hours.map((h, i) => ({
      hour: `${h}:00`,
      count: counts[i],
      intensity: counts[i] / max,
    }));
  }, [reservations]);

  const damageRanking = useMemo(() => {
    const sorted = [...displays]
      .filter((d) => d.damageCount > 0)
      .sort((a, b) => b.damageCount - a.damageCount)
      .slice(0, 5);
    const max = Math.max(...sorted.map((d) => d.damageCount), 1);
    return sorted.map((d) => ({
      id: d.id,
      code: d.code,
      count: d.damageCount,
      percent: Math.round((d.damageCount / max) * 100),
    }));
  }, [displays]);

  const missingParts = useMemo(() => {
    return displays
      .filter((d) => d.missingAccessories.length > 0)
      .map((d) => ({
        id: d.id,
        code: d.code,
        size: d.size,
        location: d.location,
        missing: d.missingAccessories,
        photo: d.photoUrl,
      }));
  }, [displays]);

  const deptUsage = useMemo(() => {
    const map = new Map<string, number>();
    reservations.forEach((r) => {
      if (r.status === 'cancelled') return;
      map.set(r.department, (map.get(r.department) || 0) + 1);
    });
    const data = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const colors = ['#0F4C81', '#2E79BE', '#5399D7', '#89BCE6', '#B8D8F1', '#DAECF8'];
    return data.map((d, i) => ({ ...d, fill: colors[i] || colors[colors.length - 1] }));
  }, [reservations]);

  const avgUsageRate = usageTrend.length > 0
    ? Math.round(usageTrend.reduce((s, d) => s + d.使用率, 0) / usageTrend.length)
    : 0;

  const totalDamageCount = displays.reduce((s, d) => s + d.damageCount, 0);

  const stats = [
    {
      label: '可借用',
      value: available,
      total: displays.length,
      icon: MonitorCheck,
      bgClass: 'from-emerald-400 to-teal-500',
      lightBg: 'from-emerald-50 to-teal-50',
      border: 'border-emerald-100',
      trend: '设备库存',
      sub: `占比 ${displays.length > 0 ? Math.round((available / displays.length) * 100) : 0}%`,
    },
    {
      label: '使用中',
      value: borrowed,
      icon: MonitorPlay,
      bgClass: 'from-sky-400 to-indigo-500',
      lightBg: 'from-sky-50 to-indigo-50',
      border: 'border-sky-100',
      trend: '今日预约',
      sub: `${todayReservations} 条`,
    },
    {
      label: '维修中',
      value: maintenance,
      icon: Wrench,
      bgClass: 'from-amber-400 to-orange-500',
      lightBg: 'from-amber-50 to-orange-50',
      border: 'border-amber-100',
      trend: '累计损坏',
      sub: `${totalDamageCount} 次`,
    },
    {
      label: '配件缺失',
      value: missing,
      icon: PackageX,
      bgClass: 'from-rose-400 to-pink-500',
      lightBg: 'from-rose-50 to-pink-50',
      border: 'border-rose-100',
      trend: '逾期未还',
      sub: `${overdue} 条`,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 mb-1">
            统计仪表盘
            <span className="ml-2 text-brand-600">
              <Sparkles size={22} className="inline -mt-1" />
            </span>
          </h2>
          <p className="text-sm text-zinc-500">
            近 7 天平均使用率
            <span className="text-brand-700 font-bold mx-1">{avgUsageRate}%</span>
            · 更新于 {format(today, 'yyyy年M月d日 HH:mm', { locale: zhCN })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary" onClick={() => navigate('/reservations/new')}>
            <CalendarRange size={16} /> 创建预约
          </button>
          <button className="btn-primary" onClick={() => navigate('/returns')}>
            <Layers size={16} /> 归还检查
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className={`card p-5 bg-gradient-to-br ${s.lightBg} border ${s.border} relative overflow-hidden group`}
          >
            <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-br ${s.bgClass} opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
            <div className="relative flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm text-zinc-600 font-medium mb-3">{s.label}</p>
                <p className="text-4xl font-bold text-zinc-900 mb-1 tracking-tight">{s.value}</p>
                {s.total !== undefined && (
                  <p className="text-xs text-zinc-500">/ {s.total} 台</p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.bgClass} flex items-center justify-center shadow-lg shrink-0`}>
                <s.icon size={22} className="text-white" />
              </div>
            </div>
            <div className="relative mt-4 pt-3 border-t border-white/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <TrendingUp size={13} className="text-zinc-400" />
                <span className="text-xs text-zinc-500">{s.trend}</span>
              </div>
              <span className="text-xs font-semibold text-zinc-700">{s.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-brand-600" />
                近 7 天使用率趋势
              </h3>
              <p className="text-xs text-zinc-500 mt-1">每日预约时段占所有可用时段的比例</p>
            </div>
            <span className="chip bg-brand-50 text-brand-700 border border-brand-100">
              平均 {avgUsageRate}%
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="usageGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0F4C81" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#0F4C81" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(v) => `${v}%`}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 10px 25px -10px rgba(15,76,129,0.2)',
                    fontSize: 12,
                  }}
                  formatter={(v: number) => [`${v}%`, '使用率']}
                  labelStyle={{ fontWeight: 600, marginBottom: 4 }}
                />
                <Area
                  type="monotone"
                  dataKey="使用率"
                  stroke="#0F4C81"
                  strokeWidth={2.5}
                  fill="url(#usageGradient)"
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#0F4C81' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                <Clock3 size={18} className="text-brand-600" />
                最忙时段分布
              </h3>
              <p className="text-xs text-zinc-500 mt-1">09:00 - 18:00 各时段热度</p>
            </div>
          </div>
          <div className="space-y-3 pt-1">
            {busyHours.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-14 text-xs font-medium text-zinc-600 shrink-0">{h.hour}</span>
                <div className="flex-1 h-8 rounded-lg bg-zinc-100 overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                    style={{
                      width: `${Math.max(h.intensity * 100, h.count > 0 ? 8 : 0)}%`,
                      background: `linear-gradient(90deg, #B8D8F1 ${h.intensity * 20}%, #2E79BE, #0F4C81)`,
                    }}
                  >
                    {h.count > 0 && (
                      <span className="text-[11px] font-bold text-white drop-shadow-sm">
                        {h.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-zinc-100">
            <p className="text-xs text-zinc-500">
              💡 最忙时段为
              <span className="font-bold text-brand-700 mx-1">
                {busyHours.reduce((a, b) => (a.count > b.count ? a : b)).hour}
              </span>
              ，建议尽量避开
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                <AlertOctagon size={18} className="text-rose-500" />
                设备损坏排行
              </h3>
              <p className="text-xs text-zinc-500 mt-1">累计损坏次数 Top 5</p>
            </div>
            <span className="chip bg-rose-50 text-rose-700 border border-rose-100">
              共 {totalDamageCount} 次
            </span>
          </div>
          {damageRanking.length === 0 ? (
            <div className="py-10 text-center">
              <AlertOctagon size={28} className="mx-auto mb-3 text-zinc-300" />
              <p className="text-sm text-zinc-500">暂无损坏记录 🎉</p>
            </div>
          ) : (
            <div className="space-y-4">
              {damageRanking.map((d, i) => (
                <div key={d.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${
                        i === 0 ? 'bg-rose-500 text-white' :
                        i === 1 ? 'bg-orange-400 text-white' :
                        i === 2 ? 'bg-amber-400 text-white' :
                        'bg-zinc-200 text-zinc-600'
                      }`}>
                        {i + 1}
                      </span>
                      <span className="font-semibold text-zinc-800 text-sm">{d.code}</span>
                    </div>
                    <span className="text-sm font-bold text-zinc-700">{d.count} 次</span>
                  </div>
                  <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        i === 0 ? 'bg-gradient-to-r from-rose-400 to-rose-600' :
                        i === 1 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                        i === 2 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                        'bg-gradient-to-r from-brand-400 to-brand-600'
                      }`}
                      style={{ width: `${d.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                <Layers size={18} className="text-violet-500" />
                部门使用排行
              </h3>
              <p className="text-xs text-zinc-500 mt-1">预约次数统计</p>
            </div>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptUsage} margin={{ top: 5, right: 5, left: -20, bottom: 5 }} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#475569' }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                  formatter={(v: number) => [`${v} 次`, '预约次数']}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={18}>
                  {deptUsage.map((_, idx) => (
                    <Cell key={idx} fill={deptUsage[idx]?.fill || '#0F4C81'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                <ShoppingCart size={18} className="text-amber-500" />
                缺配件待补清单
              </h3>
              <p className="text-xs text-zinc-500 mt-1">共 {missingParts.length} 台设备需补件</p>
            </div>
            <button
              className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-0.5"
              onClick={() => navigate('/devices')}
            >
              管理 <ArrowUpRight size={13} />
            </button>
          </div>
          {missingParts.length === 0 ? (
            <div className="py-10 text-center">
              <ShoppingCart size={28} className="mx-auto mb-3 text-zinc-300" />
              <p className="text-sm text-zinc-500">所有设备配件齐全 ✨</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[260px] overflow-y-auto scrollbar-thin pr-1">
              {missingParts.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-xl border border-amber-100 bg-amber-50/40 hover:bg-amber-50/70 transition-all cursor-pointer"
                  onClick={() => navigate(`/devices/${d.id}/edit`)}
                >
                  <div className="flex items-start gap-3">
                    <img src={d.photo} className="w-12 h-12 rounded-lg object-cover border border-white shadow-sm" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-zinc-800 text-sm">{d.code}</span>
                        <ChevronRight size={14} className="text-amber-500 shrink-0" />
                      </div>
                      <p className="text-[11px] text-zinc-500 mb-2">{d.size}英寸 · {d.location}</p>
                      <div className="flex flex-wrap gap-1">
                        {d.missing.map((m, i) => (
                          <span key={i} className="chip bg-rose-100 text-rose-700 border border-rose-200/70">
                            缺 {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-zinc-900 text-lg">设备状态一览</h3>
            <p className="text-xs text-zinc-500 mt-1">点击设备卡片进入详情</p>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {displays.map((d) => (
            <button
              key={d.id}
              onClick={() => navigate(`/devices/${d.id}/edit`)}
              className="group p-2.5 rounded-xl border border-zinc-200 hover:border-brand-400 hover:shadow-md transition-all text-left bg-white relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                d.status === 'available' ? 'bg-emerald-500' :
                d.status === 'borrowed' ? 'bg-sky-500' :
                d.status === 'maintenance' ? 'bg-amber-500' :
                'bg-rose-500'
              }`} />
              <div className="aspect-square rounded-lg overflow-hidden bg-zinc-100 mb-2">
                <img src={d.photoUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={d.code} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-800 truncate">{d.code}</span>
                  <StatusBadge status={d.status} />
                </div>
                <p className="text-[10px] text-zinc-500 truncate leading-tight">{d.size}英寸</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
