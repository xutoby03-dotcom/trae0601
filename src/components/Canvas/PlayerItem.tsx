import { useTacticsStore } from '@/store/useTacticsStore';
import type { Player } from '@/types';

interface PlayerProps {
  player: Player;
  currentX: number;
  currentY: number;
  scale: number;
  isAnimated?: boolean;
}

export default function PlayerItem({
  player,
  currentX,
  currentY,
  scale,
  isAnimated = false,
}: PlayerProps) {
  const { selectedId, currentTool, setSelected, movePlayer } = useTacticsStore();
  const isSelected = selectedId === player.id;
  const isOffense = player.type === 'offense';
  const radius = 2.2 * scale;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTool === 'select') {
      setSelected(player.id, 'player');

      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { x: currentX, y: currentY };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / scale;
        const dy = (moveEvent.clientY - startY) / scale;
        movePlayer(player.id, {
          x: Math.max(radius / scale, Math.min(100 - radius / scale, startPos.x + dx)),
          y: Math.max(radius / scale, Math.min(37 - radius / scale, startPos.y + dy)),
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  const strokeColor = isOffense ? '#ff6b35' : '#0077b6';
  const fillColor = isOffense ? 'rgba(255, 107, 53, 0.85)' : 'rgba(0, 119, 182, 0.85)';
  const glowColor = isOffense ? 'rgba(255, 107, 53, 0.6)' : 'rgba(0, 119, 182, 0.6)';

  return (
    <g
      transform={`translate(${currentX * scale}, ${currentY * scale})`}
      onMouseDown={handleMouseDown}
      style={{
        cursor: currentTool === 'select' ? 'move' : 'default',
        transition: isAnimated ? 'none' : 'transform 0.1s ease-out',
      }}
    >
      {isSelected && (
        <circle
          r={radius + 1 * scale}
          fill="none"
          stroke={strokeColor}
          strokeWidth={2}
          opacity="0.8"
          style={{
            filter: `drop-shadow(0 0 ${3 * scale}px ${glowColor})`,
          }}
        >
          <animate
            attributeName="r"
            values={`${radius + 1 * scale};${radius + 2 * scale};${radius + 1 * scale}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {isAnimated && (
        <circle
          r={radius * 1.5}
          fill={fillColor}
          opacity="0.15"
        />
      )}

      <circle
        r={radius}
        fill={fillColor}
        stroke={isSelected ? '#ffffff' : strokeColor}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{
          filter: isSelected
            ? `drop-shadow(0 0 ${4 * scale}px ${glowColor})`
            : `drop-shadow(0 ${1 * scale}px ${2 * scale}px rgba(0,0,0,0.3))`,
        }}
      />

      <text
        y={0.6 * scale}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={2.2 * scale}
        fontFamily="'Rajdhani', sans-serif"
        fontWeight="700"
        style={{ userSelect: 'none', pointerEvents: 'none' }}
      >
        {player.label}
      </text>

      {isOffense && (
        <circle
          r={radius + 0.4 * scale}
          fill="none"
          stroke="#ffd60a"
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity="0.5"
        />
      )}
    </g>
  );
}
