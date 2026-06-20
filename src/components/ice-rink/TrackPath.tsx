import { useMemo } from 'react';
import type { TrackPoint } from '../../types';

interface TrackPathProps {
  points: TrackPoint[];
  scale: number;
  animated?: boolean;
}

export function TrackPath({ points, scale, animated = false }: TrackPathProps) {
  const pathData = useMemo(() => {
    if (points.length < 2) return '';
    let d = `M ${points[0].x * scale} ${points[0].y * scale}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x * scale} ${points[i].y * scale}`;
    }
    return d;
  }, [points, scale]);

  const waterPathData = useMemo(() => {
    const waterSegments: string[] = [];
    let inWater = false;
    let currentPath = '';

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      const x = p.x * scale;
      const y = p.y * scale;

      if (p.water) {
        if (!inWater) {
          currentPath = `M ${x} ${y}`;
          inWater = true;
        } else {
          currentPath += ` L ${x} ${y}`;
        }
      } else {
        if (inWater && currentPath) {
          waterSegments.push(currentPath);
          currentPath = '';
        }
        inWater = false;
      }
    }
    if (currentPath) waterSegments.push(currentPath);
    return waterSegments;
  }, [points, scale]);

  if (points.length < 2) return null;

  return (
    <g>
      <path
        d={pathData}
        fill="none"
        stroke="rgba(56, 189, 248, 0.3)"
        strokeWidth={scale * 2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={pathData}
        fill="none"
        stroke="url(#trackGradient)"
        strokeWidth={scale * 0.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={animated ? 'animate-track-draw' : ''}
      />
      {waterPathData.map((d, i) => (
        <path
          key={`water-${i}`}
          d={d}
          fill="none"
          stroke="rgba(34, 211, 238, 0.6)"
          strokeWidth={scale * 3}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.5}
        />
      ))}
      <defs>
        <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
      </defs>
    </g>
  );
}
