import type { UrgencyLevel, RequestStatus, PurchaseStatus } from '@/types';

interface Props {
  type: 'urgency' | 'request' | 'purchase' | 'stock';
  value: string;
}

const urgencyConfig: Record<UrgencyLevel, { label: string; className: string }> = {
  low: { label: '不急', className: 'bg-slate-100 text-slate-600' },
  normal: { label: '普通', className: 'bg-brand-50 text-brand-700' },
  high: { label: '较急', className: 'bg-warn-50 text-warn-500' },
  urgent: { label: '紧急', className: 'bg-danger-50 text-danger-600' },
};

const requestConfig: Record<RequestStatus, { label: string; className: string }> = {
  pending: { label: '待处理', className: 'bg-warn-50 text-warn-500' },
  processing: { label: '处理中', className: 'bg-brand-50 text-brand-700' },
  completed: { label: '已完成', className: 'bg-slate-100 text-slate-600' },
  cancelled: { label: '已取消', className: 'bg-slate-100 text-slate-400' },
};

const purchaseConfig: Record<PurchaseStatus, { label: string; className: string }> = {
  ordered: { label: '待到货', className: 'bg-warn-50 text-warn-500' },
  arrived: { label: '已入库', className: 'bg-brand-50 text-brand-700' },
  cancelled: { label: '已取消', className: 'bg-slate-100 text-slate-400' },
};

const stockConfig = {
  danger: { label: '红区', className: 'bg-danger-50 text-danger-600' },
  warn: { label: '预警', className: 'bg-warn-50 text-warn-500' },
  normal: { label: '正常', className: 'bg-brand-50 text-brand-700' },
};

export default function StatusBadge({ type, value }: Props) {
  let config;
  if (type === 'urgency') config = urgencyConfig[value as UrgencyLevel];
  else if (type === 'request') config = requestConfig[value as RequestStatus];
  else if (type === 'purchase') config = purchaseConfig[value as PurchaseStatus];
  else config = stockConfig[value as keyof typeof stockConfig];

  if (!config) return null;

  return <span className={`badge ${config.className}`}>{config.label}</span>;
}
