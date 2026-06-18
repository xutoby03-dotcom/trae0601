import { useDroppable } from '@dnd-kit/core';
import { Guest } from '../types';
import DraggableGuest from './DraggableGuest';

interface UnseatedGuestsPanelProps {
  guests: Guest[];
}

export default function UnseatedGuestsPanel({ guests }: UnseatedGuestsPanelProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'unseated-panel',
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-wedding-pink/20">
        <h3 className="font-medium text-wedding-dark">未安排宾客</h3>
        <p className="text-xs text-gray-500 mt-1">拖拽宾客到右侧桌位</p>
      </div>

      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto scrollbar-thin transition-colors ${
          isOver ? 'bg-wedding-pink/10' : ''
        }`}
      >
        <div className="space-y-2">
          {guests.map(guest => (
            <DraggableGuest key={guest.id} guest={guest} />
          ))}
        </div>

        {guests.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">🎉</p>
            <p className="text-sm">全部宾客已安排</p>
          </div>
        )}
      </div>
    </div>
  );
}
