import { getBudgetStatusText, getReimbursementStatusText } from '@/utils/format';
import type { BudgetStatus, ReimbursementStatus } from '@/types';

interface StatusBadgeProps {
  status: BudgetStatus | ReimbursementStatus;
  type?: 'budget' | 'reimbursement';
}

export default function StatusBadge({ status, type = 'reimbursement' }: StatusBadgeProps) {
  const text =
    type === 'budget' ? getBudgetStatusText(status) : getReimbursementStatusText(status);

  const getStyles = () => {
    switch (status) {
      case 'active':
      case 'paid':
        return 'bg-success-50 text-success-600 border-success-200';
      case 'pending_teacher':
        return 'bg-warning-50 text-warning-600 border-warning-200';
      case 'pending_finance':
        return 'bg-primary-50 text-primary-600 border-primary-200';
      case 'draft':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'rejected':
        return 'bg-danger-50 text-danger-600 border-danger-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStyles()}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
      {text}
    </span>
  );
}
