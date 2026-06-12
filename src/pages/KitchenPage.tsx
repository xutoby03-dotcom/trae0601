import { useMemo, useState } from "react";
import { Utensils, Package, Truck, Clock, ChefHat, CheckCircle2 } from "lucide-react";
import { useStore } from "@/store";
import type { DeliveryType, MealType, Order, OrderStatus } from "@/types";
import {
  DELIVERY_TYPE_LABELS,
  MEAL_TYPE_LABELS,
} from "@/types";
import KitchenOrderCard from "@/components/KitchenOrderCard";
import MealTypeTabs from "@/components/MealTypeTabs";
import DatePickerTabs from "@/components/DatePickerTabs";
import { getDateOrders } from "@/utils/format";
import { cn } from "@/lib/utils";

const columns: { type: DeliveryType; icon: typeof Utensils; emoji: string }[] = [
  { type: "dine_in", icon: Utensils, emoji: "🍽️" },
  { type: "takeaway", icon: Package, emoji: "📦" },
  { type: "delivery", icon: Truck, emoji: "🚚" },
];

export default function KitchenPage() {
  const {
    orders,
    selectedDate,
    selectedMealType,
    setSelectedDate,
    setSelectedMealType,
    updateOrderStatus,
  } = useStore();

  const [showCompleted, setShowCompleted] = useState(false);

  const dateOrders = useMemo(
    () => getDateOrders(orders, selectedDate),
    [orders, selectedDate]
  );

  const columnsData = useMemo(() => {
    const filtered = dateOrders.filter((o) => {
      if (o.mealType !== selectedMealType) return false;
      if (o.status === "cancelled") return false;
      if (!showCompleted && o.status === "completed") return false;
      return true;
    });

    return columns.map((col) => ({
      ...col,
      orders: filtered.filter((o) => o.deliveryType === col.type),
    }));
  }, [dateOrders, selectedMealType, showCompleted]);

  const overallStats = useMemo(() => {
    const active = dateOrders.filter(
      (o) => o.mealType === selectedMealType && o.status !== "cancelled"
    );
    return {
      total: active.length,
      pending: active.filter((o) => o.status === "pending").length,
      cooking: active.filter((o) => o.status === "cooking").length,
      completed: active.filter((o) => o.status === "completed").length,
    };
  }, [dateOrders, selectedMealType]);

  const handleStatusChange = (id: string, status: OrderStatus) => {
    updateOrderStatus(id, status);
  };

  return (
    <div className="space-y-5">
      {/* 页面头部 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-900">👨‍🍳 厨房看板</h1>
          <p className="mt-1 text-sm text-brand-600">
            实时查看订单状态，分栏展示堂食/打包/配送
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm text-brand-700 hover:bg-brand-50">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="h-4 w-4 rounded border-brand-300 text-brand-500 focus:ring-brand-400"
            />
            显示已完成
          </label>
        </div>
      </div>

      {/* 状态统计条 */}
      <div className="grid grid-cols-4 gap-3">
        <StatBadge
          icon={Utensils}
          label="订单总数"
          value={overallStats.total}
          color="bg-brand-500 text-white"
        />
        <StatBadge
          icon={Clock}
          label="待备餐"
          value={overallStats.pending}
          color="bg-amber-500 text-white"
        />
        <StatBadge
          icon={ChefHat}
          label="制作中"
          value={overallStats.cooking}
          color="bg-sky-500 text-white"
        />
        <StatBadge
          icon={CheckCircle2}
          label="已完成"
          value={overallStats.completed}
          color="bg-emerald-500 text-white"
        />
      </div>

      {/* 筛选栏 */}
      <div className="card flex flex-wrap items-center justify-between gap-4 p-4">
        <DatePickerTabs value={selectedDate} onChange={setSelectedDate} />
        <MealTypeTabs
          value={selectedMealType as MealType}
          onChange={(mt) => setSelectedMealType(mt)}
        />
      </div>

      {/* 三栏看板 */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {columnsData.map((col) => (
          <div
            key={col.type}
            className={cn(
              "kanban-column",
              col.type === "dine_in" && "border-l-4 border-emerald-400",
              col.type === "takeaway" && "border-l-4 border-sky-400",
              col.type === "delivery" && "border-l-4 border-violet-400"
            )}
          >
            {/* 列标题 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-xl",
                    col.type === "dine_in" && "bg-emerald-100 text-emerald-600",
                    col.type === "takeaway" && "bg-sky-100 text-sky-600",
                    col.type === "delivery" && "bg-violet-100 text-violet-600"
                  )}
                >
                  <col.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-brand-800">
                    {DELIVERY_TYPE_LABELS[col.type]}
                  </h3>
                  <p className="text-xs text-brand-500">
                    {MEAL_TYPE_LABELS[selectedMealType as MealType]}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "flex h-7 min-w-[28px] items-center justify-center rounded-full px-2 text-sm font-bold",
                  col.type === "dine_in" && "bg-emerald-500 text-white",
                  col.type === "takeaway" && "bg-sky-500 text-white",
                  col.type === "delivery" && "bg-violet-500 text-white"
                )}
              >
                {col.orders.length}
              </span>
            </div>

            {/* 订单卡片列表 */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
              {col.orders.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-xl border-2 border-dashed border-brand-200 text-center">
                  <span className="mb-1 text-3xl opacity-40">{col.emoji}</span>
                  <p className="text-xs text-brand-400">暂无订单</p>
                </div>
              ) : (
                col.orders
                  .sort(
                    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  )
                  .map((o: Order) => (
                    <KitchenOrderCard
                      key={o.id}
                      order={o}
                      onStatusChange={(s) => handleStatusChange(o.id, s)}
                    />
                  ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Utensils;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`card flex items-center gap-3 p-3 ${color}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-white/80">{label}</p>
        <p className="text-2xl font-bold leading-tight">{value}</p>
      </div>
    </div>
  );
}
