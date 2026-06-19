import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus, PurchaseStatus } from "@/types";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  PURCHASE_STATUS_LABELS,
} from "@/types";

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-zinc-100 text-zinc-700 border-zinc-200",
  purchasing: "bg-blue-50 text-blue-700 border-blue-200",
  ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
  completed: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  unpaid: "bg-red-50 text-red-700 border-red-200",
  paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const purchaseStatusStyles: Record<PurchaseStatus, string> = {
  pending: "bg-accent-50 text-accent-700 border-accent-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("badge border", orderStatusStyles[status])}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={cn("badge border", paymentStatusStyles[status])}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}

export function PurchaseStatusBadge({ status }: { status: PurchaseStatus }) {
  return (
    <span className={cn("badge border", purchaseStatusStyles[status])}>
      {PURCHASE_STATUS_LABELS[status]}
    </span>
  );
}

export function StockBadge({ count }: { count: number }) {
  if (count === 0) {
    return <span className="badge bg-red-100 text-red-700 border border-red-200">缺货</span>;
  }
  if (count <= 3) {
    return <span className="badge bg-accent-50 text-accent-700 border border-accent-200">低库存 {count}</span>;
  }
  return <span className="badge bg-emerald-50 text-emerald-700 border border-emerald-200">{count} 件</span>;
}
