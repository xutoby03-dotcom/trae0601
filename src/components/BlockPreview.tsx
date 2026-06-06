import React from 'react';
import { BlockShape, Skin } from '../types';
import { getBlockColor } from '../theme';

interface BlockPreviewProps {
  block: BlockShape;
  colorIndex: number;
  skin: Skin;
  index: number;
  disabled?: boolean;
  size?: number;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
}

export const BlockPreview: React.FC<BlockPreviewProps> = ({
  block,
  colorIndex,
  skin,
  index,
  disabled = false,
  size = 20,
  onDragStart,
  onDragEnd,
}) => {
  const { matrix } = block;
  const rows = matrix.length;
  const cols = matrix[0].length;
  const gap = 2;
  const blockColor = getBlockColor(skin, colorIndex);

  const handleDragStart = (e: React.DragEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('blockIndex', String(index));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(index);
  };

  const handleDragEnd = () => {
    onDragEnd?.();
  };

  return (
    <div
      className={`block-preview ${disabled ? 'disabled' : ''}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        padding: 12,
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 12,
        cursor: disabled ? 'not-allowed' : 'grab',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '2px solid transparent',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${size}px)`,
          gridTemplateRows: `repeat(${rows}, ${size}px)`,
          gap: `${gap}px`,
          pointerEvents: 'none',
        }}
      >
        {matrix.map((row, r) =>
          row.map((cell, c) => {
            const cellStyle: React.CSSProperties = {
              width: size,
              height: size,
              backgroundColor: cell ? blockColor : 'transparent',
              borderRadius: 4,
            };

            if (cell && skin === 'metal') {
              cellStyle.background = `linear-gradient(135deg, ${blockColor} 0%, ${blockColor}dd 40%, ${blockColor} 50%, ${blockColor}ee 70%, ${blockColor}aa 100%)`;
              cellStyle.boxShadow = `
                inset 0 2px 4px rgba(255,255,255,0.4),
                inset 0 -2px 4px rgba(0,0,0,0.3),
                0 1px 2px rgba(0,0,0,0.2)
              `;
            } else if (cell) {
              cellStyle.boxShadow = `
                inset 0 2px 3px rgba(255,255,255,0.2),
                inset 0 -2px 3px rgba(0,0,0,0.3)
              `;
            }

            const textureClass = cell ? (skin === 'metal' ? 'metal-texture' : 'wood-texture') : '';

            return (
              <div
                key={`${r}-${c}`}
                className={textureClass}
                style={cellStyle}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
