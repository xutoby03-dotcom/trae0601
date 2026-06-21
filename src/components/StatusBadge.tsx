import '../styles/components.css';

export type StatusType = 'pending' | 'queued' | 'answering' | 'answered';

export interface StatusBadgeProps {
  status: StatusType;
  showDot?: boolean;
  className?: string;
}

const labelMap: Record<StatusType, string> = {
  pending: '待处理',
  queued: '队列中',
  answering: '回答中',
  answered: '已回答',
};

export function StatusBadge({ status, showDot = true, className = '' }: StatusBadgeProps) {
  return (
    <span className={`status-badge status-badge-${status} ${className}`}>
      {showDot && <span className="status-badge-dot" />}
      {labelMap[status]}
    </span>
  );
}
