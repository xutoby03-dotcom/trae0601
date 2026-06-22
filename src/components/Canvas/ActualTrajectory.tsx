import type { ActualPosition, Player, DeviationStats } from '@/types';

interface ActualTrajectoryProps {
  player: Player;
  positions: ActualPosition[];
  deviationStats: DeviationStats | undefined;
  scale: number;
  currentTime: number;
  isHighlighted: boolean;
}

export default function ActualTrajectory({
  player,
  positions,
  deviationStats,
  scale,
  currentTime,
  isHighlighted,
}: ActualTrajectoryProps) {
  const sortedPositions = [...positions].sort((a, b) => a.time - b.time);
  if (sortedPositions.length === 0) return null;

  const isOffense = player.type === 'offense';
  const trajectoryColor = isOffense ? '#c77dff' : '#48bfe3';
  const pointColor = isOffense ? '#e0aaff' : '#90e0ef';

  const maxDeviationPos = deviationStats
    ? sortedPositions.find((p) => Math.abs(p.time - deviationStats.maxDeviationTime) < 0.05)
    : null;

  const polylinePoints = sortedPositions
    .map((p) => `${p.position.x * scale},${p.position.y * scale}`)
    .join(' ');

  const baseOpacity = isHighlighted ? 1 : 0.6;
  const strokeWidth = isHighlighted ? 1.5 * scale : 0.8 * scale;

  return (
    <g className="actual-trajectory">
      {sortedPositions.length > 1 && (
        <polyline
          points={polylinePoints}
          fill="none"
          stroke={trajectoryColor}
          strokeWidth={strokeWidth}
          strokeDasharray={`${2 * scale},${1.5 * scale}`}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={baseOpacity}
          style={{
            filter: isHighlighted
              ? `drop-shadow(0 0 ${3 * scale}px ${trajectoryColor}60)`
              : 'none',
          }}
        />
      )}

      {sortedPositions.map((pos) => {
        const isNearCurrentTime = Math.abs(pos.time - currentTime) < 0.25;
        const isMaxDeviation = maxDeviationPos?.id === pos.id;

        return (
          <g key={pos.id}>
            {isNearCurrentTime && (
              <circle
                cx={pos.position.x * scale}
                cy={pos.position.y * scale}
                r={2.5 * scale}
                fill="none"
                stroke={pointColor}
                strokeWidth={1.5}
                opacity={0.8}
              >
                <animate
                  attributeName="r"
                  values={`${2 * scale};${3.5 * scale};${2 * scale}`}
                  dur="1s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.8;0.3;0.8"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            {isMaxDeviation && (
              <circle
                cx={pos.position.x * scale}
                cy={pos.position.y * scale}
                r={2.2 * scale}
                fill="none"
                stroke="#ef4444"
                strokeWidth={2}
                opacity={isHighlighted ? 1 : 0.8}
              >
                <animate
                  attributeName="r"
                  values={`${2 * scale};${3 * scale};${2 * scale}`}
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="1;0.5;1"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>
            )}

            <circle
              cx={pos.position.x * scale}
              cy={pos.position.y * scale}
              r={isHighlighted ? 0.8 * scale : 0.5 * scale}
              fill={isMaxDeviation ? '#ef4444' : pointColor}
              stroke={isMaxDeviation ? '#ef4444' : trajectoryColor}
              strokeWidth={1}
              opacity={isNearCurrentTime ? 1 : baseOpacity}
            />
          </g>
        );
      })}
    </g>
  );
}
