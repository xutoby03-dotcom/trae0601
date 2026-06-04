import React, { useState, useRef, useEffect } from 'react';
import { NodeData, ConnectionPointPosition, ConnectionPoint } from '../types';
import { Shape } from './Shape';
import { useEditorStore } from '../store/useEditorStore';
import { snapToGrid } from '../utils/geometry';

interface NodeProps {
  node: NodeData;
  isSelected: boolean;
  onMouseDownNode: (e: React.MouseEvent, nodeId: string) => void;
  onStartConnection: (point: ConnectionPoint) => void;
  onEndConnection: (point: ConnectionPoint) => void;
}

const connectionPoints: ConnectionPointPosition[] = ['top', 'right', 'bottom', 'left'];

export const NodeComponent: React.FC<NodeProps> = ({
  node,
  isSelected,
  onMouseDownNode,
  onStartConnection,
  onEndConnection,
}) => {
  const { updateNode, setEditingNode, editingNodeId, connectingFrom } = useEditorStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [showConnectionPoints, setShowConnectionPoints] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeStart, setNodeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isEditing = editingNodeId === node.id;

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing || isResizing) return;
    e.stopPropagation();
    onMouseDownNode(e, node.id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setNodeStart({ x: node.x, y: node.y, width: node.width, height: node.height });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging && !isResizing) {
      const dx = (e.clientX - dragStart.x) / useEditorStore.getState().canvas.scale;
      const dy = (e.clientY - dragStart.y) / useEditorStore.getState().canvas.scale;
      updateNode(node.id, {
        x: snapToGrid(nodeStart.x + dx),
        y: snapToGrid(nodeStart.y + dy),
      });
    } else if (isResizing) {
      const dx = (e.clientX - dragStart.x) / useEditorStore.getState().canvas.scale;
      const dy = (e.clientY - dragStart.y) / useEditorStore.getState().canvas.scale;
      const newWidth = Math.max(60, snapToGrid(nodeStart.width + dx));
      const newHeight = Math.max(40, snapToGrid(nodeStart.height + dy));
      updateNode(node.id, {
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    if (isDragging || isResizing) {
      useEditorStore.getState().saveToHistory();
    }
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, nodeStart, node.id]);

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setNodeStart({ x: node.x, y: node.y, width: node.width, height: node.height });
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isDragging && !isResizing) {
      setEditingNode(node.id);
    }
  };

  const handleTextBlur = () => {
    setEditingNode(null);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateNode(node.id, { text: e.target.value });
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setEditingNode(null);
    }
    if (e.key === 'Escape') {
      setEditingNode(null);
    }
  };

  const handleConnectionPointMouseDown = (e: React.MouseEvent, position: ConnectionPointPosition) => {
    e.stopPropagation();
    e.preventDefault();
    onStartConnection({ nodeId: node.id, position });
  };

  const handleConnectionPointMouseUp = (e: React.MouseEvent, position: ConnectionPointPosition) => {
    e.stopPropagation();
    e.preventDefault();
    if (connectingFrom) {
      onEndConnection({ nodeId: node.id, position });
    }
  };

  const getConnectionPointPosition = (position: ConnectionPointPosition) => {
    const { width, height } = node;
    switch (position) {
      case 'top':
        return { left: width / 2 - 6, top: -6 };
      case 'right':
        return { left: width - 6, top: height / 2 - 6 };
      case 'bottom':
        return { left: width / 2 - 6, top: height - 6 };
      case 'left':
        return { left: -6, top: height / 2 - 6 };
    }
  };

  return (
    <g
      transform={`translate(${node.x}, ${node.y})`}
      style={{ cursor: isEditing ? 'text' : 'move' }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setShowConnectionPoints(true)}
      onMouseLeave={() => !connectingFrom && setShowConnectionPoints(false)}
    >
      <Shape type={node.type} width={node.width} height={node.height} color={node.color} />

      {isEditing ? (
        <foreignObject x={5} y={5} width={node.width - 10} height={node.height - 10}>
          <textarea
            ref={textareaRef}
            value={node.text}
            onChange={handleTextChange}
            onBlur={handleTextBlur}
            onKeyDown={handleTextKeyDown}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'transparent',
              textAlign: 'center',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'inherit',
            }}
          />
        </foreignObject>
      ) : (
        <text
          x={node.width / 2}
          y={node.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="14"
          fill="#333"
          pointerEvents="none"
          style={{ userSelect: 'none' }}
        >
          {node.text}
        </text>
      )}

      {isSelected && !isEditing && (
        <>
          <rect
            x={-2}
            y={-2}
            width={node.width + 4}
            height={node.height + 4}
            fill="none"
            stroke="#2196f3"
            strokeWidth={2}
            strokeDasharray="4,2"
            pointerEvents="none"
          />
          <rect
            x={node.width - 8}
            y={node.height - 8}
            width={12}
            height={12}
            fill="#fff"
            stroke="#2196f3"
            strokeWidth={2}
            cursor="se-resize"
            onMouseDown={handleResizeMouseDown}
          />
        </>
      )}

      {(showConnectionPoints || connectingFrom) && !isEditing && (
        <>
          {connectionPoints.map((pos) => {
            const { left, top } = getConnectionPointPosition(pos);
            return (
              <circle
                key={pos}
                cx={left + 6}
                cy={top + 6}
                r={6}
                fill="#fff"
                stroke="#2196f3"
                strokeWidth={2}
                cursor="crosshair"
                onMouseDown={(e) => handleConnectionPointMouseDown(e, pos)}
                onMouseUp={(e) => handleConnectionPointMouseUp(e, pos)}
              />
            );
          })}
        </>
      )}
    </g>
  );
};
