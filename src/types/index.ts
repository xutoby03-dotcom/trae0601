export type DeviceType = "standard" | "folding" | "wheelchair" | "rollator";

export type IncidentType = "fall" | "brake_failure" | "noise" | "uneven";

export type RepairStatus = "pending" | "in_progress" | "completed";

export interface Device {
  id: string;
  type: DeviceType;
  serialNumber: string;
  userName: string;
  heightAdapt: string;
  purchaseDate: string;
  foldType: string;
  photo: string;
  createdAt: string;
  lastCheckDate: string;
  footPadUsageDays: number;
}

export interface CheckRecord {
  id: string;
  deviceId: string;
  checkDate: string;
  footPad: boolean;
  antiSlipCover: boolean;
  brakeLine: boolean;
  armrestSponge: boolean;
  foldLock: boolean;
  wheelRotation: boolean;
  inspector: string;
  notes: string;
}

export interface Incident {
  id: string;
  deviceId: string;
  type: IncidentType;
  location: string;
  photo: string;
  incidentDate: string;
  description: string;
  reporter: string;
}

export interface RepairTask {
  id: string;
  deviceId: string;
  incidentId: string;
  title: string;
  description: string;
  status: RepairStatus;
  createdAt: string;
  completedAt: string;
  assignee: string;
}

export interface CheckItem {
  key: keyof Pick<
    CheckRecord,
    | "footPad"
    | "antiSlipCover"
    | "brakeLine"
    | "armrestSponge"
    | "foldLock"
    | "wheelRotation"
  >;
  label: string;
  icon: string;
  description: string;
}

export const CHECK_ITEMS: CheckItem[] = [
  {
    key: "footPad",
    label: "脚垫",
    icon: "Footprints",
    description: "检查脚垫是否磨损、变形或脱落",
  },
  {
    key: "antiSlipCover",
    label: "防滑套",
    icon: "ShieldCheck",
    description: "检查防滑套是否完好，防滑纹路是否清晰",
  },
  {
    key: "brakeLine",
    label: "刹车线",
    icon: "CircleStop",
    description: "检查刹车线是否松动、生锈，刹车是否灵敏",
  },
  {
    key: "armrestSponge",
    label: "扶手海绵",
    icon: "Hand",
    description: "检查扶手海绵是否破损、塌陷",
  },
  {
    key: "foldLock",
    label: "折叠卡扣",
    icon: "Lock",
    description: "检查折叠卡扣是否牢固，开合是否顺畅",
  },
  {
    key: "wheelRotation",
    label: "车轮转动",
    icon: "CircleDot",
    description: "检查车轮转动是否顺畅，有无异响",
  },
];

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  fall: "外出摔倒",
  brake_failure: "刹不住车",
  noise: "异常响声",
  uneven: "推行偏斜",
};

export const DEVICE_TYPE_LABELS: Record<DeviceType, string> = {
  standard: "标准助行器",
  folding: "折叠助行器",
  wheelchair: "轮椅式助行器",
  rollator: "带轮助行器",
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  pending: "待处理",
  in_progress: "处理中",
  completed: "已完成",
};

export const FOOT_PAD_REPLACE_THRESHOLD = 90;
