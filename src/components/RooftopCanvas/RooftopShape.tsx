import { Rooftop } from '../../types';

interface RooftopShapeProps {
  rooftop: Rooftop;
}

export const RooftopShape = ({ rooftop }: RooftopShapeProps) => {
  const pathData = rooftop.outline
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ') + ' Z';

  return (
    <g>
      <defs>
        <pattern
          id="grid-pattern"
          patternUnits="userSpaceOnUse"
          width="20"
          height="20"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="20"
            stroke="rgba(6, 182, 212, 0.1)"
            strokeWidth="0.5"
          />
          <line
            x1="0"
            y1="0"
            x2="20"
            y2="0"
            stroke="rgba(6, 182, 212, 0.1)"
            strokeWidth="0.5"
          />
        </pattern>
        <linearGradient id="rooftop-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(30, 41, 59, 0.9)" />
          <stop offset="100%" stopColor="rgba(15, 23, 42, 0.95)" />
        </linearGradient>
        <filter id="rooftop-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d={pathData}
        fill="url(#rooftop-gradient)"
        stroke="rgba(6, 182, 212, 0.4)"
        strokeWidth="2"
        filter="url(#rooftop-glow)"
      />

      <path
        d={pathData}
        fill="url(#grid-pattern)"
        stroke="none"
      />

      {rooftop.outline.map((p, i) => (
        <circle
          key={`corner-${i}`}
          cx={p.x}
          cy={p.y}
          r="4"
          fill="#06b6d4"
          className="animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </g>
  );
};
