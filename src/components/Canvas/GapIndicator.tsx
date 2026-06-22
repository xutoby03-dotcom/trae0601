import { useTacticsStore } from '@/store/useTacticsStore';
import type { GapInfo } from '@/types';
import { getPlayerPositionAtTime, distance } from '@/utils/pathCalculations';

interface GapIndicatorProps {
  gap: GapInfo;
  scale: number;
  currentTime: number;
  isHighlighted: boolean;
}

export default function GapIndicator({
  gap,
  scale,
  currentTime,
  isHighlighted,
}: GapIndicatorProps) {
  const { play } = useTacticsStore();

  const isActive = currentTime >= gap.startTime && currentTime <= gap.endTime;
  const displayTime = isHighlighted ? gap.startTime : currentTime;

  const offPlayer = play.players.find((p) => p.id === gap.playerId);
  if (!offPlayer) return null;

  const defense = play.players.filter((p) => p.type === 'defense');
  const offPos = getPlayerPositionAtTime(offPlayer, play.routes, displayTime);

  let nearestDef = null as typeof defense[number] | null;
  let nearestDist = Infinity;
  for (const defPlayer of defense) {
    const defPos = getPlayerPositionAtTime(defPlayer, play.routes, displayTime);
    const dist = distance(offPos, defPos);
    if (dist < nearestDist) {
      nearestDist = dist;
      nearestDef = defPlayer;
    }
  }

  const showRing = isActive || isHighlighted;

  if (!showRing) {
    return isHighlighted ? (
      <g opacity="0.4">
        <circle
          cx={offPos.x * scale}
          cy={offPos.y * scale}
          r={gap.maxDistance * 0.5 * scale}
          fill="rgba(56, 176, 0, 0.08)"
          stroke="#38b000"
          strokeWidth={0.5 * scale}
          strokeDasharray="3,3"
        />
      </g>
    ) : null;
  }

  const nearestDefPos = nearestDef
    ? getPlayerPositionAtTime(nearestDef, play.routes, displayTime)
    : null;

  return (
    <g opacity={isHighlighted ? 1 : 0.85}>
      <circle
        cx={offPos.x * scale}
        cy={offPos.y * scale}
        r={gap.maxDistance * 0.5 * scale}
        fill="rgba(56, 176, 0, 0.12)"
        stroke="#38b000"
        strokeWidth={isHighlighted ? 1.5 * scale : 0.8 * scale}
        strokeDasharray="4,3"
      >
        {isHighlighted && (
          <animate
            attributeName="opacity"
            values="1;0.5;1"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <circle
        cx={offPos.x * scale}
        cy={offPos.y * scale}
        r={gap.maxDistance * scale}
        fill="none"
        stroke="#70e000"
        strokeWidth={isHighlighted ? 0.8 * scale : 0.4 * scale}
        strokeDasharray="2,4"
        opacity={isHighlighted ? 0.5 : 0.25}
      />

      {nearestDef && nearestDefPos && (
        <>
          <line
            x1={offPos.x * scale}
            y1={offPos.y * scale}
            x2={nearestDefPos.x * scale}
            y2={nearestDefPos.y * scale}
            stroke={isHighlighted ? '#38b000' : 'rgba(56, 176, 0, 0.5)'}
            strokeWidth={isHighlighted ? 1.2 * scale : 0.6 * scale}
            strokeDasharray={isHighlighted ? 'none' : '5,3'}
            style={{
              filter: isHighlighted
                ? `drop-shadow(0 0 ${2 * scale}px rgba(56, 176, 0, 0.7))`
                : 'none',
            }}
          />

          <g>
            <rect
              x={((offPos.x + nearestDefPos.x) / 2) * scale - 5 * scale}
              y={((offPos.y + nearestDefPos.y) / 2) * scale - 1.6 * scale}
              width={10 * scale}
              height={3.2 * scale}
              rx={0.5 * scale}
              fill="rgba(0, 0, 0, 0.75)"
            />
            <text
              x={((offPos.x + nearestDefPos.x) / 2) * scale}
              y={((offPos.y + nearestDefPos.y) / 2) * scale + 0.5 * scale}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isHighlighted ? '#9ef01a' : '#38b000'}
              fontSize={isHighlighted ? 1.6 * scale : 1.3 * scale}
              fontFamily="'Roboto Mono', monospace"
              fontWeight="700"
              style={{ userSelect: 'none' }}
            >
              {nearestDist.toFixed(1)}yd
            </text>
          </g>
        </>
      )}

      {isHighlighted && (
        <g>
          <circle
            cx={offPos.x * scale}
            cy={offPos.y * scale}
            r={5 * scale}
            fill="none"
            stroke="#9ef01a"
            strokeWidth={1.5 * scale}
            opacity="0.6"
          >
            <animate
              attributeName="r"
              values={`${3 * scale};${6 * scale};${3 * scale}`}
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0.2;0.8"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>

          <rect
            x={offPos.x * scale - 4.5 * scale}
            y={offPos.y * scale - gap.maxDistance * 0.5 * scale - 4.5 * scale}
            width={9 * scale}
            height={3.2 * scale}
            rx={0.5 * scale}
            fill="rgba(0, 0, 0, 0.75)"
            stroke="#38b000"
            strokeWidth={0.5 * scale}
          />
          <text
            x={offPos.x * scale}
            y={offPos.y * scale - gap.maxDistance * 0.5 * scale - 3 * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#9ef01a"
            fontSize={1.5 * scale}
            fontFamily="'Rajdhani', sans-serif"
            fontWeight="700"
            style={{ userSelect: 'none' }}
          >
            空档 {offPlayer.label}
          </text>
          <text
            x={offPos.x * scale}
            y={offPos.y * scale - gap.maxDistance * 0.5 * scale - 1.5 * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#ffffff"
            fontSize={1.2 * scale}
            fontFamily="'Roboto Mono', monospace"
            fontWeight="600"
            style={{ userSelect: 'none' }}
          >
            最远 {gap.maxDistance.toFixed(1)}yd
          </text>
        </g>
      )}
    </g>
  );
}
