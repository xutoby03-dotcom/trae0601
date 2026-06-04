import { Point, NodeData, ConnectionPointPosition, ConnectionPoint } from '../types';

export function getConnectionPoint(node: NodeData, position: ConnectionPointPosition): Point {
  const { x, y, width, height } = node;
  switch (position) {
    case 'top':
      return { x: x + width / 2, y };
    case 'right':
      return { x: x + width, y: y + height / 2 };
    case 'bottom':
      return { x: x + width / 2, y: y + height };
    case 'left':
      return { x, y: y + height / 2 };
  }
}

export function rectIntersectsRect(
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number },
  padding = 0
): boolean {
  return !(
    r1.x + r1.width + padding < r2.x ||
    r2.x + r2.width + padding < r1.x ||
    r1.y + r1.height + padding < r2.y ||
    r2.y + r2.height + padding < r1.y
  );
}

export function pointInRect(
  point: Point,
  rect: { x: number; y: number; width: number; height: number }
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function lineIntersectsRect(
  p1: Point,
  p2: Point,
  rect: { x: number; y: number; width: number; height: number },
  padding = 5
): boolean {
  const r = {
    x: rect.x - padding,
    y: rect.y - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };

  if (pointInRect(p1, r) || pointInRect(p2, r)) return true;

  const edges = [
    [{ x: r.x, y: r.y }, { x: r.x + r.width, y: r.y }],
    [{ x: r.x + r.width, y: r.y }, { x: r.x + r.width, y: r.y + r.height }],
    [{ x: r.x + r.width, y: r.y + r.height }, { x: r.x, y: r.y + r.height }],
    [{ x: r.x, y: r.y + r.height }, { x: r.x, y: r.y }],
  ];

  for (const [e1, e2] of edges) {
    if (lineIntersectsLine(p1, p2, e1, e2)) return true;
  }

  return false;
}

export function lineIntersectsLine(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const d1 = direction(p3, p4, p1);
  const d2 = direction(p3, p4, p2);
  const d3 = direction(p1, p2, p3);
  const d4 = direction(p1, p2, p4);

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true;
  }

  if (d1 === 0 && onSegment(p3, p4, p1)) return true;
  if (d2 === 0 && onSegment(p3, p4, p2)) return true;
  if (d3 === 0 && onSegment(p1, p2, p3)) return true;
  if (d4 === 0 && onSegment(p1, p2, p4)) return true;

  return false;
}

function direction(p1: Point, p2: Point, p3: Point): number {
  return (p3.x - p1.x) * (p2.y - p1.y) - (p2.x - p1.x) * (p3.y - p1.y);
}

function onSegment(p1: Point, p2: Point, p: Point): boolean {
  return (
    p.x <= Math.max(p1.x, p2.x) &&
    p.x >= Math.min(p1.x, p2.x) &&
    p.y <= Math.max(p1.y, p2.y) &&
    p.y >= Math.min(p1.y, p2.y)
  );
}

