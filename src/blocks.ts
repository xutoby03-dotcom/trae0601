import { BlockShape } from './types';

let blockIdCounter = 0;
const nextId = () => `block_${++blockIdCounter}`;

export const BLOCK_TEMPLATES: Omit<BlockShape, 'id'>[] = [
  {
    name: 'single',
    matrix: [[1]],
  },
  {
    name: 'dot2-v',
    matrix: [[1], [1]],
  },
  {
    name: 'dot2-h',
    matrix: [[1, 1]],
  },
  {
    name: 'line3-v',
    matrix: [[1], [1], [1]],
  },
  {
    name: 'line3-h',
    matrix: [[1, 1, 1]],
  },
  {
    name: 'line4-v',
    matrix: [[1], [1], [1], [1]],
  },
  {
    name: 'line4-h',
    matrix: [[1, 1, 1, 1]],
  },
  {
    name: 'line5-v',
    matrix: [[1], [1], [1], [1], [1]],
  },
  {
    name: 'line5-h',
    matrix: [[1, 1, 1, 1, 1]],
  },
  {
    name: 'square2',
    matrix: [
      [1, 1],
      [1, 1],
    ],
  },
  {
    name: 'square3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
  },
  {
    name: 'L1',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: 'L2',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
  },
  {
    name: 'L3',
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
  },
  {
    name: 'L4',
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
  },
  {
    name: 'T1',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
  },
  {
    name: 'T2',
    matrix: [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 1],
    ],
  },
  {
    name: 'T3',
    matrix: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 1],
    ],
  },
  {
    name: 'T4',
    matrix: [
      [1, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
  },
  {
    name: 'corner1',
    matrix: [
      [1, 0],
      [1, 1],
    ],
  },
  {
    name: 'corner2',
    matrix: [
      [0, 1],
      [1, 1],
    ],
  },
  {
    name: 'corner3',
    matrix: [
      [1, 1],
      [1, 0],
    ],
  },
  {
    name: 'corner4',
    matrix: [
      [1, 1],
      [0, 1],
    ],
  },
];

export function createRandomBlock(): BlockShape {
  const template = BLOCK_TEMPLATES[Math.floor(Math.random() * BLOCK_TEMPLATES.length)];
  return {
    ...template,
    id: nextId(),
  };
}

export function createRandomBlocks(count: number): BlockShape[] {
  return Array.from({ length: count }, () => createRandomBlock());
}

export function getBlockSize(shape: BlockShape): { rows: number; cols: number } {
  return {
    rows: shape.matrix.length,
    cols: shape.matrix[0].length,
  };
}
