import { useTacticsStore } from '@/store/useTacticsStore';
import type { TransferWindow } from '@/types';
import { getPlayerPositionAtTime } from '@/utils/pathCalculations';

interface TransferWindowProps {
  window: TransferWindow;
  scale: number;
  currentTime: number;
}

export default function TransferWindowIndicator({
  window,
  scale,
  currentTime,
}: TransferWindowProps) {
  const { play } = useTacticsStore();
  const isActive = currentTime >= window.startTime && currentTime <= window.endTime;

  const fromPlayer = play.players.find((p) => p.id === window.fromId);
  const toPlayer = play.players.find((p) => p.id === window.toId);

  if (!fromPlayer || !toPlayer) return null;

  const fromPos = getPlayerPositionAtTime(fromPlayer, play.routes, currentTime);
  const toPos = getPlayerPositionAtTime(toPlayer, play.routes, currentTime);

  const qualityColors: Record<string, string> = {
    good: '#38b000',
    great: '#9ef01a',
    excellent: '#ffd60a',
  };

  const color = qualityColors[window.quality];

  return (
    <g opacity={isActive ? 1 : 0.4}>
      <line
        x1={fromPos.x * scale}
        y1={fromPos.y * scale}
        x2={toPos.x * scale}
        y2={toPos.y * scale}
        stroke={color}
        strokeWidth={isActive ? 1.5 * scale : 0.5 * scale}
        strokeDasharray={isActive ? 'none' : '4,4'}
        strokeLinecap="round"
        style={{
          filter: isActive ? `drop-shadow(0 0 ${4 * scale}px ${color})` : 'none',
        }}
      />

      {isActive && (
        <>
          <circle
            cx={toPos.x * scale}
            cy={toPos.y * scale}
            r={4 * scale}
            fill="none"
            stroke={color}
            strokeWidth={1.5 * scale}
            opacity="0.6"
          >
            <animate
              attributeName="r"
              values={`${3 * scale};${5 * scale};${3 * scale}`}
              dur="1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.8;0.2;0.8"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>

          <rect
            x={(fromPos.x + toPos.x) / 2 * scale - 6 * scale}
            y={(fromPos.y + toPos.y) / 2 * scale - 2 * scale}
            width={12 * scale}
            height={4 * scale}
            rx={0.5 * scale}
            fill="rgba(0,0,0,0.7)"
          />
          <text
            x={(fromPos.x + toPos.x) / 2 * scale}
            y={(fromPos.y + toPos.y) / 2 * scale + 0.6 * scale}
            textAnchor="middle"
            dominantBaseline="middle"
            fill={color}
            fontSize={1.8 * scale}
            fontFamily="'Roboto Mono', monospace"
            fontWeight="700"
            style={{ userSelect: 'none' }}
          >
            {(window.endTime - window.startTime).toFixed(1)}s
          </text>
        </>
      )}
    </g>
  );
}
