import { Tag } from 'antd';
import type { Severity } from '@/types';
import { SEVERITY_CONFIG } from '@/types';

interface SeverityTagProps {
  severity: Severity;
}

export default function SeverityTag({ severity }: SeverityTagProps) {
  const config = SEVERITY_CONFIG[severity];
  return (
    <Tag color={config.color} style={{ margin: 0 }}>
      {config.label}
    </Tag>
  );
}