export function generateOrthogonalPath(
  fromNode: NodeData,
  fromPos: ConnectionPointPosition,
  toNode: NodeData,
  toPos: ConnectionPointPosition,
  allNodes: NodeData[]
): Point[] {
  const start = getConnectionPoint(fromNode, fromPos);
  const end = getConnectionPoint(toNode, toPos);

  const otherNodes = allNodes.filter((n) => n.id !== fromNode.id && n.id !== toNode.id);

  const paths: Point[][] = [];

  const tryPath = (waypoints: Point[]): Point[] | null => {
    const fullPath = [start, ...waypoints, end];
    for (let i = 0; i < fullPath.length - 1; i++) {
      for (const node of otherNodes) {
        if (lineIntersectsRect(fullPath[i], fullPath[i + 1], node, 10)) {
          return null;
        }
      }
    }
    return fullPath;
  };

  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  if (fromPos === 'right' && toPos === 'left') {
    paths.push([{ x: midX, y: start.y }, { x: midX, y: end.y }]);
    paths.push([{ x: start.x + 50, y: start.y }, { x: start.x + 50, y: midY }, { x: end.x - 50, y: midY }, { x: end.x - 50, y: end.y }]);
  } else if (fromPos === 'left' && toPos === 'right') {
    paths.push([{ x: midX, y: start.y }, { x: midX, y: end.y }]);
    paths.push([{ x: start.x - 50, y: start.y }, { x: start.x - 50, y: midY }, { x: end.x + 50, y: midY }, { x: end.x + 50, y: end.y }]);
  } else if (fromPos === 'bottom' && toPos === 'top') {
    paths.push([{ x: start.x, y: midY }, { x: end.x, y: midY }]);
    paths.push([{ x: start.x, y: start.y + 50 }, { x: midX, y: start.y + 50 }, { x: midX, y: end.y - 50 }, { x: end.x, y: end.y - 50 }]);
  } else if (fromPos === 'top' && toPos === 'bottom') {
    paths.push([{ x: start.x, y: midY }, { x: end.x, y: midY }]);
    paths.push([{ x: start.x, y: start.y - 50 }, { x: midX, y: start.y - 50 }, { x: midX, y: end.y + 50 }, { x: end.x, y: end.y + 50 }]);
  } else if (fromPos === 'right' && toPos === 'top') {
    paths.push([{ x: end.x, y: start.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x + 50, y: start.y }, { x: start.x + 50, y: end.y - 50 }, { x: end.x, y: end.y - 50 }]);
  } else if (fromPos === 'right' && toPos === 'bottom') {
    paths.push([{ x: end.x, y: start.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x + 50, y: start.y }, { x: start.x + 50, y: end.y + 50 }, { x: end.x, y: end.y + 50 }]);
  } else if (fromPos === 'left' && toPos === 'top') {
    paths.push([{ x: end.x, y: start.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x - 50, y: start.y }, { x: start.x - 50, y: end.y - 50 }, { x: end.x, y: end.y - 50 }]);
  } else if (fromPos === 'left' && toPos === 'bottom') {
    paths.push([{ x: end.x, y: start.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x - 50, y: start.y }, { x: start.x - 50, y: end.y + 50 }, { x: end.x, y: end.y + 50 }]);
  } else if (fromPos === 'top' && toPos === 'left') {
    paths.push([{ x: start.x, y: end.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x, y: start.y - 50 }, { x: end.x - 50, y: start.y - 50 }, { x: end.x - 50, y: end.y }]);
  } else if (fromPos === 'top' && toPos === 'right') {
    paths.push([{ x: start.x, y: end.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x, y: start.y - 50 }, { x: end.x + 50, y: start.y - 50 }, { x: end.x + 50, y: end.y }]);
  } else if (fromPos === 'bottom' && toPos === 'left') {
    paths.push([{ x: start.x, y: end.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x, y: start.y + 50 }, { x: end.x - 50, y: start.y + 50 }, { x: end.x - 50, y: end.y }]);
  } else if (fromPos === 'bottom' && toPos === 'right') {
    paths.push([{ x: start.x, y: end.y }, { x: end.x, y: end.y }]);
    paths.push([{ x: start.x, y: start.y + 50 }, { x: end.x + 50, y: start.y + 50 }, { x: end.x + 50, y: end.y }]);
  }

  for (const waypoints of paths) {
    const result = tryPath(waypoints);
    if (result) return result;
  }

  const simplePath = [start];
  if (start.x !== end.x && start.y !== end.y) {
    if (Math.abs(start.x - end.x) >= Math.abs(start.y - end.y)) {
      simplePath.push({ x: end.x, y: start.y });
    } else {
      simplePath.push({ x: start.x, y: end.y });
    }
  }
  simplePath.push(end);
  return simplePath;
}

export function snapToGrid(value: number, gridSize: number = 20): number {
  return Math.round(value / gridSize) * gridSize;
}
