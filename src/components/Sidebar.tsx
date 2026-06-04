import React from 'react';
import { ShapeType } from '../types';
import { ShapeIcon } from './Shape';

const shapes: { type: ShapeType; label: string }[] = [
  { type: 'rectangle', label: '矩形' },
  { type: 'rounded-rect', label: '圆角矩形' },
  { type: 'circle', label: '圆形' },
  { type: 'diamond', label: '菱形' },
  { type: 'parallelogram', label: '平行四边形' },
];

interface SidebarProps {
  onDragStart: (type: ShapeType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onDragStart }) => {
  const handleDragStart = (e: React.DragEvent, type: ShapeType) => {
    e.dataTransfer.setData('shape-type', type);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(type);
  };

  return (
    <div
      style={{
        width: '180px',
        background: '#f5f5f5',
        borderRight: '1px solid #ddd',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <h3 style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>基础形状</h3>
      {shapes.map((shape) => (
        <div
          key={shape.type}
          draggable
          onDragStart={(e) => handleDragStart(e, shape.type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            cursor: 'grab',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2196f3';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#ddd';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <ShapeIcon type={shape.type} size={32} />
          <span style={{ fontSize: '13px', color: '#333' }}>{shape.label}</span>
        </div>
      ))}
    </div>
  );
};
