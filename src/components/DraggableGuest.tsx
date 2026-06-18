import { useDraggable } from '@dnd-kit/core';
import { Guest } from '../types';

interface DraggableGuestProps {
  guest: Guest;
  isDragging?: boolean;
}

export default function DraggableGuest({ guest, isDragging }: DraggableGuestProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: guest.id,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 bg-white rounded-lg shadow-sm border border-wedding-pink/20 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md ${
        isDragging ? 'shadow-lg ring-2 ring-wedding-gold' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-wedding-pink/40 flex items-center justify-center text-sm font-medium">
          {guest.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{guest.name}</p>
          <p className="text-xs text-gray-500 truncate">{guest.relation} · {guest.headCount}人</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mt-2">
        {guest.isChild && (
          <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
            👶
          </span>
        )}
        {guest.isElderly && (
          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
            👴
          </span>
        )}
        {guest.allergens.length > 0 && (
          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded text-xs">
            ⚠️ 过敏
          </span>
        )}
        {guest.dietaryRestrictions.length > 0 && (
          <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">
            🍽️ 特殊餐
          </span>
        )}
      </div>
    </div>
  );
}
