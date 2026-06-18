import type { FlavorWithStock, SupplyItemWithStatus } from '../../types';

type StatusType = FlavorWithStock['stockStatus'] | SupplyItemWithStatus['stockStatus'];

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  normal: { label: '库存正常', className: 'badge-normal' },
  low: { label: '库存不足', className: 'badge-low' },
  expired: { label: '已过期', className: 'badge-expired' },
  damp: { label: '已受潮', className: 'badge-damp' },
  out_of_stock: { label: '缺货', className: 'badge-out_of_stock' },
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status];
  return <span className={`${config.className} ${className}`}>{config.label}</span>;
}

interface PurchaseStatusBadgeProps {
  status: 'pending' | 'ordered' | 'received';
}

const purchaseStatusConfig = {
  pending: { label: '待采购', className: 'status-pending' },
  ordered: { label: '已下单', className: 'status-ordered' },
  received: { label: '已入库', className: 'status-received' },
};

export function PurchaseStatusBadge({ status }: PurchaseStatusBadgeProps) {
  const config = purchaseStatusConfig[status];
  return <span className={config.className}>{config.label}</span>;
}
