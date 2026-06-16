import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAquariumStore } from "@/store/useAquariumStore";
import { useFeedingStore } from "@/store/useFeedingStore";
import { useStockStore } from "@/store/useStockStore";
import AlertBanner from "@/components/common/AlertBanner";
import {
  BarChart3,
  Fish,
  Utensils,
  Package,
  AlertTriangle,
  TrendingUp,
  CalendarClock,
  ChefHat,
} from "lucide-react";
import {
  calcWeeklyUsage,
  calcFeederRanking,
} from "@/utils/statistics";
import {
  findMostMissedTimeframes,
  findAppetiteAbnormal,
  calcAvgDailyUsageByType,
  calcStockDaysLeft,
} from "@/utils/alertChecker";
import { round1 } from "@/utils/formatters";

const COLORS = ["#0f766e", "#0369a1", "#ea580c", "#7c3aed", "#059669", "#be123c"];

export default function Statistics() {
  const aquariums = useAquariumStore((s) => s.aquariums);
  const weekly = calcWeeklyUsage();
  const ranking = calcFeederRanking(30);
  const missTime = findMostMissedTimeframes();
  const appetite = findAppetiteAbnormal(30);
  const stocks = useStockStore((s) => s.stocks);
  const totalRecords = useFeedingStore((s) => s.getAllRecords().length);

  const pieData = useMemo(() => {
    const totals: Record<string, number> = {};
    weekly.series.forEach((ser) => {
      totals[ser.name] = ser.data.reduce((s, n) => s + n, 0);
    });
    const sum = Object.values(totals).reduce((a, b) => a + b, 0);
    return Object.entries(totals).map(([name, value]) => ({
      name,
      value: round1(value),
      percent: sum === 0 ? 0 : Math.round((value / sum) * 100),
    }));
  }, [weekly.series]);

  const missedByPeriod = useMemo(
    () =>
      missTime.map((m) => ({
        name: m.label,
        漏喂次数: m.missed,
        总次数: m.total,
        漏喂率: Math.round(m.rate * 100),
      })),
    [missTime]
  );

  const totalFish = aquariums.reduce(
    (s, a) => s + a.fish_species.reduce((ss, f) => ss + f.count, 0),
    0
  );

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-slide-up">
      <div>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-brand-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-water-600" />
          数据统计与分析
        </h2>
        <p className="text-sm text-brand-600 mt-1">
          可视化喂食数据，发现潜在问题
        </p>
      </div>

      <section>
        <AlertBanner showAll />
      </section>

      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Fish}
          label="鱼缸总数"
          value={aquariums.length}
          suffix="个"
          color="from-brand-700 to-water-600"
          sub={`${totalFish} 只鱼/虾`}
        />
        <StatCard
          icon={Utensils}
          label="累计喂食"
          value={totalRecords}
          suffix="次"
          color="from-water-600 to-emerald-600"
          sub={`本周消耗 ${weekly.total.toFixed(1)}g`}
        />
        <StatCard
          icon={TrendingUp}
          label="本周日均"
          value={weekly.avgDaily.toFixed(1)}
          suffix="g"
          color="from-indigo-600 to-brand-600"
          sub="按喂食日平均"
        />
        <StatCard
          icon={Package}
          label="鱼粮库存"
          value={stocks.reduce((s, x) => s + x.current_grams, 0)}
          suffix="g"
          color="from-coral-500 to-amber-500"
          sub={`${stocks.length} 种品类`}
        />
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold text-lg text-brand-900">
                📊 本周喂食量趋势
              </h3>
              <p className="text-xs text-brand-600 mt-0.5">
                各鱼缸每日消耗对比（g）
              </p>
            </div>
            <div className="chip bg-gradient-to-r from-water-600 to-brand-700 text-white">
              本周合计 {weekly.total.toFixed(1)}g
            </div>
          </div>
          <div className="h-72">
            {weekly.total === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-brand-500">
                暂无数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={weekly.labels.map((label, i) => {
                    const row: any = { date: label };
                    weekly.series.forEach((ser) => {
                      row[ser.name] = ser.data[i];
                    });
                    return row;
                  })}
                >
                  <defs>
                    {weekly.series.map((s, i) => (
                      <linearGradient
                        key={s.name}
                        id={`grad${i}`}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={COLORS[i % COLORS.length]}
                          stopOpacity={0.55}
                        />
                        <stop
                          offset="95%"
                          stopColor={COLORS[i % COLORS.length]}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="#bae6fd" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: "#075985" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#075985" }}
                    axisLine={false}
                    tickLine={false}
                    unit="g"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #bae6fd",
                      borderRadius: "12px",
                      boxShadow: "0 8px 24px rgba(12,74,110,.12)",
                    }}
                  />
                  <Legend />
                  {weekly.series.map((s, i) => (
                    <Area
                      key={s.name}
                      type="monotone"
                      dataKey={s.name}
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2.5}
                      fill={`url(#grad${i})`}
                      stackId="1"
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="glass-card p-5 md:p-6">
          <h3 className="font-display font-bold text-lg text-brand-900 mb-4">
            🥧 各鱼缸用粮占比
          </h3>
          <div className="h-64">
            {pieData.length === 0 || pieData.every((p) => p.value === 0) ? (
              <div className="h-full flex items-center justify-center text-sm text-brand-500">
                暂无数据
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ percent }) => `${percent}%`}
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 space-y-2">
            {pieData.map((p, i) => (
              <div
                key={p.name}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="font-semibold text-brand-800">{p.name}</span>
                </div>
                <span className="text-brand-600 tabular-nums">
                  {p.value}g · {p.percent}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2 mb-5">
            <CalendarClock className="w-5 h-5 text-coral-500" />
            最容易忘记的时段
          </h3>
          <div className="h-56">
            {missedByPeriod.every((x) => x["漏喂次数"] === 0) ? (
              <div className="h-full flex items-center justify-center text-sm text-brand-500">
                暂无漏喂记录，表现很棒 👍
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={missedByPeriod} layout="vertical">
                  <CartesianGrid stroke="#bae6fd" strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "white",
                      border: "1px solid #fed7aa",
                      borderRadius: "12px",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="漏喂次数" fill="#ea580c" radius={[0, 8, 8, 0]} />
                  <Bar dataKey="总次数" fill="#bae6fd" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-4 space-y-2.5">
            {missTime
              .sort((a, b) => b.rate - a.rate)
              .map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-brand-800">
                      {m.label}
                    </span>
                    <span className="tabular-nums text-brand-600">
                      漏喂 {m.missed}/{m.total}（
                      {Math.round(m.rate * 100)}%）
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-brand-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-coral-500 to-amber-500"
                      style={{ width: `${Math.min(100, m.rate * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="glass-card p-5 md:p-6">
          <h3 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2 mb-5">
            <ChefHat className="w-5 h-5 text-water-600" />
            喂食达人榜（近30天）
          </h3>
          {ranking.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-sm text-brand-500">
              暂无数据
            </div>
          ) : (
            <div className="space-y-3">
              {ranking.map((r, idx) => {
                const max = ranking[0].count || 1;
                const medals = ["🥇", "🥈", "🥉"];
                return (
                  <div
                    key={r.name}
                    className="p-4 rounded-2xl bg-gradient-to-r from-brand-50/60 to-water-50/60 border border-brand-100 animate-fade-slide-up"
                    style={{ animationDelay: `${idx * 60}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-100 to-water-100 flex items-center justify-center text-2xl">
                        {medals[idx] ?? `#${idx + 1}`}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-brand-900 text-lg">
                            {r.name}
                          </span>
                          <span className="tabular-nums font-semibold text-brand-700">
                            {r.count} 次 · {r.total_grams.toFixed(1)}g
                          </span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/70 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-water-500 via-brand-500 to-indigo-500 transition-all"
                            style={{ width: `${(r.count / max) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-5 md:p-6">
          <h3 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-coral-500" />
            食欲异常分析（近30天）
          </h3>
          {appetite.length === 0 ? (
            <div className="text-sm text-brand-500 py-8 text-center">
              暂无数据
            </div>
          ) : (
            <div className="space-y-3">
              {appetite.map((a) => {
                const leftRate =
                  a.total_records === 0
                    ? 0
                    : a.leftover_records / a.total_records;
                const abnormalRate =
                  a.total_records === 0
                    ? 0
                    : a.status_sluggish_sick / a.total_records;
                const risky = leftRate > 0.3 || abnormalRate > 0.1;
                return (
                  <div
                    key={a.aquarium_id}
                    className={`p-4 rounded-2xl border ${
                      risky
                        ? "bg-red-50/60 border-red-200"
                        : "bg-white/60 border-brand-100"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-bold text-brand-900">
                          🐟 {a.aquarium_name}
                        </div>
                        <div className="text-[11px] text-brand-500 mt-0.5">
                          共 {a.total_records} 条喂食记录
                        </div>
                      </div>
                      {risky && (
                        <span className="chip bg-red-100 text-red-700">
                          ⚠️ 需关注
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-brand-600">剩食记录</span>
                          <span className="tabular-nums font-semibold text-amber-700">
                            {a.leftover_records} 次（
                            {Math.round(leftRate * 100)}%）
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${leftRate * 100}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-brand-600">状态异常</span>
                          <span className="tabular-nums font-semibold text-red-700">
                            {a.status_sluggish_sick} 次（
                            {Math.round(abnormalRate * 100)}%）
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-red-100 overflow-hidden">
                          <div
                            className="h-full bg-red-400"
                            style={{ width: `${abnormalRate * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-5 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-lg text-brand-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-coral-500" />
              库存续航预警
            </h3>
          </div>
          {stocks.length === 0 ? (
            <div className="text-sm text-brand-500 py-8 text-center">
              暂无库存数据
            </div>
          ) : (
            <div className="space-y-3">
              {stocks.map((s) => {
                const avg = calcAvgDailyUsageByType();
                const daily = avg[s.food_type] ?? 0;
                const days = calcStockDaysLeft(s.food_type);
                const critical = days !== null && days <= 7;
                const warn = days !== null && days <= 14 && !critical;
                return (
                  <div
                    key={s.id}
                    className={`p-4 rounded-2xl border ${
                      critical
                        ? "bg-gradient-to-br from-red-50 to-coral-50 border-red-200"
                        : warn
                        ? "bg-gradient-to-br from-amber-50 to-coral-50 border-amber-200"
                        : "bg-white/60 border-brand-100"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-bold text-brand-900">
                          📦 {s.food_name}
                        </div>
                        <div className="text-[11px] text-brand-500 mt-0.5">
                          剩余 {s.current_grams}g · 日均消耗{" "}
                          {daily ? daily.toFixed(2) : "—"}g
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-2xl font-display font-bold tabular-nums ${
                            critical
                              ? "text-red-600"
                              : warn
                              ? "text-coral-600"
                              : "text-water-700"
                          }`}
                        >
                          {days !== null ? days : "—"}
                        </div>
                        <div className="text-[11px] text-brand-500">剩余天数</div>
                      </div>
                    </div>
                    {(critical || warn) && (
                      <div className="mt-2 pt-2 border-t border-white/70 text-[11px]">
                        {critical
                          ? "🔴 库存告急！请立即采购"
                          : "🟡 库存偏低，建议近期补货"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  color,
  sub,
}: {
  icon: typeof Fish;
  label: string;
  value: string | number;
  suffix?: string;
  color: string;
  sub?: string;
}) {
  return (
    <div className="relative glass-card glass-card-hover p-5 overflow-hidden animate-fade-slide-up">
      <div
        className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-10 blur-2xl`}
      />
      <div className="relative flex items-start gap-4">
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br ${color} text-white flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-brand-600">{label}</div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-display text-3xl font-bold text-brand-900 tabular-nums">
              {value}
            </span>
            {suffix && (
              <span className="text-sm text-brand-500 font-medium">
                {suffix}
              </span>
            )}
          </div>
          {sub && (
            <div className="text-xs text-brand-600 mt-1 opacity-90">
              {sub}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
