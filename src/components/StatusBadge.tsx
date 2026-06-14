import type { EquipmentStatus } from '@/types';
import { EQUIPMENT_STATUS_LABELS, EQUIPMENT_STATUS_COLORS } from '@/types';
import { CheckCircle, ThumbsUp, AlertTriangle, XCircle, Archive } from 'lucide-react';

interface StatusBadgeProps {
  status: EquipmentStatus;
}

const iconMap: Record<EquipmentStatus, React.ComponentType<any>> = {
  excellent: CheckCircle,
  good: ThumbsUp,
  attention: AlertTriangle,
  overdue: XCircle,
  retired: Archive,
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const Icon = iconMap[status];
  return (
    <span className={`badge border ${EQUIPMENT_STATUS_COLORS[status]}`}>
      <Icon size={12} />
      {EQUIPMENT_STATUS_LABELS[status]}
    </span>
  );
};
