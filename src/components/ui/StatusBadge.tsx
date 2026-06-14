import { Check, X, Clock, Droplets, AlertTriangle } from 'lucide-react';
import type { CostumeStatus, WashStatus, BorrowStatus } from '../../../shared/types';

interface StatusBadgeProps {
  status: string;
  type?: 'costume' | 'wash' | 'borrow';
}

const statusConfig: Record<string, { label: string; className: string; icon?: typeof Check }> = {
  available: { label: '可借用', className: 'bg-green-100 text-green-700', icon: Check },
  borrowed: { label: '已借出', className: 'bg-blue-100 text-blue-700', icon: Clock },
  pending: { label: '待处理', className: 'bg-amber-100 text-amber-700', icon: AlertTriangle },
  washing: { label: '待清洗', className: 'bg-cyan-100 text-cyan-700', icon: Droplets },
  clean: { label: '已清洗', className: 'bg-green-100 text-green-700', icon: Check },
  dirty: { label: '待清洗', className: 'bg-orange-100 text-orange-700', icon: Droplets },
  returned: { label: '已归还', className: 'bg-green-100 text-green-700', icon: Check },
  overdue: { label: '已逾期', className: 'bg-red-100 text-red-700', icon: X },
};

export function StatusBadge({ status, type = 'costume' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {config.label}
    </span>
  );
}
