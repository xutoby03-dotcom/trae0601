import { useState, useCallback } from 'react';
import { Difficulty, Position, GameState } from '../types';
import {
  initializeGame,
  canPlaceBlock,
  placeBlock,
  findLinesToClear,
  clearCells,
  calculateScore,
  canPlaceAnyBlock,
} from '../gameLogic';
import { createRandomBlocks } from '../blocks';

export function useGame(initialDifficulty: Difficulty = 'easy') {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(initialDifficulty));
  const [hoverPosition, setHoverPosition] = useState<Position | null>(null);
  const [clearingCells, setClearingCells] = useState<Position[]>([]);

  const selectBlock = useCallback((index: number | null) => {
    setGameState((prev) => ({ ...prev, selectedBlockIndex: index }));
  }, []);

  const resetGame = useCallback((difficulty?: Difficulty) => {
    setGameState(initializeGame(difficulty || gameState.difficulty));
    setHoverPosition(null);
    setClearingCells([]);
  }, [gameState.difficulty]);

  const tryPlaceBlock = useCallback(
    (position: Position) => {
      setGameState((prev) => {
        if (prev.selectedBlockIndex === null || prev.gameOver) return prev;

        const block = prev.currentBlocks[prev.selectedBlockIndex];
        if (!block || !canPlaceBlock(prev.grid, block, position)) {
          return prev;
        }

        const colorIndex = prev.selectedBlockIndex;
        let newGrid = placeBlock(prev.grid, block, position, colorIndex);
        const toClear = findLinesToClear(newGrid);

        if (toClear.length > 0) {
          setClearingCells(toClear);
          setTimeout(() => {
            setClearingCells([]);
            setGameState((p) => {
              const clearedGrid = clearCells(p.grid, toClear);
              const newCombo = p.combo + 1;
              const scoreGain = calculateScore(toClear.length, p.combo);

              const remainingBlocks = p.currentBlocks.filter((_, i) => i !== p.selectedBlockIndex);
              let nextBlocks = remainingBlocks;
              let nextSelected: number | null = null;

              if (remainingBlocks.length === 0) {
                nextBlocks = createRandomBlocks(3);
              }

              const isOver = !canPlaceAnyBlock(clearedGrid, nextBlocks);

              return {
                ...p,
                grid: clearedGrid,
                currentBlocks: nextBlocks,
                selectedBlockIndex: nextSelected,
                score: p.score + scoreGain,
                combo: newCombo,
                gameOver: isOver,
              };
            });
          }, 400);

          return {
            ...prev,
            grid: newGrid,
          };
        } else {
          const remainingBlocks = prev.currentBlocks.filter((_, i) => i !== prev.selectedBlockIndex);
          let nextBlocks = remainingBlocks;
          let nextSelected: number | null = null;

          if (remainingBlocks.length === 0) {
            nextBlocks = createRandomBlocks(3);
          }

          const isOver = !canPlaceAnyBlock(newGrid, nextBlocks);

          return {
            ...prev,
            grid: newGrid,
            currentBlocks: nextBlocks,
            selectedBlockIndex: nextSelected,
            combo: 0,
            gameOver: isOver,
          };
        }
      });

      setHoverPosition(null);
    },
    []
  );

  const handleCellHover = useCallback(
    (position: Position | null) => {
      if (gameState.selectedBlockIndex === null) {
        setHoverPosition(null);
        return;
      }
      setHoverPosition(position);
    },
    [gameState.selectedBlockIndex]
  );

  const canPlaceAtHover = useCallback((): boolean => {
    if (gameState.selectedBlockIndex === null || !hoverPosition) return false;
    const block = gameState.currentBlocks[gameState.selectedBlockIndex];
    if (!block) return false;
    return canPlaceBlock(gameState.grid, block, hoverPosition);
  }, [gameState.selectedBlockIndex, gameState.grid, gameState.currentBlocks, hoverPosition]);

  const getGhostCells = useCallback((): Position[] => {
    if (gameState.selectedBlockIndex === null || !hoverPosition) return [];
    const block = gameState.currentBlocks[gameState.selectedBlockIndex];
    if (!block) return [];

    const cells: Position[] = [];
    for (let r = 0; r < block.matrix.length; r++) {
      for (let c = 0; c < block.matrix[r].length; c++) {
        if (block.matrix[r][c]) {
          cells.push({ row: hoverPosition.row + r, col: hoverPosition.col + c });
        }
      }
    }
    return cells;
  }, [gameState.selectedBlockIndex, gameState.currentBlocks, hoverPosition]);

  return {
    gameState,
    hoverPosition,
    clearingCells,
    selectBlock,
    tryPlaceBlock,
    handleCellHover,
    canPlaceAtHover,
    getGhostCells,
    resetGame,
  };
}
