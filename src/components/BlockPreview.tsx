import React from 'react';
import { BlockShape, Skin } from '../types';
import { getBlockColor } from '../theme';

interface BlockPreviewProps {
  block: BlockShape;
  colorIndex: number;
  skin: Skin;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  size?: number;
}

export const BlockPreview: React.FC<BlockPreviewProps> = ({
  block,
  colorIndex,
  skin,
  selected = false,
  onClick,
  disabled = false,
  size = 20,
}) => {
  const { matrix } = block;
  const rows = matrix.length;
  const cols = matrix[0].length;
  const gap = 2;
  const blockColor = getBlockColor(skin, colorIndex);

  return (
    <div
      className={`block-preview ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      style={{
        padding: 12,
        backgroundColor: selected ? 'var(--accent-color)' : 'var(--bg-secondary)',
        borderRadius: 12,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        transition: 'all 0.2s ease',
        transform: selected ? 'scale(1.05)' : 'scale(1)',
        boxShadow: selected
          ? '0 4px 12px rgba(0,0,0,0.2)'
          : '0 2px 4px rgba(0,0,0,0.1)',
        border: selected ? '2px solid var(--accent-color)' : '2px solid transparent',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${size}px)`,
          gridTemplateRows: `repeat(${rows}, ${size}px)`,
          gap: `${gap}px`,
        }}
      >
        {matrix.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              style={{
                width: size,
                height: size,
                backgroundColor: cell ? blockColor : 'transparent',
                borderRadius: 4,
                boxShadow: cell
                  ? 'inset 0 2px 3px rgba(255,255,255,0.2), inset 0 -2px 3px rgba(0,0,0,0.2)'
                  : 'none',
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
