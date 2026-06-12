import type { Order, OrderStatus } from "@/types";
import { MEAL_TYPE_LABELS, ORDER_STATUS_LABELS } from "@/types";
import {
  AlertTriangle,
  ChefHat,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  UtensilsCrossed,
  Package,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatTime, getOrderStatusColor } from "@/utils/format";

interface Props {
  order: Order;
  onStatusChange: (status: OrderStatus) => void;
}

const nextStatusMap: Record<OrderStatus, OrderStatus | null> = {
  pending: "cooking",
  cooking: "completed",
  completed: null,
  cancelled: null,
};

const statusButtonConfig: Record<
  OrderStatus,
  { label: string; icon: typeof ChefHat; className: string }
> = {
  pending: {
    label: "开始制作",
    icon: ChefHat,
    className: "bg-sky-500 hover:bg-sky-600 text-white",
  },
  cooking: {
    label: "标记完成",
    icon: CheckCircle2,
    className: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  completed: {
    label: "已完成",
    icon: CheckCircle2,
    className: "bg-emerald-100 text-emerald-700 cursor-default",
  },
  cancelled: {
    label: "已取消",
    icon: AlertTriangle,
    className: "bg-red-100 text-red-700 cursor-default",
  },
};

export default function KitchenOrderCard({ order, onStatusChange }: Props) {
  const btnConfig = statusButtonConfig[order.status];
  const Icon = btnConfig.icon;
  const nextStatus = nextStatusMap[order.status];

  const handleClick = () => {
    if (nextStatus) onStatusChange(nextStatus);
  };

  return (
    <div
      className={cn(
        "group rounded-xl bg-white p-3.5 shadow-sm transition-all duration-300 hover:shadow-md",
        order.status === "cancelled" && "opacity-60",
        order.status === "completed" && "ring-1 ring-emerald-200"
      )}
    >
      {/* 头部 */}
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-semibold text-brand-900">
              {order.elderlyName}
            </h4>
            <span
              className={cn("badge border text-[10px]", getOrderStatusColor(order.status))}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-brand-500">
            <Clock className="h-3 w-3" />
            {formatTime(order.createdAt)}
            <span className="mx-1 h-1 w-1 rounded-full bg-brand-300" />
            {MEAL_TYPE_LABELS[order.mealType]}
          </div>
        </div>
      </div>

      {/* 菜品列表 */}
      <div className="mb-3 space-y-1 rounded-lg bg-brand-50/70 p-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between text-xs">
            <span className="truncate text-brand-700">
              {item.dishName}
            </span>
            <span className="ml-2 flex-shrink-0 font-medium text-brand-600">
              ×{item.quantity}
            </span>
          </div>
        ))}
      </div>

      {/* 忌口 */}
      {order.dietaryNote && (
        <div className="mb-3 flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-2.5 py-2">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-red-500" />
          <span className="text-xs font-medium text-red-700">{order.dietaryNote}</span>
        </div>
      )}

      {/* 联系信息（仅配送显示） */}
      {order.deliveryType === "delivery" && (
        <div className="mb-3 space-y-1 rounded-lg border border-violet-100 bg-violet-50/60 px-2.5 py-2 text-xs">
          <div className="flex items-center gap-1.5 text-violet-700">
            <MapPin className="h-3 w-3" />
            <span>{order.building}</span>
          </div>
          <div className="flex items-center gap-1.5 text-violet-700">
            <Phone className="h-3 w-3" />
            <span>{order.phone}</span>
          </div>
        </div>
      )}

      {/* 底部操作按钮 */}
      <button
        onClick={handleClick}
        disabled={!nextStatus}
        className={cn(
          "flex w-full items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-200",
          btnConfig.className,
          nextStatus && "active:scale-[0.98]"
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {btnConfig.label}
      </button>
    </div>
  );
}
