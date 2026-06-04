import type { Body, Constraint } from 'matter-js';

export type ToolType =
  | 'select'
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'polygon'
  | 'freehand'
  | 'spring'
  | 'rope'
  | 'joint';

export interface BodyData {
  id: string;
  type: string;
  x: number;
  y: number;
  angle: number;
  density: number;
  friction: number;
  restitution: number;
  isStatic: boolean;
  color: string;
  label: string;
  vertices?: { x: number; y: number }[];
  width?: number;
  height?: number;
  radius?: number;
}

export interface ConstraintData {
  id: string;
  type: 'spring' | 'rope' | 'joint';
  bodyA: string | null;
  bodyB: string | null;
  pointA?: { x: number; y: number };
  pointB?: { x: number; y: number };
  stiffness: number;
  damping: number;
  length: number;
}

export interface EmitterData {
  id: string;
  x: number;
  y: number;
  frequency: number;
  velocityX: number;
  velocityY: number;
  particleSize: number;
  active: boolean;
  color: string;
}

export interface SceneData {
  id: string;
  name: string;
  thumbnail?: string;
  gravityX: number;
  gravityY: number;
  timeScale: number;
  isPaused: boolean;
  bodies: BodyData[];
  constraints: ConstraintData[];
  emitters: EmitterData[];
  createdAt: number;
  updatedAt: number;
}

export interface PhysicsState {
  engine: any;
  render: any;
  runner: any;
  bodies: Map<string, Body>;
  constraints: Map<string, Constraint>;
  selectedBody: string | null;
  activeTool: ToolType;
  gravity: { x: number; y: number };
  timeScale: number;
  isPaused: boolean;
  zoom: number;
  pan: { x: number; y: number };
  emitters: EmitterData[];
  scenes: SceneData[];
  currentSceneId: string | null;
  fps: number;
  collisionCount: number;
}

export interface DrawState {
  isDrawing: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  points: { x: number; y: number }[];
  constraintStart: { bodyId: string | null; x: number; y: number } | null;
}
