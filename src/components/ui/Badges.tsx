import { clsx } from 'clsx';
import { statusColors, securityColors } from '../../utils';
import type { BoxStatus, BorrowStatus, SecurityLevel } from '../../types';

export function StatusBadge({ status }: { status: BoxStatus | BorrowStatus }) {
  return (
    <span className={clsx('badge', statusColors[status])}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
      {status}
    </span>
  );
}

export function SecurityBadge({ level }: { level: SecurityLevel }) {
  return (
    <span className={clsx('badge', securityColors[level])}>
      {level}
    </span>
  );
}
