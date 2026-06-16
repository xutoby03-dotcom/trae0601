import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import TimeSlotPicker from '../../components/TimeSlotPicker';
import PetForm from '../../components/PetForm';
import { timeSlots } from '../../data/mockData';
import type { PetInfo } from '../../types';
import { cn } from '../../lib/utils';

const today = () => new Date().toISOString().split('T')[0];

export default function BookingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poolId = searchParams.get('poolId') ?? '';
  const { washingPools, createBooking, bookings } = useAppStore();

  const pool = useMemo(() => washingPools.find((p) => p.id === poolId), [washingPools, poolId]);

  const [date, setDate] = useState<string>(today());
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [petInfo, setPetInfo] = useState<PetInfo>({
    nickname: '',
    size: 'MEDIUM',
    building: '',
    ownerPhone: '',
    afraidOfWater: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disabledSlots = useMemo(() => {
    return bookings
      .filter((b) => b.poolId === poolId && b.date === date && (b.status === 'PENDING' || b.status === 'IN_USE'))
      .map((b) => b.timeSlot);
  }, [bookings, poolId, date]);

  const isPoolAvailable = pool?.status === 'IDLE';
  const canSubmit = pool && isPoolAvailable && selectedSlot && petInfo.nickname && petInfo.building && petInfo.ownerPhone;

  const handleSubmit = () => {
    if (!pool || !canSubmit) return;
    setError(null);
    setSubmitting(true);

    try {
      const booking = createBooking(pool.id, pool.name, date, selectedSlot, petInfo);
      setTimeout(() => {
        navigate(`/resident/using/${booking.id}`);
      }, 300);
    } catch (e) {
      setError('预约失败，请稍后重试');
      setSubmitting(false);
    }
  };

  const unavailableStatusText: Record<string, string> = {
    OCCUPIED: '当前有人正在使用',
    CLEANING_PENDING: '待清洁，暂不可用',
    PAUSED: '已暂停使用',
    MAINTENANCE: '维修中，暂不可用',
  };

  if (!pool) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-rose-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">洗脚池不存在</h2>
        <p className="text-slate-500 mb-6 text-center">请返回重新选择</p>
        <button
          onClick={() => navigate('/resident')}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-white font-medium shadow-lg shadow-teal-500/30"
        >
          返回首页
        </button>
      </div>
    );
  }

  if (!isPoolAvailable) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col items-center justify-center p-8">
        <AlertCircle className="h-16 w-16 text-amber-400 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">该洗脚池暂不可用</h2>
        <p className="text-slate-500 mb-2 text-center">{pool.name}</p>
        <p className="text-amber-600 mb-6 text-center font-medium">
          {unavailableStatusText[pool.status] || '当前不可预约'}
        </p>
        <button
          onClick={() => navigate('/resident')}
          className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 text-white font-medium shadow-lg shadow-teal-500/30"
        >
          返回选择其他洗脚池
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/resident')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">预约洗脚池</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 p-5 text-white shadow-xl shadow-teal-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-1">{pool.name}</h2>
              <div className="flex items-center gap-1.5 text-teal-50/90 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{pool.location}</span>
              </div>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-3">
            <CalendarDays className="h-4 w-4" />
            <span>选择日期</span>
          </div>
          <input
            type="date"
            value={date}
            min={today()}
            onChange={(e) => {
              setDate(e.target.value);
              setSelectedSlot('');
            }}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition-all focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
          />
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <TimeSlotPicker
            slots={timeSlots}
            selected={selectedSlot}
            onChange={setSelectedSlot}
            disabledSlots={disabledSlots}
          />
        </div>

        <div className="rounded-2xl bg-white border border-slate-100 p-5 shadow-sm">
          <PetForm value={petInfo} onChange={setPetInfo} />
        </div>

        {error && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 flex items-center gap-2 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={cn(
              'w-full flex items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-semibold text-white transition-all',
              canSubmit && !submitting
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.99]'
                : 'bg-slate-300 cursor-not-allowed'
            )}
          >
            {submitting
              ? '提交中...'
              : !pool
                ? '请选择洗脚池'
                : !selectedSlot
                  ? '请选择时段'
                  : !petInfo.nickname
                    ? '请填写宠物昵称'
                    : !petInfo.building
                      ? '请选择楼栋'
                      : !petInfo.ownerPhone
                        ? '请填写联系电话'
                        : '确认预约'}
          </button>
        </div>
      </div>
    </div>
  );
}
