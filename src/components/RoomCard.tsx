import { useState } from 'react';
import { Music, MapPin, Clock, Calendar, X, ChevronRight } from 'lucide-react';
import { Room, ROOM_STATUS_LABELS, PIANO_TYPE_LABELS, TIME_SLOTS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatDisplayDate, formatShortWeekday, getNext7Days } from '@/utils/bookingUtils';
import RoomDetailModal from './RoomDetailModal';

interface RoomCardProps {
  room: Room;
  index: number;
}

export default function RoomCard({ room, index }: RoomCardProps) {
  const [showDetail, setShowDetail] = useState(false);
  const { getSlotStatus, getBookingsForRoom } = useAppStore();
  
  const days = getNext7Days();
  const today = days[0];
  
  const bookings = getBookingsForRoom(room.id);
  
  const previewSlots = room.availableTimeSlots.slice(0, 6);
  
  const todaySlots = previewSlots.length > 0
    ? previewSlots.map(slot => ({
        time: slot,
        status: getSlotStatus(room.id, today, slot),
      }))
    : TIME_SLOTS.slice(0, 6).map(slot => ({
        time: slot,
        status: 'not_open' as const,
      }));
  
  const availableCount = room.availableTimeSlots.filter(
    slot => getSlotStatus(room.id, today, slot) === 'available'
  ).length;
  
  const statusClass = {
    available: 'badge-available',
    maintenance: 'badge-maintenance',
    temporarily_closed: 'badge-maintenance',
  }[room.status];

  const handleCardClick = () => {
    setShowDetail(true);
  };

  return (
    <>
      <div
        className={`card p-4 cursor-pointer opacity-0 animate-fade-in-up animate-stagger-${Math.min(index + 1, 8)} ${
          room.status !== 'available' ? 'opacity-70' : ''
        }`}
        onClick={handleCardClick}
      >
        <div className="flex gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-cream-100">
              <img
                src={room.photoUrl}
                alt={`琴房 ${room.roomNumber}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            {room.hasMusicStand && (
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gold-500 rounded-full flex items-center justify-center shadow-md">
                <Music className="w-3.5 h-3.5 text-wood-900" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="font-serif text-lg font-semibold text-wood-900">
                  {room.roomNumber}
                </h3>
                <p className="text-sm text-wood-600">
                  {PIANO_TYPE_LABELS[room.pianoType]}
                </p>
              </div>
              <span className={`badge ${statusClass} flex-shrink-0`}>
                {ROOM_STATUS_LABELS[room.status]}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-xs text-wood-500 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {room.floor}楼
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                今日可约 {availableCount} 时段
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              {todaySlots.map((slot, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded text-xs font-medium flex items-center justify-center ${
                    slot.status === 'available'
                      ? 'bg-green-100 text-green-700'
                      : slot.status === 'waitlist_only'
                      ? 'bg-yellow-100 text-yellow-700'
                      : slot.status === 'not_open'
                      ? 'bg-wood-100 text-wood-400'
                      : 'bg-red-100 text-red-700'
                  }`}
                  title={`${slot.time} - ${slot.status}`}
                >
                  {slot.time.split(':')[0]}
                </div>
              ))}
              <div className="flex items-center text-wood-400 text-xs ml-1">
                <span>...</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>
        
        {room.maintenanceReason && (
          <div className="mt-3 pt-3 border-t border-cream-200">
            <p className="text-xs text-orange-600">
              原因：{room.maintenanceReason}
            </p>
          </div>
        )}
      </div>
      
      {showDetail && (
        <RoomDetailModal room={room} onClose={() => setShowDetail(false)} />
      )}
    </>
  );
}
