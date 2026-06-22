import type { CollisionRisk } from '@/types';

interface CollisionMarkerProps {
  risk: CollisionRisk;
  scale: number;
  isActive: boolean;
  isHighlighted?: boolean;
}

export default function CollisionMarker({ risk, scale, isActive, isHighlighted = false }: CollisionMarkerProps) {
  const severityColors: Record<string, string> = {
    low: '#ffd60a',
    medium: '#ff6b35',
    high: '#d00000',
  };

  const color = severityColors[risk.severity];
  const size = risk.severity === 'high' ? 3.5 : risk.severity === 'medium' ? 3 : 2.5;
  const showPulse = isActive || isHighlighted;
  const enhancedSize = isHighlighted ? size * 1.3 : size;

  return (
    <g
      transform={`translate(${risk.position.x * scale}, ${risk.position.y * scale})`}
      opacity={showPulse ? 1 : 0.5}
    >
      <circle
        r={enhancedSize * scale}
        fill={color}
        opacity={showPulse ? 0.3 : 0.1}
      >
        {showPulse && (
          <animate
            attributeName="r"
            values={`${enhancedSize * scale};${enhancedSize * 1.8 * scale};${enhancedSize * scale}`}
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <circle
        r={enhancedSize * 0.7 * scale}
        fill={color}
        opacity={showPulse ? 0.9 : 0.5}
        style={{
          filter: isHighlighted
            ? `drop-shadow(0 0 ${4 * scale}px ${color})`
            : 'none',
        }}
      />

      <text
        y={0.5 * scale}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={isHighlighted ? 2.4 * scale : 2 * scale}
        fontWeight="900"
        fontFamily="'Rajdhani', sans-serif"
        style={{ userSelect: 'none' }}
      >
        !
      </text>

      <text
        y={-enhancedSize * scale - 0.5 * scale}
        textAnchor="middle"
        fill={color}
        fontSize={isHighlighted ? 1.8 * scale : 1.5 * scale}
        fontFamily="'Roboto Mono', monospace"
        fontWeight="700"
        style={{ userSelect: 'none' }}
      >
        {risk.time.toFixed(1)}s
      </text>
    </g>
  );
}
