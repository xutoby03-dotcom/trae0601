import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { BUILDINGS, PHENOMENON_OPTIONS, STATUS_CONFIG } from '@/shared/constants';
import { formatDuration, formatDateTime, relativeTime } from '@/utils/time';
import type { FaultStatus } from '@/shared/types';
import ElevatorHistoryPopover from '@/components/ElevatorHistoryPopover';
import {
  FileBarChart,
  TrendingUp,
  Clock,
  Building2,
  AlertCircle,
  Repeat,
  BarChart3,
  PieChart as PieIcon,
  ArrowRight,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';

export default function Statistics() {
  const navigate = useNavigate();
  const stats = useAppStore((s) => s.computeStatistics());
  const tickets = useAppStore((s) => s.tickets);

  const summary = useMemo(() => {
    const active = stats.activeCount;
    const recovered = stats.recoveredCount;
    const recoverRate = stats.totalTickets > 0 ? Math.round((recovered / stats.totalTickets) * 100) : 0;
    const avg = stats.avgRecoveryTime;
    return { active, recovered, recoverRate, avg };
  }, [stats]);

  const maxElevator = Math.max(1, ...stats.topFaultElevators.map((e) => e.count));
  const maxBuilding = Math.max(1, ...stats.buildingFaultCounts.map((b) => b.count));
  const maxPhenom = Math.max(1, ...stats.repeatedFaultTypes.map((p) => p.count));
  const maxMonth = Math.max(1, ...stats.monthlyTrend.map((m) => m.count));

  const totalStatusMin = Object.values(stats.statusDuration).reduce((s, v) => s + (v || 0), 0) || 1;
  const statusColors: Record<string, string> = {
    urgent: '#e74c3c',
    processing: '#f39c12',
    waiting_parts: '#f1c40f',
    recovered: '#27ae60',
    repeated: '#e67e22',
  };

  return (
    <div className="container max-w-7xl py-6 pb-10 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <FileBarChart size={24} className="text-brand-500" />
          统计分析
        </h1>
        <p className="text-sm text-slate-500 mt-1">基于全量工单数据分析，帮您发现问题电梯、识别高频故障</p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <KpiCard
          icon={<AlertCircle size={20} />}
          label="累计工单"
          value={stats.totalTickets}
          tone="blue"
          sub="自系统上线以来"
        />
        <KpiCard
          icon={<TrendingUp size={20} />}
          label="恢复率"
          value={`${summary.recoverRate}%`}
          tone="green"
          sub={`${summary.recovered} / ${stats.totalTickets} 单已解决`}
        />
        <KpiCard
          icon={<Clock size={20} />}
          label="平均恢复"
          value={formatDuration(summary.avg)}
          tone="orange"
          sub="从发生到恢复"
        />
        <KpiCard
          icon={<Building2 size={20} />}
          label="处理中"
          value={summary.active}
          tone="red"
          sub="当前未完成工单"
        />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <section className="card p-5 md:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">
              <div className="w-1 h-5 rounded-full bg-brand-500" />
              <BarChart3 size={16} />
              电梯故障率 TOP 10
            </h2>
            <span className="text-xs text-slate-400">故障次数越多，问题越集中</span>
          </div>
          <div className="space-y-3">
            {stats.topFaultElevators.map((row, i) => {
              const b = BUILDINGS.find((x) => x.code === row.elevator.building);
              const pct = (row.count / maxElevator) * 100;
              const rankColor =
                i === 0
                  ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                  : i === 1
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                    : i === 2
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                      : 'bg-slate-100 text-slate-600';
              return (
                <div key={`${row.elevator.building}-${row.elevator.unit}-${row.elevator.elevatorNo}`} className="group">
                  <div className="flex items-center gap-3 mb-1.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${rankColor}`}>
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-slate-800 truncate">
                        {b?.name || row.elevator.building} {row.elevator.unit} {row.elevator.elevatorNo}
                        <span className="text-xs text-slate-400 ml-1.5 font-normal">
                          {row.elevator.floorCount}层
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-800 tabular-nums shrink-0">
                      {row.count}<span className="text-xs text-slate-400 font-normal ml-0.5">次</span>
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden ml-10">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${i < 3 ? 'bg-gradient-to-r from-red-400 via-orange-400 to-amber-400' : 'bg-gradient-to-r from-brand-400 to-brand-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">
              <div className="w-1 h-5 rounded-full bg-emerald-500" />
              <PieIcon size={16} />
              各阶段耗时占比
            </h2>
          </div>

          <DonutChart data={Object.entries(stats.statusDuration).map(([k, v]) => ({
            key: k as FaultStatus,
            value: v || 0,
            label: STATUS_CONFIG[k as FaultStatus]?.label || k,
            color: statusColors[k] || '#64748b',
          }))} total={totalStatusMin} />

          <div className="mt-5 space-y-2">
            {Object.entries(stats.statusDuration).map(([k, v]) => {
              const val = v || 0;
              if (val === 0) return null;
              const pct = Math.round((val / totalStatusMin) * 100);
              return (
                <div key={k} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-3 h-3 rounded shrink-0"
                    style={{ backgroundColor: statusColors[k] || '#64748b' }}
                  />
                  <span className="text-slate-700 font-medium flex-1">
                    {STATUS_CONFIG[k as FaultStatus]?.label}
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    {formatDuration(val)} · {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-5 md:p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">
              <div className="w-1 h-5 rounded-full bg-amber-500" />
              <Repeat size={16} />
              重复故障分析
            </h2>
          </div>

          <div className="mb-6">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">按故障现象统计</div>
            <div className="space-y-3">
              {stats.repeatedFaultTypes.map((row, i) => {
                const label = PHENOMENON_OPTIONS.find((p) => p.value === row.phenomenon)?.label || row.phenomenon;
                const pct = (row.count / maxPhenom) * 100;
                return (
                  <div key={row.phenomenon}>
                    <div className="flex items-center justify-between mb-1.5 text-sm">
                      <span className="font-medium text-slate-700">#{i + 1} {label}</span>
                      <span className="font-bold text-slate-800 tabular-nums">{row.count} 次</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowUpRight size={12} />
                同梯反复榜
              </div>
              <span className="text-[11px] text-slate-400">同一台电梯历史故障 ≥ 2 次</span>
            </div>

            {stats.repeatedElevatorRank.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">
                暂无反复故障电梯，数据积累后将自动展示
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs text-slate-500">
                      <th className="text-left px-4 py-2.5 font-semibold">排名</th>
                      <th className="text-left px-4 py-2.5 font-semibold">电梯</th>
                      <th className="text-center px-4 py-2.5 font-semibold">历史次数</th>
                      <th className="text-center px-4 py-2.5 font-semibold">最新状态</th>
                      <th className="text-left px-4 py-2.5 font-semibold">最近发生</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.repeatedElevatorRank.map((row, i) => {
                      const b = BUILDINGS.find((x) => x.code === row.building);
                      const cfg = STATUS_CONFIG[row.latestStatus];
                      const rankBadge =
                        i === 0
                          ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                          : i === 1
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : i === 2
                              ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                              : 'bg-slate-100 text-slate-500';
                      return (
                        <tr
                          key={`${row.building}-${row.unit}-${row.elevatorNo}`}
                          onClick={() => navigate(`/fault/${row.latestTicketId}`)}
                          className="border-t border-slate-100 cursor-pointer hover:bg-brand-50/50 transition-colors group"
                        >
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-black ${rankBadge}`}>
                              {i + 1}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">
                              {b?.name || row.building} {row.unit} {row.elevatorNo}
                            </div>
                            <div className="text-[11px] text-slate-400">{row.floorCount}层</div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <ElevatorHistoryPopover
                              elevator={{ building: row.building, unit: row.unit, elevatorNo: row.elevatorNo }}
                              align="right"
                              trigger={
                                <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-full text-xs font-bold cursor-pointer hover:opacity-80 transition-opacity ${row.count >= 3 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {row.count} 次
                                </span>
                              }
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                            <span title={formatDateTime(row.latestOccurredAt)}>
                              {relativeTime(row.latestOccurredAt)}
                            </span>
                          </td>
                          <td className="px-3 py-3">
                            <ChevronRight size={14} className="text-slate-300 group-hover:text-brand-500 transition-colors" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {stats.repeatedElevatorRank.some((r) => r.count >= 3) && (
              <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                <div className="flex items-start gap-2 text-sm text-amber-800">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <div className="font-bold mb-1">⚠️ 建议安排全面检修</div>
                    <ul className="space-y-0.5">
                      {stats.repeatedElevatorRank
                        .filter((r) => r.count >= 3)
                        .map((r) => {
                          const b = BUILDINGS.find((x) => x.code === r.building);
                          return (
                            <li key={`${r.building}-${r.unit}-${r.elevatorNo}`} className="text-xs">
                              <ArrowRight size={10} className="inline mr-1 -mt-0.5" />
                              <strong>{b?.name || r.building} {r.unit} {r.elevatorNo}</strong>
                              累计 <strong>{r.count}</strong> 次
                            </li>
                          );
                        })}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="card p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">
              <div className="w-1 h-5 rounded-full bg-purple-500" />
              <Building2 size={16} />
              楼栋故障分布
            </h2>
          </div>
          <div className="space-y-3">
            {stats.buildingFaultCounts.map((b) => {
              const meta = BUILDINGS.find((x) => x.code === b.building);
              const pct = (b.count / maxBuilding) * 100;
              return (
                <div key={b.building}>
                  <div className="flex items-center justify-between mb-1.5 text-sm">
                    <span className="font-medium text-slate-700">
                      {meta?.name || b.building}
                      <span className="text-xs text-slate-400 font-normal ml-1">
                        {meta?.floors}层
                      </span>
                    </span>
                    <span className="font-bold text-slate-800 tabular-nums">{b.count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-400 to-brand-500 transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="card p-5 md:p-6 lg:col-span-3">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">
              <div className="w-1 h-5 rounded-full bg-rose-500" />
              <TrendingUp size={16} />
              月度故障趋势
            </h2>
            <span className="text-xs text-slate-400">最近 6 个月工单数量变化</span>
          </div>
          <div className="flex items-end gap-4 h-56 px-2">
            {stats.monthlyTrend.map((m) => {
              const h = (m.count / maxMonth) * 85 + 8;
              const [yr, mo] = m.month.split('-');
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative flex-1 w-full flex items-end justify-center">
                    <div
                      className="w-full max-w-[44px] rounded-t-xl bg-gradient-to-t from-brand-500 via-brand-400 to-rose-400 shadow-card transition-all group-hover:scale-y-[1.02] group-hover:shadow-pop origin-bottom relative"
                      style={{ height: `${h}%` }}
                    >
                      <div className="absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 rounded-lg bg-slate-800 text-white text-xs font-bold tabular-nums whitespace-nowrap">
                        {m.count} 单
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-slate-500">{parseInt(mo, 10)}月</div>
                  <div className="text-[10px] text-slate-400 -mt-1.5">{yr}</div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
  tone,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone: 'blue' | 'green' | 'orange' | 'red';
  sub?: string;
}) {
  const tones = {
    blue: { bg: 'from-brand-50 to-white', text: 'text-brand-600', icon: 'bg-brand-100 text-brand-500', glow: 'shadow-[0_0_0_4px_rgba(30,58,95,0.05)]' },
    green: { bg: 'from-emerald-50 to-white', text: 'text-emerald-600', icon: 'bg-emerald-100 text-emerald-500', glow: 'shadow-[0_0_0_4px_rgba(16,185,129,0.06)]' },
    orange: { bg: 'from-orange-50 to-white', text: 'text-orange-600', icon: 'bg-orange-100 text-orange-500', glow: 'shadow-[0_0_0_4px_rgba(249,115,22,0.06)]' },
    red: { bg: 'from-red-50 to-white', text: 'text-red-600', icon: 'bg-red-100 text-red-500', glow: 'shadow-[0_0_0_4px_rgba(239,68,68,0.06)]' },
  } as const;
  const t = tones[tone];
  return (
    <div className={`card p-4 md:p-5 bg-gradient-to-br ${t.bg} ${t.glow} relative overflow-hidden`}>
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-[0.04]" />
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
          <div className={`text-2xl md:text-3xl font-black ${t.text} tabular-nums tracking-tight`}>
            {value}
          </div>
          {sub && <div className="mt-1.5 text-[11px] text-slate-500">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.icon}`}>{icon}</div>
      </div>
    </div>
  );
}

function DonutChart({
  data,
  total,
}: {
  data: { key: string; value: number; label: string; color: string }[];
  total: number;
}) {
  const size = 180;
  const stroke = 22;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  const filtered = data.filter((d) => d.value > 0);
  const top = filtered[0];

  return (
    <div className="relative flex items-center justify-center py-4">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#f1f5f9" strokeWidth={stroke} fill="none" />
        {filtered.map((d) => {
          const len = (d.value / total) * c;
          const el = (
            <circle
              key={d.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              stroke={d.color}
              strokeWidth={stroke}
              fill="none"
              strokeLinecap="butt"
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-black text-slate-800 tabular-nums">{filtered.length}</div>
        <div className="text-[11px] text-slate-500">状态类别</div>
        {top && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-600">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: top.color }} />
            主：{top.label}
          </div>
        )}
      </div>
    </div>
  );
}
