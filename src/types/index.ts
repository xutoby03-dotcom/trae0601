export type StationStatus = "online" | "offline" | "fault" | "maintenance";

export interface ChargingStation {
  id: string;
  code: string;
  building: string;
  location: string;
  socketCount: number;
  power: number;
  installDate: string;
  feeRule: string;
  feePerHour: number;
  photo: string;
  status: StationStatus;
  createdAt: string;
  lastInspectionAt: string | null;
  usageRate?: number;
}

export type InspectionItem =
  | "screen"
  | "socket"
  | "leakage"
  | "cable"
  | "qrcode"
  | "fireSpace"
  | "clutter";

export type ItemStatus = "normal" | "abnormal" | "skipped";

export interface InspectionRecord {
  id: string;
  taskId: string;
  stationId: string;
  inspector: string;
  inspectorId: string;
  inspectDate: string;
  items: Record<InspectionItem, ItemStatus>;
  abnormalPhotos: Partial<Record<InspectionItem, string[]>>;
  remarks: string;
  hasAbnormal: boolean;
}

export interface InspectionTask {
  id: string;
  name: string;
  date: string;
  inspector: string;
  stationIds: string[];
  completedCount: number;
  status: "pending" | "in_progress" | "completed";
}

export type RepairIssueType =
  | "no_charge"
  | "fee_error"
  | "plug_hot"
  | "qrcode_invalid"
  | "other";

export type RepairStatus =
  | "pending"
  | "processing"
  | "maintenance"
  | "completed"
  | "cancelled";

export interface RepairTimelineItem {
  time: string;
  action: string;
  operator: string;
  note?: string;
}

export interface RepairTicket {
  id: string;
  ticketNo: string;
  stationId: string;
  issueType: RepairIssueType;
  description: string;
  photos: string[];
  reporterName: string;
  reporterPhone: string;
  reporterBuilding: string;
  status: RepairStatus;
  createdAt: string;
  assignee: string | null;
  assignedAt: string | null;
  completedAt: string | null;
  resolution: string | null;
  timeline: RepairTimelineItem[];
}

export interface PartItem {
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface MaintenanceRecord {
  id: string;
  stationId: string;
  repairTicketId?: string;
  faultReason: string;
  faultCategory: string;
  partsReplaced: PartItem[];
  totalCost: number;
  technician: string;
  technicianPhone: string;
  startedAt: string;
  completedAt: string;
  notes: string;
  beforePhotos: string[];
  afterPhotos: string[];
  stationStatusAfter: StationStatus;
}

export type AlertType = "inspection_abnormal" | "repair_ticket" | "maintenance";

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  stationId?: string;
  timestamp: string;
  priority: "low" | "medium" | "high";
  read: boolean;
}

export const INSPECTION_ITEM_LABELS: Record<InspectionItem, string> = {
  screen: "显示屏",
  socket: "插座",
  leakage: "漏电保护器",
  cable: "线缆外观",
  qrcode: "二维码",
  fireSpace: "消防间距",
  clutter: "周边堆物",
};

export const REPAIR_ISSUE_LABELS: Record<RepairIssueType, string> = {
  no_charge: "充不进电",
  fee_error: "扣费异常",
  plug_hot: "插头发热",
  qrcode_invalid: "二维码失效",
  other: "其他问题",
};

export const STATION_STATUS_LABELS: Record<StationStatus, string> = {
  online: "在线",
  offline: "离线",
  fault: "故障",
  maintenance: "维修中",
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: "待处理",
  processing: "处理中",
  maintenance: "维修中",
  completed: "已完成",
  cancelled: "已取消",
};
