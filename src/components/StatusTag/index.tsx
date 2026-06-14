import { Tag } from 'antd';
import type { CSSProperties } from 'react';
import {
  FacilityStatus,
  RepairStatus,
  Severity,
  FACILITY_STATUS_CONFIG,
  REPAIR_STATUS_CONFIG,
  SEVERITY_CONFIG,
} from '@/types';

const baseTagStyle: CSSProperties = {
  borderRadius: 8,
  fontSize: 12,
  padding: '2px 10px',
  fontWeight: 500,
  lineHeight: 1.6,
  border: 'none',
};

const blinkingDotStyle: CSSProperties = {
  display: 'inline-block',
  width: 6,
  height: 6,
  borderRadius: '50%',
  marginRight: 6,
  backgroundColor: '#E63946',
  animation: 'blink 1s infinite',
  verticalAlign: 'middle',
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }
`;
if (!document.querySelector('style[data-status-tag-keyframes]')) {
  styleSheet.setAttribute('data-status-tag-keyframes', 'true');
  document.head.appendChild(styleSheet);
}

interface FacilityStatusTagProps {
  status: FacilityStatus;
}

export function FacilityStatusTag({ status }: FacilityStatusTagProps) {
  const config = FACILITY_STATUS_CONFIG[status];
  return (
    <Tag
      color={config.color}
      style={{
        ...baseTagStyle,
        backgroundColor: `${config.color}15`,
        color: config.color,
      }}
    >
      {config.label}
    </Tag>
  );
}

interface RepairStatusTagProps {
  status: RepairStatus;
}

export function RepairStatusTag({ status }: RepairStatusTagProps) {
  const config = REPAIR_STATUS_CONFIG[status];
  return (
    <Tag
      color={config.color}
      style={{
        ...baseTagStyle,
        backgroundColor: `${config.color}15`,
        color: config.color,
      }}
    >
      {config.label}
    </Tag>
  );
}

interface SeverityTagProps {
  severity: Severity;
}

export function SeverityTag({ severity }: SeverityTagProps) {
  const config = SEVERITY_CONFIG[severity];
  const isCritical = severity === 'critical';
  return (
    <Tag
      color={config.color}
      style={{
        ...baseTagStyle,
        backgroundColor: `${config.color}15`,
        color: config.color,
      }}
    >
      {isCritical && <span style={blinkingDotStyle} />}
      {config.label}
    </Tag>
  );
}
