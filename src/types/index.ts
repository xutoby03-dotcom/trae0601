export type RepairStatus =
  | "pending"
  | "processing"
  | "waiting_parts"
  | "completed"
  | "scrapped";

export type UserRole = "teacher" | "repair_staff" | "admin";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
}

export interface Instrument {
  id: string;
  type: string;
  brand: string;
  classroom: string;
  teacherId: string;
  photo: string;
  createdAt: string;
}

export interface RepairOrder {
  id: string;
  instrumentId: string;
  faultDescription: string;
  impactLevel: 1 | 2 | 3 | 4 | 5;
  affectClass: boolean;
  reporterId: string;
  faultPhoto: string;
  status: RepairStatus;
  createdAt: string;
  closedAt?: string;
}

export interface RepairLog {
  id: string;
  repairId: string;
  fromStatus: RepairStatus | null;
  toStatus: RepairStatus;
  handlerId: string;
  note: string;
  createdAt: string;
}

export const STATUS_META: Record<
  RepairStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  pending: {
    label: "待接单",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    dotColor: "bg-amber-500",
  },
  processing: {
    label: "处理中",
    color: "text-blue-700",
    bgColor: "bg-blue-500/10",
    dotColor: "bg-blue-600",
  },
  waiting_parts: {
    label: "待配件",
    color: "text-purple-700",
    bgColor: "bg-purple-500/10",
    dotColor: "bg-violetpurple-500",
  },
  completed: {
    label: "已修好",
    color: "text-forest-600",
    bgColor: "bg-forest-500/10",
    dotColor: "bg-forest-500",
  },
  scrapped: {
    label: "报废",
    color: "text-brick-600",
    bgColor: "bg-brick-500/10",
    dotColor: "bg-brick-500",
  },
};

export const STATUS_FLOW: Record<RepairStatus, RepairStatus[]> = {
  pending: ["processing"],
  processing: ["waiting_parts", "completed", "scrapped"],
  waiting_parts: ["processing", "scrapped"],
  completed: [],
  scrapped: [],
};

export const INSTRUMENT_TYPES = [
  "小提琴",
  "大提琴",
  "中提琴",
  "低音提琴",
  "长笛",
  "短笛",
  "单簧管",
  "双簧管",
  "萨克斯",
  "小号",
  "圆号",
  "长号",
  "大号",
  "钢琴",
  "电子琴",
  "手风琴",
  "吉他",
  "尤克里里",
  "竖琴",
  "架子鼓",
  "定音鼓",
  "木琴",
  "琵琶",
  "二胡",
  "古筝",
  "扬琴",
  "笛子",
  "唢呐",
  "笙",
  "其他",
];

export const CLASSROOMS = [
  "音乐教室A101",
  "音乐教室A102",
  "音乐教室A103",
  "音乐教室B201",
  "音乐教室B202",
  "音乐教室B203",
  "管弦乐排练厅",
  "民乐排练厅",
  "钢琴练习室1",
  "钢琴练习室2",
  "打击乐专用室",
  "乐器储藏室",
];
