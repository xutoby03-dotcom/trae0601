import { Tag } from 'antd';
import type { FacilityStatus } from '@/types';
import { FACILITY_STATUS_CONFIG } from '@/types';

interface FacilityStatusTagProps {
  status: FacilityStatus;
}

export default function FacilityStatusTag({ status }: FacilityStatusTagProps) {
  const config = FACILITY_STATUS_CONFIG[status];
  return (
    <Tag color={config.color} style={{ margin: 0 }}>
      {config.label}
    </Tag>
  );
}
