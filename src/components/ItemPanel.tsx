import React from 'react';
import { itemTemplates } from '@/data/items';
import ItemIcon from '@/components/ItemIcon';
import { ItemType } from '@/types';

interface ItemPanelProps {
  onDragStart: (type: ItemType) => void;
}

const ItemPanel: React.FC<ItemPanelProps> = ({ onDragStart }) => {
  const handleDragStart = (e: React.DragEvent, type: ItemType) => {
    e.dataTransfer.setData('itemType', type);
    e.dataTransfer.effectAllowed = 'copy';
    onDragStart(type);
  };

  return (
    <div className="w-56 bg-stone-50 border-r border-stone-200 flex flex-col h-full">
      <div className="p-4 border-b border-stone-200">
        <h2 className="text-lg font-medium text-stone-800" style={{ fontFamily: 'serif' }}>
          器物
        </h2>
        <p className="text-xs text-stone-500 mt-1">拖拽至茶席布置</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {itemTemplates.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => handleDragStart(e, item.type)}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-stone-200 cursor-grab active:cursor-grabbing hover:border-amber-300 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-stone-50 rounded-lg group-hover:bg-amber-50 transition-colors">
              <ItemIcon type={item.type} size={36} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-stone-800">
                {item.name}
              </div>
              <div className="text-xs text-stone-500 truncate">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-3 border-t border-stone-200 bg-stone-100">
        <div className="text-xs text-stone-500 space-y-1">
          <p>• 拖拽器物到画布上</p>
          <p>• 单击选中，可删除</p>
          <p>• 拖动调整位置</p>
        </div>
      </div>
    </div>
  );
};

export default ItemPanel;
