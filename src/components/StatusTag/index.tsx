import type { ReimbursementStatus } from '../../types';

interface StatusTagProps {
  status: ReimbursementStatus;
}

const statusConfig: Record<ReimbursementStatus, { label: string; className: string }> = {
  pending: {
    label: '待审核',
    className: 'bg-warning-100 text-warning-700',
  },
  reviewing: {
    label: '审核中',
    className: 'bg-info-100 text-info-700',
  },
  approved: {
    label: '已通过',
    className: 'bg-primary-100 text-primary-700',
  },
  rejected: {
    label: '已拒绝',
    className: 'bg-danger-100 text-danger-700',
  },
};

export const StatusTag = ({ status }: StatusTagProps) => {
  const config = statusConfig[status];
  return <span className={`tag ${config.className}`}>{config.label}</span>;
};
