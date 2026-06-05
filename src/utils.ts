import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  AnchorPoint,
  Point,
  Shape,
  Layer,
  Document,
  Fill,
  Stroke,
  Gradient,
  GradientStop,
  PatternFill,
  TextProperties,
  GridType,
  ShapeType,
  BlendMode,
  BooleanOp,
} from './types';

export function generateId(): string {
  return uuidv4();
}

export function createDefaultFill(): Fill {
  return {
    type: 'solid',
    color: '#4a90d9',
    opacity: 1,
    gradient: null,
    pattern: null,
  };
}

export function createDefaultStroke(): Stroke {
  return {
    color: '#222222',
    width: 1,
    opacity: 1,
    dashArray: '',
    lineCap: 'butt',
    lineJoin: 'miter',
  };
}

export function createDefaultTextProps(): TextProperties {
  return {
    content: 'Text',
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    textAnchor: 'start',
    pathId: null,
    startOffset: 0,
  };
}

export function createShape(type: ShapeType, anchors: AnchorPoint[] = [], pathData: string = ''): Shape {
  return {
    id: generateId(),
    type,
    anchors,
    pathData,
    fill: createDefaultFill(),
    stroke: createDefaultStroke(),
    transform: '',
    name: getShapeDefaultName(type),
    locked: false,
    visible: true,
    opacity: 1,
    blendMode: 'normal',
    textProps: type === 'text' ? createDefaultTextProps() : null,
    children: [],
    parentId: null,
    booleanOp: null,
  };
}

function getShapeDefaultName(type: ShapeType): string {
  const names: Record<ShapeType, string> = {
    path: 'Path',
    rect: 'Rectangle',
    circle: 'Circle',
    ellipse: 'Ellipse',
    polygon: 'Polygon',
    star: 'Star',
    text: 'Text',
    group: 'Group',
  };
  return names[type] || 'Shape';
}

export function createLayer(name: string = 'Layer 1'): Layer {
  return {
    id: generateId(),
    name,
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'normal',
    expanded: true,
    shapeIds: [],
  };
}

export function createDocument(name: string = 'Untitled'): Document {
  const layer = createLayer('Layer 1');
  return {
    id: generateId(),
    name,
    width: 1920,
    height: 1080,
    layers: [layer],
    shapes: {},
    activeLayerId: layer.id,
    thumbnail: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export function anchorsToPathData(anchors: AnchorPoint[], closed: boolean = true): string {
  if (anchors.length === 0) return '';
  if (anchors.length === 1) {
    return `M ${anchors[0].x} ${anchors[0].y}`;
  }

  let d = `M ${anchors[0].x} ${anchors[0].y}`;

  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1];
    const curr = anchors[i];

    if (prev.handleOut && curr.handleIn) {
      d += ` C ${prev.x + prev.handleOut.x} ${prev.y + prev.handleOut.y}, ${curr.x + curr.handleIn.x} ${curr.y + curr.handleIn.y}, ${curr.x} ${curr.y}`;
    } else if (prev.handleOut) {
      d += ` C ${prev.x + prev.handleOut.x} ${prev.y + prev.handleOut.y}, ${curr.x} ${curr.y}, ${curr.x} ${curr.y}`;
    } else if (curr.handleIn) {
      d += ` C ${prev.x} ${prev.y}, ${curr.x + curr.handleIn.x} ${curr.y + curr.handleIn.y}, ${curr.x} ${curr.y}`;
    } else {
      d += ` L ${curr.x} ${curr.y}`;
    }
  }

  if (closed) {
    const last = anchors[anchors.length - 1];
    const first = anchors[0];
    if (last.handleOut && first.handleIn) {
      d += ` C ${last.x + last.handleOut.x} ${last.y + last.handleOut.y}, ${first.x + first.handleIn.x} ${first.y + first.handleIn.y}, ${first.x} ${first.y}`;
    } else if (last.handleOut) {
      d += ` C ${last.x + last.handleOut.x} ${last.y + last.handleOut.y}, ${first.x} ${first.y}, ${first.x} ${first.y}`;
    } else if (first.handleIn) {
      d += ` C ${last.x} ${last.y}, ${first.x + first.handleIn.x} ${first.y + first.handleIn.y}, ${first.x} ${first.y}`;
    }
    d += ' Z';
  }

  return d;
}

