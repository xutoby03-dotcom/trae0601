import { useState, useCallback, useRef } from 'react';
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
  const [dragOverPosition, setDragOverPosition] = useState<Position | null>(null);
  const [dragBlockIndex, setDragBlockIndex] = useState<number | null>(null);
  const [clearingCells, setClearingCells] = useState<Position[]>([]);
  const [scoreGain, setScoreGain] = useState<number | null>(null);
  const [scoreGainCombo, setScoreGainCombo] = useState<number>(0);
  const scoreGainIdRef = useRef(0);

  const triggerScoreGain = useCallback((gain: number, newCombo: number) => {
    const id = ++scoreGainIdRef.current;
    setScoreGain(gain);
    setScoreGainCombo(newCombo);
    setTimeout(() => {
      if (scoreGainIdRef.current === id) {
        setScoreGain(null);
        setScoreGainCombo(0);
      }
    }, 100);
  }, []);

  const resetGame = useCallback((difficulty?: Difficulty) => {
    setGameState(initializeGame(difficulty || gameState.difficulty));
    setDragOverPosition(null);
    setDragBlockIndex(null);
    setClearingCells([]);
    setScoreGain(null);
    setScoreGainCombo(0);
  }, [gameState.difficulty]);

  const startDrag = useCallback((blockIndex: number) => {
    setDragBlockIndex(blockIndex);
  }, []);

  const endDrag = useCallback(() => {
    setDragBlockIndex(null);
    setDragOverPosition(null);
  }, []);

  const handleCellDragOver = useCallback((position: Position | null) => {
    setDragOverPosition(position);
  }, []);

  const tryPlaceBlock = useCallback(
    (position: Position, blockIndex: number) => {
      setGameState((prev) => {
        if (prev.gameOver) return prev;

        const block = prev.currentBlocks[blockIndex];
        if (!block || !canPlaceBlock(prev.grid, block, position)) {
          return prev;
        }

        const colorIndex = blockIndex;
        let newGrid = placeBlock(prev.grid, block, position, colorIndex);
        const toClear = findLinesToClear(newGrid);

        if (toClear.length > 0) {
          const newComboForGain = prev.combo + 1;
          const gain = calculateScore(toClear.length, prev.combo);
          triggerScoreGain(gain, newComboForGain);

          setClearingCells(toClear);
          setTimeout(() => {
            setClearingCells([]);
            setGameState((p) => {
              const clearedGrid = clearCells(p.grid, toClear);
              const newCombo = p.combo + 1;

              const remainingBlocks = p.currentBlocks.filter((_, i) => i !== blockIndex);
              let nextBlocks = remainingBlocks;

              if (remainingBlocks.length === 0) {
                nextBlocks = createRandomBlocks(3);
              }

              const isOver = !canPlaceAnyBlock(clearedGrid, nextBlocks);

              return {
                ...p,
                grid: clearedGrid,
                currentBlocks: nextBlocks,
                selectedBlockIndex: null,
                score: p.score + gain,
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
          const remainingBlocks = prev.currentBlocks.filter((_, i) => i !== blockIndex);
          let nextBlocks = remainingBlocks;

          if (remainingBlocks.length === 0) {
            nextBlocks = createRandomBlocks(3);
          }

          const isOver = !canPlaceAnyBlock(newGrid, nextBlocks);

          return {
            ...prev,
            grid: newGrid,
            currentBlocks: nextBlocks,
            selectedBlockIndex: null,
            combo: 0,
            gameOver: isOver,
          };
        }
      });

      setDragOverPosition(null);
      setDragBlockIndex(null);
    },
    [triggerScoreGain]
  );

  const canPlaceAtHover = useCallback((): boolean => {
    if (dragBlockIndex === null || !dragOverPosition) return false;
    const block = gameState.currentBlocks[dragBlockIndex];
    if (!block) return false;
    return canPlaceBlock(gameState.grid, block, dragOverPosition);
  }, [dragBlockIndex, dragOverPosition, gameState.grid, gameState.currentBlocks]);

  const getGhostCells = useCallback((): Position[] => {
    if (dragBlockIndex === null || !dragOverPosition) return [];
    const block = gameState.currentBlocks[dragBlockIndex];
    if (!block) return [];

    const cells: Position[] = [];
    for (let r = 0; r < block.matrix.length; r++) {
      for (let c = 0; c < block.matrix[r].length; c++) {
        if (block.matrix[r][c]) {
          cells.push({ row: dragOverPosition.row + r, col: dragOverPosition.col + c });
        }
      }
    }
    return cells;
  }, [dragBlockIndex, dragOverPosition, gameState.currentBlocks]);

  return {
    gameState,
    clearingCells,
    scoreGain,
    scoreGainCombo,
    tryPlaceBlock,
    handleCellDragOver,
    canPlaceAtHover,
    getGhostCells,
    resetGame,
    startDrag,
    endDrag,
  };
}
