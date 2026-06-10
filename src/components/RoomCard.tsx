import { Music, Drum, Mic, Users, ChevronRight, CheckCircle, XCircle } from 'lucide-react';
import type { Room } from '../types';
import { roomTypeLabels, roomTypeColors, useStore } from '../store';

const RoomIcon = ({ type }: { type: Room['type'] }) => {
  switch (type) {
    case 'piano': return <Music size={18} />;
    case 'drum': return <Drum size={18} />;
    case 'vocal': return <Mic size={18} />;
  }
};

interface RoomCardProps {
  room: Room;
  status?: 'available' | 'in_use' | 'upcoming' | 'needs_cleaning';
  bookingInfo?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
}

const statusLabels = {
  available: { text: '空闲', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  in_use: { text: '使用中', color: 'bg-red-100 text-red-700', icon: XCircle },
  upcoming: { text: '即将开始', color: 'bg-yellow-100 text-yellow-700', icon: null },
  needs_cleaning: { text: '待打扫', color: 'bg-orange-100 text-orange-700', icon: null },
};

export default function RoomCard({ room, status = 'available', bookingInfo, action, onClick }: RoomCardProps) {
  const StatusIcon = statusLabels[status]?.icon;

  return (
    <div
      className={`card p-4 cursor-pointer transition-all hover:shadow-md ${onClick ? 'hover:border-indigo-300' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg border ${roomTypeColors[room.type]}`}>
            <RoomIcon type={room.type} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-800">{room.name}</h4>
            <span className="text-xs text-gray-500">{roomTypeLabels[room.type]} · {room.floor}</span>
          </div>
        </div>
        {status && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusLabels[status].color}`}>
            {StatusIcon && <StatusIcon size={12} />}
            {statusLabels[status].text}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
        <span className="flex items-center gap-1">
          <Users size={14} />
          <span>最多{room.capacity}人</span>
        </span>
        {room.hasMusicStand && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">谱架</span>}
        {room.hasExternalSpeaker && <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">外放</span>}
      </div>

      {bookingInfo}

      {action && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
          {action}
          {onClick && <ChevronRight size={16} className="text-gray-400" />}
        </div>
      )}
      {!action && onClick && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      )}
    </div>
  );
}

export { RoomIcon, statusLabels, roomTypeLabels, roomTypeColors };
