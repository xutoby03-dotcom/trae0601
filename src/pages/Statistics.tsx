import { useMemo } from "react";
import {
  BarChart3,
  PieChart as PieChartIcon,
  AlertTriangle,
  Building2,
  Activity,
  Send,
  Star,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react";
import { useStore } from "@/store/useStore";
import { useNavigate } from "react-router-dom";
import {
  formatDate,
  formatDateTime,
  basketStatusLabel,
  overdueDays,
  lendStatusLabel,
} from "@/utils/format";
import type { BasketStatus } from "@/types";

export default function Statistics() {
  const navigate = useNavigate();
  const { baskets, lendRecords, returnChecks, sendReminder, reminders } = useStore();

  const stockCounts = useMemo(() => {
    const counts: Record<BasketStatus, number> = {
      available: 0,
      lent: 0,
      repair: 0,
      scrapped: 0,
    };
    baskets.forEach((b) => counts[b.status]++);
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    const activeTotal = total - counts.scrapped;
    return { counts, total, activeTotal };
  }, [baskets]);

  const stockPercentages = useMemo(() => {
    const base = stockCounts.activeTotal || 1;
    return {
      available: Math.round((stockCounts.counts.available / base) * 100),
      lent: Math.round((stockCounts.counts.lent / base) * 100),
      repair: Math.round((stockCounts.counts.repair / base) * 100),
    };
  }, [stockCounts]);

  const overdueList = useMemo(
    () =>
      lendRecords
        .filter((r) => r.status === "overdue")
        .sort((a, b) => overdueDays(b.expectedReturnTime) - overdueDays(a.expectedReturnTime)),
    [lendRecords]
  );

  const departmentStats = useMemo(() => {
    const map = new Map<string, number>();
    lendRecords.forEach((r) => {
      map.set(r.department, (map.get(r.department) || 0) + 1);
    });
    const arr = Array.from(map.entries()).map(([name, count]) => ({ name, count }));
    arr.sort((a, b) => b.count - a.count);
    return arr;
  }, [lendRecords]);

  const maxDeptCount = Math.max(1, ...departmentStats.map((d) => d.count));

  const damageRateStats = useMemo(() => {
    const totalChecks = returnChecks.length || 1;
    const damaged = returnChecks.filter((r) => r.basketDamaged).length;
    const currentRate = +((damaged / totalChecks) * 100).toFixed(1);

    const months: { label: string; rate: number; actual: number; total: number }[] = [];
    const now = new Date();
    const lendWithReturn = lendRecords.filter((r) => r.actualReturnTime);
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthChecks = returnChecks.filter((rc) => {
        const cd = new Date(rc.checkTime);
        return cd.getFullYear() === y && cd.getMonth() === m;
      });
      const total = monthChecks.length;
      const dmg = monthChecks.filter((rc) => rc.basketDamaged).length;
      const rate = total > 0 ? +((dmg / total) * 100).toFixed(1) : 0;
      months.push({
        label: `${m + 1}月`,
        rate,
        actual: dmg,
        total,
      });
    }
    return { currentRate, months, damaged, total: totalChecks, lendWithReturn };
  }, [returnChecks, lendRecords]);

  const maxMonthRate = Math.max(1, ...damageRateStats.months.map((m) => m.rate), 10);

  const pieSlices = [
    {
      key: "available",
      label: "可用",
      value: stockCounts.counts.available,
      pct: stockPercentages.available,
      color: "#059669",
    },
    {
      key: "lent",
      label: "借出中",
      value: stockCounts.counts.lent,
      pct: stockPercentages.lent,
      color: "#1e3a5f",
    },
    {
      key: "repair",
      label: "维修中",
      value: stockCounts.counts.repair,
      pct: stockPercentages.repair,
      color: "#f59e0b",
    },
  ];

  const valuableTagCount = baskets.filter((b) => b.hasValuableTag).length;

  return (
    <div className="space-y-5 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-5 bg-gradient-to-br from-steel-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-steel-600 text-white flex items-center justify-center shadow-industrial">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate2-500">篮子总量</p>
              <p className="text-2xl font-display font-bold text-slate2-800 tabular-nums">
                {stockCounts.total}
              </p>
            </div>
          </div>
          <p className="text-xs text-slate2-400">
            活跃 {stockCounts.activeTotal} · 报废{" "}
            {stockCounts.counts.scrapped}
          </p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-signal-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-signal-500 text-white flex items-center justify-center shadow-industrial">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate2-500">逾期数量</p>
              <p className="text-2xl font-display font-bold text-signal-500 tabular-nums">
                {overdueList.length}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/return")}
            className="text-xs text-signal-600 font-medium hover:text-signal-700 inline-flex items-center gap-1"
          >
            处理归还 <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
        <div className="card p-5 bg-gradient-to-br from-amber-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500 text-steel-900 flex items-center justify-center shadow-industrial">
              <Star className="w-5 h-5 fill-steel-900" />
            </div>
            <div>
              <p className="text-xs text-slate2-500">贵重物品专用篮</p>
              <p className="text-2xl font-display font-bold text-amber-700 tabular-nums">
                {valuableTagCount}
              </p>
            </div>
          </div>
          <p className="text-xs text-amber-700/80">
            已专门标记，优先使用追踪
          </p>
        </div>
        <div className="card p-5 bg-gradient-to-br from-forest-50 to-white">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-forest-500 text-white flex items-center justify-center shadow-industrial">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate2-500">历史破损率</p>
              <p className="text-2xl font-display font-bold text-forest-600 tabular-nums">
                {damageRateStats.currentRate}%
              </p>
            </div>
          </div>
          <p className="text-xs text-slate2-400">
            {damageRateStats.damaged}/{damageRateStats.total} 次归还检出破损
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate2-200 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-steel-600" />
              库存状态分布
            </h3>
            <span className="text-xs text-slate2-400 font-mono">
              活跃 {stockCounts.activeTotal} 只
            </span>
          </div>
          <div className="p-5 flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="relative w-48 h-48 flex-shrink-0">
              <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="16"
                />
                {(() => {
                  let offset = 0;
                  const circumference = 2 * Math.PI * 40;
                  return pieSlices.map((s) => {
                    const dash = (s.pct / 100) * circumference;
                    const style = {
                      strokeDasharray: `${dash} ${circumference}`,
                      strokeDashoffset: -offset,
                      transition: "all 0.6s ease",
                    };
                    offset += dash;
                    return (
                      <circle
                        key={s.key}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={s.color}
                        strokeWidth="16"
                        style={style}
                      />
                    );
                  });
                })()}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display font-bold text-3xl text-slate2-800 tabular-nums">
                  {stockCounts.activeTotal}
                </span>
                <span className="text-xs text-slate2-500">活跃总数</span>
              </div>
            </div>
            <div className="flex-1 space-y-3 w-full">
              {pieSlices.map((s) => (
                <div key={s.key} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-sm"
                        style={{ background: s.color }}
                      />
                      <span className="text-sm font-medium text-slate2-700">
                        {s.label}
                      </span>
                    </div>
                    <span className="font-mono text-sm tabular-nums">
                      <b className="text-slate2-800">{s.value}</b>
                      <span className="text-slate2-400 ml-2">{s.pct}%</span>
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate2-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 group-hover:brightness-110"
                      style={{ width: `${s.pct}%`, background: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate2-200 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
              <Activity className="w-5 h-5 text-amber-600" />
              近6个月破损率趋势
            </h3>
            <span className="text-xs font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">
              当前 {damageRateStats.currentRate}%
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-end gap-3 h-48">
              {damageRateStats.months.map((m) => (
                <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex-1 flex items-end relative group">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-amber-500 to-amber-400 transition-all duration-700 relative overflow-hidden"
                      style={{
                        height: `${Math.max(4, (m.rate / maxMonthRate) * 100)}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate2-800 text-white text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {m.rate}% ({m.actual}/{m.total})
                    </div>
                  </div>
                  <div className="text-[11px] font-mono text-slate2-500">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate2-100 flex items-center justify-between text-xs text-slate2-500">
              <span>最高月：{Math.max(...damageRateStats.months.map(m => m.rate))}%</span>
              <span>归还总次数：{damageRateStats.total}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate2-200 flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-steel-600" />
              部门借用次数排行
            </h3>
            <span className="text-xs text-slate2-400 font-mono">
              共 {departmentStats.length} 个部门
            </span>
          </div>
          <div className="p-5 space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
            {departmentStats.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate2-400">暂无数据</p>
            ) : (
              departmentStats.map((d, idx) => {
                const pct = Math.round((d.count / maxDeptCount) * 100);
                const rankColor =
                  idx === 0
                    ? "from-amber-400 to-amber-600 text-white"
                    : idx === 1
                    ? "from-slate2-300 to-slate2-400 text-white"
                    : idx === 2
                    ? "from-orange-300 to-orange-500 text-white"
                    : "from-slate2-100 to-slate2-200 text-slate2-600";
                return (
                  <div key={d.name} className="group">
                    <div className="flex items-center gap-3 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center font-display font-bold text-xs bg-gradient-to-br ${rankColor} shadow-card flex-shrink-0`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-sm font-medium text-slate2-700 flex-1">
                        {d.name}
                      </span>
                      <span className="font-mono text-sm tabular-nums">
                        <b className="text-steel-600">{d.count}</b>
                        <span className="text-xs text-slate2-400 ml-1.5">
                          次
                        </span>
                      </span>
                    </div>
                    <div className="ml-10 h-2 rounded-full bg-slate2-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-steel-400 to-steel-600 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-signal-100 bg-gradient-to-r from-signal-50 to-white flex items-center justify-between">
            <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-signal-500" />
              逾期清单详情
            </h3>
            <span className="text-xs font-mono bg-signal-500 text-white px-2 py-0.5 rounded-full">
              {overdueList.length} 笔
            </span>
          </div>
          <div className="max-h-96 overflow-x-auto scrollbar-thin">
            {overdueList.length === 0 ? (
              <div className="py-12 text-center">
                <Activity className="w-12 h-12 text-forest-300 mx-auto mb-3" />
                <p className="text-slate2-500 text-sm">当前没有逾期记录</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate2-50 text-xs text-slate2-500 sticky top-0">
                  <tr>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                      篮子编号
                    </th>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                      借用人
                    </th>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                      部门
                    </th>
                    <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                      逾期天数
                    </th>
                    <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                      预计归还
                    </th>
                    <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate2-100">
                  {overdueList.map((r) => {
                    const days = overdueDays(r.expectedReturnTime);
                    const remindCount = reminders[r.id] || 0;
                    return (
                      <tr
                        key={r.id}
                        className="hover:bg-signal-50/30 transition-colors"
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate2-800">
                              {r.basketCode}
                            </span>
                            {r.hasValuable && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate2-700 font-medium">
                          {r.borrowerName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate2-600">
                          {r.department}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center justify-center min-w-[48px] px-2 py-1 rounded font-bold font-mono tabular-nums ${
                              days >= 7
                                ? "bg-signal-500 text-white"
                                : days >= 3
                                ? "bg-signal-100 text-signal-600"
                                : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {days} 天
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate2-500">
                          {formatDate(r.expectedReturnTime)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => sendReminder(r.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-steel-50 text-steel-700 border border-steel-200 hover:bg-steel-600 hover:text-white hover:border-steel-600 transition-all"
                              title="发送催还提醒"
                            >
                              <Send className="w-3 h-3" />
                              {remindCount > 0 ? `催(${remindCount})` : "催还"}
                            </button>
                            <button
                              onClick={() => navigate("/return")}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-forest-50 text-forest-700 border border-forest-200 hover:bg-forest-500 hover:text-white hover:border-forest-500 transition-all"
                            >
                              归还
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate2-200 flex items-center justify-between">
          <h3 className="font-display font-semibold text-slate2-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-steel-600" />
            完整借出记录
          </h3>
          <span className="text-xs text-slate2-400 font-mono">
            共 {lendRecords.length} 条记录
          </span>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead className="bg-slate2-50 text-xs text-slate2-500 sticky top-0">
              <tr>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  编号
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  篮子编号
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  借用人
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  部门
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  目的地
                </th>
                <th className="text-center font-semibold px-4 py-3 whitespace-nowrap">
                  状态
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  借出时间
                </th>
                <th className="text-left font-semibold px-4 py-3 whitespace-nowrap">
                  归还时间
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate2-100">
              {lendRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate2-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate2-400">
                    {r.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate2-800 text-xs">
                        {r.basketCode}
                      </span>
                      {r.hasValuable && (
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate2-700 font-medium">
                    {r.borrowerName}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate2-600">
                    {r.department}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate2-600 text-xs">
                    {r.destination}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-center">
                    <span
                      className={`status-badge !text-[10px] ${
                        r.status === "overdue"
                          ? "bg-signal-50 text-signal-500 ring-1 ring-inset ring-signal-100"
                          : r.status === "active"
                          ? "bg-steel-50 text-steel-600 ring-1 ring-inset ring-steel-200"
                          : "bg-forest-50 text-forest-600 ring-1 ring-inset ring-forest-200"
                      }`}
                    >
                      {r.status === "overdue" && (
                        <span className="w-1.5 h-1.5 rounded-full bg-signal-500 animate-blink-dot" />
                      )}
                      {lendStatusLabel[r.status]}
                      {r.status === "overdue" &&
                        ` ${overdueDays(r.expectedReturnTime)}天`}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate2-500">
                    {formatDateTime(r.lendTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate2-500">
                    {r.actualReturnTime
                      ? formatDateTime(r.actualReturnTime)
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
