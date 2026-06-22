import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTeaStore } from '@/store/useTeaStore';
import { TeaItem, ItemType } from '@/types';
import ItemIcon from '@/components/ItemIcon';
import { findItemAtPoint } from '@/utils/collision';
import { getDirectionLabel } from '@/utils/layout';

interface CanvasItemProps {
  item: TeaItem;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, item: TeaItem) => void;
}

const CanvasItem: React.FC<CanvasItemProps> = ({ item, isSelected, onMouseDown }) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMouseDown(e, item);
  };

  return (
    <div
      className={`absolute cursor-move select-none transition-shadow duration-150 ${
        isSelected ? 'z-20' : 'z-10'
      }`}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        transform: `rotate(${item.rotation}deg)`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className={`w-full h-full flex items-center justify-center rounded-full ${
          isSelected
            ? 'ring-2 ring-amber-500 ring-offset-2 ring-offset-amber-50 shadow-lg'
            : 'hover:shadow-md'
        }`}
      >
        <ItemIcon type={item.type} size={Math.min(item.width, item.height) - 4} />
      </div>
      {isSelected && (
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-amber-600 text-white text-xs rounded whitespace-nowrap">
          {item.name}
        </div>
      )}
    </div>
  );
};

const TeaCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    items,
    clothConfig,
    selectedItemId,
    addItem,
    updateItem,
    selectItem,
    bringToFront,
    removeItem,
  } = useTeaStore();

  const [isDragging, setIsDragging] = useState(false);
  const [dragItem, setDragItem] = useState<TeaItem | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragOver, setIsDragOver] = useState(false);

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
      };
    },
    []
  );

  const handleCanvasMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        selectItem(null);
      }
    },
    [selectItem]
  );

  const handleItemMouseDown = useCallback(
    (e: React.MouseEvent, item: TeaItem) => {
      e.preventDefault();
      selectItem(item.id);
      bringToFront(item.id);

      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDragOffset({
        x: coords.x - item.x,
        y: coords.y - item.y,
      });
      setDragItem(item);
      setIsDragging(true);
    },
    [selectItem, bringToFront, getCanvasCoords]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !dragItem) return;

      const coords = getCanvasCoords(e.clientX, e.clientY);
      let newX = coords.x - dragOffset.x;
      let newY = coords.y - dragOffset.y;

      newX = Math.max(0, Math.min(clothConfig.width - dragItem.width, newX));
      newY = Math.max(0, Math.min(clothConfig.height - dragItem.height, newY));

      updateItem(dragItem.id, { x: newX, y: newY });
    },
    [isDragging, dragItem, dragOffset, clothConfig, updateItem, getCanvasCoords]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragItem(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const itemType = e.dataTransfer.getData('itemType') as ItemType;
    if (!itemType) return;

    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (
      coords.x < 0 ||
      coords.x > clothConfig.width ||
      coords.y < 0 ||
      coords.y > clothConfig.height
    ) {
      return;
    }

    addItem(itemType, coords.x, coords.y);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (selectedItemId && (e.key === 'Delete' || e.key === 'Backspace')) {
        removeItem(selectedItemId);
      }
    },
    [selectedItemId, removeItem]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const renderDirectionIndicator = () => {
    const hostLabel = `主人 · ${getDirectionLabel(clothConfig.hostDirection)}`;
    const guestLabel = `客人 · ${getDirectionLabel(clothConfig.guestDirection)}`;

    const hostPosition = {
      top: 'top-2 left-1/2 -translate-x-1/2',
      bottom: 'bottom-2 left-1/2 -translate-x-1/2',
      left: 'left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left',
      right: 'right-2 top-1/2 -translate-y-1/2 rotate-90 origin-right',
    }[clothConfig.hostDirection];

    const guestPosition = {
      top: 'top-2 left-1/2 -translate-x-1/2',
      bottom: 'bottom-2 left-1/2 -translate-x-1/2',
      left: 'left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-left',
      right: 'right-2 top-1/2 -translate-y-1/2 rotate-90 origin-right',
    }[clothConfig.guestDirection];

    return (
      <>
        <div
          className={`absolute ${hostPosition} px-3 py-1 bg-amber-100 text-amber-800 text-xs rounded-full border border-amber-200 z-30`}
        >
          {hostLabel}
        </div>
        <div
          className={`absolute ${guestPosition} px-3 py-1 bg-teal-50 text-teal-700 text-xs rounded-full border border-teal-200 z-30`}
        >
          {guestLabel}
        </div>
      </>
    );
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 bg-stone-100 overflow-auto">
      <div
        ref={canvasRef}
        className={`relative bg-amber-50 rounded-lg shadow-xl transition-all duration-200 ${
          isDragOver ? 'ring-4 ring-amber-400 ring-opacity-50' : ''
        }`}
        style={{
          width: clothConfig.width,
          height: clothConfig.height,
          backgroundImage: `
            linear-gradient(rgba(139, 119, 101, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(139, 119, 101, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
        }}
        onMouseDown={handleCanvasMouseDown}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          className="absolute inset-0 pointer-events-none rounded-lg"
          style={{
            boxShadow: 'inset 0 0 30px rgba(139, 69, 19, 0.08)',
          }}
        />

        {renderDirectionIndicator()}

        {items.map((item) => (
          <CanvasItem
            key={item.id}
            item={item}
            isSelected={item.id === selectedItemId}
            onMouseDown={handleItemMouseDown}
          />
        ))}

        {items.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center text-stone-400">
              <div className="text-4xl mb-2">🍵</div>
              <p className="text-sm">从左侧拖拽器物开始布置茶席</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeaCanvas;
