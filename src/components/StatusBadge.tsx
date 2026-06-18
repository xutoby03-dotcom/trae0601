import type { MedicineStatus } from '@/types';

const colorClasses: Record<string, string> = {
  green: 'bg-green-100 text-green-700 border-green-200',
  orange: 'bg-warning-100 text-warning-700 border-warning-200 animate-pulse-slow',
  red: 'bg-danger-100 text-danger-700 border-danger-200 animate-pulse-slow',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
};

export default function StatusBadge({ status }: { status: MedicineStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colorClasses[status.color]}`}
    >
      {status.label}
    </span>
  );
}
