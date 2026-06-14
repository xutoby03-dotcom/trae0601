export type Severity = 'low' | 'medium' | 'high' | 'critical';

export type RepairStatus = 'pending' | 'assigned' | 'in_progress' | 'review' | 'completed' | 'cancelled';

export interface RepairPhoto {
  id: string;
  repair_id: string;
  photo_type: 'before' | 'after' | 'report';
  photo_url: string;
  uploaded_at: string;
}

export interface MaintenanceLog {
  id: string;
  repair_id: string;
  action: 'assign' | 'start' | 'complete' | 'review' | 'reject' | 'create' | 'auto_disable' | 'cancel';
  operator: string;
  remark: string;
  created_at: string;
}

export interface Repair {
  id: string;
  facility_id: string;
  problem_type: string;
  severity: Severity;
  reporter: string;
  reporter_phone: string;
  description: string;
  need_closure: boolean;
  expected_fix_date: string;
  status: RepairStatus;
  assigned_to: string | null;
  assigned_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  reviewer: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
  created_at: string;
}

export const PROBLEM_TYPES: string[] = [
  '结构松动',
  '链条异响',
  '表面破损',
  '焊接开裂',
  '塑料老化',
  '螺丝脱落',
  '油漆剥落',
  '安全垫破损',
  '电气故障',
  '其他',
];

export const SEVERITY_CONFIG = {
  low: { label: '轻微', color: '#2A9D8F', autoDisable: false },
  medium: { label: '一般', color: '#FFB703', autoDisable: false },
  high: { label: '严重', color: '#FF6B35', autoDisable: true },
  critical: { label: '高危', color: '#E63946', autoDisable: true },
};

export const REPAIR_STATUS_CONFIG = {
  pending: { label: '待分派', color: '#868E96', step: 1 },
  assigned: { label: '已分派', color: '#219EBC', step: 2 },
  in_progress: { label: '维修中', color: '#FF6B35', step: 3 },
  review: { label: '待复检', color: '#FFB703', step: 4 },
  completed: { label: '已完成', color: '#2A9D8F', step: 5 },
  cancelled: { label: '已取消', color: '#ADB5BD', step: 0 },
};
