export type PlantStatus = "healthy" | "warning" | "problem";
export type IssueStatus = "pending" | "processing" | "closed";
export type OperationType =
  | "watering"
  | "pruning"
  | "fertilizing"
  | "repotting"
  | "pest_control";

export interface Plant {
  id: string;
  location: string;
  species: string;
  potDiameter: number;
  supplierId: string;
  maintenanceFrequency: string;
  photoUrl: string;
  status: PlantStatus;
  createdAt: string;
  lastServiceAt?: string;
}

export interface ServicePhoto {
  id: string;
  url: string;
  type: "before" | "after" | "detail";
}

export interface ServiceRecord {
  id: string;
  plantId: string;
  staffId: string;
  checkinAt: string;
  operations: OperationType[];
  notes: string;
  photos: ServicePhoto[];
  createdAt: string;
}

export interface Issue {
  id: string;
  plantId: string;
  type: string;
  description: string;
  assignedTo: string;
  responsibleSupplierId: string;
  deadline: string;
  status: IssueStatus;
  createdAt: string;
  closedAt?: string;
  responseAt?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
}

export interface Staff {
  id: string;
  name: string;
  role: "admin" | "maintenance";
  avatar: string;
}

export interface Reminder {
  id: string;
  type: "missed_service" | "missing_photo" | "deadline_approaching";
  title: string;
  description: string;
  plantId?: string;
  issueId?: string;
  createdAt: string;
  read: boolean;
}

export const OPERATION_LABELS: Record<OperationType, string> = {
  watering: "浇水",
  pruning: "修剪",
  fertilizing: "施肥",
  repotting: "换盆",
  pest_control: "病虫处理",
};

export const PLANT_STATUS_LABELS: Record<PlantStatus, string> = {
  healthy: "健康",
  warning: "警告",
  problem: "问题",
};

export const ISSUE_STATUS_LABELS: Record<IssueStatus, string> = {
  pending: "待处理",
  processing: "处理中",
  closed: "已闭环",
};
