import type { CollisionRisk } from '@/types';

interface CollisionMarkerProps {
  risk: CollisionRisk;
  scale: number;
  isActive: boolean;
}

export default function CollisionMarker({ risk, scale, isActive }: CollisionMarkerProps) {
  const severityColors: Record<string, string> = {
    low: '#ffd60a',
    medium: '#ff6b35',
    high: '#d00000',
  };

  const color = severityColors[risk.severity];
  const size = risk.severity === 'high' ? 3.5 : risk.severity === 'medium' ? 3 : 2.5;

  return (
    <g
      transform={`translate(${risk.position.x * scale}, ${risk.position.y * scale})`}
      opacity={isActive ? 1 : 0.5}
    >
      <circle
        r={size * scale}
        fill={color}
        opacity={isActive ? 0.3 : 0.1}
      >
        {isActive && (
          <animate
            attributeName="r"
            values={`${size * scale};${size * 1.8 * scale};${size * scale}`}
            dur="1.2s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <circle
        r={size * 0.7 * scale}
        fill={color}
        opacity={isActive ? 0.8 : 0.4}
      />

      <text
        y={0.5 * scale}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={2 * scale}
        fontWeight="900"
        fontFamily="'Rajdhani', sans-serif"
        style={{ userSelect: 'none' }}
      >
        !
      </text>

      <text
        y={-size * scale - 0.5 * scale}
        textAnchor="middle"
        fill={color}
        fontSize={1.5 * scale}
        fontFamily="'Roboto Mono', monospace"
        fontWeight="700"
        style={{ userSelect: 'none' }}
      >
        {risk.time.toFixed(1)}s
      </text>
    </g>
  );
}
