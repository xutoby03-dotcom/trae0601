import { useMemo } from 'react';
import type { TrackPoint } from '../../types';

interface BladeHeatmapProps {
  points: TrackPoint[];
  scale: number;
  minHeight?: number;
  maxHeight?: number;
}

export function BladeHeatmap({ points, scale, minHeight = 1.5, maxHeight = 3.5 }: BladeHeatmapProps) {
  const segments = useMemo(() => {
    if (points.length < 2) return [];
    return points.map((p, i) => {
      if (i === 0) return null;
      const prev = points[i - 1];
      const avgHeight = (p.bladeHeight + prev.bladeHeight) / 2;
      const normalized = (avgHeight - minHeight) / (maxHeight - minHeight);
      const clamped = Math.max(0, Math.min(1, normalized));
      return {
        x1: prev.x * scale,
        y1: prev.y * scale,
        x2: p.x * scale,
        y2: p.y * scale,
        intensity: clamped,
      };
    }).filter(Boolean);
  }, [points, scale, minHeight, maxHeight]);

  if (points.length < 2) return null;

  const getColor = (intensity: number) => {
    const r = Math.round(14 + intensity * 239);
    const g = Math.round(165 - intensity * 121);
    const b = Math.round(233 - intensity * 188);
    return `rgba(${r}, ${g}, ${b}, 0.7)`;
  };

  return (
    <g>
      {segments.map((seg, i) => (
      seg && (
        <line
          key={i}
          x1={seg.x1}
          y1={seg.y1}
          x2={seg.x2}
          y2={seg.y2}
          stroke={getColor(seg.intensity)}
          strokeWidth={scale * 2.5}
          strokeLinecap="round"
        />
      )
    ))}
    </g>
  );
}
