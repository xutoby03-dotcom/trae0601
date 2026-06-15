import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from 'recharts';
import {
  ArrowDownCircle, CheckCircle2, TrendingDown, Lightbulb,
  AlertTriangle, DollarSign, Target, Sparkles,
} from 'lucide-react';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import {
  cn, formatCurrency, getAnnualAmount, getMonthlyEquivalent,
  getCategoryInfo, getCategoryLabel, getCategoryStats,
  getTotalAnnual, getTotalMonthly, generateSmartSuggestions,
} from '@/utils/helpers';
import { CATEGORY_OPTIONS } from '@/utils/constants';

export default function Statistics() {
  const subs = useSubscriptionStore((s) => s.subscriptions);
  const confirmUsage = useSubscriptionStore((s) => s.confirmUsage);
  const categoryBreakdown = useMemo(() => getCategoryStats(subs), [subs]);
  const annualProjection = useMemo(() => getTotalAnnual(subs), [subs]);
  const monthlyProjection = useMemo(() => getTotalMonthly(subs), [subs]);
  const suggestions = useMemo(() => generateSmartSuggestions(subs), [subs]);

  const pieData = useMemo(() => {
    return CATEGORY_OPTIONS.map((cat) => {
      const stat = categoryBreakdown.find((c) => c.category === cat.value);
      return {
        name: cat.label,
        value: Math.round(stat?.monthlyTotal || 0),
        color: cat.color,
        emoji: cat.emoji,
        count: stat?.count || 0,
      };
    }).filter((d) => d.value > 0);
  }, [categoryBreakdown]);

  const topSubscriptions = useMemo(() => {
    return [...subs]
      .sort((a, b) => getAnnualAmount(b) - getAnnualAmount(a))
      .slice(0, 5)
      .map((s) => ({
        id: s.id,
        name: s.name,
        emoji: s.logoEmoji,
        monthly: Math.round(getMonthlyEquivalent(s) * 100) / 100,
        annual: Math.round(getAnnualAmount(s) * 100) / 100,
        category: s.category,
      }));
  }, [subs]);

  const monthlyBarData = useMemo(() => {
    const months: { name: string; value: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const total = subs.reduce((sum, s) => {
        if (s.nextBillingDate.startsWith(monthStr)) return sum + s.amount;
        if (s.billingCycle === 'monthly') return sum + getMonthlyEquivalent(s);
        if (s.billingCycle === 'yearly') return sum + s.amount / 12;
        if (s.billingCycle === 'quarterly') return sum + s.amount / 3;
        return sum + getMonthlyEquivalent(s);
      }, 0);
      months.push({
        name: `${d.getMonth() + 1}月`,
        value: Math.round(total),
      });
    }
    return months;
  }, [subs]);

  const totalPotentialSaving = suggestions.reduce((s, x) => s + (x.potentialSaving || 0), 0);

  const renderSeverityBadge = (sev: string) => {
    const styles = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      low: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    } as const;
    const labels = { high: '高', medium: '中', low: '低' };
    return (
      <span className={cn('tag border', styles[sev as keyof typeof styles])}>
        {labels[sev as keyof typeof labels]}优先级
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl md:text-4xl tracking-tight">
          统计分析
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          按类别分组查看消费结构，通过智能建议优化你的订阅支出
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <DollarSign className="w-3.5 h-3.5 text-teal-400" /> 月均预估
          </div>
          <p className="font-display font-bold text-2xl md:text-3xl text-teal-300">
            {formatCurrency(monthlyProjection)}
          </p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Target className="w-3.5 h-3.5 text-amber-400" /> 年度预估
          </div>
          <p className="font-display font-bold text-2xl md:text-3xl text-amber-300">
            {formatCurrency(annualProjection)}
          </p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <TrendingDown className="w-3.5 h-3.5 text-sky-400" /> 可节省
          </div>
          <p className="font-display font-bold text-2xl md:text-3xl text-sky-300">
            {formatCurrency(totalPotentialSaving)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">/年（按建议）</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400" /> 优化建议
          </div>
          <p className="font-display font-bold text-2xl md:text-3xl text-fuchsia-300">
            {suggestions.length}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">条待处理</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="glass-card p-5 lg:col-span-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">分类占比（月度）</h2>
            <span className="text-xs text-slate-500">{pieData.length} 个分类</span>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-full md:w-2/5 h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(148,163,184,0.2)',
                      borderRadius: '12px',
                      color: '#F1F5F9',
                      fontSize: '12px',
                    }}
                    formatter={(v: number) => formatCurrency(v)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 w-full space-y-2.5">
              {pieData.map((d) => {
                const total = pieData.reduce((s, x) => s + x.value, 0);
                const pct = total ? Math.round((d.value / total) * 100) : 0;
                return (
                  <div key={d.name} className="group">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <span>{d.emoji}</span>
                        <span className="font-medium">{d.name}</span>
                        <span className="text-[11px] text-slate-500">({d.count}项)</span>
                      </span>
                      <span className="flex items-center gap-3 tabular-nums">
                        <span className="text-slate-400">{pct}%</span>
                        <span className="font-display font-semibold text-slate-100 min-w-[72px] text-right">
                          {formatCurrency(d.value)}
                        </span>
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-black/30 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 group-hover:brightness-125"
                        style={{ width: `${pct}%`, background: d.color }}
                      />
                    </div>
                  </div>
                );
              })}
              {pieData.length === 0 && (
                <p className="text-center text-slate-500 text-sm py-8">暂无数据</p>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-5 lg:col-span-2">
          <h2 className="font-display font-bold text-lg mb-4">年度 Top 5 花费</h2>
          <div className="space-y-3.5">
            {topSubscriptions.map((s, i) => {
              const cat = getCategoryInfo(s.category);
              return (
                <div
                  key={s.id}
                  className="p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-display font-bold text-xs',
                        i === 0 ? 'bg-amber-500/25 text-amber-300' :
                        i === 1 ? 'bg-slate-400/20 text-slate-300' :
                        i === 2 ? 'bg-orange-600/25 text-orange-300' :
                                 'bg-white/5 text-slate-400'
                      )}
                    >
                      #{i + 1}
                    </div>
                    <div className="text-2xl">{s.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-500" style={{ color: cat.color }}>
                        {cat.label} · 月均 {formatCurrency(s.monthly)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-amber-300 tabular-nums">
                        {formatCurrency(s.annual)}
                      </div>
                      <div className="text-[10px] text-slate-500">/年</div>
                    </div>
                  </div>
                </div>
              );
            })}
            {topSubscriptions.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-8">暂无数据</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="font-display font-bold text-lg mb-4">近 6 个月月开销趋势</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyBarData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={12} />
                <YAxis stroke="#64748B" fontSize={12} tickFormatter={(v) => `¥${v}`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgba(15,23,42,0.95)',
                    border: '1px solid rgba(148,163,184,0.2)',
                    borderRadius: '12px',
                    color: '#F1F5F9',
                    fontSize: '12px',
                  }}
                  formatter={(v: number) => formatCurrency(v)}
                  cursor={{ fill: 'rgba(45,212,191,0.05)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="url(#barGradient)" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0D9488" />
                    <stop offset="100%" stopColor="#0F766E" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <h2 className="font-display font-bold text-lg">智能省钱建议</h2>
            </div>
            {suggestions.length > 0 && (
              <span className="tag bg-amber-500/15 text-amber-300 border border-amber-500/25">
                可省约 {formatCurrency(totalPotentialSaving)}/年
              </span>
            )}
          </div>
          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 -mr-1 stagger">
            {suggestions.map((s) => (
              <div
                key={s.id}
                className={cn(
                  'p-4 rounded-xl border transition-colors',
                  s.severity === 'high' && 'bg-red-500/5 border-red-500/20 hover:border-red-500/35',
                  s.severity === 'medium' && 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/35',
                  s.severity === 'low' && 'bg-sky-500/5 border-sky-500/20 hover:border-sky-500/35'
                )}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {renderSeverityBadge(s.severity)}
                    <h3 className="font-semibold text-sm">{s.title}</h3>
                  </div>
                  {s.potentialSaving && (
                    <div className="text-right shrink-0">
                      <div className="font-display font-bold text-sm text-teal-300 tabular-nums whitespace-nowrap">
                        -{formatCurrency(s.potentialSaving)}
                      </div>
                      <div className="text-[10px] text-slate-500">潜在节省/年</div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-3">{s.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-1.5">
                    {s.subscriptionIds.slice(0, 3).map((id) => {
                      const sub = subs.find((x) => x.id === id);
                      if (!sub) return null;
                      return (
                        <div
                          key={id}
                          className="w-6 h-6 rounded-full bg-slate-800 ring-2 ring-slate-900 flex items-center justify-center text-xs"
                          title={sub.name}
                        >
                          {sub.logoEmoji}
                        </div>
                      );
                    })}
                    {s.subscriptionIds.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-slate-700 ring-2 ring-slate-900 flex items-center justify-center text-[10px] text-slate-300">
                        +{s.subscriptionIds.length - 3}
                      </div>
                    )}
                  </div>
                  {s.type === 'unconfirmed' && (
                    <div className="flex items-center gap-2">
                      {s.subscriptionIds.slice(0, 2).map((id) => (
                        <button
                          key={id}
                          onClick={() => confirmUsage(id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/25 hover:bg-teal-500/25 transition-colors text-[11px] font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {subs.find(x => x.id === id)?.name.slice(0, 6)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {suggestions.length === 0 && (
              <div className="text-center py-12">
                <div className="text-5xl mb-3">🌟</div>
                <h3 className="font-display font-bold text-lg mb-1">太棒了！</h3>
                <p className="text-sm text-slate-400">
                  当前没有优化建议，订阅消费非常健康
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        {CATEGORY_OPTIONS.filter((cat) => {
          const count = subs.filter((s) => s.category === cat.value).length;
          return count > 0;
        }).map((cat) => {
          const catSubs = subs.filter((s) => s.category === cat.value);
          const monthly = catSubs.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
          const annual = monthly * 12;
          const count = catSubs.length;
          return (
            <div
              key={cat.value}
              className="glass-card glass-card-hover p-5 relative overflow-hidden"
            >
              <div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-2xl"
                style={{ background: cat.color }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                    style={{
                      background: `${cat.color}22`,
                      boxShadow: `inset 0 0 0 1px ${cat.color}44`,
                    }}
                  >
                    {cat.emoji}
                  </div>
                  <span className="tag border" style={{ background: `${cat.color}15`, borderColor: `${cat.color}33`, color: cat.color }}>
                    {count} 项
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg mb-0.5">{cat.label}</h3>
                <p className="text-xs text-slate-400 mb-4">{getCategoryLabel(cat.value)}类订阅</p>
                <div className="space-y-2 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">月均</span>
                    <span className="font-display font-bold text-slate-100 tabular-nums">{formatCurrency(monthly)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">年度</span>
                    <span className="font-display font-bold tabular-nums" style={{ color: cat.color }}>
                      {formatCurrency(annual)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
