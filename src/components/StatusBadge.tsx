import { cn } from '@/lib/utils';
import type { LicenseStatus, AuditStatus, AuditAction } from '@/types';
import { licenseStatusLabels, auditStatusLabels, auditActionLabels } from '@/types';

interface StatusBadgeProps {
  type: 'license' | 'audit' | 'action';
  status: LicenseStatus | AuditStatus | AuditAction;
  size?: 'sm' | 'md';
}

const licenseStatusStyles: Record<LicenseStatus, string> = {
  normal: 'bg-green-100 text-green-700 border-green-200',
  expiring: 'bg-amber-100 text-amber-700 border-amber-200',
  expired: 'bg-red-100 text-red-700 border-red-200',
};

const auditStatusStyles: Record<AuditStatus, string> = {
  pending: 'bg-slate-100 text-slate-600 border-slate-200',
  approved: 'bg-green-100 text-green-700 border-green-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  material_required: 'bg-amber-100 text-amber-700 border-amber-200',
};

const actionStyles: Record<AuditAction, string> = {
  approve: 'bg-green-100 text-green-700 border-green-200',
  reject: 'bg-red-100 text-red-700 border-red-200',
  material_request: 'bg-amber-100 text-amber-700 border-amber-200',
};

const StatusBadge = ({ type, status, size = 'md' }: StatusBadgeProps) => {
  const sizeClasses = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-sm';

  let label = '';
  let styles = '';

  if (type === 'license') {
    label = licenseStatusLabels[status as LicenseStatus];
    styles = licenseStatusStyles[status as LicenseStatus];
  } else if (type === 'audit') {
    label = auditStatusLabels[status as AuditStatus];
    styles = auditStatusStyles[status as AuditStatus];
  } else {
    label = auditActionLabels[status as AuditAction];
    styles = actionStyles[status as AuditAction];
  }

  const pulseAnimation = type === 'license' && status === 'expiring'
    ? 'animate-pulse'
    : '';

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border',
        sizeClasses,
        styles,
        pulseAnimation
      )}
    >
      {type === 'license' && status === 'expiring' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-ping" />
      )}
      {type === 'license' && status === 'expired' && (
        <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
      )}
      {type === 'license' && status === 'normal' && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
      )}
      {label}
    </span>
  );
};

export default StatusBadge;
