import Matter from 'matter-js';
import type { ToolType } from '../types';

const { Bodies, Vertices, Composite } = Matter;

export const generateId = () => Math.random().toString(36).substring(2, 9);

const defaultRender = (color: string) => ({
  fillStyle: color,
  strokeStyle: '#ffffff22',
  lineWidth: 2,
});

export const createRectangle = (
  x: number,
  y: number,
  width: number,
  height: number,
  options: {
    color?: string;
    isStatic?: boolean;
    density?: number;
    friction?: number;
    restitution?: number;
  } = {}
) => {
  const {
    color = '#00f5d4',
    isStatic = false,
    density = 0.001,
    friction = 0.1,
    restitution = 0.5,
  } = options;

  return Bodies.rectangle(x, y, Math.abs(width), Math.abs(height), {
    id: generateId() as any,
    isStatic,
    density,
    friction,
    restitution,
    render: defaultRender(color),
    label: 'rectangle',
  });
};

export const createCircle = (
  x: number,
  y: number,
  radius: number,
  options: {
    color?: string;
    isStatic?: boolean;
    density?: number;
    friction?: number;
    restitution?: number;
  } = {}
) => {
  const {
    color = '#9d4edd',
    isStatic = false,
    density = 0.001,
    friction = 0.1,
    restitution = 0.5,
  } = options;

  return Bodies.circle(x, y, Math.abs(radius), {
    id: generateId() as any,
    isStatic,
    density,
    friction,
    restitution,
    render: defaultRender(color),
    label: 'circle',
  });
};

export const createTriangle = (
  x: number,
  y: number,
  radius: number,
  options: {
    color?: string;
    isStatic?: boolean;
    density?: number;
    friction?: number;
    restitution?: number;
  } = {}
) => {
  const {
    color = '#ff6b6b',
    isStatic = false,
    density = 0.001,
    friction = 0.1,
    restitution = 0.5,
  } = options;

  return Bodies.polygon(x, y, 3, Math.abs(radius), {
    id: generateId() as any,
    isStatic,
    density,
    friction,
    restitution,
    render: defaultRender(color),
    label: 'triangle',
  });
};

export const createPolygon = (
  x: number,
  y: number,
  sides: number,
  radius: number,
  options: {
    color?: string;
    isStatic?: boolean;
    density?: number;
    friction?: number;
    restitution?: number;
  } = {}
) => {
  const {
    color = '#4ecdc4',
    isStatic = false,
    density = 0.001,
    friction = 0.1,
    restitution = 0.5,
  } = options;

  return Bodies.polygon(x, y, sides, Math.abs(radius), {
    id: generateId() as any,
    isStatic,
    density,
    friction,
    restitution,
    render: defaultRender(color),
    label: 'polygon',
  });
};

export const createFreehand = (
  points: { x: number; y: number }[],
  options: {
    color?: string;
    isStatic?: boolean;
    density?: number;
    friction?: number;
    restitution?: number;
  } = {}
) => {
  const {
    color = '#ffe66d',
    isStatic = false,
    density = 0.001,
    friction = 0.1,
    restitution = 0.5,
  } = options;

  if (points.length < 3) return null;

  const centroid = Vertices.centre(points);

  const translatedPoints = points.map((p) => ({
    x: p.x - centroid.x,
    y: p.y - centroid.y,
  }));

  return Bodies.fromVertices(centroid.x, centroid.y, [translatedPoints], {
    id: generateId() as any,
    isStatic,
    density,
    friction,
    restitution,
    render: defaultRender(color),
    label: 'freehand',
  });
};

export const getToolIcon = (tool: ToolType) => {
  const icons: Record<ToolType, string> = {
    select: 'hand',
    rectangle: 'square',
    circle: 'circle',
    triangle: 'triangle',
    polygon: 'hexagon',
    freehand: 'pen',
    spring: 'waves',
    rope: 'link',
    joint: 'anchor',
  };
  return icons[tool];
};

export const getToolName = (tool: ToolType) => {
  const names: Record<ToolType, string> = {
    select: '手指工具',
    rectangle: '矩形',
    circle: '圆形',
    triangle: '三角形',
    polygon: '多边形',
    freehand: '自由绘制',
    spring: '弹簧',
    rope: '绳索',
    joint: '固定关节',
  };
  return names[tool];
};

export const applyExplosion = (
  engine: Matter.Engine,
  centerX: number,
  centerY: number,
  force: number,
  radius: number = 200
) => {
  const bodies = Composite.allBodies(engine.world);

  bodies.forEach((body) => {
    if (body.isStatic) return;

    const dx = body.position.x - centerX;
    const dy = body.position.y - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < radius && distance > 0) {
      const normalizedForce = (1 - distance / radius) * force;
      const fx = (dx / distance) * normalizedForce;
      const fy = (dy / distance) * normalizedForce;

      Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
    }
  });
};

export const updateBodyProperties = (
  body: Matter.Body,
  properties: {
    density?: number;
    friction?: number;
    restitution?: number;
    isStatic?: boolean;
    color?: string;
  }
) => {
  if (properties.density !== undefined) {
    Matter.Body.setDensity(body, properties.density);
  }
  if (properties.friction !== undefined) {
    body.friction = properties.friction;
  }
  if (properties.restitution !== undefined) {
    body.restitution = properties.restitution;
  }
  if (properties.isStatic !== undefined) {
    Matter.Body.setStatic(body, properties.isStatic);
  }
  if (properties.color !== undefined && body.render) {
    body.render.fillStyle = properties.color;
  }
};
