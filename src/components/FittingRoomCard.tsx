import { Lightbulb, AlertTriangle } from 'lucide-react';
import type { FittingRoom } from '../../shared/types';
import { cleanStatusLabels, roomStatusLabels } from '@/utils/format';

interface Props {
  room: FittingRoom;
  onClick?: () => void;
}

export default function FittingRoomCard({ room, onClick }: Props) {
  const isOverLimit = room.currentItemsCount !== undefined && room.currentItemsCount > room.maxItems;
  const statusInfo = roomStatusLabels[room.status];
  const cleanInfo = cleanStatusLabels[room.cleanStatus];

  return (
    <div
      onClick={onClick}
      className={`card card-hover cursor-pointer p-4 relative overflow-hidden ${
        room.status === 'occupied' ? 'ring-2 ring-burgundy-500' : ''
      }`}
    >
      <div className={`absolute top-0 right-0 w-16 h-16 ${statusInfo.className} opacity-10 rotate-45 translate-x-8 -translate-y-8`}></div>
      
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-display text-xl font-bold text-charcoal-800">{room.number}</h3>
          <p className="text-sm text-charcoal-500">{room.floor}楼</p>
        </div>
        <div className={`w-3 h-3 rounded-full ${statusInfo.className} ${room.status === 'occupied' ? 'animate-pulse' : ''}`}></div>
      </div>

      {room.photoUrl && (
        <div className="mb-3 rounded-lg overflow-hidden h-24">
          <img src={room.photoUrl} alt={`试衣间${room.number}`} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-charcoal-600">
            <Lightbulb className={`w-4 h-4 ${room.hasMirrorLight ? 'text-champagne-500' : 'text-gray-400'}`} />
            <span>镜灯</span>
          </div>
          <span className={`status-badge ${cleanInfo.className}`}>{cleanInfo.label}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-charcoal-600">件数限制</span>
          <span className={`font-medium ${isOverLimit ? 'text-red-600' : 'text-charcoal-700'}`}>
            {room.currentItemsCount !== undefined ? `${room.currentItemsCount}/` : ''}{room.maxItems}件
          </span>
        </div>

        {isOverLimit && (
          <div className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            <AlertTriangle className="w-3 h-3" />
            <span>超过件数上限！</span>
          </div>
        )}

        <div className="pt-2 border-t border-cream-300">
          <span className={`status-badge ${statusInfo.className} text-white`}>{statusInfo.label}</span>
        </div>
      </div>
    </div>
  );
}
