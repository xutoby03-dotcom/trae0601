import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Clock, Users, BookOpen, Volume2, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useStore, practiceTypeLabels, roomTypeLabels, roomTypeColors } from '../store';
import RoomCard from '../components/RoomCard';
import type { PracticeType, Room, RoomType } from '../types';
import { format, addDays, parseISO, isBefore, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function BookingPage() {
  const [searchParams] = useSearchParams();
  const { rooms, bookings, addBooking, getRoomBookingsByDate, checkTimeConflict, currentUser } = useStore(s => ({
    rooms: s.rooms,
    bookings: s.bookings,
    addBooking: s.addBooking,
    getRoomBookingsByDate: s.getRoomBookingsByDate,
    checkTimeConflict: s.checkTimeConflict,
    currentUser: s.currentUser,
  }));

  const today = format(new Date(), 'yyyy-MM-dd');
  const minDate = today;
  const maxDate = format(addDays(new Date(), 14), 'yyyy-MM-dd');

  const [selectedRoomId, setSelectedRoomId] = useState<string>(searchParams.get('roomId') || '');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [practiceType, setPracticeType] = useState<PracticeType>('piano_solo');
  const [peopleCount, setPeopleCount] = useState(1);
  const [needMusicStand, setNeedMusicStand] = useState(false);
  const [hasExternalSpeaker, setHasExternalSpeaker] = useState(false);
  const [filterType, setFilterType] = useState<RoomType | 'all'>('all');
  const [userName, setUserName] = useState(currentUser);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const rid = searchParams.get('roomId');
    if (rid) setSelectedRoomId(rid);
  }, [searchParams]);

  const filteredRooms = useMemo(() => {
    return filterType === 'all' ? rooms : rooms.filter(r => r.type === filterType);
  }, [rooms, filterType]);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId);

  const conflictCheck = useMemo(() => {
    if (!selectedRoomId) return null;
    const hasConflict = checkTimeConflict(selectedRoomId, date, startTime, endTime);
    if (hasConflict) return '该时间段与已有预约冲突';

    const start = parseISO(`${date}T${startTime}:00`);
    const end = parseISO(`${date}T${endTime}:00`);
    if (!isBefore(start, end)) return '结束时间必须晚于开始时间';

    if (isToday(parseISO(date)) && isBefore(start, new Date())) {
      return '开始时间不能早于当前时间';
    }

    if (selectedRoom && peopleCount > selectedRoom.capacity) {
      return `人数超过房间容量限制（最多${selectedRoom.capacity}人）`;
    }

    if (needMusicStand && !selectedRoom?.hasMusicStand) {
      return '该房间不提供谱架';
    }

    return null;
  }, [selectedRoomId, date, startTime, endTime, checkTimeConflict, peopleCount, selectedRoom, needMusicStand]);

  const existingBookings = useMemo(() => {
    if (!selectedRoomId) return [];
    return getRoomBookingsByDate(selectedRoomId, date);
  }, [selectedRoomId, date, getRoomBookingsByDate]);

  const timeSlots = useMemo(() => {
    const slots: { time: string; status: 'available' | 'booked' | 'past' }[] = [];
    for (let h = 8; h <= 22; h++) {
      for (let m = 0; m < 60; m += 30) {
        const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        const slotTime = parseISO(`${date}T${time}:00`);
        let status: 'available' | 'booked' | 'past' = 'available';

        if (isToday(parseISO(date)) && isBefore(slotTime, new Date())) {
          status = 'past';
        } else if (selectedRoomId) {
          const isBooked = existingBookings.some(b => {
            const bStart = parseISO(`${b.date}T${b.startTime}:00`);
            const bEnd = parseISO(`${b.date}T${b.endTime}:00`);
            return !isBefore(slotTime, bStart) && isBefore(slotTime, bEnd);
          });
          if (isBooked) status = 'booked';
        }

        slots.push({ time, status });
      }
    }
    return slots;
  }, [date, selectedRoomId, existingBookings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId) {
      setToast({ type: 'error', message: '请先选择一个房间' });
      return;
    }
    if (conflictCheck) {
      setToast({ type: 'error', message: conflictCheck });
      return;
    }

    const result = addBooking({
      roomId: selectedRoomId,
      userId: 'u' + Date.now(),
      userName: userName || '匿名用户',
      date,
      startTime,
      endTime,
      practiceType,
      peopleCount,
      needMusicStand,
      hasExternalSpeaker,
    });

    setToast({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      setTimeout(() => {
        setSelectedRoomId('');
      }, 1000);
    }
    setTimeout(() => setToast(null), 3000);
  };

  const generateEndTimeOptions = () => {
    const [sh, sm] = startTime.split(':').map(Number);
    const options: string[] = [];
    for (let mins = sh * 60 + sm + 30; mins <= 23 * 60; mins += 30) {
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
    }
    if (options.length === 0) {
      return [endTime];
    }
    if (!options.includes(endTime)) {
      setEndTime(options[0]);
    }
    return options;
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-1">预约房间</h1>
        <p className="text-gray-500 text-sm">选择房间和时间段，提前预约避免白跑一趟</p>
      </div>

      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          {toast.message}
        </div>
      )}

      <div className="card p-4">
        <label className="label mb-2">房间类型筛选</label>
        <div className="flex flex-wrap gap-2">
          {(['all', 'piano', 'drum', 'vocal'] as const).map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filterType === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {t === 'all' ? '全部' : roomTypeLabels[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">选择房间</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              onClick={() => setSelectedRoomId(room.id)}
              className={`transition-all ${selectedRoomId === room.id ? 'ring-2 ring-indigo-500 rounded-2xl' : ''}`}
            >
              <RoomCard room={room} />
            </div>
          ))}
        </div>
      </div>

      {selectedRoom && (
        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{selectedRoom.name}</h3>
              <p className="text-sm text-gray-500">
                {roomTypeLabels[selectedRoom.type]} · {selectedRoom.floor} · 最多{selectedRoom.capacity}人
              </p>
            </div>
            <button type="button" onClick={() => setSelectedRoomId('')} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label"><Calendar size={14} className="inline mr-1" />日期</label>
              <input
                type="date"
                className="input"
                value={date}
                min={minDate}
                max={maxDate}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">预约人姓名</label>
              <input
                type="text"
                className="input"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="请输入姓名"
                required
              />
            </div>
            <div>
              <label className="label"><Clock size={14} className="inline mr-1" />开始时间</label>
              <select
                className="input"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                required
              >
                {timeSlots.filter(s => s.status !== 'past').map(s => (
                  <option key={s.time} value={s.time} disabled={s.status === 'booked'}>
                    {s.time} {s.status === 'booked' ? '(已被预约)' : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label"><Clock size={14} className="inline mr-1" />结束时间</label>
              <select
                className="input"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                required
              >
                {generateEndTimeOptions().map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">练习类型</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {(Object.keys(practiceTypeLabels) as PracticeType[]).map(pt => (
                <button
                  type="button"
                  key={pt}
                  onClick={() => setPracticeType(pt)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    practiceType === pt
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {practiceTypeLabels[pt]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label"><Users size={14} className="inline mr-1" />练习人数（含自己）</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPeopleCount(p => Math.max(1, p - 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl font-bold"
              >
                −
              </button>
              <span className="text-2xl font-bold w-12 text-center">{peopleCount}</span>
              <button
                type="button"
                onClick={() => setPeopleCount(p => Math.min(selectedRoom.capacity, p + 1))}
                className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-xl font-bold"
              >
                +
              </button>
              <span className="text-sm text-gray-500 ml-2">（房间最多 {selectedRoom.capacity} 人）</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={needMusicStand}
                onChange={e => setNeedMusicStand(e.target.checked)}
                disabled={!selectedRoom.hasMusicStand}
                className="mt-1 w-4 h-4 accent-indigo-600"
              />
              <div>
                <div className="font-medium text-gray-800 flex items-center gap-1.5">
                  <BookOpen size={16} /> 需要谱架
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {selectedRoom.hasMusicStand ? '房间内有谱架可使用' : '该房间未配备谱架'}
                </div>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={hasExternalSpeaker}
                onChange={e => setHasExternalSpeaker(e.target.checked)}
                className="mt-1 w-4 h-4 accent-indigo-600"
              />
              <div>
                <div className="font-medium text-gray-800 flex items-center gap-1.5">
                  <Volume2 size={16} /> 自带外放设备
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  需要连接房间音箱或自行携带设备
                </div>
              </div>
            </label>
          </div>

          {existingBookings.length > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">当日该房间已有预约：</p>
              <div className="space-y-1">
                {existingBookings.map(b => (
                  <div key={b.id} className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="font-mono">{b.startTime}-{b.endTime}</span>
                    <span>·</span>
                    <span>{b.userName}</span>
                    <span>·</span>
                    <span>{practiceTypeLabels[b.practiceType]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {conflictCheck && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertTriangle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{conflictCheck}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600 mb-3">
              <strong>预约摘要：</strong>{selectedRoom.name} · {format(parseISO(date), 'MM月dd日 (EEEE)', { locale: zhCN })} · {startTime}-{endTime} · {peopleCount}人
            </div>
            <button
              type="submit"
              className="btn-primary w-full py-3 text-base"
              disabled={!!conflictCheck}
            >
              确认预约
            </button>
          </div>
        </form>
      )}

      {bookings.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">我的预约记录</h3>
          <div className="space-y-3">
            {bookings.slice().reverse().slice(0, 10).map(b => {
              const room = rooms.find(r => r.id === b.roomId);
              const statusStyle = {
                pending: 'bg-yellow-100 text-yellow-700',
                in_use: 'bg-red-100 text-red-700',
                completed: 'bg-green-100 text-green-700',
                cancelled: 'bg-gray-200 text-gray-500',
                needs_cleaning: 'bg-orange-100 text-orange-700',
              }[b.status];
              const statusText = {
                pending: '待使用',
                in_use: '使用中',
                completed: '已完成',
                cancelled: '已取消',
                needs_cleaning: '待打扫',
              }[b.status];
              return (
                <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium text-gray-800">
                      {room?.name} <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${statusStyle}`}>{statusText}</span>
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {b.date} {b.startTime}-{b.endTime} · {practiceTypeLabels[b.practiceType]} · {b.peopleCount}人
                    </p>
                  </div>
                  {b.status === 'pending' && (
                    <CancelButton bookingId={b.id} onCancelled={() => setToast({ type: 'success', message: '预约已取消' })} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function CancelButton({ bookingId, onCancelled }: { bookingId: string; onCancelled: () => void }) {
  const cancelBooking = useStore(s => s.cancelBooking);
  const [confirm, setConfirm] = useState(false);
  return (
    <div>
      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="btn-danger text-sm px-3 py-1.5"
        >
          取消
        </button>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => { cancelBooking(bookingId); onCancelled(); }}
            className="btn-danger text-sm px-3 py-1.5"
          >
            确认
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="btn-secondary text-sm px-3 py-1.5"
          >
            返回
          </button>
        </div>
      )}
    </div>
  );
}
