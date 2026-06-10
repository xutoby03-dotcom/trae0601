export type DocumentType = 'id_card' | 'passport' | 'driver_license' | 'hk_macau_permit' | 'bank_card' | 'other';

export type ProcessStatus = 'not_started' | 'appointment' | 'submitted' | 'waiting' | 'completed';

export type DocumentStatus = 'expired' | 'expiring_soon' | 'valid' | 'long_term';

export interface Document {
  id: string;
  type: DocumentType;
  holder: string;
  expireDate: string;
  issueLocation: string;
  photo: string;
  needAnnualReview: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
  remindDays: number;
  processStatus: ProcessStatus;
}

export interface Material {
  id: string;
  documentId: string;
  name: string;
  isReady: boolean;
}

export interface ReminderSetting {
  documentType: DocumentType;
  defaultDays: number;
}

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  id_card: '身份证',
  passport: '护照',
  driver_license: '驾照',
  hk_macau_permit: '港澳通行证',
  bank_card: '银行卡',
  other: '其他',
};

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  not_started: '未开始',
  appointment: '已预约',
  submitted: '已提交材料',
  waiting: '等待领取',
  completed: '已拿到',
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  expired: '已过期',
  expiring_soon: '即将到期',
  valid: '有效',
  long_term: '长期有效',
};

export const DEFAULT_REMINDER_SETTINGS: ReminderSetting[] = [
  { documentType: 'id_card', defaultDays: 90 },
  { documentType: 'passport', defaultDays: 180 },
  { documentType: 'driver_license', defaultDays: 30 },
  { documentType: 'hk_macau_permit', defaultDays: 60 },
  { documentType: 'bank_card', defaultDays: 30 },
  { documentType: 'other', defaultDays: 30 },
];

export const DEFAULT_MATERIALS: string[] = [
  '证件照片',
  '身份证复印件',
  '申请表',
  '户口本复印件',
  '居住证明',
];
