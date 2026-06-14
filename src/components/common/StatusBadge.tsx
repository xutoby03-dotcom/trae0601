import type { UmbrellaStatus } from '@/types';
import clsx from 'clsx';

interface Props {
  status: UmbrellaStatus;
  size?: 'sm' | 'md';
}

const CONFIG: Record<UmbrellaStatus, { label: string; cls: string }> = {
  available: {
    label: '可借',
    cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  },
  lent: {
    label: '借出中',
    cls: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  },
  damaged: {
    label: '破损待修',
    cls: 'bg-orange-50 text-orange-700 ring-1 ring-orange-200',
  },
  scrapped: {
    label: '已报废',
    cls: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
  },
};

export default function StatusBadge({ status, size = 'md' }: Props) {
  const c = CONFIG[status];
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        c.cls
      )}
    >
      <span
        className={clsx(
          'mr-1.5 inline-block rounded-full',
          size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2',
          status === 'available' && 'bg-emerald-500',
          status === 'lent' && 'bg-sky-500',
          status === 'damaged' && 'bg-orange-500',
          status === 'scrapped' && 'bg-slate-400'
        )}
      />
      {c.label}
    </span>
  );
}
