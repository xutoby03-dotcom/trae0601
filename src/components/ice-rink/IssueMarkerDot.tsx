import type { IssueMarker, IssueType, Severity } from '../../types';
import { getSeverityColor, getIssueTypeLabel } from '../../utils/severityCalc';

interface IssueMarkerDotProps {
  issue: IssueMarker;
  scale: number;
  selected?: boolean;
  onClick?: () => void;
  pulse?: boolean;
  critical?: boolean;
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

export function IssueMarkerDot({
  issue,
  scale,
  selected = false,
  onClick,
  pulse = true,
  critical = false,
}: IssueMarkerDotProps) {
  const cx = issue.x * scale;
  const cy = issue.y * scale;
  const baseR = (issue.radius || 2) * scale;
  const r = critical ? baseR * 1.4 : baseR;
  const color = critical ? '#ef4444' : getSeverityColor(issue.severity);
  const filterId = `glow-${issue.id}-${critical ? 'c' : 'n'}`;

  return (
    <g
      className="cursor-pointer transition-transform hover:scale-110"
      style={{ transformOrigin: `${cx}px ${cy}px` }}
      onClick={onClick}
      filter={critical ? `url(#${filterId})` : undefined}
    >
      {critical && (
        <defs>
          <filter id={filterId} x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feFlood floodColor="#ef4444" floodOpacity="0.6" result="glowColor" />
            <feComposite in="glowColor" in2="coloredBlur" operator="in" result="softGlow" />
            <feMerge>
              <feMergeNode in="softGlow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}

      {pulse && !issue.resolved && (
        <>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={critical ? 3 : 2}
            opacity={critical ? 0.8 : 0.6}
            className="animate-pulse-ring"
            style={{ animationDuration: pulseDurations[issue.severity] }}
          />
          {critical && (
            <circle
              cx={cx}
              cy={cy}
              r={r * 1.6}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
              opacity={0.5}
              className="animate-pulse-ring"
              style={{ animationDuration: '1.2s', animationDelay: '0.2s' }}
            />
          )}
        </>
      )}

      {critical && !issue.resolved && (
        <rect
          x={cx - r * 2.2}
          y={cy - r * 3.2}
          width={r * 4.4}
          height={r * 1.6}
          rx={r * 0.4}
          fill="#ef4444"
          stroke="#fca5a5"
          strokeWidth={1}
        />
      )}
      {critical && !issue.resolved && (
        <text
          x={cx}
          y={cy - r * 2.1}
          textAnchor="middle"
          fontSize={r * 0.75}
          fill="#fff"
          fontWeight="bold"
          style={{ pointerEvents: 'none' }}
        >
          高危·{getIssueTypeLabel(issue.type)}
        </text>
      )}

      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        opacity={issue.resolved ? 0.3 : critical ? 1 : 0.8}
        stroke={selected ? '#fff' : critical ? '#fecaca' : 'transparent'}
        strokeWidth={selected ? 3 : critical ? 2 : 0}
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
