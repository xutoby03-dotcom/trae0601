import { Particle } from '../../types';
import { useMemo } from 'react';

interface WindParticlesProps {
  particles: Particle[];
  windSpeed: number;
}

export const WindParticles = ({ particles, windSpeed }: WindParticlesProps) => {
  const particleOpacity = useMemo(() => 
    Math.min(0.8, 0.3 + windSpeed * 0.03),
    [windSpeed]
  );

  return (
    <g>
      <defs>
        <linearGradient id="particle-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {particles.map((p) => {
        const length = 8 + windSpeed * 1.5;
        const angle = Math.atan2(p.vy, p.vx) * (180 / Math.PI);
        const opacity = (p.life / p.maxLife) * p.opacity * particleOpacity;

        return (
          <g key={p.id} transform={`translate(${p.x}, ${p.y}) rotate(${angle})`}>
            <line
              x1={-length / 2}
              y1="0"
              x2={length / 2}
              y2="0"
              stroke="url(#particle-gradient)"
              strokeWidth="1.5"
              opacity={opacity}
              strokeLinecap="round"
            />
            <circle
              cx={length / 2}
              cy="0"
              r="1.5"
              fill="#06b6d4"
              opacity={opacity * 1.5}
            />
          </g>
        );
      })}
    </g>
  );
};
