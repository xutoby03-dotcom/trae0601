import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  UtensilsCrossed,
  ClipboardList,
  ChefHat,
  BarChart3,
  ArrowRight,
  Clock,
  AlertTriangle,
  Truck,
  Calendar,
} from "lucide-react";
import { useStore } from "@/store";
import {
  formatDate,
  getDateOrders,
  getOrderedCount,
  orderTotalPrice,
} from "@/utils/format";
import { cn } from "@/lib/utils";
import {
  MEAL_TYPE_LABELS,
  ORDER_STATUS_LABELS,
} from "@/types";

const todayStr = () => {
  const d = new Date();
  return formatDate(d.toISOString());
};

export default function Home() {
  const { dishes, orders, selectedDate } = useStore();
  const today = todayStr();
  const viewDate = selectedDate || today;

  const stats = useMemo(() => {
    const todayOrders = getDateOrders(orders, viewDate);
    const valid = todayOrders.filter((o) => o.status !== "cancelled");
    const cancelled = todayOrders.filter((o) => o.status === "cancelled");
    const delivery = valid.filter((o) => o.deliveryType === "delivery");
    const pending = valid.filter((o) => o.status === "pending");
    const cooking = valid.filter((o) => o.status === "cooking");
    const revenue = valid.reduce((s, o) => s + orderTotalPrice(o), 0);

    return {
      total: todayOrders.length,
      valid: valid.length,
      cancelled: cancelled.length,
      cancelRate:
        todayOrders.length > 0
          ? Math.round((cancelled.length / todayOrders.length) * 100)
          : 0,
      delivery: delivery.length,
      pending: pending.length,
      cooking: cooking.length,
      revenue,
    };
  }, [orders, viewDate]);

  // 今日热门菜品
  const hotDishes = useMemo(() => {
    const todayDishes = dishes.filter((d) => d.date === viewDate);
    return todayDishes
      .map((d) => ({
        ...d,
        ordered: getOrderedCount(d.id, orders),
      }))
      .sort((a, b) => b.ordered - a.ordered)
      .slice(0, 5);
  }, [dishes, orders, viewDate]);

  // 最近订单
  const recentOrders = useMemo(() => {
    return getDateOrders(orders, viewDate)
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [orders, viewDate]);

  const quickLinks = [
    {
      to: "/menu",
      label: "菜单管理",
      icon: UtensilsCrossed,
      emoji: "🍱",
      desc: "维护每日菜品",
      color: "from-brand-400 to-brand-500",
    },
    {
      to: "/orders",
      label: "订餐登记",
      icon: ClipboardList,
      emoji: "📋",
      desc: "录入老人订餐",
      color: "from-sky-400 to-sky-500",
    },
    {
      to: "/kitchen",
      label: "厨房看板",
      icon: ChefHat,
      emoji: "👨‍🍳",
      desc: "后厨出餐进度",
      color: "from-emerald-400 to-emerald-500",
    },
    {
      to: "/stats",
      label: "数据统计",
      icon: BarChart3,
      emoji: "📊",
      desc: "查看分析报告",
      color: "from-violet-400 to-violet-500",
    },
  ];

  const now = new Date();
  const greeting = (() => {
    const h = now.getHours();
    if (h < 9) return { text: "早上好", emoji: "🌅" };
    if (h < 13) return { text: "中午好", emoji: "☀️" };
    if (h < 18) return { text: "下午好", emoji: "🌤️" };
    return { text: "晚上好", emoji: "🌙" };
  })();

  return (
    <div className="space-y-6">
      {/* 欢迎头部 */}
      <div className="card relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600 p-6 text-white shadow-lg">
        <div className="absolute -right-8 -top-8 text-[160px] opacity-10">🍲</div>
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/80">
              <Calendar className="mr-1 inline h-4 w-4" />
              {now.toLocaleDateString("zh-CN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "long",
              })}
            </p>
            <h1 className="mt-1 font-serif text-3xl font-bold">
              {greeting.emoji} {greeting.text}，管理员
            </h1>
            <p className="mt-1 text-white/80">
              今天共收到 {stats.total} 个订餐，已完成备餐的有 {stats.valid - stats.pending - stats.cooking} 份
            </p>
          </div>
          <div className="flex items-center gap-6 rounded-2xl bg-white/10 px-6 py-3 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-2xl font-bold">{stats.valid}</p>
              <p className="text-xs text-white/70">有效订单</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">¥{stats.revenue}</p>
              <p className="text-xs text-white/70">今日营收</p>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷入口 */}
      <div>
        <h2 className="mb-3 font-serif text-lg font-semibold text-brand-900">快捷操作</h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="group card card-hover block overflow-hidden p-5"
              >
                <div
                  className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${link.color} text-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110`}
                >
                  {link.emoji}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-brand-900">{link.label}</h3>
                    <p className="mt-0.5 text-sm text-brand-500">{link.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-brand-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-brand-500" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 实时状态 */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-brand-900">
            <Clock className="h-5 w-5 text-brand-500" />
            实时出餐状态
          </h3>
          <div className="space-y-3">
            <StatusRow
              label="待备餐"
              value={stats.pending}
              color="bg-amber-500"
              emoji="⏳"
            />
            <StatusRow
              label="制作中"
              value={stats.cooking}
              color="bg-sky-500"
              emoji="🔥"
            />
            <StatusRow
              label="待配送"
              value={stats.delivery}
              color="bg-violet-500"
              emoji="🚚"
            />
            <StatusRow
              label="已取消"
              value={stats.cancelled}
              color="bg-red-500"
              emoji="❌"
              showRate
              rate={stats.cancelRate}
            />
          </div>

          {stats.cancelRate > 15 && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-700">取消率偏高</p>
                <p className="mt-0.5 text-xs text-red-600">
                  建议确认是否存在菜品质量或登记问题
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 热门菜品 */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold text-brand-900">
            🏆 今日热门菜品
          </h3>
          {hotDishes.length === 0 || hotDishes.every((d) => d.ordered === 0) ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-brand-400">
              <span className="mb-2 text-4xl">🍽️</span>
              <p>今日暂无预订数据</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {hotDishes.map((d, idx) => (
                <div
                  key={d.id}
                  className="flex items-center gap-3 rounded-xl bg-brand-50/50 p-2.5"
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold",
                      idx === 0 && "bg-gradient-to-br from-amber-400 to-amber-500 text-white",
                      idx === 1 && "bg-gradient-to-br from-slate-400 to-slate-500 text-white",
                      idx === 2 && "bg-gradient-to-br from-orange-400 to-orange-500 text-white",
                      idx > 2 && "bg-brand-100 text-brand-600"
                    )}
                  >
                    {idx + 1}
                  </div>
                  <img
                    src={d.image}
                    alt={d.name}
                    className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-brand-800">{d.name}</p>
                    <p className="text-xs text-brand-500">
                      {MEAL_TYPE_LABELS[d.mealType]}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-brand-600">{d.ordered}</p>
                    <p className="text-[10px] text-brand-400">份</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 最近订单 */}
        <div className="card p-5">
          <h3 className="mb-4 flex items-center justify-between font-serif text-lg font-semibold text-brand-900">
            <span className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-brand-500" />
              最近订单
            </span>
            <Link
              to="/orders"
              className="text-xs font-normal text-brand-500 hover:text-brand-700"
            >
              查看全部 →
            </Link>
          </h3>
          {recentOrders.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-center text-brand-400">
              <span className="mb-2 text-4xl">📭</span>
              <p>今日暂无订单</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentOrders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-xl border border-brand-100 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-brand-800 truncate">
                        {o.elderlyName}
                      </span>
                      {o.deliveryType === "delivery" && (
                        <Truck className="h-3 w-3 text-violet-500" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-brand-500">
                      {o.items.map((i) => i.dishName).join("、")}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "badge border ml-2 flex-shrink-0",
                      o.status === "pending" && "bg-brand-50 text-brand-700 border-brand-200",
                      o.status === "cooking" && "bg-sky-50 text-sky-700 border-sky-200",
                      o.status === "completed" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                      o.status === "cancelled" && "bg-red-50 text-red-700 border-red-200"
                    )}
                  >
                    {ORDER_STATUS_LABELS[o.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  color,
  emoji,
  showRate,
  rate,
}: {
  label: string;
  value: number;
  color: string;
  emoji: string;
  showRate?: boolean;
  rate?: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-brand-50/60 px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-xl">{emoji}</span>
        <div>
          <p className="text-sm font-medium text-brand-800">{label}</p>
          {showRate && rate !== undefined && (
            <p className="text-[11px] text-brand-500">占比 {rate}%</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="text-xl font-bold text-brand-800">{value}</span>
      </div>
    </div>
  );
}
