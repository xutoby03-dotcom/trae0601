import { useTacticsStore } from '@/store/useTacticsStore';
import type { FakeNode } from '@/types';

interface FakeNodeProps {
  node: FakeNode;
  scale: number;
  isActive: boolean;
  isHighlighted?: boolean;
}

export default function FakeNodeItem({ node, scale, isActive, isHighlighted = false }: FakeNodeProps) {
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

  const size = isHighlighted ? 3.5 * scale : 3 * scale;
  const showGlow = isActive || isHighlighted;

  return (
    <g
      transform={`translate(${node.position.x * scale}, ${node.position.y * scale})`}
      onClick={handleClick}
      style={{ cursor: 'pointer' }}
      opacity={showGlow ? 1 : 0.7}
    >
      {showGlow && (
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
        fill={showGlow ? '#d00000' : 'rgba(208, 0, 0, 0.7)'}
        stroke={isSelected || isHighlighted ? '#ffffff' : '#ff4d4d'}
        strokeWidth={isSelected || isHighlighted ? 2.5 : 1.5}
        style={{
          filter: showGlow
            ? `drop-shadow(0 0 ${isHighlighted ? 10 : 8}px rgba(208, 0, 0, 0.9))`
            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
        }}
      />

      <text
        y={0.8 * scale}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={isHighlighted ? 3 * scale : 2.5 * scale}
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
        fontSize={isHighlighted ? 2.2 * scale : 1.8 * scale}
        fontFamily="'Roboto Mono', monospace"
        fontWeight="700"
        style={{ userSelect: 'none' }}
      >
        {node.time.toFixed(1)}s
      </text>
    </g>
  );
}
