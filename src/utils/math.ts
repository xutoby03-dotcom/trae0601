import { Point } from '../types';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const distance = (p1: Point, p2: Point): number => {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const lerp = (a: number, b: number, t: number): number => {
  return a + (b - a) * t;
};

export const lerpPoint = (p1: Point, p2: Point, t: number): Point => {
  return {
    x: lerp(p1.x, p2.x, t),
    y: lerp(p1.y, p2.y, t),
  };
};

export const getAngle = (from: Point, to: Point): number => {
  return Math.atan2(to.y - from.y, to.x - from.x);
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const getPathLength = (path: Point[]): number => {
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) {
    length += distance(path[i], path[i + 1]);
  }
  return length;
};

export const getSegmentLength = (path: Point[], index: number): number => {
  if (index >= path.length - 1) return 0;
  return distance(path[index], path[index + 1]);
};

export const moveAlongPath = (
  path: Point[],
  currentIndex: number,
  progress: number,
  distanceToMove: number
): { x: number; y: number; newIndex: number; newProgress: number; finished: boolean } => {
  let newIndex = currentIndex;
  let newProgress = progress;
  let remaining = distanceToMove;

  while (remaining > 0 && newIndex < path.length - 1) {
    const segLength = getSegmentLength(path, newIndex);
    const distInSegment = segLength * (1 - newProgress);

    if (remaining <= distInSegment) {
      newProgress += remaining / segLength;
      remaining = 0;
    } else {
      remaining -= distInSegment;
      newIndex++;
      newProgress = 0;
    }
  }

  const finished = newIndex >= path.length - 1;

  if (finished) {
    const lastPoint = path[path.length - 1];
    return {
      x: lastPoint.x,
      y: lastPoint.y,
      newIndex: path.length - 1,
      newProgress: 1,
      finished: true,
    };
  }

  const p1 = path[newIndex];
  const p2 = path[newIndex + 1];
  const pos = lerpPoint(p1, p2, newProgress);

  return {
    x: pos.x,
    y: pos.y,
    newIndex,
    newProgress,
    finished: false,
  };
};
