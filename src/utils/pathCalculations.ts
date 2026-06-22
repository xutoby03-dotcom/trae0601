import type { Point, Keyframe, Route, Player, Disc, Play } from '../types';

export function distance(a: Point, b: Point): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

export function lerp(a: Point, b: Point, t: number): Point {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getPositionAtTime(
  startPos: Point,
  keyframes: Keyframe[],
  currentTime: number,
): Point {
  const allFrames: Keyframe[] = [
    { id: 'start', time: 0, position: startPos },
    ...keyframes.sort((a, b) => a.time - b.time),
  ];

  if (currentTime <= allFrames[0].time) {
    return allFrames[0].position;
  }

  if (currentTime >= allFrames[allFrames.length - 1].time) {
    return allFrames[allFrames.length - 1].position;
  }

  for (let i = 0; i < allFrames.length - 1; i++) {
    const curr = allFrames[i];
    const next = allFrames[i + 1];
    if (currentTime >= curr.time && currentTime <= next.time) {
      const t = (currentTime - curr.time) / (next.time - curr.time);
      return lerp(curr.position, next.position, t);
    }
  }

  return allFrames[allFrames.length - 1].position;
}

export function getPlayerPositionAtTime(
  player: Player,
  routes: Route[],
  currentTime: number,
): Point {
  const route = routes.find((r) => r.playerId === player.id);
  if (!route || route.keyframes.length === 0) {
    return player.startPosition;
  }
  return getPositionAtTime(player.startPosition, route.keyframes, currentTime);
}

export function getDiscPositionAtTime(
  disc: Disc,
  players: Player[],
  routes: Route[],
  currentTime: number,
): Point {
  if (currentTime < disc.releaseTime) {
    if (disc.holderId) {
      const holder = players.find((p) => p.id === disc.holderId);
      if (holder) {
        return getPlayerPositionAtTime(holder, routes, currentTime);
      }
    }
    return disc.position;
  }
  return disc.position;
}

export function pathToSvgD(
  startPos: Point,
  keyframes: Keyframe[],
  scale: number,
): string {
  if (keyframes.length === 0) {
    return `M ${startPos.x * scale} ${startPos.y * scale}`;
  }
  const sortedFrames = [...keyframes].sort((a, b) => a.time - b.time);
  let d = `M ${startPos.x * scale} ${startPos.y * scale}`;
  for (const frame of sortedFrames) {
    d += ` L ${frame.position.x * scale} ${frame.position.y * scale}`;
  }
  return d;
}

export function segmentsIntersect(
  p1: Point,
  p2: Point,
  p3: Point,
  p4: Point,
): Point | null {
  const denom = (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (Math.abs(denom) < 0.0001) return null;

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) / denom;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) / denom;

  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: p1.x + ua * (p2.x - p1.x),
      y: p1.y + ua * (p2.y - p1.y),
    };
  }
  return null;
}

export function getRouteSegments(
  startPos: Point,
  keyframes: Keyframe[],
): { start: Point; end: Point; startTime: number; endTime: number }[] {
  const segments: { start: Point; end: Point; startTime: number; endTime: number }[] = [];
  const allFrames = [{ time: 0, position: startPos }, ...keyframes.sort((a, b) => a.time - b.time)];
  for (let i = 0; i < allFrames.length - 1; i++) {
    segments.push({
      start: allFrames[i].position,
      end: allFrames[i + 1].position,
      startTime: allFrames[i].time,
      endTime: allFrames[i + 1].time,
    });
  }
  return segments;
}

export function getTimeAtPositionOnSegment(
  start: Point,
  end: Point,
  startTime: number,
  endTime: number,
  target: Point,
): number {
  const totalDist = distance(start, end);
  const targetDist = distance(start, target);
  if (totalDist === 0) return startTime;
  const t = targetDist / totalDist;
  return startTime + t * (endTime - startTime);
}

export function calculateRouteLength(startPos: Point, keyframes: Keyframe[]): number {
  let length = 0;
  const allFrames = [
    { time: 0, position: startPos },
    ...keyframes.sort((a, b) => a.time - b.time),
  ];
  for (let i = 0; i < allFrames.length - 1; i++) {
    length += distance(allFrames[i].position, allFrames[i + 1].position);
  }
  return length;
}
