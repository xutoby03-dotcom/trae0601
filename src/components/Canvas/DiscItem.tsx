import { useTacticsStore } from '@/store/useTacticsStore';

interface DiscProps {
  x: number;
  y: number;
  scale: number;
}

export default function DiscItem({ x, y, scale }: DiscProps) {
  const { setSelected, selectedId, currentTool, setDiscPosition } = useTacticsStore();
  const isSelected = selectedId === 'disc';
  const radius = 1.8 * scale;

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentTool === 'select') {
      setSelected('disc', 'disc');

      const startX = e.clientX;
      const startY = e.clientY;
      const startPos = { x, y };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const dx = (moveEvent.clientX - startX) / scale;
        const dy = (moveEvent.clientY - startY) / scale;
        setDiscPosition({
          x: Math.max(0, Math.min(100, startPos.x + dx)),
          y: Math.max(0, Math.min(37, startPos.y + dy)),
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

  return (
    <g
      transform={`translate(${x * scale}, ${y * scale})`}
      onMouseDown={handleMouseDown}
      style={{ cursor: currentTool === 'select' ? 'move' : 'default' }}
    >
      {isSelected && (
        <circle
          r={radius + 1.5 * scale}
          fill="none"
          stroke="#ffd60a"
          strokeWidth={2}
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values={`${radius + 1 * scale};${radius + 2.5 * scale};${radius + 1 * scale}`}
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      <circle
        r={radius * 1.2}
        fill="rgba(255, 214, 10, 0.2)"
      />

      <ellipse
        rx={radius}
        ry={radius * 0.6}
        fill="#ffd60a"
        stroke="#e6b800"
        strokeWidth={1.5}
        style={{
          filter: isSelected
            ? 'drop-shadow(0 0 6px rgba(255, 214, 10, 0.8))'
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      />

      <ellipse
        rx={radius * 0.5}
        ry={radius * 0.3}
        fill="none"
        stroke="#e6b800"
        strokeWidth={1}
        opacity="0.6"
      />

      <circle
        r={radius * 0.15}
        fill="#e6b800"
      />
    </g>
  );
}
