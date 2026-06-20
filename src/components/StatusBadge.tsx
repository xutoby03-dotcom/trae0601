import { statusLabels, statusColors } from "../types/appointment";
import type { AppointmentStatus } from "../types/appointment";

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-100 text-gray-600";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {statusLabels[status]}
    </span>
  );
}
