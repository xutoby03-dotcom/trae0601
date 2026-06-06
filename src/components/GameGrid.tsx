import React, { useCallback } from 'react';
import { Position, Skin } from '../types';
import { getBlockColor } from '../theme';

interface GameGridProps {
  grid: number[][];
  ghostCells: Position[];
  clearingCells: Position[];
  canPlace: boolean;
  skin: Skin;
  onCellDrop: (position: Position, blockIndex: number) => void;
  onCellDragOver: (position: Position | null) => void;
}

export const GameGrid: React.FC<GameGridProps> = ({
  grid,
  ghostCells,
  clearingCells,
  canPlace,
  skin,
  onCellDrop,
  onCellDragOver,
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

  const handleDragOver = useCallback(
    (e: React.DragEvent, position: Position) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      onCellDragOver(position);
    },
    [onCellDragOver]
  );

  const handleDragLeave = useCallback(() => {
    onCellDragOver(null);
  }, [onCellDragOver]);

  const handleDrop = useCallback(
    (e: React.DragEvent, position: Position) => {
      e.preventDefault();
      const blockIndexStr = e.dataTransfer.getData('blockIndex');
      const blockIndex = parseInt(blockIndexStr, 10);
      if (!isNaN(blockIndex) && blockIndex >= 0) {
        onCellDrop(position, blockIndex);
      }
      onCellDragOver(null);
    },
    [onCellDrop, onCellDragOver]
  );

  const getMetalStyle = (filled: boolean, color: string) => {
    if (skin !== 'metal' || !filled) return {};
    return {
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 40%, ${color} 50%, ${color}ee 70%, ${color}aa 100%)`,
      boxShadow: `
        inset 0 2px 4px rgba(255,255,255,0.4),
        inset 0 -2px 4px rgba(0,0,0,0.3),
        0 1px 2px rgba(0,0,0,0.2)
      `,
    };
  };

  const getWoodStyle = (filled: boolean, color: string) => {
    if (skin !== 'wood' || !filled) return {};
    return {
      background: `linear-gradient(180deg, ${color} 0%, ${color} 100%)`,
      boxShadow: `
        inset 0 2px 3px rgba(255,255,255,0.2),
        inset 0 -2px 3px rgba(0,0,0,0.3)
      `,
    };
  };

  return (
    <div
      className="game-grid-wrapper"
      style={{
        padding: padding,
        borderRadius: 12,
      }}
      onDragLeave={handleDragLeave}
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
              bgColor = canPlace ? 'rgba(76, 175, 80, 0.4)' : 'rgba(244, 67, 54, 0.3)';
            }

            const isBoxBoundary =
              size >= 3 && (rowIndex % 3 === 2 || colIndex % 3 === 2);

            const borderColor = showGhost
              ? canPlace
                ? 'rgba(76, 175, 80, 0.8)'
                : 'rgba(244, 67, 54, 0.8)'
              : 'transparent';

            const skinStyle = filled
              ? skin === 'metal'
                ? getMetalStyle(true, bgColor)
                : getWoodStyle(true, bgColor)
              : {};

            const textureClass = filled ? (skin === 'metal' ? 'metal-texture' : 'wood-texture') : '';

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`grid-cell ${filled ? 'filled' : ''} ${clearing ? 'clearing' : ''} ${showGhost ? 'ghost' : ''} ${textureClass}`}
                style={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: filled ? 'transparent' : bgColor,
                  borderRadius: 6,
                  cursor: 'default',
                  transition: 'all 0.15s ease',
                  borderRight: isBoxBoundary && colIndex < size - 1 ? '2px solid var(--border-color)' : 'none',
                  borderBottom: isBoxBoundary && rowIndex < size - 1 ? '2px solid var(--border-color)' : 'none',
                  border: showGhost ? `2px solid ${borderColor}` : 'none',
                  boxSizing: 'border-box',
                  transform: clearing ? 'scale(0.9)' : showGhost ? 'scale(0.96)' : 'scale(1)',
                  opacity: clearing ? 0.5 : 1,
                  ...skinStyle,
                }}
                onDragOver={(e) => handleDragOver(e, { row: rowIndex, col: colIndex })}
                onDrop={(e) => handleDrop(e, { row: rowIndex, col: colIndex })}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
