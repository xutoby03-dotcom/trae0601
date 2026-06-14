import { Tag } from 'antd';
import type { RepairStatus } from '@/types';
import { REPAIR_STATUS_CONFIG } from '@/types';

interface RepairStatusTagProps {
  status: RepairStatus;
}

export default function RepairStatusTag({ status }: RepairStatusTagProps) {
  const config = REPAIR_STATUS_CONFIG[status];
  return (
    <Tag color={config.color} style={{ margin: 0 }}>
      {config.label}
    </Tag>
  );
}
