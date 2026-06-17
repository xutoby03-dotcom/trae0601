import { Priority, PRIORITY_LABELS } from '@/types';

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

const PriorityBadge = ({ priority, size = 'md' }: PriorityBadgeProps) => {
  const styles = {
    urgent: 'bg-warning-500 text-white',
    normal: 'bg-primary-500 text-white',
    low: 'bg-brown-400 text-white',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  const icons = {
    urgent: '🔥',
    normal: '📍',
    low: '📌',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${styles[priority]} ${sizeClasses[priority]}`}
    >
      <span>{icons[priority]}</span>
      {PRIORITY_LABELS[priority]}
    </span>
  );
};

export default PriorityBadge;
