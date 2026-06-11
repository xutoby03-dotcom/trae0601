import type { LoanStatus, DeviceStatus, ExceptionSeverity, ExceptionStatus, RenewalStatus } from '@/types';
import {
  getLoanStatusLabel,
  getDeviceStatusLabel,
  getExceptionSeverityLabel,
  getExceptionStatusLabel,
  getRenewalStatusLabel,
} from '@/utils';

interface StatusBadgeProps {
  status: string;
  type?: 'loan' | 'device' | 'severity' | 'exception' | 'renewal';
}

export default function StatusBadge({ status, type = 'loan' }: StatusBadgeProps) {
  const getLabel = () => {
    switch (type) {
      case 'loan':
        return getLoanStatusLabel(status as LoanStatus);
      case 'device':
        return getDeviceStatusLabel(status as DeviceStatus);
      case 'severity':
        return getExceptionSeverityLabel(status as ExceptionSeverity);
      case 'exception':
        return getExceptionStatusLabel(status as ExceptionStatus);
      case 'renewal':
        return getRenewalStatusLabel(status as RenewalStatus);
      default:
        return status;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'loan':
        switch (status) {
          case 'active':
            return 'bg-primary-50 text-primary-700';
          case 'pending':
            return 'bg-warning-50 text-warning-700';
          case 'returned':
            return 'bg-success-50 text-success-700';
          case 'overdue':
            return 'bg-danger-50 text-danger-700';
          default:
            return 'bg-gray-100 text-gray-700';
        }
      case 'device':
        switch (status) {
          case 'available':
            return 'bg-success-50 text-success-700';
          case 'loaned':
            return 'bg-primary-50 text-primary-700';
          case 'maintenance':
            return 'bg-warning-50 text-warning-700';
          case 'scrapped':
            return 'bg-gray-100 text-gray-700';
          default:
            return 'bg-gray-100 text-gray-700';
        }
      case 'severity':
        switch (status) {
          case 'low':
            return 'bg-warning-50 text-warning-700';
          case 'medium':
            return 'bg-orange-50 text-orange-700';
          case 'high':
            return 'bg-danger-50 text-danger-700';
          default:
            return 'bg-gray-100 text-gray-700';
        }
      case 'exception':
        switch (status) {
          case 'open':
            return 'bg-danger-50 text-danger-700';
          case 'processing':
            return 'bg-warning-50 text-warning-700';
          case 'resolved':
            return 'bg-success-50 text-success-700';
          default:
            return 'bg-gray-100 text-gray-700';
        }
      case 'renewal':
        switch (status) {
          case 'pending':
            return 'bg-warning-50 text-warning-700';
          case 'approved':
            return 'bg-success-50 text-success-700';
          case 'rejected':
            return 'bg-danger-50 text-danger-700';
          default:
            return 'bg-gray-100 text-gray-700';
        }
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStyles()}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        type === 'loan' && status === 'overdue' ? 'bg-danger-500 animate-pulse' :
        type === 'exception' && status === 'open' ? 'bg-danger-500 animate-pulse' :
        'bg-current opacity-60'
      }`}></span>
      {getLabel()}
    </span>
  );
}
