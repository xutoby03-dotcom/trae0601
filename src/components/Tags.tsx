import { Tag } from 'antd';
import type { Severity, RepairStatus } from '@/types';
import { SEVERITY_CONFIG, REPAIR_STATUS_CONFIG } from '@/types';

export function SeverityTag({ severity }: { severity: Severity }) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <Tag color={config.color} style={{ margin: 0 }}>
      {config.label}
    </Tag>
  );
}

export function RepairStatusTag({ status }: { status: RepairStatus }) {
  const config = REPAIR_STATUS_CONFIG[status];
  return (
    <Tag color={config.color} style={{ margin: 0 }}>
      {config.label}
    </Tag>
  );
}
