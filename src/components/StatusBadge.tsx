import { ClothingStatus, STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: ClothingStatus;
  size?: 'sm' | 'md';
}

const StatusBadge = ({ status, size = 'md' }: StatusBadgeProps) => {
  const styles = {
    pending: 'bg-warning-50 text-warning-600 border-warning-200',
    in_progress: 'bg-primary-50 text-primary-600 border-primary-200',
    completed: 'bg-success-50 text-success-600 border-success-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${styles[status]} ${sizeClasses[size]}`}
    >
      <span
        className={`w-2 h-2 rounded-full mr-2 ${
          status === 'pending'
            ? 'bg-warning-500'
            : status === 'in_progress'
            ? 'bg-primary-500'
            : 'bg-success-500'
        } ${status === 'in_progress' ? 'animate-pulse' : ''}`}
      />
      {STATUS_LABELS[status]}
    </span>
  );
};

export default StatusBadge;
