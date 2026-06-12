import type { Dish, Order } from "@/types";
import {
  DISH_TYPE_LABELS,
  MEAL_TYPE_LABELS,
  ORDER_STATUS_LABELS,
  DELIVERY_TYPE_LABELS,
} from "@/types";

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${m}-${day} ${h}:${min}`;
};

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
};

export const formatCurrency = (n: number) => `¥${n.toFixed(0)}`;

export const getDishTypeLabel = (t: string) =>
  DISH_TYPE_LABELS[t as keyof typeof DISH_TYPE_LABELS] || t;

export const getMealTypeLabel = (t: string) =>
  MEAL_TYPE_LABELS[t as keyof typeof MEAL_TYPE_LABELS] || t;

export const getOrderStatusLabel = (t: string) =>
  ORDER_STATUS_LABELS[t as keyof typeof ORDER_STATUS_LABELS] || t;

export const getDeliveryTypeLabel = (t: string) =>
  DELIVERY_TYPE_LABELS[t as keyof typeof DELIVERY_TYPE_LABELS] || t;

export const getDishTypeColor = (t: string) => {
  switch (t) {
    case "meat":
      return "bg-red-50 text-red-700 border-red-200";
    case "vegetarian":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "mixed":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getOrderStatusColor = (t: string) => {
  switch (t) {
    case "pending":
      return "bg-brand-50 text-brand-700 border-brand-200";
    case "cooking":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "completed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getDeliveryTypeColor = (t: string) => {
  switch (t) {
    case "dine_in":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "takeaway":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "delivery":
      return "bg-violet-50 text-violet-700 border-violet-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getOrderedCount = (dishId: string, orders: Order[]) => {
  return orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => {
      const item = o.items.find((i) => i.dishId === dishId);
      return sum + (item?.quantity || 0);
    }, 0);
};

export const getDateOrders = (orders: Order[], dateStr: string) => {
  return orders.filter((o) => formatDate(o.createdAt) === dateStr);
};

export const genDateList = (days: number) => {
  const list: { value: string; label: string; weekday: string }[] = [];
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  for (let i = -3; i <= days - 3; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const value = `${y}-${m}-${day}`;
    list.push({
      value,
      label: `${m}/${day}`,
      weekday: i === 0 ? "今天" : weekdays[d.getDay()],
    });
  }
  return list;
};

export const orderTotalPrice = (order: Order) =>
  order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export { formatDate as formatDishDate };
