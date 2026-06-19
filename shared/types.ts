export type ProductCategory = "chicken_feet" | "duck_neck" | "tofu" | "other";

export type SampleStatus = "active" | "expiring" | "expired" | "destroyed";

export type IncidentType = "complaint" | "odor" | "temperature" | "other";

export type IncidentStatus = "pending" | "investigating" | "resolved";

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  formulaBatch: string;
  processor: string;
  cookTime: string;
  salesWindow: string;
  photoUrl: string;
  isOnSale: boolean;
  hasSample: boolean;
  createdAt: string;
}

export interface Sample {
  id: string;
  productId: string;
  product?: Product;
  weight: number;
  containerNo: string;
  fridgeSlot: string;
  startTime: string;
  expireTime: string;
  status: SampleStatus;
  destructionPhoto?: string;
  destructionPerson?: string;
  destructionTime?: string;
}

export interface Incident {
  id: string;
  type: IncidentType;
  description: string;
  sampleId?: string;
  sample?: Sample;
  occurTime: string;
  reporter: string;
  status: IncidentStatus;
}

export interface CategoryCompletion {
  category: ProductCategory;
  name: string;
  required: number;
  done: number;
  completionRate: number;
}

export interface DashboardStats {
  todaySamplesRequired: number;
  todaySamplesDone: number;
  pendingDestruction: number;
  activeIncidents: number;
  fridgeOccupancy: number;
  fridgeCapacity: number;
  categoryCompletion: CategoryCompletion[];
}

export const CATEGORY_NAMES: Record<ProductCategory, string> = {
  chicken_feet: "卤鸡爪",
  duck_neck: "卤鸭脖",
  tofu: "卤豆干",
  other: "其他卤味",
};

export const SAMPLE_STATUS_NAMES: Record<SampleStatus, string> = {
  active: "留样中",
  expiring: "即将到期",
  expired: "已到期",
  destroyed: "已销毁",
};

export const INCIDENT_TYPE_NAMES: Record<IncidentType, string> = {
  complaint: "售卖投诉",
  odor: "异味",
  temperature: "温度异常",
  other: "其他异常",
};

export const INCIDENT_STATUS_NAMES: Record<IncidentStatus, string> = {
  pending: "待处理",
  investigating: "调查中",
  resolved: "已解决",
};
