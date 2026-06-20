import type { TrackPoint } from '../types';
import { iceRinkConfig } from '../data/mockData';

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function generateTrackPath(startX: number, startY: number, laps: number): TrackPoint[] {
  const points: TrackPoint[] = [];
  const { width, height } = iceRinkConfig;
  const bladeHeight = 2.5;
  const margin = 3;
  const passWidth = 2.5;
  const passes = Math.floor((width - margin * 2) / passWidth);

  let x = margin;
  let y = margin;
  let direction: 'down' | 'up' = 'down';
  let t = 0;

  for (let lap = 0; lap < laps; lap++) {
    for (let pass = 0; pass < passes; pass++) {
      const startY = margin;
      const endY = height - margin;
      const steps = 20;

      for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        y = direction === 'down'
          ? lerp(startY, endY, progress)
          : lerp(endY, startY, progress);

        x = margin + pass * passWidth + (direction === 'down' ? 0 : passWidth * progress * 0.1);

        points.push({
          timestamp: Date.now() + t * 1000,
          x,
          y,
          bladeHeight: bladeHeight + Math.sin(t * 0.3) * 0.2,
          water: pass % 3 === 0 && progress > 0.2 && progress < 0.8,
        });
        t += 0.5;
      }
      direction = direction === 'down' ? 'up' : 'down';
    }
  }

  return points;
}

export function calculateTrackDuration(points: TrackPoint[]): number {
  if (points.length < 2) return 0;
  return (points[points.length - 1].timestamp - points[0].timestamp) / 1000;
}

export function getTrackBounds(points: TrackPoint[]): { minX: number; maxX: number; minY: number; maxY: number } {
  if (points.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const p of points) {
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  return { minX, maxX, minY, maxY };
}
