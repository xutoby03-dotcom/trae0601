import { X, Music, MapPin, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Room, PIANO_TYPE_LABELS, TIME_SLOTS, ROOM_STATUS_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { formatDisplayDate, formatShortWeekday, getNext7Days } from '@/utils/bookingUtils';

interface RoomDetailModalProps {
  room: Room;
  onClose: () => void;
}

export default function RoomDetailModal({ room, onClose }: RoomDetailModalProps) {
  const { selectedDate, setSelectedDate, getSlotStatus, openBookingModal } = useAppStore();
  const days = getNext7Days();
  
  const handleSlotClick = (date: string, timeSlot: string) => {
    const status = getSlotStatus(room.id, date, timeSlot);
    if (status === 'available' || status === 'waitlist_only') {
      openBookingModal(room.id, date, timeSlot);
    }
  };

  const getSlotClass = (status: string) => {
    switch (status) {
      case 'available': return 'slot-available';
      case 'booked': return 'slot-booked';
      case 'waitlist_only': return 'slot-waitlist';
      case 'blocked': return 'slot-blocked';
      case 'not_open': return 'slot-not-open';
      default: return 'slot-available';
    }
  };

  const getSlotLabel = (status: string) => {
    switch (status) {
      case 'available': return '可约';
      case 'booked': return '已满';
      case 'waitlist_only': return '候补';
      case 'blocked': return '关闭';
      case 'not_open': return '未开放';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-cream-100">
              <img src={room.photoUrl} alt={room.roomNumber} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-bold text-wood-900">{room.roomNumber}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-wood-600">{PIANO_TYPE_LABELS[room.pianoType]}</span>
                <span className={`badge ${room.status === 'available' ? 'badge-available' : 'badge-maintenance'}`}>
                  {ROOM_STATUS_LABELS[room.status]}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-cream-100 transition-colors text-wood-500 hover:text-wood-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card p-4">
              <MapPin className="w-5 h-5 text-wood-500 mb-2" />
              <p className="text-xs text-wood-500">楼层</p>
              <p className="font-semibold text-wood-900">{room.floor} 楼</p>
            </div>
            <div className="card p-4">
              <Music className="w-5 h-5 text-wood-500 mb-2" />
              <p className="text-xs text-wood-500">谱架</p>
              <p className="font-semibold text-wood-900">{room.hasMusicStand ? '有' : '无'}</p>
            </div>
            <div className="card p-4">
              <Clock className="w-5 h-5 text-wood-500 mb-2" />
              <p className="text-xs text-wood-500">开放时段</p>
              <p className="font-semibold text-wood-900">{room.availableTimeSlots.length} 个</p>
            </div>
            <div className="card p-4">
              <Calendar className="w-5 h-5 text-wood-500 mb-2" />
              <p className="text-xs text-wood-500">开放时间</p>
              <p className="font-semibold text-wood-900">
                {room.availableTimeSlots.length > 0 
                  ? `${room.availableTimeSlots[0].split('-')[0]}-${room.availableTimeSlots[room.availableTimeSlots.length - 1].split('-')[1]}`
                  : '暂未开放'}
              </p>
            </div>
          </div>

          {room.status !== 'available' && room.maintenanceReason && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-orange-800">当前不可用</p>
                <p className="text-sm text-orange-600">{room.maintenanceReason}</p>
              </div>
            </div>
          )}

          <div className="mb-4">
            <h3 className="font-serif text-lg font-semibold text-wood-900 mb-4">选择预约时段</h3>
            <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-2">
              {days.map(date => (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all ${
                    selectedDate === date
                      ? 'bg-wood-700 text-gold-300 shadow-lg'
                      : 'bg-cream-50 text-wood-600 hover:bg-cream-100'
                  }`}
                >
                  <p className="text-xs opacity-75">{formatShortWeekday(date)}</p>
                  <p className="font-semibold">{formatDisplayDate(date)}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-1 flex-wrap">
              {TIME_SLOTS.map(slot => {
                const status = getSlotStatus(room.id, selectedDate, slot);
                const notClickable = status === 'booked' || status === 'blocked' || status === 'not_open';
                return (
                  <button
                    key={slot}
                    onClick={() => handleSlotClick(selectedDate, slot)}
                    disabled={notClickable}
                    className={`w-24 py-2 px-3 rounded-lg text-sm transition-all ${getSlotClass(status)}`}
                  >
                    <p className="font-medium">{slot}</p>
                    <p className="text-xs opacity-75">{getSlotLabel(status)}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-cream-200">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-200"></div>
              <span className="text-sm text-wood-600">可预约</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-yellow-200"></div>
              <span className="text-sm text-wood-600">可候补</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-red-200"></div>
              <span className="text-sm text-wood-600">已满</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gray-200"></div>
              <span className="text-sm text-wood-600">关闭</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-wood-200"></div>
              <span className="text-sm text-wood-600">未开放</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
