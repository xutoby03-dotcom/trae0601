import type { IssueMarker, IssueType, Severity } from '../../types';
import { getSeverityColor } from '../../utils/severityCalc';

interface IssueMarkerDotProps {
  issue: IssueMarker;
  scale: number;
  selected?: boolean;
  onClick?: () => void;
  pulse?: boolean;
}

const issueIcons: Record<IssueType, string> = {
  groove: '⚡',
  water: '💧',
  ice_debris: '❄️',
  closed_area: '🚫',
};

const pulseDurations: Record<Severity, string> = {
  high: '0.8s',
  medium: '1.5s',
  low: '2.5s',
};

export function IssueMarkerDot({ issue, scale, selected = false, onClick, pulse = true }: IssueMarkerDotProps) {
  const cx = issue.x * scale;
  const cy = issue.y * scale;
  const r = (issue.radius || 2) * scale;
  const color = getSeverityColor(issue.severity);

  return (
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      onClick={onClick}
    >
      {pulse && !issue.resolved && (
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0.6}
          className="animate-pulse-ring"
          style={{
            animationDuration: pulseDurations[issue.severity],
          }}
        />
      )}

      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        opacity={issue.resolved ? 0.3 : 0.8}
        stroke={selected ? '#fff' : 'transparent'}
        strokeWidth={selected ? 3 : 0}
      />

      <circle
        cx={cx}
        cy={cy}
        r={r * 0.6}
        fill="rgba(255,255,255,0.2)"
      />

      <text
        x={cx}
        y={cy + r * 0.35}
        textAnchor="middle"
        fontSize={r * 0.9}
        style={{ pointerEvents: 'none' }}
      >
        {issueIcons[issue.type]}
      </text>

      {issue.resolved && (
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize="12"
          fill="#10B981"
          fontWeight="bold"
        >
          ✓
        </text>
      )}
    </g>
  );
}
