import type { Medicine } from '@/types';
import { getMedicineStatus, getStatusColor } from '@/utils/medicine';
import { clsx } from 'clsx';
import { AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  medicine: Medicine;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export function StatusTag({ medicine, showLabel = true, size = 'md' }: Props) {
  const status = getMedicineStatus(medicine);
  const config = getStatusColor(status);

  const icons = {
    normal: <CheckCircle2 size={size === 'sm' ? 12 : 14} />,
    expiring: <AlertTriangle size={size === 'sm' ? 12 : 14} />,
    expired: <AlertCircle size={size === 'sm' ? 12 : 14} />,
  };

  if (!showLabel) {
    return (
      <span
        className={clsx(
          'inline-block rounded-full ring-4 ring-offset-2',
          config.dot,
          status === 'expiring' && 'animate-pulse-soft',
          status === 'expired' && 'ring-red-100',
          status === 'expiring' && 'ring-amber-100',
          status === 'normal' && 'ring-emerald-100'
        )}
        style={{ width: size === 'sm' ? 10 : 12, height: size === 'sm' ? 10 : 12 }}
      />
    );
  }

  return (
    <span
      className={clsx(
        config.badge,
        status === 'expiring' && 'animate-pulse-soft'
      )}
    >
      {icons[status]}
      {config.label}
    </span>
  );
}
