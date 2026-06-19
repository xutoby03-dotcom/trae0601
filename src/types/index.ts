export type ProductCategory = "summer" | "autumn" | "sports" | "vest" | "pants";

export const PRODUCT_CATEGORY_LABELS: Record<ProductCategory, string> = {
  summer: "夏装",
  autumn: "秋装",
  sports: "运动服",
  vest: "马甲",
  pants: "校裤",
};

export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];

export interface Student {
  id: string;
  className: string;
  name: string;
  height: number;
  weight: number;
  originalSize: Size;
  phone: string;
  remark: string;
  createdAt: string;
}

export interface Product {
  id: string;
  category: ProductCategory;
  name: string;
  sizeChart: Record<Size, { height: string; weight: string }>;
  stock: Record<Size, number>;
  price: number;
  supplier: string;
  createdAt: string;
}

export type PaymentStatus = "unpaid" | "paid";
export type OrderStatus = "pending" | "purchasing" | "ready" | "completed";
export type OriginalCondition = "good" | "damaged" | "lost";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  unpaid: "待付款",
  paid: "已付款",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "待处理",
  purchasing: "采购中",
  ready: "可发放",
  completed: "已完成",
};

export const ORIGINAL_CONDITION_LABELS: Record<OriginalCondition, string> = {
  good: "完好",
  damaged: "破损",
  lost: "丢失",
};

export interface Order {
  id: string;
  studentId: string;
  productId: string;
  size: Size;
  quantity: number;
  isExchange: boolean;
  originalSize?: Size;
  originalCondition?: OriginalCondition;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  remark: string;
  createdAt: string;
}

export type PurchaseStatus = "pending" | "completed";

export const PURCHASE_STATUS_LABELS: Record<PurchaseStatus, string> = {
  pending: "待采购",
  completed: "已入库",
};

export interface Purchase {
  id: string;
  productId: string;
  size: Size;
  quantity: number;
  supplier: string;
  status: PurchaseStatus;
  createdAt: string;
  completedAt?: string;
}

export const CLASSES = ["一年级1班", "一年级2班", "一年级3班", "二年级1班", "二年级2班"];
