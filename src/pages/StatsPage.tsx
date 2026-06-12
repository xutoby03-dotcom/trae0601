import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useStore } from "@/store";
import type { Order } from "@/types";
import { BUILDING_OPTIONS, MEAL_TYPE_LABELS } from "@/types";
import {
  formatDate,
  getDateOrders,
  orderTotalPrice,
} from "@/utils/format";
import {
  TrendingUp,
  Percent,
  UtensilsCrossed,
  Truck,
  AlertTriangle,
  Trophy,
  Calendar,
} from "lucide-react";

export default function StatsPage() {
  const { orders, dishes, selectedDate } = useStore();

  // 今日统计
  const todayStats = useMemo(() => {
    const todayOrders = getDateOrders(orders, selectedDate);
    const validOrders = todayOrders.filter((o) => o.status !== "cancelled");
    const cancelled = todayOrders.filter((o) => o.status === "cancelled");
    const delivery = validOrders.filter((o) => o.deliveryType === "delivery");

    // 菜品预订排行
    const dishCount = new Map<string, number>();
    validOrders.forEach((o) => {
      o.items.forEach((item) => {
        dishCount.set(item.dishName, (dishCount.get(item.dishName) || 0) + item.quantity);
      });
    });
    const topDishes = Array.from(dishCount.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // 楼栋配送分布
    const buildingCount = new Map<string, number>();
    delivery.forEach((o) => {
      buildingCount.set(o.building, (buildingCount.get(o.building) || 0) + 1);
    });
    const buildingStats = BUILDING_OPTIONS.map((b) => ({
      name: b,
      count: buildingCount.get(b) || 0,
    }));

    const revenue = validOrders.reduce((s, o) => s + orderTotalPrice(o), 0);

    return {
      total: todayOrders.length,
      valid: validOrders.length,
      cancelled: cancelled.length,
      cancelRate:
        todayOrders.length > 0
          ? Math.round((cancelled.length / todayOrders.length) * 100)
          : 0,
      delivery: delivery.length,
      revenue,
      topDishes,
      buildingStats,
    };
  }, [orders, selectedDate]);

  // 近7天趋势
  const trendData = useMemo(() => {
    const result = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d.toISOString());
      const dayOrders = getDateOrders(orders, dateStr);
      const valid = dayOrders.filter((o: Order) => o.status !== "cancelled");
      const cancelled = dayOrders.filter((o: Order) => o.status === "cancelled");
      result.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        预订数: valid.length,
        取消数: cancelled.length,
      });
    }
    return result;
  }, [orders]);

  // 餐别分布
  const mealDistribution = useMemo(() => {
    const valid = orders.filter((o) => {
      const d = formatDate(o.createdAt);
      return (
        d === selectedDate && o.status !== "cancelled"
      );
    });
    const counts: Record<string, number> = { breakfast: 0, lunch: 0, dinner: 0 };
    valid.forEach((o) => {
      counts[o.mealType] = (counts[o.mealType] || 0) + 1;
    });
    return (Object.keys(counts) as Array<keyof typeof counts>).map((k) => ({
      name: MEAL_TYPE_LABELS[k],
      value: counts[k],
    }));
  }, [orders, selectedDate]);

  const PIE_COLORS = ["#F97316", "#FB923C", "#FED7AA"];

  // 配送压力分级
  const getPressureLevel = (count: number) => {
    if (count === 0) return { label: "无压力", color: "bg-gray-100 text-gray-500" };
    if (count <= 2) return { label: "轻松", color: "bg-emerald-100 text-emerald-700" };
    if (count <= 5) return { label: "适中", color: "bg-sky-100 text-sky-700" };
    if (count <= 8) return { label: "较忙", color: "bg-amber-100 text-amber-700" };
    return { label: "繁忙", color: "bg-red-100 text-red-700" };
  };

  return (
    <div className="space-y-6">
      {/* 页面头部 */}
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-900">📈 统计分析</h1>
        <p className="mt-1 text-sm text-brand-600">
          查看预订数据、取消率、菜品排行和配送压力分析
        </p>
      </div>

      {/* 核心数据卡片 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          icon={UtensilsCrossed}
          label="今日预订"
          value={todayStats.valid}
          suffix="份"
          gradient="from-brand-400 to-brand-500"
          emoji="🍱"
        />
        <MetricCard
          icon={Percent}
          label="取消率"
          value={todayStats.cancelRate}
          suffix="%"
          gradient={
            todayStats.cancelRate > 20
              ? "from-red-400 to-red-500"
              : "from-emerald-400 to-emerald-500"
          }
          emoji={todayStats.cancelRate > 20 ? "⚠️" : "✅"}
          trend={todayStats.cancelRate > 20 ? "偏高" : "正常"}
          trendColor={todayStats.cancelRate > 20 ? "text-red-100" : "text-emerald-100"}
        />
        <MetricCard
          icon={Truck}
          label="上门配送"
          value={todayStats.delivery}
          suffix="单"
          gradient="from-violet-400 to-violet-500"
          emoji="🚚"
        />
        <MetricCard
          icon={TrendingUp}
          label="今日营收"
          value={todayStats.revenue}
          suffix="元"
          gradient="from-sky-400 to-sky-500"
          emoji="💰"
        />
      </div>

      {/* 图表区 - 第一行 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 近7天趋势 */}
        <div className="card col-span-1 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-900">
              <Calendar className="h-5 w-5 text-brand-500" />
              近7天预订趋势
            </h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#FED7AA" vertical={false} />
                <XAxis dataKey="date" stroke="#9A3412" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9A3412" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#FFF7ED",
                    border: "1px solid #FED7AA",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="预订数"
                  stroke="#F97316"
                  strokeWidth={3}
                  dot={{ fill: "#F97316", r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="取消数"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#EF4444", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 餐别分布 */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-brand-900">
            🍽️ 今日餐别分布
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mealDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name} ${value}`}
                  labelLine={false}
                >
                  {mealDistribution.map((_, idx) => (
                    <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 图表区 - 第二行 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 菜品排行 */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-brand-900">
            <Trophy className="h-5 w-5 text-amber-500" />
            最受欢迎菜品 Top 10
          </h3>
          {todayStats.topDishes.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-brand-400">
              暂无数据
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={todayStats.topDishes}
                  layout="vertical"
                  margin={{ top: 5, right: 20, bottom: 5, left: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#FED7AA" horizontal={false} />
                  <XAxis type="number" stroke="#9A3412" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="#9A3412"
                    fontSize={12}
                    width={75}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#FFF7ED",
                      border: "1px solid #FED7AA",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    formatter={(v: number) => [`${v} 份`, "预订"]}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {todayStats.topDishes.map((_, idx) => (
                      <Cell
                        key={idx}
                        fill={
                          idx === 0
                            ? "url(#goldGradient)"
                            : idx === 1
                            ? "url(#silverGradient)"
                            : idx === 2
                            ? "url(#bronzeGradient)"
                            : "#FB923C"
                        }
                      />
                    ))}
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#FBBF24" />
                      </linearGradient>
                      <linearGradient id="silverGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#94A3B8" />
                        <stop offset="100%" stopColor="#CBD5E1" />
                      </linearGradient>
                      <linearGradient id="bronzeGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#B45309" />
                        <stop offset="100%" stopColor="#D97706" />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* 楼栋配送压力热力图 */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-brand-900">
            <AlertTriangle className="h-5 w-5 text-violet-500" />
            上门配送压力分布
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {todayStats.buildingStats.map((b) => {
              const level = getPressureLevel(b.count);
              return (
                <div
                  key={b.name}
                  className="flex items-center justify-between rounded-xl border border-brand-100 bg-white p-3 transition-all hover:shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                      {b.name.replace("号楼", "")}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-brand-800">{b.name}</p>
                      <p className="text-xs text-brand-500">{b.count} 单需配送</p>
                    </div>
                  </div>
                  <span className={`badge ${level.color}`}>{level.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  gradient,
  emoji,
  trend,
  trendColor,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: number;
  suffix?: string;
  gradient: string;
  emoji?: string;
  trend?: string;
  trendColor?: string;
}) {
  return (
    <div className={`card bg-gradient-to-br ${gradient} p-5 text-white shadow-lg`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/80">{label}</p>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-3xl font-bold">{value}</span>
            {suffix && <span className="text-sm text-white/80">{suffix}</span>}
          </div>
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trendColor || "text-white/80"}`}>
              {trend}
            </p>
          )}
        </div>
        {emoji && <span className="text-2xl">{emoji}</span>}
      </div>
    </div>
  );
}