export function createRectAnchors(x: number, y: number, w: number, h: number): AnchorPoint[] {
  return [
    { x, y, handleIn: null, handleOut: null, type: 'corner' },
    { x: x + w, y, handleIn: null, handleOut: null, type: 'corner' },
    { x: x + w, y: y + h, handleIn: null, handleOut: null, type: 'corner' },
    { x, y: y + h, handleIn: null, handleOut: null, type: 'corner' },
  ];
}

export function createRectPath(x: number, y: number, w: number, h: number): string {
  return `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
}

export function createCircleAnchors(cx: number, cy: number, r: number): AnchorPoint[] {
  const k = 0.5522847498;
  return [
    { x: cx, y: cy - r, handleIn: { x: -r * k, y: 0 }, handleOut: { x: r * k, y: 0 }, type: 'smooth' },
    { x: cx + r, y: cy, handleIn: { x: 0, y: -r * k }, handleOut: { x: 0, y: r * k }, type: 'smooth' },
    { x: cx, y: cy + r, handleIn: { x: r * k, y: 0 }, handleOut: { x: -r * k, y: 0 }, type: 'smooth' },
    { x: cx - r, y: cy, handleIn: { x: 0, y: r * k }, handleOut: { x: 0, y: -r * k }, type: 'smooth' },
  ];
}

export function createCirclePath(cx: number, cy: number, r: number): string {
  return anchorsToPathData(createCircleAnchors(cx, cy, r), true);
}

export function createEllipseAnchors(cx: number, cy: number, rx: number, ry: number): AnchorPoint[] {
  const kx = 0.5522847498 * rx;
  const ky = 0.5522847498 * ry;
  return [
    { x: cx, y: cy - ry, handleIn: { x: -kx, y: 0 }, handleOut: { x: kx, y: 0 }, type: 'smooth' },
    { x: cx + rx, y: cy, handleIn: { x: 0, y: -ky }, handleOut: { x: 0, y: ky }, type: 'smooth' },
    { x: cx, y: cy + ry, handleIn: { x: kx, y: 0 }, handleOut: { x: -kx, y: 0 }, type: 'smooth' },
    { x: cx - rx, y: cy, handleIn: { x: 0, y: ky }, handleOut: { x: 0, y: -ky }, type: 'smooth' },
  ];
}

export function createEllipsePath(cx: number, cy: number, rx: number, ry: number): string {
  return anchorsToPathData(createEllipseAnchors(cx, cy, rx, ry), true);
}

export function createPolygonAnchors(cx: number, cy: number, r: number, sides: number): AnchorPoint[] {
  const anchors: AnchorPoint[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
    anchors.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      handleIn: null,
      handleOut: null,
      type: 'corner',
    });
  }
  return anchors;
}

export function createPolygonPath(cx: number, cy: number, r: number, sides: number): string {
  return anchorsToPathData(createPolygonAnchors(cx, cy, r, sides), true);
}

export function createStarAnchors(cx: number, cy: number, outerR: number, innerR: number, points: number): AnchorPoint[] {
  const anchors: AnchorPoint[] = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    anchors.push({
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      handleIn: null,
      handleOut: null,
      type: 'corner',
    });
  }
  return anchors;
}

export function createStarPath(cx: number, cy: number, outerR: number, innerR: number, points: number): string {
  return anchorsToPathData(createStarAnchors(cx, cy, outerR, innerR, points), true);
}

export function getShapeBounds(anchors: AnchorPoint[]): { x: number; y: number; w: number; h: number } {
  if (anchors.length === 0) return { x: 0, y: 0, w: 0, h: 0 };
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  for (const a of anchors) {
    const points: Point[] = [{ x: a.x, y: a.y }];
    if (a.handleIn) points.push({ x: a.x + a.handleIn.x, y: a.y + a.handleIn.y });
    if (a.handleOut) points.push({ x: a.x + a.handleOut.x, y: a.y + a.handleOut.y });
    for (const p of points) {
      minX = Math.min(minX, p.x);
      minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }
  }

  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function getShapeCenter(anchors: AnchorPoint[]): Point {
  const bounds = getShapeBounds(anchors);
  return { x: bounds.x + bounds.w / 2, y: bounds.y + bounds.h / 2 };
}

export function screenToCanvas(
  screenX: number,
  screenY: number,
  zoom: number,
  panX: number,
  panY: number,
  canvasRect: DOMRect
): Point {
  return {
    x: (screenX - canvasRect.left - panX) / zoom,
    y: (screenY - canvasRect.top - panY) / zoom,
  };
}

export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  zoom: number,
  panX: number,
  panY: number,
  canvasRect: DOMRect
): Point {
  return {
    x: canvasX * zoom + panX + canvasRect.left,
    y: canvasY * zoom + panY + canvasRect.top,
  };
}

export function distanceBetween(p1: Point, p2: Point): number {
  return Math.sqrt((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2);
}

export function pointOnPath(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

export function smoothBrushPoints(points: Point[], smoothing: number = 0.3): Point[] {
  if (points.length < 3) return points;
  const result: Point[] = [points[0]];
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];
    result.push({
      x: curr.x + (prev.x + next.x - 2 * curr.x) * smoothing,
      y: curr.y + (prev.y + next.y - 2 * curr.y) * smoothing,
    });
  }
  result.push(points[points.length - 1]);
  return result;
}

export function pointsToAnchors(points: Point[]): AnchorPoint[] {
  if (points.length === 0) return [];
  const anchors: AnchorPoint[] = [{ x: points[0].x, y: points[0].y, handleIn: null, handleOut: null, type: 'corner' }];

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const dist = distanceBetween(prev, curr);
    if (dist < 2) continue;

    let handleIn: Point | null = null;
    if (i > 1) {
      const prevPrev = points[Math.max(0, i - 2)];
      const dx = curr.x - prevPrev.x;
      const dy = curr.y - prevPrev.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 0) {
        const handleLen = dist * 0.3;
        handleIn = { x: (-dx / len) * handleLen, y: (-dy / len) * handleLen };
      }
    }
    anchors.push({ x: curr.x, y: curr.y, handleIn, handleOut: null, type: 'smooth' });
  }
  return anchors;
}

export function renderPixelGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  gridSize: number
): void {
  const effectiveSize = gridSize * zoom;
  if (effectiveSize < 4) return;

  ctx.strokeStyle = 'rgba(128,128,128,0.15)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  const startX = panX % effectiveSize;
  const startY = panY % effectiveSize;

  for (let x = startX; x < width; x += effectiveSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
  }
  for (let y = startY; y < height; y += effectiveSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
  }
  ctx.stroke();

  if (effectiveSize >= 20) {
    ctx.strokeStyle = 'rgba(128,128,128,0.3)';
    ctx.beginPath();
    const majorEvery = gridSize <= 10 ? 10 : gridSize <= 50 ? 5 : 2;
    const majorSize = effectiveSize * majorEvery;
    const startMajX = panX % majorSize;
    const startMajY = panY % majorSize;
    for (let x = startMajX; x < width; x += majorSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = startMajY; y < height; y += majorSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();
  }
}

export function renderIsometricGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  gridSize: number
): void {
  const effectiveSize = gridSize * zoom;
  if (effectiveSize < 4) return;

  ctx.strokeStyle = 'rgba(128,128,128,0.2)';
  ctx.lineWidth = 0.5;

  const angle30 = Math.PI / 6;
  const dx = effectiveSize * Math.cos(angle30);
  const dy = effectiveSize * Math.sin(angle30);

  ctx.beginPath();
  for (let y = -height; y < height * 2; y += effectiveSize) {
    const offY = y + (panY % effectiveSize);
    ctx.moveTo(panX % dx - width, offY);
    ctx.lineTo(panX % dx + width * 2, offY - (width * 2 * dy) / dx);
    ctx.moveTo(panX % dx - width, offY);
    ctx.lineTo(panX % dx + width * 2, offY + (width * 2 * dy) / dx);
  }
  for (let x = panX % dx - width; x < width * 2; x += dx) {
    const offX = x;
    ctx.moveTo(offX, -height);
    ctx.lineTo(offX, height * 2);
  }
  ctx.stroke();
}

export function renderPolarGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  gridSize: number
): void {
  const effectiveSize = gridSize * zoom;
  if (effectiveSize < 4) return;

  const cx = width / 2 + panX;
  const cy = height / 2 + panY;
  const maxR = Math.sqrt(width * width + height * height);

  ctx.strokeStyle = 'rgba(128,128,128,0.2)';
  ctx.lineWidth = 0.5;

  ctx.beginPath();
  for (let r = effectiveSize; r < maxR; r += effectiveSize) {
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
  }
  ctx.stroke();

  const numLines = 12;
  ctx.beginPath();
  for (let i = 0; i < numLines; i++) {
    const angle = (Math.PI * 2 * i) / numLines;
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
  }
  ctx.stroke();
}

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  gridSize: number,
  gridType: GridType
): void {
  switch (gridType) {
    case 'pixel':
      renderPixelGrid(ctx, width, height, zoom, panX, panY, gridSize);
      break;
    case 'isometric':
      renderIsometricGrid(ctx, width, height, zoom, panY, panY, gridSize);
      break;
    case 'polar':
      renderPolarGrid(ctx, width, height, zoom, panX, panY, gridSize);
      break;
  }
}

export function renderRulers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  zoom: number,
  panX: number,
  panY: number,
  rulerSize: number
): void {
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, width, rulerSize);
  ctx.fillRect(0, 0, rulerSize, height);

  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, rulerSize, rulerSize);

  ctx.strokeStyle = '#555';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rulerSize, 0);
  ctx.lineTo(rulerSize, height);
  ctx.moveTo(0, rulerSize);
  ctx.lineTo(width, rulerSize);
  ctx.stroke();

  const step = getRulerStep(zoom);
  const effectiveStep = step * zoom;

  ctx.fillStyle = '#aaa';
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const startX = panX % effectiveStep;
  for (let x = startX; x < width; x += effectiveStep) {
    const canvasX = (x - panX) / zoom;
    ctx.beginPath();
    ctx.moveTo(x + rulerSize, rulerSize);
    ctx.lineTo(x + rulerSize, rulerSize + 5);
    ctx.stroke();
    ctx.fillText(formatRulerValue(canvasX), x + rulerSize, rulerSize + 7);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  const startY = panY % effectiveStep;
  for (let y = startY; y < height; y += effectiveStep) {
    const canvasY = (y - panY) / zoom;
    ctx.beginPath();
    ctx.moveTo(rulerSize, y + rulerSize);
    ctx.lineTo(rulerSize + 5, y + rulerSize);
    ctx.stroke();
    ctx.save();
    ctx.translate(rulerSize + 7, y + rulerSize);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(formatRulerValue(canvasY), 0, 0);
    ctx.restore();
  }
}

function getRulerStep(zoom: number): number {
  if (zoom >= 8) return 1;
  if (zoom >= 4) return 2;
  if (zoom >= 2) return 5;
  if (zoom >= 1) return 10;
  if (zoom >= 0.5) return 20;
  if (zoom >= 0.25) return 50;
  return 100;
}

function formatRulerValue(val: number): string {
  return Math.round(val).toString();
}

export function snapToGrid(point: Point, gridSize: number): Point {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

export function booleanOperation(
  shape1: Shape,
  shape2: Shape,
  op: BooleanOp
): Shape {
  const result = createShape('path', [], '');
  result.fill = { ...shape1.fill };
  result.stroke = { ...shape1.stroke };

  const d1 = shape1.pathData || anchorsToPathData(shape1.anchors, true);
  const d2 = shape2.pathData || anchorsToPathData(shape2.anchors, true);

  const svgNS = 'http://www.w3.org/2000/svg';
  const tmpSvg = document.createElementNS(svgNS, 'svg');
  tmpSvg.setAttribute('width', '1');
  tmpSvg.setAttribute('height', '1');
  tmpSvg.style.position = 'absolute';
  tmpSvg.style.left = '-9999px';
  document.body.appendChild(tmpSvg);

  const path1 = document.createElementNS(svgNS, 'path');
  path1.setAttribute('d', d1);
  const path2 = document.createElementNS(svgNS, 'path');
  path2.setAttribute('d', d2);

  tmpSvg.appendChild(path1);
  tmpSvg.appendChild(path2);

  const clipRule = op === 'subtract' ? 'evenodd' : 'nonzero';

  switch (op) {
    case 'union':
      result.pathData = `${d1} ${d2}`;
      break;
    case 'subtract':
      result.pathData = `${d1} ${d2}`;
      result.booleanOp = 'subtract';
      break;
    case 'intersect':
      result.pathData = `${d1} ${d2}`;
      result.booleanOp = 'intersect';
      break;
    case 'exclude':
      result.pathData = `${d1} ${d2}`;
      result.booleanOp = 'exclude';
      break;
  }

  document.body.removeChild(tmpSvg);
  result.name = `${op} result`;
  return result;
}

export function generateFillSVG(fill: Fill, shapeId: string): { attrs: Record<string, string>; defs: React.ReactElement | null } {
  const attrs: Record<string, string> = {};
  let defs: React.ReactElement | null = null;

  switch (fill.type) {
    case 'none':
      attrs.fill = 'none';
      break;
    case 'solid':
      attrs.fill = fill.color;
      attrs['fill-opacity'] = fill.opacity.toString();
      break;
    case 'linearGradient': {
      const gradId = `grad-${shapeId}`;
      if (fill.gradient) {
        attrs.fill = `url(#${gradId})`;
        defs = createGradientSVG(gradId, fill.gradient);
      }
      break;
    }
    case 'radialGradient': {
      const gradId = `grad-${shapeId}`;
      if (fill.gradient) {
        attrs.fill = `url(#${gradId})`;
        defs = createGradientSVG(gradId, fill.gradient);
      }
      break;
    }
    case 'pattern': {
      const patId = `pat-${shapeId}`;
      if (fill.pattern) {
        attrs.fill = `url(#${patId})`;
        defs = createPatternSVG(patId, fill.pattern);
      }
      break;
    }
  }

  return { attrs, defs };
}

