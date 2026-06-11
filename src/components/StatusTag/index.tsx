import type { ReimbursementStatus, InvoiceStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusTagProps {
  status: ReimbursementStatus;
}

const statusConfig: Record<ReimbursementStatus, { label: string; className: string }> = {
  pending: { label: '待审核', className: 'bg-amber-100 text-amber-700' },
  approved: { label: '已通过', className: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: '已驳回', className: 'bg-red-100 text-red-700' },
  settled: { label: '已结算', className: 'bg-teal-100 text-teal-700' },
};

export function StatusTag({ status }: StatusTagProps) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

interface InvoiceStatusTagProps {
  status: InvoiceStatus;
}

const invoiceConfig: Record<InvoiceStatus, { label: string; className: string }> = {
  provided: { label: '有发票', className: 'bg-emerald-100 text-emerald-700' },
  missing: { label: '缺发票', className: 'bg-red-100 text-red-700' },
  partial: { label: '部分发票', className: 'bg-amber-100 text-amber-700' },
};

export function InvoiceStatusTag({ status }: InvoiceStatusTagProps) {
  const config = invoiceConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}
