import { useTacticsStore } from '@/store/useTacticsStore';
import type { FakeNode } from '@/types';

interface FakeNodeProps {
  node: FakeNode;
  scale: number;
  isActive: boolean;
}

export default function FakeNodeItem({ node, scale, isActive }: FakeNodeProps) {
  const { selectedId, setSelected } = useTacticsStore();
  const isSelected = selectedId === node.id;

  const directionArrows: Record<string, string> = {
    left: '←',
    right: '→',
    in: '↓',
    out: '↑',
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelected(node.id, 'fake');
  };

  const size = 3 * scale;

  return (
    <g
      transform={`translate(${node.position.x * scale}, ${node.position.y * scale})`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
    >
      {isActive && (
        <circle
          r={size * 1.5}
          fill="#d00000"
          opacity="0.15"
        >
          <animate
            attributeName="r"
            values={`${size};${size * 1.8};${size}`}
            dur="0.8s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      <circle
        r={size}
        fill={isActive ? '#d00000' : 'rgba(208, 0, 0, 0.7)'}
        stroke={isSelected ? '#ffffff' : '#ff4d4d'}
        strokeWidth={isSelected ? 2.5 : 1.5}
        style={{
          filter: isActive
            ? 'drop-shadow(0 0 8px rgba(208, 0, 0, 0.8))'
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      />

      <text
        y={0.8 * scale}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={2.5 * scale}
        fontWeight="700"
        fontFamily="'Rajdhani', sans-serif"
        style={{ userSelect: 'none' }}
      >
        {directionArrows[node.direction]}
      </text>

      <text
        y={-size - 0.5 * scale}
        textAnchor="middle"
        fill="#d00000"
        fontSize={1.8 * scale}
        fontFamily="'Roboto Mono', monospace"
        fontWeight="700"
        style={{ userSelect: 'none' }}
      >
        {node.time.toFixed(1)}s
      </text>
    </g>
  );
}
