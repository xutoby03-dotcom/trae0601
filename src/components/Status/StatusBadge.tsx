import type { FacilityStatus, IssueLevel, IssueStatus, RepairStatus } from '@/types';
import { FACILITY_STATUS_LABELS, ISSUE_LEVEL_LABELS, ISSUE_STATUS_LABELS, REPAIR_STATUS_LABELS } from '@/types';
import { cn } from '@/utils';

interface StatusBadgeProps {
  type: 'facility' | 'issue-level' | 'issue-status' | 'repair-status';
  value: string;
}

export function StatusBadge({ type, value }: StatusBadgeProps) {
  let label = value;
  let className = '';

  if (type === 'facility') {
    label = FACILITY_STATUS_LABELS[value as FacilityStatus] || value;
    className = {
      normal: 'bg-success-100 text-success-700',
      needs_repair: 'bg-primary-100 text-primary-700',
      out_of_service: 'bg-danger-100 text-danger-700',
    }[value as FacilityStatus] || 'bg-gray-100 text-gray-700';
  }

  if (type === 'issue-level') {
    label = ISSUE_LEVEL_LABELS[value as IssueLevel] || value;
    className = {
      minor: 'bg-secondary-100 text-secondary-700',
      needs_repair: 'bg-primary-100 text-primary-700',
      out_of_service: 'bg-danger-100 text-danger-700',
    }[value as IssueLevel] || 'bg-gray-100 text-gray-700';
  }

  if (type === 'issue-status') {
    label = ISSUE_STATUS_LABELS[value as IssueStatus] || value;
    className = {
      pending: 'bg-yellow-100 text-yellow-700',
      confirmed: 'bg-primary-100 text-primary-700',
      resolved: 'bg-success-100 text-success-700',
      closed: 'bg-gray-100 text-gray-600',
    }[value as IssueStatus] || 'bg-gray-100 text-gray-700';
  }

  if (type === 'repair-status') {
    label = REPAIR_STATUS_LABELS[value as RepairStatus] || value;
    className = {
      pending: 'bg-yellow-100 text-yellow-700',
      in_progress: 'bg-primary-100 text-primary-700',
      completed: 'bg-secondary-100 text-secondary-700',
      reviewed: 'bg-success-100 text-success-700',
    }[value as RepairStatus] || 'bg-gray-100 text-gray-700';
  }

  return (
    <span className={cn('badge', className)}>
      {label}
    </span>
  );
}
