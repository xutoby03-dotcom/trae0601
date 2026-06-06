import React from 'react';
import { BlockShape, Skin } from '../types';
import { BlockPreview } from './BlockPreview';

interface BlockTrayProps {
  blocks: BlockShape[];
  skin: Skin;
  onDragStart?: (index: number) => void;
  onDragEnd?: () => void;
}

export const BlockTray: React.FC<BlockTrayProps> = ({ blocks, skin, onDragStart, onDragEnd }) => {
  return (
    <div
      className="block-tray"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          paddingRight: 4,
        }}
      >
        拖拽方块
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {blocks.map((block, index) => (
          <BlockPreview
            key={block.id}
            block={block}
            colorIndex={index}
            skin={skin}
            index={index}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}
      </div>
      {blocks.length === 0 && (
        <div
          style={{
            padding: '24px 32px',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
            fontSize: 13,
          }}
        >
          新方块即将出现...
        </div>
      )}
    </div>
  );
};
