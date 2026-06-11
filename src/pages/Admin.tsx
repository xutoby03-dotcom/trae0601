import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock, Wrench, Package, CheckCircle2, BarChart3, Building2, AlertTriangle,
  TrendingUp, Search, Filter, ChevronRight,
} from 'lucide-react';
import { useTicketStore } from '@/store/useTicketStore';
import TicketCard from '@/components/TicketCard';
import type { TicketStatus } from '@/types';
import { STATUS_COLOR } from '@/types';

export default function Admin() {
  const { getStats, tickets } = useTicketStore();
  const navigate = useNavigate();
  const stats = getStats();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');

  const filtered = useMemo(() => {
    return tickets
      .filter((t) => (statusFilter === 'all' ? true : t.status === statusFilter))
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          t.id.toLowerCase().includes(q) ||
          t.building.toLowerCase().includes(q) ||
          t.room.toLowerCase().includes(q) ||
          t.faultType.toLowerCase().includes(q) ||
          t.studentName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [tickets, search, statusFilter]);

  const maxFault = Math.max(...stats.faultTypeDistribution.map((d) => d.count), 1);
  const maxBuilding = Math.max(...stats.buildingDistribution.map((d) => d.count), 1);

  const faultColors = [
    'from-teal-400 to-teal-600',
    'from-orange-400 to-orange-600',
    'from-violet-400 to-violet-600',
    'from-emerald-400 to-emerald-600',
    'from-rose-400 to-rose-600',
    'from-amber-400 to-amber-600',
    'from-cyan-400 to-cyan-600',
    'from-fuchsia-400 to-fuchsia-600',
  ];

  const statCards = [
    { label: '平均处理时长', value: stats.avgProcessingTime + 'h', icon: Clock, color: 'from-teal-500 to-teal-700', hint: '所有已完成工单' },
    { label: '待接单', value: stats.pendingCount, icon: AlertTriangle, color: 'from-amber-500 to-amber-600', hint: '需要尽快处理' },
    { label: '处理中', value: stats.processingCount, icon: Wrench, color: 'from-teal-400 to-teal-600', hint: '维修员正在处理' },
    { label: '等配件', value: stats.waitingPartsCount, icon: Package, color: 'from-violet-500 to-violet-600', hint: '等待配件到位' },
    { label: '今日完成', value: stats.todayCompleted, icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', hint: '24小时内完成' },
    { label: '总工单数', value: stats.totalCount, icon: TrendingUp, color: 'from-teal-600 to-teal-800', hint: '历史累计' },
  ];

  return (
    <div className="min-h-screen grain-bg">
      <div className="container py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <h1 className="font-display text-3xl font-bold text-ink-500 mb-1">管理看板</h1>
          <p className="text-ink-300 text-sm">全局数据统计与工单管理</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statCards.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="group bg-white rounded-2xl shadow-card border border-teal-600/8 p-4 overflow-hidden relative animate-slide-up"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className={`absolute -right-6 -top-6 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-card`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="font-display text-2xl font-bold text-ink-500 leading-none mb-1">{s.value}</div>
                  <div className="text-xs font-semibold text-ink-400 mb-0.5">{s.label}</div>
                  <div className="text-[10px] text-ink-200">{s.hint}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-ink-500 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-teal-600" />
                故障类型分布
              </h2>
              <span className="text-xs text-ink-200">共 {stats.faultTypeDistribution.reduce((a, b) => a + b.count, 0)} 条</span>
            </div>
            <div className="space-y-3.5">
              {stats.faultTypeDistribution.map((d, idx) => (
                <div key={d.type}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink-500">{d.type}</span>
                    <span className="text-xs font-bold text-ink-400">{d.count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-cream-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${faultColors[idx % faultColors.length]} transition-all duration-700 ease-out`}
                      style={{ width: `${(d.count / maxFault) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-lg font-bold text-ink-500 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                楼栋问题排行
              </h2>
              <span className="text-xs text-ink-200">按报修数量降序</span>
            </div>
            <div className="space-y-3">
              {stats.buildingDistribution.map((d, idx) => {
                const rankColors = ['from-orange-500 to-orange-400', 'from-teal-500 to-teal-400', 'from-violet-500 to-violet-400'];
                const pillColor = idx < 3 ? `bg-gradient-to-r ${rankColors[idx]} text-white` : 'bg-cream-100 text-ink-400';
                return (
                  <div key={d.building} className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${pillColor} shadow-soft flex-shrink-0`}>
                      {idx + 1}
                    </span>
                    <span className="w-14 text-sm font-medium text-ink-500 flex-shrink-0">{d.building}</span>
                    <div className="flex-1 h-6 rounded-lg bg-cream-100 overflow-hidden relative">
                      <div
                        className="h-full rounded-lg bg-gradient-to-r from-teal-400 to-teal-600 transition-all duration-700 ease-out flex items-center justify-end pr-2"
                        style={{ width: `${Math.max((d.count / maxBuilding) * 100, 8)}%` }}
                      >
                        <span className="text-[10px] font-bold text-white">{d.count}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-teal-600/8 p-6 animate-fade-in">
          <div className="flex items-center justify-between gap-3 mb-5 flex-wrap">
            <h2 className="font-display text-lg font-bold text-ink-500 flex items-center gap-2">
              <Filter className="w-5 h-5 text-teal-600" />
              全部工单
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-200" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索工单号、楼栋、房间..."
                  className="pl-9 pr-4 py-2 rounded-xl bg-cream-50 border border-teal-600/10 text-sm text-ink-500 placeholder:text-ink-200 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all w-60"
                />
              </div>
              <div className="flex p-0.5 rounded-xl bg-cream-100 border border-teal-600/5">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${statusFilter === 'all' ? 'bg-white text-teal-700 shadow-soft' : 'text-ink-300 hover:text-ink-500'}`}
                >
                  全部
                </button>
                {(['pending', 'processing', 'waiting_parts', 'completed'] as TicketStatus[]).map((s) => {
                  const label = { pending: '待接', processing: '处理中', waiting_parts: '等配件', completed: '完成' }[s];
                  const active = statusFilter === s;
                  const c = STATUS_COLOR[s];
                  return (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${active ? `bg-white shadow-soft ${c.text}` : 'text-ink-300 hover:text-ink-500'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-ink-300">没有匹配的工单</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-teal-600/8 text-left">
                    <th className="py-3 px-3 text-xs font-semibold text-ink-300 uppercase tracking-wider">工单</th>
                    <th className="py-3 px-3 text-xs font-semibold text-ink-300 uppercase tracking-wider">位置</th>
                    <th className="py-3 px-3 text-xs font-semibold text-ink-300 uppercase tracking-wider">类型</th>
                    <th className="py-3 px-3 text-xs font-semibold text-ink-300 uppercase tracking-wider">报修人</th>
                    <th className="py-3 px-3 text-xs font-semibold text-ink-300 uppercase tracking-wider">紧急</th>
                    <th className="py-3 px-3 text-xs font-semibold text-ink-300 uppercase tracking-wider">状态</th>
                    <th className="py-3 px-3 text-xs font-semibold text-ink-300 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.slice(0, 10).map((t) => {
                    const c = STATUS_COLOR[t.status];
                    return (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/ticket/${t.id}`)}
                        className="border-b border-teal-600/5 hover:bg-teal-50/40 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-3">
                          <div className="font-mono font-semibold text-ink-500 text-xs">{t.id}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-ink-500">{t.building} {t.room}</td>
                        <td className="py-3 px-3 text-ink-400">{t.faultType}</td>
                        <td className="py-3 px-3 text-ink-400">{t.studentName}</td>
                        <td className="py-3 px-3">
                          {t.urgency === 'urgent' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-600 border border-orange-200">
                              <AlertTriangle className="w-2.5 h-2.5" /> 紧急
                            </span>
                          ) : (
                            <span className="text-[10px] text-ink-200">普通</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
                            {{ pending: '待接单', processing: '处理中', waiting_parts: '等配件', completed: '已完成' }[t.status]}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <ChevronRight className="w-4 h-4 text-ink-200 inline" />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filtered.length > 10 && (
                <div className="pt-4 text-center text-xs text-ink-300">显示前 10 条，共 {filtered.length} 条结果</div>
              )}
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.slice(0, 3).map((t) => (
              <TicketCard key={t.id} ticket={t} compact />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
