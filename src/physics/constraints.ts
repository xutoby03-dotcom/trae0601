import Matter from 'matter-js';
import { generateId } from './tools';

const { Constraint } = Matter;

export const createSpring = (
  bodyA: Matter.Body | null,
  bodyB: Matter.Body | null,
  pointA?: { x: number; y: number },
  pointB?: { x: number; y: number },
  options: {
    stiffness?: number;
    damping?: number;
    length?: number;
    color?: string;
  } = {}
) => {
  const {
    stiffness = 0.01,
    damping = 0.1,
    length = 100,
    color = '#00f5d4',
  } = options;

  return Constraint.create({
    id: generateId() as any,
    bodyA: bodyA || undefined,
    bodyB: bodyB || undefined,
    pointA: bodyA ? undefined : pointA,
    pointB: bodyB ? undefined : pointB,
    stiffness,
    damping,
    length,
    render: {
      visible: true,
      strokeStyle: color,
      lineWidth: 2,
    },
    label: 'spring',
  });
};

export const createRope = (
  bodyA: Matter.Body | null,
  bodyB: Matter.Body | null,
  pointA?: { x: number; y: number },
  pointB?: { x: number; y: number },
  options: {
    length?: number;
    color?: string;
  } = {}
) => {
  const { length = 100, color = '#ffe66d' } = options;

  return Constraint.create({
    id: generateId() as any,
    bodyA: bodyA || undefined,
    bodyB: bodyB || undefined,
    pointA: bodyA ? undefined : pointA,
    pointB: bodyB ? undefined : pointB,
    stiffness: 1,
    damping: 0.1,
    length,
    render: {
      visible: true,
      strokeStyle: color,
      lineWidth: 3,
    },
    label: 'rope',
  });
};

export const createJoint = (
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  options: {
    stiffness?: number;
    color?: string;
  } = {}
) => {
  const { stiffness = 1, color = '#ff6b6b' } = options;

  return Constraint.create({
    id: generateId() as any,
    bodyA,
    bodyB,
    stiffness,
    damping: 0,
    length: 0,
    render: {
      visible: true,
      strokeStyle: color,
      lineWidth: 4,
    },
    label: 'joint',
  });
};

export const updateConstraintProperties = (
  constraint: Matter.Constraint,
  properties: {
    stiffness?: number;
    damping?: number;
    length?: number;
    color?: string;
  }
) => {
  if (properties.stiffness !== undefined) {
    constraint.stiffness = properties.stiffness;
  }
  if (properties.damping !== undefined) {
    constraint.damping = properties.damping;
  }
  if (properties.length !== undefined) {
    constraint.length = properties.length;
  }
  if (properties.color !== undefined && constraint.render) {
    constraint.render.strokeStyle = properties.color;
  }
};
