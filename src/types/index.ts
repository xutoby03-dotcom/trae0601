export type SurgeryType = 'sterilization' | 'tooth_extraction' | 'debridement' | 'other';

export type AnesthesiaType = 'general' | 'local' | 'sedation';

export type CaseStatus = 'active' | 'closed';

export type VisitPlanStatus = 'pending' | 'completed' | 'missed';

export type DoctorMark = 'normal' | 'observation' | 'recheck';

export type AlertType = 'missed_visit' | 'wound_redness' | 'refuse_food' | 'recheck_schedule';

export type AlertLevel = 'normal' | 'warning' | 'danger';

export type AlertStatus = 'unread' | 'read' | 'handled' | 'ignored';

export interface PetCase {
  id: string;
  petName: string;
  ownerName: string;
  ownerPhone: string;
  surgeryType: SurgeryType;
  doctor: string;
  anesthesiaType: AnesthesiaType;
  dischargeDate: string;
  photos: string[];
  status: CaseStatus;
  createdAt: string;
}

export interface VisitPlan {
  id: string;
  caseId: string;
  dayNumber: 1 | 3 | 7;
  planDate: string;
  status: VisitPlanStatus;
}

export interface VisitRecord {
  id: string;
  caseId: string;
  planId: string;
  appetite: 1 | 2 | 3 | 4 | 5;
  spirit: 1 | 2 | 3 | 4 | 5;
  woundPhotos: string[];
  medication: string;
  defecation: string;
  abnormalDesc: string;
  doctorMark?: DoctorMark;
  doctorNote?: string;
  ownerReplied: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  caseId: string;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  status: AlertStatus;
  createdAt: string;
}

export const SURGERY_TYPE_LABELS: Record<SurgeryType, string> = {
  sterilization: '绝育手术',
  tooth_extraction: '拔牙手术',
  debridement: '清创手术',
  other: '其他手术',
};

export const ANESTHESIA_TYPE_LABELS: Record<AnesthesiaType, string> = {
  general: '全身麻醉',
  local: '局部麻醉',
  sedation: '镇静麻醉',
};

export const DOCTOR_MARK_LABELS: Record<DoctorMark, string> = {
  normal: '正常',
  observation: '需观察',
  recheck: '尽快复诊',
};

export const DOCTOR_MARK_COLORS: Record<DoctorMark, string> = {
  normal: 'bg-green-100 text-green-700',
  observation: 'bg-warning-100 text-warning-700',
  recheck: 'bg-danger-100 text-danger-700',
};

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  missed_visit: '漏回访',
  wound_redness: '伤口红肿',
  refuse_food: '拒食超过24小时',
  recheck_schedule: '复诊安排',
};

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  normal: '普通',
  warning: '警告',
  danger: '紧急',
};

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  normal: 'bg-blue-100 text-blue-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-danger-100 text-danger-700',
};
