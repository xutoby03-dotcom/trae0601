import { BlockShape, Difficulty, DIFFICULTY_CONFIG, Position } from './types';
import { createRandomBlocks } from './blocks';

export function createEmptyGrid(size: number): number[][] {
  return Array.from({ length: size }, () => Array(size).fill(0));
}

export function canPlaceBlock(
  grid: number[][],
  block: BlockShape,
  position: Position
): boolean {
  const { matrix } = block;
  const gridSize = grid.length;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        const gridRow = position.row + r;
        const gridCol = position.col + c;

        if (gridRow < 0 || gridRow >= gridSize || gridCol < 0 || gridCol >= gridSize) {
          return false;
        }

        if (grid[gridRow][gridCol]) {
          return false;
        }
      }
    }
  }

  return true;
}

export function placeBlock(
  grid: number[][],
  block: BlockShape,
  position: Position,
  colorIndex: number
): number[][] {
  const newGrid = grid.map((row) => [...row]);
  const { matrix } = block;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c]) {
        newGrid[position.row + r][position.col + c] = colorIndex + 1;
      }
    }
  }

  return newGrid;
}

export function findLinesToClear(grid: number[][]): Position[] {
  const size = grid.length;
  const toClear: Position[] = [];
  const cleared = new Set<string>();

  for (let r = 0; r < size; r++) {
    let fullRow = true;
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        fullRow = false;
        break;
      }
    }
    if (fullRow) {
      for (let c = 0; c < size; c++) {
        const key = `${r},${c}`;
        if (!cleared.has(key)) {
          cleared.add(key);
          toClear.push({ row: r, col: c });
        }
      }
    }
  }

  for (let c = 0; c < size; c++) {
    let fullCol = true;
    for (let r = 0; r < size; r++) {
      if (!grid[r][c]) {
        fullCol = false;
        break;
      }
    }
    if (fullCol) {
      for (let r = 0; r < size; r++) {
        const key = `${r},${c}`;
        if (!cleared.has(key)) {
          cleared.add(key);
          toClear.push({ row: r, col: c });
        }
      }
    }
  }

  if (size >= 3) {
    for (let boxRow = 0; boxRow < size; boxRow += 3) {
      for (let boxCol = 0; boxCol < size; boxCol += 3) {
        let fullBox = true;
        for (let r = 0; r < 3 && boxRow + r < size; r++) {
          for (let c = 0; c < 3 && boxCol + c < size; c++) {
            if (!grid[boxRow + r][boxCol + c]) {
              fullBox = false;
              break;
            }
          }
          if (!fullBox) break;
        }
        if (fullBox) {
          for (let r = 0; r < 3 && boxRow + r < size; r++) {
            for (let c = 0; c < 3 && boxCol + c < size; c++) {
              const key = `${boxRow + r},${boxCol + c}`;
              if (!cleared.has(key)) {
                cleared.add(key);
                toClear.push({ row: boxRow + r, col: boxCol + c });
              }
            }
          }
        }
      }
    }
  }

  return toClear;
}

export function clearCells(grid: number[][], cells: Position[]): number[][] {
  const newGrid = grid.map((row) => [...row]);
  for (const cell of cells) {
    newGrid[cell.row][cell.col] = 0;
  }
  return newGrid;
}

export function calculateScore(clearedCount: number, combo: number): number {
  const baseScore = clearedCount * 10;
  const lineBonus = clearedCount >= 9 ? 500 : clearedCount >= 7 ? 200 : clearedCount >= 5 ? 100 : 0;
  const comboMultiplier = 1 + combo * 0.5;
  return Math.floor((baseScore + lineBonus) * comboMultiplier);
}

export function canPlaceAnyBlock(grid: number[][], blocks: BlockShape[]): boolean {
  const size = grid.length;
  for (const block of blocks) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (canPlaceBlock(grid, block, { row: r, col: c })) {
          return true;
        }
      }
    }
  }
  return false;
}

export function initializeGame(difficulty: Difficulty) {
  const size = DIFFICULTY_CONFIG[difficulty].gridSize;
  return {
    grid: createEmptyGrid(size),
    currentBlocks: createRandomBlocks(3),
    selectedBlockIndex: null as number | null,
    score: 0,
    combo: 0,
    gameOver: false,
    difficulty,
  };
}

export function getBlockCellCount(block: BlockShape): number {
  let count = 0;
  for (const row of block.matrix) {
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}