function createGradientSVG(id: string, gradient: Gradient): React.ReactElement {
  if (gradient.type === 'linear') {
    const angle = (gradient.angle * Math.PI) / 180;
    const x1 = 50 - Math.cos(angle) * 50;
    const y1 = 50 - Math.sin(angle) * 50;
    const x2 = 50 + Math.cos(angle) * 50;
    const y2 = 50 + Math.sin(angle) * 50;
    return React.createElement(
      'linearGradient',
      { id, x1: `${x1}%`, y1: `${y1}%`, x2: `${x2}%`, y2: `${y2}%` },
      gradient.stops.map((s, i) =>
        React.createElement('stop', {
          key: i,
          offset: `${s.offset * 100}%`,
          stopColor: s.color,
          stopOpacity: s.opacity,
        })
      )
    );
  } else {
    return React.createElement(
      'radialGradient',
      { id, cx: `${gradient.cx || 50}%`, cy: `${gradient.cy || 50}%`, r: '50%' },
      gradient.stops.map((s, i) =>
        React.createElement('stop', {
          key: i,
          offset: `${s.offset * 100}%`,
          stopColor: s.color,
          stopOpacity: s.opacity,
        })
      )
    );
  }
}

function createPatternSVG(id: string, pattern: PatternFill): React.ReactElement {
  const size = pattern.spacing * pattern.scale;
  const children: React.ReactElement[] = [];

  switch (pattern.type) {
    case 'dots':
      children.push(
        React.createElement('circle', {
          cx: size / 2,
          cy: size / 2,
          r: size * 0.15,
          fill: pattern.color,
        })
      );
      break;
    case 'lines':
      children.push(
        React.createElement('line', {
          x1: 0,
          y1: size / 2,
          x2: size,
          y2: size / 2,
          stroke: pattern.color,
          strokeWidth: size * 0.1,
        })
      );
      break;
    case 'crosshatch':
      children.push(
        React.createElement('line', {
          x1: 0,
          y1: 0,
          x2: size,
          y2: size,
          stroke: pattern.color,
          strokeWidth: size * 0.05,
        }),
        React.createElement('line', {
          x1: size,
          y1: 0,
          x2: 0,
          y2: size,
          stroke: pattern.color,
          strokeWidth: size * 0.05,
        })
      );
      break;
    case 'zigzag':
      children.push(
        React.createElement('polyline', {
          points: `0,${size * 0.75} ${size / 2},${size * 0.25} ${size},${size * 0.75}`,
          fill: 'none',
          stroke: pattern.color,
          strokeWidth: size * 0.05,
        })
      );
      break;
  }

  return React.createElement(
    'pattern',
    {
      id,
      x: 0,
      y: 0,
      width: size,
      height: size,
      patternUnits: 'userSpaceOnUse',
      patternTransform: `rotate(${pattern.angle})`,
    },
    React.createElement('rect', { width: size, height: size, fill: pattern.backgroundColor }),
    ...children
  );
}

