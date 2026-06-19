import type { ApplicationStatus, RiskLevel, SealStatus, RecordStatus } from '@/types';
import {
  getApplicationStatusColor,
  getApplicationStatusText,
  getRiskLevelColor,
  getRiskLevelText,
  getSealStatusColor,
  getSealStatusText,
  getRecordStatusColor,
  getRecordStatusText,
} from '@/utils/helpers';

interface Props {
  type: 'seal' | 'application' | 'record' | 'risk';
  status: SealStatus | ApplicationStatus | RecordStatus | RiskLevel;
}

export default function StatusBadge({ type, status }: Props) {
  let color = '';
  let text = '';

  switch (type) {
    case 'seal':
      color = getSealStatusColor(status as SealStatus);
      text = getSealStatusText(status as SealStatus);
      break;
    case 'application':
      color = getApplicationStatusColor(status as ApplicationStatus);
      text = getApplicationStatusText(status as ApplicationStatus);
      break;
    case 'record':
      color = getRecordStatusColor(status as RecordStatus);
      text = getRecordStatusText(status as RecordStatus);
      break;
    case 'risk':
      color = getRiskLevelColor(status as RiskLevel);
      text = getRiskLevelText(status as RiskLevel);
      break;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}>
      {text}
    </span>
  );
}
