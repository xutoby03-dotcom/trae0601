export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  plateNumber: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Seat {
  id: string;
  brand: string;
  model: string;
  weightRange: string;
  installationType: 'seatbelt' | 'isofix' | 'both';
  manufactureDate: string;
  expiryDate: string;
  photo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Installation {
  id: string;
  vehicleId: string;
  seatId: string;
  orientation: 'forward' | 'backward';
  installationMethod: 'seatbelt' | 'isofix';
  lastInspectionDate?: string;
  createdAt: string;
}

export interface InspectionItem {
  name: string;
  checked: boolean;
  notes?: string;
}

export interface Inspection {
  id: string;
  installationId: string;
  date: string;
  seatbeltLocked: InspectionItem;
  isofixLocked: InspectionItem;
  supportLeg: InspectionItem;
  headrestHeight: InspectionItem;
  harnessPosition: InspectionItem;
  wobbleAmount: InspectionItem;
  manualPage?: string;
  passed: boolean;
  notes?: string;
}

export interface Task {
  id: string;
  inspectionId: string;
  itemKey?: InspectionItemKey;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string;
  completedAt?: string;
}

export type ReminderType = 'child_growth' | 'winter_clothing' | 'seat_expiry' | 'recheck';

export interface Reminder {
  id: string;
  type: ReminderType;
  title: string;
  description: string;
  date: string;
  enabled: boolean;
  relatedId?: string;
  dismissed?: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  birthDate: string;
  weight: number;
  height: number;
  createdAt: string;
  updatedAt: string;
}

export type InspectionItemKey = 'seatbeltLocked' | 'isofixLocked' | 'supportLeg' | 'headrestHeight' | 'harnessPosition' | 'wobbleAmount';

export interface InspectionItemConfig {
  key: InspectionItemKey;
  label: string;
  description: string;
  instruction: string;
}

export const INSPECTION_ITEMS: InspectionItemConfig[] = [
  {
    key: 'seatbeltLocked',
    label: '安全带锁定',
    description: '检查安全带是否正确穿过座椅并完全锁定',
    instruction: '拉扯安全带确认无法松动，参考说明书第 {page} 页'
  },
  {
    key: 'isofixLocked',
    label: 'ISOFIX 接口锁定',
    description: '检查 ISOFIX 接口是否完全卡入车辆锚点',
    instruction: '听到"咔嗒"声后，尝试摇晃座椅确认牢固，参考说明书第 {page} 页'
  },
  {
    key: 'supportLeg',
    label: '支撑腿',
    description: '检查支撑腿是否完全展开并稳固支撑在车底',
    instruction: '调节支撑腿高度使其与车底紧密接触，锁止开关应处于锁定位置，参考说明书第 {page} 页'
  },
  {
    key: 'headrestHeight',
    label: '头枕高度',
    description: '检查头枕高度是否适合孩子当前身高',
    instruction: '头枕上缘应与孩子头顶平齐或略高，肩部应在肩带导槽下方，参考说明书第 {page} 页'
  },
  {
    key: 'harnessPosition',
    label: '肩带位置',
    description: '检查肩带高度和松紧度是否合适',
    instruction: '后向安装时肩带应在肩部以下或平齐，前向安装时应在肩部以上或平齐；捏起肩带测试松紧，应无法捏起多余布料，参考说明书第 {page} 页'
  },
  {
    key: 'wobbleAmount',
    label: '晃动幅度',
    description: '检查座椅安装后的稳固程度',
    instruction: '在座椅前后左右方向用力摇晃，晃动幅度不应超过 2.5 厘米，参考说明书第 {page} 页'
  }
];

export const INSTALLATION_TYPE_LABELS: Record<Seat['installationType'], string> = {
  seatbelt: '安全带固定',
  isofix: 'ISOFIX 接口',
  both: '安全带 + ISOFIX'
};

export const ORIENTATION_LABELS: Record<Installation['orientation'], string> = {
  forward: '正向安装',
  backward: '反向安装'
};

export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  child_growth: '孩子成长提醒',
  winter_clothing: '冬季厚衣提醒',
  seat_expiry: '座椅到期提醒',
  recheck: '复查提醒'
};

export const REMINDER_TYPE_COLORS: Record<ReminderType, string> = {
  child_growth: 'bg-blue-100 text-blue-700',
  winter_clothing: 'bg-cyan-100 text-cyan-700',
  seat_expiry: 'bg-red-100 text-red-700',
  recheck: 'bg-amber-100 text-amber-700'
};
