import React from 'react';
import { BlockShape, Skin } from '../types';
import { BlockPreview } from './BlockPreview';

interface BlockTrayProps {
  blocks: BlockShape[];
  selectedIndex: number | null;
  skin: Skin;
  onSelectBlock: (index: number | null) => void;
}

export const BlockTray: React.FC<BlockTrayProps> = ({
  blocks,
  selectedIndex,
  skin,
  onSelectBlock,
}) => {
  return (
    <div className="block-tray" style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {blocks.map((block, index) => (
        <BlockPreview
          key={block.id}
          block={block}
          colorIndex={index}
          skin={skin}
          selected={selectedIndex === index}
          onClick={() => onSelectBlock(selectedIndex === index ? null : index)}
        />
      ))}
      {blocks.length === 0 && (
        <div
          style={{
            padding: '24px 48px',
            color: 'var(--text-secondary)',
            fontStyle: 'italic',
          }}
        >
          新方块即将出现...
        </div>
      )}
    </div>
  );
};