export function generateStrokeSVG(stroke: Stroke): Record<string, string> {
  const attrs: Record<string, string> = {
    stroke: stroke.color,
    'stroke-width': stroke.width.toString(),
    'stroke-opacity': stroke.opacity.toString(),
    'stroke-linecap': stroke.lineCap,
    'stroke-linejoin': stroke.lineJoin,
  };
  if (stroke.dashArray) {
    attrs['stroke-dasharray'] = stroke.dashArray;
  }
  return attrs;
}

export function exportToSVGString(doc: Document): string {
  const allDefs: string[] = [];
  let shapeElements = '';

  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    for (const shapeId of layer.shapeIds) {
      const shape = doc.shapes[shapeId];
      if (!shape || !shape.visible) continue;
      const { attrs, defs } = generateFillSVG(shape.fill, shape.id);
      const strokeAttrs = generateStrokeSVG(shape.stroke);

      if (defs) {
        allDefs.push(renderDefToString(defs));
      }

      const allAttrs = { ...attrs, ...strokeAttrs };
      allAttrs.opacity = (shape.opacity * layer.opacity).toString();
      allAttrs['mix-blend-mode'] = shape.blendMode !== 'normal' ? shape.blendMode : undefined as any;

      const attrStr = Object.entries(allAttrs)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${k}="${v}"`)
        .join(' ');

      if (shape.type === 'text' && shape.textProps) {
        const tp = shape.textProps;
        if (tp.pathId) {
          allDefs.push(`<path id="textpath-${shape.id}" d="${shape.pathData || ''}" />`);
          shapeElements += `<text ${attrStr} font-family="${tp.fontFamily}" font-size="${tp.fontSize}" font-weight="${tp.fontWeight}" font-style="${tp.fontStyle}"><textPath href="#textpath-${shape.id}" startOffset="${tp.startOffset}%">${tp.content}</textPath></text>\n`;
        } else {
          shapeElements += `<text ${attrStr} font-family="${tp.fontFamily}" font-size="${tp.fontSize}" font-weight="${tp.fontWeight}" font-style="${tp.fontStyle}" text-anchor="${tp.textAnchor}">${tp.content}</text>\n`;
        }
      } else {
        const d = shape.pathData || anchorsToPathData(shape.anchors, true);
        if (shape.booleanOp === 'subtract') {
          shapeElements += `<path ${attrStr} d="${d}" fill-rule="evenodd" />\n`;
        } else if (shape.booleanOp === 'intersect') {
          shapeElements += `<path ${attrStr} d="${d}" clip-rule="evenodd" />\n`;
        } else if (shape.booleanOp === 'exclude') {
          shapeElements += `<path ${attrStr} d="${d}" fill-rule="evenodd" />\n`;
        } else {
          shapeElements += `<path ${attrStr} d="${d}" />\n`;
        }
      }
    }
  }

  const defsStr = allDefs.length > 0 ? `<defs>\n${allDefs.join('\n')}\n</defs>\n` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${doc.width}" height="${doc.height}" viewBox="0 0 ${doc.width} ${doc.height}">
${defsStr}${shapeElements}</svg>`;
}

function renderDefToString(element: React.ReactElement): string {
  const type = element.type as string;
  const props = element.props as any;
  const children = props.children;

  const attrStr = Object.entries(props)
    .filter(([k, v]) => k !== 'children' && v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${v}"`)
    .join(' ');

  if (Array.isArray(children)) {
    const inner = children.map((c: any) => renderDefToString(c)).join('\n');
    return `<${type} ${attrStr}>\n${inner}\n</${type}>`;
  } else if (children) {
    return `<${type} ${attrStr}>${children}</${type}>`;
  }
  return `<${type} ${attrStr} />`;
}

export function exportToPNG(doc: Document, scale: number = 1): Promise<string> {
  return new Promise((resolve) => {
    const svgStr = exportToSVGString(doc);
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = doc.width * scale;
      canvas.height = doc.height * scale;
      const ctx = canvas.getContext('2d')!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.src = url;
  });
}

export function importSVG(svgString: string): { shapes: Shape[]; width: number; height: number } {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return { shapes: [], width: 800, height: 600 };

  const width = parseFloat(svg.getAttribute('width') || '800');
  const height = parseFloat(svg.getAttribute('height') || '600');
  const shapes: Shape[] = [];

  const paths = svg.querySelectorAll('path, rect, circle, ellipse, polygon, polyline, line, text');
  paths.forEach((el) => {
    const tagName = el.tagName.toLowerCase();
    let pathData = '';

    switch (tagName) {
      case 'path':
        pathData = el.getAttribute('d') || '';
        break;
      case 'rect': {
        const x = parseFloat(el.getAttribute('x') || '0');
        const y = parseFloat(el.getAttribute('y') || '0');
        const w = parseFloat(el.getAttribute('width') || '0');
        const h = parseFloat(el.getAttribute('height') || '0');
        pathData = createRectPath(x, y, w, h);
        break;
      }
      case 'circle': {
        const cx = parseFloat(el.getAttribute('cx') || '0');
        const cy = parseFloat(el.getAttribute('cy') || '0');
        const r = parseFloat(el.getAttribute('r') || '0');
        pathData = createCirclePath(cx, cy, r);
        break;
      }
      case 'ellipse': {
        const cx = parseFloat(el.getAttribute('cx') || '0');
        const cy = parseFloat(el.getAttribute('cy') || '0');
        const rx = parseFloat(el.getAttribute('rx') || '0');
        const ry = parseFloat(el.getAttribute('ry') || '0');
        pathData = createEllipsePath(cx, cy, rx, ry);
        break;
      }
      case 'polygon':
      case 'polyline': {
        const points = el.getAttribute('points') || '';
        const pts = points
          .trim()
          .split(/[\s,]+/)
          .reduce<{ x: number; y: number }[]>((acc, _, i, arr) => {
            if (i % 2 === 0 && i + 1 < arr.length) {
              acc.push({ x: parseFloat(arr[i]), y: parseFloat(arr[i + 1]) });
            }
            return acc;
          }, []);
        const anchors = pts.map((p) => ({
          x: p.x,
          y: p.y,
          handleIn: null,
          handleOut: null,
          type: 'corner' as const,
        }));
        pathData = anchorsToPathData(anchors, tagName === 'polygon');
        break;
      }
      case 'text': {
        const shape = createShape('text');
        const content = el.textContent || 'Text';
        shape.textProps = {
          content,
          fontFamily: el.getAttribute('font-family') || 'Arial',
          fontSize: parseFloat(el.getAttribute('font-size') || '16'),
          fontWeight: el.getAttribute('font-weight') || 'normal',
          fontStyle: el.getAttribute('font-style') || 'normal',
          textAlign: el.getAttribute('text-anchor') === 'middle' ? 'center' : el.getAttribute('text-anchor') === 'end' ? 'right' : 'left',
          textAnchor: el.getAttribute('text-anchor') || 'start',
          pathId: null,
          startOffset: 0,
        };
        const x = parseFloat(el.getAttribute('x') || '0');
        const y = parseFloat(el.getAttribute('y') || '0');
        shape.anchors = [{ x, y, handleIn: null, handleOut: null, type: 'corner' }];
        shape.pathData = `M ${x} ${y}`;
        const fillAttr = el.getAttribute('fill');
        if (fillAttr) shape.fill = { type: 'solid', color: fillAttr, opacity: 1, gradient: null, pattern: null };
        shapes.push(shape);
        return;
      }
    }

    if (pathData) {
      const shape = createShape('path');
      shape.pathData = pathData;

      const fillAttr = el.getAttribute('fill');
      if (fillAttr && fillAttr !== 'none') {
        shape.fill = { type: 'solid', color: fillAttr, opacity: 1, gradient: null, pattern: null };
      } else if (fillAttr === 'none') {
        shape.fill = { type: 'none', color: '', opacity: 1, gradient: null, pattern: null };
      }

      const strokeAttr = el.getAttribute('stroke');
      if (strokeAttr) {
        shape.stroke.color = strokeAttr;
        shape.stroke.width = parseFloat(el.getAttribute('stroke-width') || '1');
      }

      const dashArray = el.getAttribute('stroke-dasharray');
      if (dashArray) shape.stroke.dashArray = dashArray;

      shapes.push(shape);
    }
  });

  return { shapes, width, height };
}

export function alignShapes(
  shapes: Shape[],
  direction: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
): Shape[] {
  if (shapes.length < 2) return shapes;

  const bounds = shapes.map((s) => getShapeBounds(s.anchors));

  switch (direction) {
    case 'left': {
      const minX = Math.min(...bounds.map((b) => b.x));
      return shapes.map((s, i) => {
        const dx = minX - bounds[i].x;
        return { ...s, anchors: s.anchors.map((a) => ({ ...a, x: a.x + dx })) };
      });
    }
    case 'center': {
      const centers = bounds.map((b) => b.x + b.w / 2);
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
      return shapes.map((s, i) => {
        const dx = avgCenter - centers[i];
        return { ...s, anchors: s.anchors.map((a) => ({ ...a, x: a.x + dx })) };
      });
    }
    case 'right': {
      const maxRight = Math.max(...bounds.map((b) => b.x + b.w));
      return shapes.map((s, i) => {
        const dx = maxRight - (bounds[i].x + bounds[i].w);
        return { ...s, anchors: s.anchors.map((a) => ({ ...a, x: a.x + dx })) };
      });
    }
    case 'top': {
      const minY = Math.min(...bounds.map((b) => b.y));
      return shapes.map((s, i) => {
        const dy = minY - bounds[i].y;
        return { ...s, anchors: s.anchors.map((a) => ({ ...a, y: a.y + dy })) };
      });
    }
    case 'middle': {
      const centers = bounds.map((b) => b.y + b.h / 2);
      const avgCenter = centers.reduce((a, b) => a + b, 0) / centers.length;
      return shapes.map((s, i) => {
        const dy = avgCenter - centers[i];
        return { ...s, anchors: s.anchors.map((a) => ({ ...a, y: a.y + dy })) };
      });
    }
    case 'bottom': {
      const maxBottom = Math.max(...bounds.map((b) => b.y + b.h));
      return shapes.map((s, i) => {
        const dy = maxBottom - (bounds[i].y + bounds[i].h);
        return { ...s, anchors: s.anchors.map((a) => ({ ...a, y: a.y + dy })) };
      });
    }
  }
}

export function distributeShapes(
  shapes: Shape[],
  direction: 'horizontal' | 'vertical'
): Shape[] {
  if (shapes.length < 3) return shapes;

  const bounds = shapes.map((s) => getShapeBounds(s.anchors));

  if (direction === 'horizontal') {
    const sorted = bounds
      .map((b, i) => ({ b, i }))
      .sort((a, b) => a.b.x - b.b.x);
    const first = sorted[0].b;
    const last = sorted[sorted.length - 1].b;
    const totalSpace = last.x - first.x;
    const gap = totalSpace / (sorted.length - 1);

    return shapes.map((s, originalIdx) => {
      const sortIdx = sorted.findIndex((item) => item.i === originalIdx);
      const dx = first.x + gap * sortIdx - bounds[originalIdx].x;
      return { ...s, anchors: s.anchors.map((a) => ({ ...a, x: a.x + dx })) };
    });
  } else {
    const sorted = bounds
      .map((b, i) => ({ b, i }))
      .sort((a, b) => a.b.y - b.b.y);
    const first = sorted[0].b;
    const last = sorted[sorted.length - 1].b;
    const totalSpace = last.y - first.y;
    const gap = totalSpace / (sorted.length - 1);

    return shapes.map((s, originalIdx) => {
      const sortIdx = sorted.findIndex((item) => item.i === originalIdx);
      const dy = first.y + gap * sortIdx - bounds[originalIdx].y;
      return { ...s, anchors: s.anchors.map((a) => ({ ...a, y: a.y + dy })) };
    });
  }
}

const DB_NAME = 'svg-editor-db';
const DB_VERSION = 1;
const STORE_NAME = 'documents';

export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveDocument(doc: Document): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ ...doc, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadDocument(id: string): Promise<Document | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function listDocuments(): Promise<Pick<Document, 'id' | 'name' | 'thumbnail' | 'updatedAt'>[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const docs = (request.result as Document[]).map((d) => ({
        id: d.id,
        name: d.name,
        thumbnail: d.thumbnail,
        updatedAt: d.updatedAt,
      }));
      resolve(docs);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function generateThumbnail(doc: Document): string {
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = 120;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, 200, 120);

  const scaleX = 200 / doc.width;
  const scaleY = 120 / doc.height;
  const scale = Math.min(scaleX, scaleY) * 0.9;
  const offsetX = (200 - doc.width * scale) / 2;
  const offsetY = (120 - doc.height * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(0, 0, doc.width, doc.height);

  for (const layer of doc.layers) {
    if (!layer.visible) continue;
    for (const shapeId of layer.shapeIds) {
      const shape = doc.shapes[shapeId];
      if (!shape || !shape.visible) continue;

      const path = new Path2D(shape.pathData || anchorsToPathData(shape.anchors, true));
      if (shape.fill.type !== 'none') {
        ctx.fillStyle = shape.fill.color;
        ctx.globalAlpha = shape.opacity * layer.opacity;
        ctx.fill(path);
      }
      if (shape.stroke.width > 0) {
        ctx.strokeStyle = shape.stroke.color;
        ctx.lineWidth = shape.stroke.width;
        ctx.globalAlpha = shape.opacity * layer.opacity;
        ctx.stroke(path);
      }
    }
  }

  ctx.restore();
  return canvas.toDataURL('image/png', 0.5);
}
