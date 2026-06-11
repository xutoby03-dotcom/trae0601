export type StallType = 'food' | 'handcraft' | 'clothing' | 'accessory' | 'other';

export type LicenseStatus = 'normal' | 'expiring' | 'expired';

export type AuditStatus = 'pending' | 'approved' | 'rejected' | 'material_required';

export type AuditAction = 'approve' | 'reject' | 'material_request';

export type FollowUpStatus = 'pending' | 'contacted' | 'materials_received' | 'resolved';

export interface Vendor {
  id: string;
  name: string;
  stallType: StallType;
  licenseNumber: string;
  validUntil: string;
  businessCategory: string;
  phone: string;
  licensePhoto: string;
  auditStatus: AuditStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuditRecord {
  id: string;
  vendorId: string;
  action: AuditAction;
  reason: string;
  operator: string;
  createdAt: string;
  followUpStatus?: FollowUpStatus;
  nextReminderDate?: string;
}

export const followUpStatusLabels: Record<FollowUpStatus, string> = {
  pending: '待跟进',
  contacted: '已联系',
  materials_received: '已收材料',
  resolved: '已处理',
};

export const stallTypeLabels: Record<StallType, string> = {
  food: '食品类',
  handcraft: '手作类',
  clothing: '服饰类',
  accessory: '饰品类',
  other: '其他',
};

export const auditStatusLabels: Record<AuditStatus, string> = {
  pending: '待审核',
  approved: '已通过',
  rejected: '已驳回',
  material_required: '待补材料',
};

export const licenseStatusLabels: Record<LicenseStatus, string> = {
  normal: '正常',
  expiring: '临期',
  expired: '已过期',
};

export const auditActionLabels: Record<AuditAction, string> = {
  approve: '通过',
  reject: '驳回',
  material_request: '补材料',
};
