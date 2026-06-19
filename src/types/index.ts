export interface PhotoItem {
  url: string;
  label?: string;
}

export type Species = "mouse" | "zebrafish" | "rat" | "rabbit";
export type CageStatus = "normal" | "warning" | "isolated" | "empty";
export type TaskStatus = "pending" | "in_progress" | "completed" | "overdue";
export type OperationType =
  | "weighing"
  | "cage_change"
  | "water_change"
  | "isolation"
  | "death";
export type AlertType =
  | "overdue_feeding"
  | "temperature_abnormal"
  | "humidity_abnormal"
  | "abnormal_behavior";
export type AlertSeverity = "high" | "medium" | "low";

export interface ResearchGroup {
  id: string;
  name: string;
  leader: string;
}

export interface Cage {
  id: string;
  cageNumber: string;
  species: Species;
  animalCount: number;
  researchGroupId: string;
  responsiblePerson: string;
  housingConditions: string;
  photoUrl: string;
  status: CageStatus;
  createdAt: string;
}

export interface DailyTask {
  id: string;
  cageId: string;
  taskDate: string;
  status: TaskStatus;
  feedAmount: number | null;
  waterStatus: string | null;
  beddingStatus: string | null;
  temperature: number | null;
  humidity: number | null;
  healthObservation: string | null;
  abnormalPhotos: PhotoItem[];
  completedAt: string | null;
  completedBy: string | null;
}

export interface OperationRecord {
  id: string;
  cageId: string;
  type: OperationType;
  weight?: number;
  fromCage?: string;
  toCage?: string;
  waterChanged?: boolean;
  isolationReason?: string;
  deathReason?: string;
  operator: string;
  createdAt: string;
  notes?: string;
}

export interface Alert {
  id: string;
  cageId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  resolved: boolean;
  createdAt: string;
}

export const SPECIES_LABEL: Record<Species, string> = {
  mouse: "小鼠",
  zebrafish: "斑马鱼",
  rat: "大鼠",
  rabbit: "兔",
};

export const CAGE_STATUS_LABEL: Record<CageStatus, string> = {
  normal: "正常",
  warning: "警告",
  isolated: "隔离中",
  empty: "空置",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  pending: "待执行",
  in_progress: "进行中",
  completed: "已完成",
  overdue: "已逾期",
};

export const OPERATION_TYPE_LABEL: Record<OperationType, string> = {
  weighing: "称重",
  cage_change: "换笼",
  water_change: "换水",
  isolation: "隔离",
  death: "死亡记录",
};

export const ALERT_TYPE_LABEL: Record<AlertType, string> = {
  overdue_feeding: "逾期未喂",
  temperature_abnormal: "温度超标",
  humidity_abnormal: "湿度异常",
  abnormal_behavior: "异常行为",
};
