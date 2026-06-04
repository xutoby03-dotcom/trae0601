import Matter from 'matter-js';
import type { SceneData } from '../types';
import { generateId } from './tools';

const { Bodies, Composite, Constraint } = Matter;

export const createNewtonCradle = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const constraints: any[] = [];
  const centerX = width / 2;
  const centerY = height / 3;

  const frameTop = Bodies.rectangle(centerX, centerY - 100, 300, 20, {
    isStatic: true,
    render: { fillStyle: '#4a4a6a' },
  });
  bodies.push(frameTop);

  const frameLeft = Bodies.rectangle(centerX - 140, centerY - 50, 20, 120, {
    isStatic: true,
    render: { fillStyle: '#4a4a6a' },
  });
  bodies.push(frameLeft);

  const frameRight = Bodies.rectangle(centerX + 140, centerY - 50, 20, 120, {
    isStatic: true,
    render: { fillStyle: '#4a4a6a' },
  });
  bodies.push(frameRight);

  const ballRadius = 25;
  const ballCount = 5;
  const startX = centerX - ((ballCount - 1) * ballRadius * 2) / 2;

  for (let i = 0; i < ballCount; i++) {
    const ball = Bodies.circle(
      startX + i * ballRadius * 2,
      centerY + 80,
      ballRadius,
      {
        restitution: 1,
        friction: 0,
        density: 0.01,
        render: { fillStyle: i === 0 ? '#ff6b6b' : '#00f5d4' },
      }
    );
    bodies.push(ball);

    const string = Constraint.create({
      bodyA: frameTop,
      pointA: { x: startX + i * ballRadius * 2 - centerX, y: 0 },
      bodyB: ball,
      stiffness: 1,
      length: 150,
      render: { strokeStyle: '#888', lineWidth: 1 },
    });
    constraints.push(string);
  }

  return {
    id: generateId(),
    name: '牛顿摆',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      radius: b.circleRadius,
    })),
    constraints: constraints.map((c) => ({
      id: String(c.id),
      type: 'rope' as const,
      bodyA: String(c.bodyA?.id) || null,
      bodyB: String(c.bodyB?.id) || null,
      stiffness: c.stiffness,
      damping: c.damping,
      length: c.length,
    })),
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createDomino = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const centerX = width / 2;
  const groundY = height - 100;

  const dominoWidth = 15;
  const dominoHeight = 60;
  const dominoCount = 15;
  const spacing = 35;
  const startX = centerX - ((dominoCount - 1) * spacing) / 2;

  for (let i = 0; i < dominoCount; i++) {
    const domino = Bodies.rectangle(
      startX + i * spacing,
      groundY - dominoHeight / 2,
      dominoWidth,
      dominoHeight,
      {
        isStatic: false,
        density: 0.01,
        friction: 0.8,
        restitution: 0.1,
        render: {
          fillStyle: `hsl(${(i * 24) % 360}, 70%, 60%)`,
        },
      }
    );
    bodies.push(domino);
  }

  const ball = Bodies.circle(startX - 80, groundY - 200, 20, {
    density: 0.02,
    restitution: 0.3,
    render: { fillStyle: '#ff6b6b' },
  });
  bodies.push(ball);

  return {
    id: generateId(),
    name: '多米诺骨牌',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      width: dominoWidth,
      height: dominoHeight,
      radius: b.circleRadius,
    })),
    constraints: [],
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createCatapult = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const constraints: any[] = [];
  const centerX = width / 2;
  const groundY = height - 100;

  const base = Bodies.rectangle(centerX, groundY - 10, 200, 30, {
    isStatic: true,
    render: { fillStyle: '#5a4a3a' },
  });
  bodies.push(base);

  const arm = Bodies.rectangle(centerX, groundY - 80, 180, 15, {
    density: 0.005,
    render: { fillStyle: '#8b7355' },
  });
  bodies.push(arm);

  const pivot = Constraint.create({
    bodyA: base,
    bodyB: arm,
    pointA: { x: -50, y: -15 },
    stiffness: 1,
    length: 0,
    render: { visible: true, strokeStyle: '#333' },
  });
  constraints.push(pivot);

  const rubberBand = Constraint.create({
    bodyA: base,
    bodyB: arm,
    pointA: { x: 70, y: -15 },
    pointB: { x: -70, y: 0 },
    stiffness: 0.05,
    damping: 0.01,
    length: 20,
    render: { strokeStyle: '#ff6b6b', lineWidth: 4 },
  });
  constraints.push(rubberBand);

  const projectile = Bodies.circle(centerX + 70, groundY - 100, 15, {
    density: 0.02,
    restitution: 0.6,
    render: { fillStyle: '#00f5d4' },
  });
  bodies.push(projectile);

  return {
    id: generateId(),
    name: '投石机',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      radius: b.circleRadius,
    })),
    constraints: constraints.map((c) => ({
      id: String(c.id),
      type: 'joint' as const,
      bodyA: String(c.bodyA?.id) || null,
      bodyB: String(c.bodyB?.id) || null,
      stiffness: c.stiffness,
      damping: c.damping,
      length: c.length,
    })),
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createPulley = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const constraints: any[] = [];
  const centerX = width / 2;
  const centerY = height / 3;

  const pulleyAnchor = Bodies.circle(centerX, centerY - 50, 20, {
    isStatic: true,
    render: { fillStyle: '#4a4a6a' },
  });
  bodies.push(pulleyAnchor);

  const weight1 = Bodies.rectangle(centerX - 150, centerY + 100, 50, 50, {
    density: 0.01,
    render: { fillStyle: '#ff6b6b' },
  });
  bodies.push(weight1);

  const weight2 = Bodies.rectangle(centerX + 150, centerY + 100, 50, 50, {
    density: 0.015,
    render: { fillStyle: '#00f5d4' },
  });
  bodies.push(weight2);

  const rope1 = Constraint.create({
    bodyA: pulleyAnchor,
    bodyB: weight1,
    stiffness: 1,
    length: 200,
    render: { strokeStyle: '#888', lineWidth: 3 },
  });
  constraints.push(rope1);

  const rope2 = Constraint.create({
    bodyA: pulleyAnchor,
    bodyB: weight2,
    stiffness: 1,
    length: 200,
    render: { strokeStyle: '#888', lineWidth: 3 },
  });
  constraints.push(rope2);

  return {
    id: generateId(),
    name: '滑轮组',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      radius: b.circleRadius,
    })),
    constraints: constraints.map((c) => ({
      id: String(c.id),
      type: 'rope' as const,
      bodyA: String(c.bodyA?.id) || null,
      bodyB: String(c.bodyB?.id) || null,
      stiffness: c.stiffness,
      damping: c.damping,
      length: c.length,
    })),
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createSimplePendulum = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const constraints: any[] = [];
  const centerX = width / 2;
  const centerY = height / 4;

  const anchor = Bodies.circle(centerX, centerY, 15, {
    isStatic: true,
    render: { fillStyle: '#4a4a6a' },
  });
  bodies.push(anchor);

  const bob = Bodies.circle(centerX + 150, centerY + 200, 40, {
    density: 0.01,
    restitution: 0.8,
    render: { fillStyle: '#ff6b6b' },
  });
  bodies.push(bob);

  const string = Constraint.create({
    bodyA: anchor,
    bodyB: bob,
    stiffness: 1,
    length: 250,
    render: { strokeStyle: '#00f5d4', lineWidth: 3 },
  });
  constraints.push(string);

  return {
    id: generateId(),
    name: '单摆',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      radius: b.circleRadius,
    })),
    constraints: constraints.map((c) => ({
      id: String(c.id),
      type: 'rope' as const,
      bodyA: String(c.bodyA?.id) || null,
      bodyB: String(c.bodyB?.id) || null,
      stiffness: c.stiffness,
      damping: c.damping,
      length: c.length,
    })),
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createDoublePendulum = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const constraints: any[] = [];
  const centerX = width / 2;
  const centerY = height / 4;

  const anchor = Bodies.circle(centerX, centerY, 15, {
    isStatic: true,
    render: { fillStyle: '#4a4a6a' },
  });
  bodies.push(anchor);

  const bob1 = Bodies.circle(centerX + 100, centerY + 100, 25, {
    density: 0.01,
    render: { fillStyle: '#ff6b6b' },
  });
  bodies.push(bob1);

  const bob2 = Bodies.circle(centerX + 200, centerY + 200, 25, {
    density: 0.01,
    render: { fillStyle: '#00f5d4' },
  });
  bodies.push(bob2);

  const string1 = Constraint.create({
    bodyA: anchor,
    bodyB: bob1,
    stiffness: 1,
    length: 140,
    render: { strokeStyle: '#ff6b6b', lineWidth: 3 },
  });
  constraints.push(string1);

  const string2 = Constraint.create({
    bodyA: bob1,
    bodyB: bob2,
    stiffness: 1,
    length: 140,
    render: { strokeStyle: '#00f5d4', lineWidth: 3 },
  });
  constraints.push(string2);

  return {
    id: generateId(),
    name: '双摆',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      radius: b.circleRadius,
    })),
    constraints: constraints.map((c) => ({
      id: String(c.id),
      type: 'rope' as const,
      bodyA: String(c.bodyA?.id) || null,
      bodyB: String(c.bodyB?.id) || null,
      stiffness: c.stiffness,
      damping: c.damping,
      length: c.length,
    })),
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createSlingshot = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const constraints: any[] = [];
  const centerX = width / 3;
  const groundY = height - 100;

  const frameLeft = Bodies.rectangle(centerX - 50, groundY - 80, 20, 160, {
    isStatic: true,
    render: { fillStyle: '#8b4513' },
  });
  bodies.push(frameLeft);

  const frameRight = Bodies.rectangle(centerX + 50, groundY - 80, 20, 160, {
    isStatic: true,
    render: { fillStyle: '#8b4513' },
  });
  bodies.push(frameRight);

  const projectile = Bodies.circle(centerX, groundY - 150, 20, {
    density: 0.02,
    restitution: 0.5,
    render: { fillStyle: '#ff6b6b' },
  });
  bodies.push(projectile);

  const band1 = Constraint.create({
    bodyA: frameLeft,
    bodyB: projectile,
    stiffness: 0.02,
    damping: 0.01,
    length: 50,
    render: { strokeStyle: '#8b4513', lineWidth: 4 },
  });
  constraints.push(band1);

  const band2 = Constraint.create({
    bodyA: frameRight,
    bodyB: projectile,
    stiffness: 0.02,
    damping: 0.01,
    length: 50,
    render: { strokeStyle: '#8b4513', lineWidth: 4 },
  });
  constraints.push(band2);

  return {
    id: generateId(),
    name: '弹弓',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      radius: b.circleRadius,
    })),
    constraints: constraints.map((c) => ({
      id: String(c.id),
      type: 'spring' as const,
      bodyA: String(c.bodyA?.id) || null,
      bodyB: String(c.bodyB?.id) || null,
      stiffness: c.stiffness,
      damping: c.damping,
      length: c.length,
    })),
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createBouncingBalls = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const centerX = width / 2;

  const colors = ['#ff6b6b', '#00f5d4', '#9d4edd', '#ffe66d', '#4ecdc4'];

  for (let i = 0; i < 10; i++) {
    const radius = 15 + Math.random() * 20;
    const ball = Bodies.circle(
      centerX + (Math.random() - 0.5) * 300,
      100 + Math.random() * 200,
      radius,
      {
        density: 0.005,
        restitution: 0.7 + Math.random() * 0.3,
        friction: 0.01,
        render: { fillStyle: colors[i % colors.length] },
      }
    );
    bodies.push(ball);
  }

  return {
    id: generateId(),
    name: '弹跳球',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: 'circle',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: 'circle',
      radius: b.circleRadius,
    })),
    constraints: [],
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createPyramid = (width: number, height: number): SceneData => {
  const bodies: any[] = [];
  const centerX = width / 2;
  const groundY = height - 100;
  const blockSize = 40;
  const rows = 6;

  for (let row = 0; row < rows; row++) {
    const blocksInRow = rows - row;
    const startX = centerX - ((blocksInRow - 1) * blockSize) / 2;

    for (let col = 0; col < blocksInRow; col++) {
      const block = Bodies.rectangle(
        startX + col * blockSize,
        groundY - blockSize / 2 - row * blockSize,
        blockSize - 2,
        blockSize - 2,
        {
          density: 0.01,
          friction: 0.5,
          restitution: 0.1,
          render: { fillStyle: `hsl(${row * 30}, 60%, 50%)` },
        }
      );
      bodies.push(block);
    }
  }

  const wreckingBall = Bodies.circle(centerX - 300, groundY - 300, 50, {
    density: 0.05,
    restitution: 0.3,
    render: { fillStyle: '#333' },
  });
  bodies.push(wreckingBall);

  return {
    id: generateId(),
    name: '金字塔堆叠',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: bodies.map((b) => ({
      id: String(b.id),
      type: b.label || 'body',
      x: b.position.x,
      y: b.position.y,
      angle: b.angle,
      density: b.density,
      friction: b.friction,
      restitution: b.restitution,
      isStatic: b.isStatic,
      color: (b.render as any)?.fillStyle || '#fff',
      label: b.label || '',
      radius: b.circleRadius,
    })),
    constraints: [],
    emitters: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const createFluid = (width: number, height: number): SceneData => {
  const centerX = width / 2;

  return {
    id: generateId(),
    name: '流体模拟',
    gravityX: 0,
    gravityY: 1,
    timeScale: 1,
    isPaused: false,
    bodies: [],
    constraints: [],
    emitters: [
      {
        id: generateId(),
        x: centerX,
        y: 150,
        frequency: 50,
        velocityX: 0,
        velocityY: 2,
        particleSize: 8,
        active: true,
        color: '#4ecdc4',
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const getAllPresets = (width: number, height: number): SceneData[] => {
  return [
    createNewtonCradle(width, height),
    createDomino(width, height),
    createCatapult(width, height),
    createPulley(width, height),
    createSimplePendulum(width, height),
    createDoublePendulum(width, height),
    createSlingshot(width, height),
    createBouncingBalls(width, height),
    createPyramid(width, height),
    createFluid(width, height),
  ];
};
