import type { DocumentStatus } from '@/types';
import { DOCUMENT_STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: DocumentStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colorMap: Record<DocumentStatus, string> = {
    expired: 'bg-red-100 text-red-700 border-red-200',
    expiring_soon: 'bg-orange-100 text-orange-700 border-orange-200',
    valid: 'bg-green-100 text-green-700 border-green-200',
    long_term: 'bg-blue-100 text-blue-700 border-blue-200',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${colorMap[status]}`}>
      {DOCUMENT_STATUS_LABELS[status]}
    </span>
  );
};
