import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { STATUS_CONFIG, STATUS_TAB_ORDER, BUILDINGS } from '@/shared/constants';
import type { FaultStatus } from '@/shared/types';
import FaultCard from '@/components/FaultCard';
import {
  Search,
  Plus,
  SlidersHorizontal,
  Inbox,
  AlertTriangle,
  Wrench,
  PackageCheck,
  CheckCircle2,
  Repeat,
  Building2,
} from 'lucide-react';

const TAB_META: { status: FaultStatus | 'all'; label: string; Icon: typeof AlertTriangle }[] = [
  { status: 'all', label: '全部', Icon: Inbox },
  { status: 'urgent', label: '紧急', Icon: AlertTriangle },
  { status: 'processing', label: '处理中', Icon: Wrench },
  { status: 'waiting_parts', label: '等配件', Icon: PackageCheck },
  { status: 'recovered', label: '已恢复', Icon: CheckCircle2 },
  { status: 'repeated', label: '反复故障', Icon: Repeat },
];

export default function Dashboard() {
  const nav = useNavigate();
  const { tickets, getFilteredTickets, currentRole, subscriptions } = useAppStore();
  const [activeTab, setActiveTab] = useState<FaultStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string | 'all'>('all');
  const [onlySubscribed, setOnlySubscribed] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets.length };
    STATUS_TAB_ORDER.forEach((s) => (c[s] = 0));
    tickets.forEach((t) => {
      if (t.status in c) c[t.status] += 1;
    });
    return c;
  }, [tickets]);

  const list = useMemo(() => {
    let base = getFilteredTickets(activeTab === 'all' ? undefined : activeTab);
    if (onlySubscribed) {
      base = base.filter((t) => subscriptions.buildings.includes(t.elevator.building));
    }
    if (buildingFilter !== 'all') {
      base = base.filter((t) => t.elevator.building === buildingFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      base = base.filter(
        (t) =>
          t.elevator.building.toLowerCase().includes(q) ||
          t.elevator.unit.includes(q) ||
          t.elevator.elevatorNo.includes(q) ||
          t.description.toLowerCase().includes(q) ||
          (t.handler && t.handler.includes(q)),
      );
    }
    return base;
  }, [getFilteredTickets, activeTab, buildingFilter, query, onlySubscribed, subscriptions]);

  const highlightStats = useMemo(() => {
    const urgent = tickets.filter((t) => t.status === 'urgent').length;
    const trapped = tickets.filter((t) => t.hasTrapped && t.status !== 'recovered').length;
    const processing = tickets.filter((t) => t.status === 'processing' || t.status === 'waiting_parts').length;
    const recovered7d = tickets.filter(
      (t) => t.recoveredAt && t.recoveredAt > Date.now() - 7 * 24 * 3600 * 1000,
    ).length;
    return { urgent, trapped, processing, recovered7d };
  }, [tickets]);

  return (
    <div className="container max-w-7xl py-6 pb-28 md:pb-10 space-y-6">
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="紧急待处理"
          value={highlightStats.urgent}
          icon={<AlertTriangle size={20} />}
          tone="red"
          sub={highlightStats.trapped > 0 ? `⚠️ ${highlightStats.trapped} 起含人员被困` : undefined}
        />
        <StatCard
          label="处理中/等配件"
          value={highlightStats.processing}
          icon={<Wrench size={20} />}
          tone="orange"
          sub="正在跟进的工单"
        />
        <StatCard
          label="近7天已恢复"
          value={highlightStats.recovered7d}
          icon={<CheckCircle2 size={20} />}
          tone="green"
          sub="恢复正常运行"
        />
        <StatCard
          label="累计工单"
          value={tickets.length}
          icon={<Inbox size={20} />}
          tone="blue"
          sub={`含 ${subscriptions.buildings.length} 个订阅楼栋`}
        />
      </section>

      <section className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1 flex items-center gap-2 px-4 py-2.5 card">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-slate-400"
            placeholder="搜索楼栋、单元、电梯号或描述..."
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-sm cursor-pointer hover:border-brand-500 transition-all">
            <input
              type="checkbox"
              checked={onlySubscribed}
              onChange={(e) => setOnlySubscribed(e.target.checked)}
              className="accent-brand-500"
            />
            只看订阅楼栋
          </label>

          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200">
            <SlidersHorizontal size={14} className="text-slate-500" />
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="bg-transparent outline-none text-sm cursor-pointer"
            >
              <option value="all">全部楼栋</option>
              {BUILDINGS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {TAB_META.map(({ status, label, Icon }) => {
          const count = status === 'all' ? counts.all : counts[status] || 0;
          const active = activeTab === status;
          const cfg = status !== 'all' ? STATUS_CONFIG[status] : undefined;
          return (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${active
                ? cfg
                  ? `${cfg.bg} ${cfg.color} ${cfg.border}`
                  : 'bg-brand-500 text-white border-brand-500 shadow-pop'
                : 'bg-white text-slate-600 border-slate-200 hover:border-brand-400 hover:text-brand-500'}`}
            >
              <Icon size={15} />
              {label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${active
                  ? cfg
                    ? 'bg-white/60'
                    : 'bg-white/20'
                  : 'bg-slate-100 text-slate-500'}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
        {list.length === 0 ? (
          <div className="md:col-span-2 xl:col-span-3 card p-16 flex flex-col items-center text-center animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
              <Inbox size={30} />
            </div>
            <h3 className="font-bold text-slate-700 mb-1">暂无故障工单</h3>
            <p className="text-sm text-slate-500 max-w-sm">
              当前筛选条件下没有相关记录，您可以切换标签或清除筛选条件。
            </p>
          </div>
        ) : (
          list.map((t) => <FaultCard key={t.id} ticket={t} />)
        )}
      </section>

      <button
        onClick={() => nav('/report')}
        className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-6 py-3.5 rounded-full bg-gradient-to-r from-brand-500 to-brand-700 text-white shadow-pop font-bold"
      >
        <Plus size={18} />
        上报电梯故障
      </button>
      <button
        onClick={() => nav('/report')}
        className="hidden md:flex fixed bottom-6 right-6 z-30 items-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-pop font-semibold hover:shadow-[0_15px_35px_-10px_rgba(30,58,95,0.55)] transition-all hover:-translate-y-0.5"
      >
        <Plus size={18} />
        上报故障
      </button>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  tone,
  sub,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: 'red' | 'orange' | 'green' | 'blue';
  sub?: string;
}) {
  const tones = {
    red: { bg: 'from-red-50 to-white', text: 'text-red-600', icon: 'bg-red-100 text-red-500' },
    orange: { bg: 'from-orange-50 to-white', text: 'text-orange-600', icon: 'bg-orange-100 text-orange-500' },
    green: { bg: 'from-emerald-50 to-white', text: 'text-emerald-600', icon: 'bg-emerald-100 text-emerald-500' },
    blue: { bg: 'from-brand-50 to-white', text: 'text-brand-600', icon: 'bg-brand-100 text-brand-500' },
  } as const;
  const t = tones[tone];
  return (
    <div className={`card p-4 md:p-5 bg-gradient-to-br ${t.bg} overflow-hidden relative`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 font-medium mb-1">{label}</div>
          <div className={`text-2xl md:text-3xl font-black ${t.text} tabular-nums`}>{value}</div>
          {sub && <div className="mt-1.5 text-[11px] text-slate-500">{sub}</div>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.icon}`}>{icon}</div>
      </div>
    </div>
  );
}
