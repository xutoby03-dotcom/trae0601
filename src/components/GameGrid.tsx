import React from 'react';
import { Position, Skin } from '../types';
import { getBlockColor } from '../theme';

interface GameGridProps {
  grid: number[][];
  ghostCells: Position[];
  clearingCells: Position[];
  canPlace: boolean;
  skin: Skin;
  onCellClick: (position: Position) => void;
  onCellHover: (position: Position | null) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  grid,
  ghostCells,
  clearingCells,
  canPlace,
  skin,
  onCellClick,
  onCellHover,
}) => {
  const size = grid.length;
  const isClearing = (row: number, col: number) =>
    clearingCells.some((c) => c.row === row && c.col === col);
  const isGhost = (row: number, col: number) =>
    ghostCells.some((c) => c.row === row && c.col === col);

  const cellSize = size <= 5 ? 60 : size <= 7 ? 50 : 44;
  const gap = 2;
  const padding = 8;
  const innerSize = size * (cellSize + gap) - gap;

  return (
    <div
      className="game-grid-wrapper"
      style={{
        padding: padding,
        borderRadius: 12,
      }}
      onMouseLeave={() => onCellHover(null)}
    >
      <div
        className="game-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${size}, ${cellSize}px)`,
          gap: `${gap}px`,
          width: innerSize,
          height: innerSize,
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const ghost = isGhost(rowIndex, colIndex);
            const clearing = isClearing(rowIndex, colIndex);
            const filled = cell > 0;
            const showGhost = ghost && !filled;

            let bgColor = 'var(--cell-bg)';
            if (filled) {
              bgColor = getBlockColor(skin, cell - 1);
            } else if (showGhost) {
              bgColor = canPlace ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.4)';
            }

            const isBoxBoundary =
              size >= 3 && (rowIndex % 3 === 2 || colIndex % 3 === 2);

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${filled ? 'filled' : ''} ${clearing ? 'clearing' : ''} ${showGhost ? 'ghost' : ''}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: bgColor,
                  borderRadius: 6,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  borderRight: isBoxBoundary && colIndex < size - 1 ? '2px solid var(--border-color)' : 'none',
                  borderBottom: isBoxBoundary && rowIndex < size - 1 ? '2px solid var(--border-color)' : 'none',
                  boxShadow: filled
                    ? 'inset 0 2px 4px rgba(255,255,255,0.2), inset 0 -2px 4px rgba(0,0,0,0.2)'
                    : 'inset 0 1px 2px rgba(0,0,0,0.05)',
                  transform: clearing ? 'scale(0.9)' : showGhost ? 'scale(0.95)' : 'scale(1)',
                  opacity: clearing ? 0.5 : 1,
                }}
                onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                onMouseEnter={() => onCellHover({ row: rowIndex, col: colIndex })}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
