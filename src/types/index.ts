export type HairLength = "short" | "medium" | "long";

export interface Pet {
  id: string;
  name: string;
  breed: string;
  weight: number;
  hairLength: HairLength;
  allergies: string[];
  temperament: string;
  photoUrl: string;
  createdAt: Date;
}

export type StepType =
  | "reception"
  | "bath"
  | "dry"
  | "trim"
  | "ear_paw_care"
  | "photo_delivery";

export type StepStatus = "pending" | "in_progress" | "completed";

export interface OrderStep {
  id: string;
  orderId: string;
  stepType: StepType;
  status: StepStatus;
  startTime?: Date;
  endTime?: Date;
  employeeId?: string;
  photoUrl?: string;
  notes?: string;
}

export type AbnormalityType = "skin_redness" | "severe_matting" | "nail_bleeding";

export interface Abnormality {
  id: string;
  orderId: string;
  type: AbnormalityType;
  description: string;
  photoUrl?: string;
  notifiedOwner: boolean;
  createdAt: Date;
}

export type OrderStatus = "queuing" | "in_progress" | "completed" | "overdue";

export interface Order {
  id: string;
  petId: string;
  pet: Pet;
  queueNumber: string;
  status: OrderStatus;
  packageId: string;
  package: ServicePackage;
  steps: OrderStep[];
  abnormalities: Abnormality[];
  createdAt: Date;
  estimatedFinish: Date;
  ownerPhone: string;
}

export type EmployeeRole = "groomer" | "receptionist" | "manager";

export interface Employee {
  id: string;
  name: string;
  role: EmployeeRole;
  avatarUrl: string;
  currentLoad: number;
}

export interface ServicePackage {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  repurchaseCount: number;
  description: string;
}

export const STEP_META: Record<
  StepType,
  { name: string; icon: string; order: number; estimatedMinutes: number }
> = {
  reception: { name: "接待", icon: "ClipboardList", order: 0, estimatedMinutes: 5 },
  bath: { name: "洗澡", icon: "Bath", order: 1, estimatedMinutes: 20 },
  dry: { name: "吹干", icon: "Wind", order: 2, estimatedMinutes: 15 },
  trim: { name: "修剪", icon: "Scissors", order: 3, estimatedMinutes: 30 },
  ear_paw_care: { name: "耳爪护理", icon: "PawPrint", order: 4, estimatedMinutes: 10 },
  photo_delivery: { name: "拍照交付", icon: "Camera", order: 5, estimatedMinutes: 5 },
};

export const ABNORMALITY_META: Record<
  AbnormalityType,
  { name: string; color: string }
> = {
  skin_redness: { name: "皮肤红点", color: "danger" },
  severe_matting: { name: "打结严重", color: "warning" },
  nail_bleeding: { name: "指甲出血", color: "danger" },
};

export const HAIR_LENGTH_META: Record<HairLength, string> = {
  short: "短毛",
  medium: "中毛",
  long: "长毛",
};
