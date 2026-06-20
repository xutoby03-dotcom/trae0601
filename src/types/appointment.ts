export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "departed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "overdue";

export type ServiceType = "haircut" | "hairwash" | "dye" | "perm" | "care";

export type PaymentMethod = "cash" | "wechat" | "alipay" | "card";

export interface Appointment {
  id: string;
  elderId: string;
  barberId: string;
  scheduledTime: string;
  serviceType: ServiceType;
  needsShampoo: boolean;
  needsWheelchair: boolean;
  needsCompanion: boolean;
  notes: string;
  status: AppointmentStatus;
  toolsChecked: boolean;
  capeChecked: boolean;
  disinfectionChecked: boolean;
  paymentMethod: PaymentMethod | null;
  hairstylePhoto: string;
  fee: number;
  satisfaction: number;
  nextSuggestedTime: string;
  createdAt: string;
  updatedAt: string;
}

export const statusLabels: Record<AppointmentStatus, string> = {
  pending: "待确认",
  confirmed: "已确认",
  departed: "已出发",
  in_progress: "服务中",
  completed: "已完成",
  cancelled: "已取消",
  overdue: "超时未到",
};

export const statusColors: Record<AppointmentStatus, string> = {
  pending: "bg-warning-100 text-warning-600",
  confirmed: "bg-info-100 text-info-600",
  departed: "bg-primary-100 text-primary-600",
  in_progress: "bg-primary-100 text-primary-600",
  completed: "bg-success-100 text-success-600",
  cancelled: "bg-gray-100 text-gray-500",
  overdue: "bg-danger-100 text-danger-600",
};

export const serviceTypeLabels: Record<ServiceType, string> = {
  haircut: "剪发",
  hairwash: "洗发",
  dye: "染发",
  perm: "烫发",
  care: "头发护理",
};

export const serviceTypePrices: Record<ServiceType, number> = {
  haircut: 30,
  hairwash: 20,
  dye: 80,
  perm: 120,
  care: 60,
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  cash: "现金",
  wechat: "微信支付",
  alipay: "支付宝",
  card: "银行卡",
};
