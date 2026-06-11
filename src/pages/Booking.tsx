import { useState, useMemo } from 'react';
import { Calendar, Clock, User, X, AlertTriangle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { formatDisplayDate, formatShortWeekday, getNext7Days } from '@/utils/bookingUtils';
import { BOOKING_STATUS_LABELS, TIME_SLOTS } from '@/types';
import WaitlistQueue from '@/components/WaitlistQueue';

export default function Booking() {
  const {
    rooms,
    bookings,
    selectedDate,
    setSelectedDate,
    selectedRoomId,
    setSelectedRoomId,
    getSlotStatus,
    openBookingModal,
    cancelBooking,
    getWaitlistForSlot,
    processWaitlist,
  } = useAppStore();

  const [studentFilter, setStudentFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'slots' | 'mybookings' | 'waitlist'>('slots');
  const [selectedWaitlistSlot, setSelectedWaitlistSlot] = useState<{
    roomId: string;
    date: string;
    timeSlot: string;
  } | null>(null);

  const days = getNext7Days();
  const availableRooms = rooms.filter(r => r.status === 'available');
  const currentRoom = rooms.find(r => r.id === selectedRoomId) || availableRooms[0];

  const filteredBookings = useMemo(() => {
    return bookings
      .filter(b => !b.isWaitlist || b.status === 'waitlist')
      .filter(b => studentFilter ? b.studentName.includes(studentFilter) : true)
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.timeSlot.localeCompare(b.timeSlot);
      });
  }, [bookings, studentFilter]);

  const handleSlotClick = (date: string, timeSlot: string) => {
    if (!currentRoom) return;
    const status = getSlotStatus(currentRoom.id, date, timeSlot);
    if (status === 'available' || status === 'waitlist_only') {
      openBookingModal(currentRoom.id, date, timeSlot);
    }
  };

  const handleCancelBooking = (booking: typeof bookings[0]) => {
    if (window.confirm('确定要取消这个预约吗？')) {
      cancelBooking(booking.id);
      if (!booking.isWaitlist) {
        processWaitlist(booking.roomId, booking.date, booking.timeSlot);
      }
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

  const waitlistBookings = selectedWaitlistSlot
    ? getWaitlistForSlot(selectedWaitlistSlot.roomId, selectedWaitlistSlot.date, selectedWaitlistSlot.timeSlot)
    : [];

  const allWaitlistSlots = useMemo(() => {
    const slots = new Map<string, { roomId: string; date: string; timeSlot: string; count: number }>();
    bookings
      .filter(b => b.isWaitlist && b.status === 'waitlist')
      .forEach(b => {
        const key = `${b.roomId}-${b.date}-${b.timeSlot}`;
        const existing = slots.get(key);
        if (existing) {
          existing.count++;
        } else {
          slots.set(key, { roomId: b.roomId, date: b.date, timeSlot: b.timeSlot, count: 1 });
        }
      });
    return Array.from(slots.values());
  }, [bookings]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-wood-900 mb-2">预约管理</h1>
        <p className="text-wood-600">查看时段、管理预约和候补队列</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'slots', label: '时段预约' },
          { key: 'mybookings', label: '我的预约' },
          { key: 'waitlist', label: '候补队列' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-wood-700 text-gold-300 shadow-lg'
                : 'bg-white text-wood-600 hover:bg-cream-50 border border-wood-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'slots' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-4 sticky top-24">
              <h3 className="font-serif font-semibold text-wood-900 mb-3">选择琴房</h3>
              <div className="space-y-2">
                {availableRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      currentRoom?.id === room.id
                        ? 'bg-wood-700 text-gold-300'
                        : 'bg-cream-50 text-wood-700 hover:bg-cream-100'
                    }`}
                  >
                    <p className="font-medium">{room.roomNumber}</p>
                    <p className="text-xs opacity-75">{room.pianoType}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {currentRoom && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-wood-900">
                      {currentRoom.roomNumber}
                    </h2>
                    <p className="text-wood-500">{currentRoom.pianoType}</p>
                  </div>
                  <span className="badge badge-available">可预约</span>
                </div>

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

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                  {TIME_SLOTS.map(slot => {
                    const status = getSlotStatus(currentRoom.id, selectedDate, slot);
                    const notClickable = status === 'booked' || status === 'blocked' || status === 'not_open';
                    return (
                      <button
                        key={slot}
                        onClick={() => handleSlotClick(selectedDate, slot)}
                        disabled={notClickable}
                        className={`p-3 rounded-lg text-sm transition-all ${getSlotClass(status)}`}
                      >
                        <p className="font-medium">{slot}</p>
                        <p className="text-xs opacity-75">
                          {status === 'available' ? '可约' : status === 'waitlist_only' ? '候补' : status === 'booked' ? '已满' : status === 'not_open' ? '未开放' : '关闭'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-6 mt-6 pt-4 border-t border-cream-200">
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
                    <div className="w-4 h-4 rounded bg-wood-200"></div>
                    <span className="text-sm text-wood-600">未开放</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'mybookings' && (
        <div>
          <div className="card p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-wood-400" />
                <input
                  type="text"
                  placeholder="输入姓名筛选预约..."
                  value={studentFilter}
                  onChange={(e) => setStudentFilter(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="card p-12 text-center">
              <Calendar className="w-16 h-16 text-wood-300 mx-auto mb-4" />
              <h3 className="font-serif text-lg font-semibold text-wood-900 mb-2">暂无预约记录</h3>
              <p className="text-wood-600">去时段预约页面预约琴房吧</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredBookings.map((booking, index) => {
                const room = rooms.find(r => r.id === booking.roomId);
                const statusClass = {
                  confirmed: 'badge-available',
                  cancelled: 'badge-booked',
                  no_show: 'badge-maintenance',
                  waitlist: 'badge-waitlist',
                  completed: 'badge-available',
                }[booking.status];

                return (
                  <div
                    key={booking.id}
                    className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 opacity-0 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif font-semibold text-wood-900">
                          {room?.roomNumber || '未知琴房'}
                        </h3>
                        <span className={`badge ${statusClass}`}>
                          {booking.isWaitlist ? `候补 #${booking.waitlistPosition}` : BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-wood-600">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {booking.studentName} · {booking.major}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDisplayDate(booking.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {booking.timeSlot}
                        </span>
                      </div>
                      <p className="text-sm text-wood-500 mt-2">
                        练习目的：{booking.practicePurpose}
                      </p>
                    </div>
                    <div className="flex sm:flex-col gap-2">
                      {booking.status === 'confirmed' && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          取消预约
                        </button>
                      )}
                      {booking.status === 'waitlist' && (
                        <button
                          onClick={() => handleCancelBooking(booking)}
                          className="px-4 py-2 text-sm text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                        >
                          取消候补
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'waitlist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-4">
              <h3 className="font-serif font-semibold text-wood-900 mb-4">有候补的时段</h3>
              {allWaitlistSlots.length === 0 ? (
                <p className="text-sm text-wood-500 text-center py-8">暂无候补队列</p>
              ) : (
                <div className="space-y-2">
                  {allWaitlistSlots.map((slot, index) => {
                    const room = rooms.find(r => r.id === slot.roomId);
                    const isSelected = selectedWaitlistSlot?.roomId === slot.roomId &&
                      selectedWaitlistSlot?.date === slot.date &&
                      selectedWaitlistSlot?.timeSlot === slot.timeSlot;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedWaitlistSlot(slot)}
                        className={`w-full p-3 rounded-lg text-left transition-all ${
                          isSelected
                            ? 'bg-wood-700 text-gold-300'
                            : 'bg-cream-50 text-wood-700 hover:bg-cream-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{room?.roomNumber}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            isSelected ? 'bg-gold-500 text-wood-900' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {slot.count}人
                          </span>
                        </div>
                        <p className={`text-xs ${isSelected ? 'text-gold-200' : 'text-wood-500'}`}>
                          {formatDisplayDate(slot.date)} {slot.timeSlot}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedWaitlistSlot ? (
              <WaitlistQueue
                bookings={waitlistBookings}
                roomNumber={rooms.find(r => r.id === selectedWaitlistSlot.roomId)?.roomNumber || ''}
                date={formatDisplayDate(selectedWaitlistSlot.date)}
                timeSlot={selectedWaitlistSlot.timeSlot}
              />
            ) : (
              <div className="card p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-wood-300 mx-auto mb-4" />
                <h3 className="font-serif text-lg font-semibold text-wood-900 mb-2">选择时段</h3>
                <p className="text-wood-600">从左侧选择一个时段查看候补队列详情</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
