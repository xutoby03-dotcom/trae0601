import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CalendarPlus, PawPrint, Clock, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { useAppStore } from '../../store';
import PoolCard from '../../components/PoolCard';
import Empty from '../../components/Empty';
import type { BookingStatus, PetSize } from '../../types';
import { cn } from '../../lib/utils';

const sizeLabels: Record<PetSize, string> = {
  SMALL: '小型',
  MEDIUM: '中型',
  LARGE: '大型',
};

const statusConfig: Record<BookingStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
  PENDING: { label: '待使用', color: 'text-teal-600', bg: 'bg-teal-50', icon: Clock },
  IN_USE: { label: '使用中', color: 'text-orange-600', bg: 'bg-orange-50', icon: PawPrint },
  COMPLETED: { label: '已完成', color: 'text-slate-500', bg: 'bg-slate-50', icon: CheckCircle2 },
  CANCELLED: { label: '已取消', color: 'text-rose-500', bg: 'bg-rose-50', icon: XCircle },
  NO_SHOW: { label: '未使用', color: 'text-amber-600', bg: 'bg-amber-50', icon: XCircle },
};

export default function ResidentHome() {
  const navigate = useNavigate();
  const { washingPools, bookings, getBookingsByPhone } = useAppStore();

  const myBookings = getBookingsByPhone('13800138001').filter(
    (b) => b.status === 'PENDING' || b.status === 'IN_USE'
  );

  const handlePoolClick = (poolId: string) => {
    navigate(`/resident/booking?poolId=${poolId}`);
  };

  const handleQuickBooking = () => {
    const firstIdle = washingPools.find((p) => p.status === 'IDLE');
    if (firstIdle) {
      navigate(`/resident/booking?poolId=${firstIdle.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-32">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-all hover:bg-slate-200 active:scale-95"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold text-slate-800">选择洗脚池</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-700">洗脚池状态</h2>
            <span className="text-sm text-slate-500">
              空闲 {washingPools.filter((p) => p.status === 'IDLE').length}/{washingPools.length}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {washingPools.map((pool) => (
              <PoolCard
                key={pool.id}
                pool={pool}
                onClick={() => handlePoolClick(pool.id)}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-700">我的预约</h2>
            {myBookings.length > 0 && (
              <span className="inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-700">
                {myBookings.length}
              </span>
            )}
          </div>

          {myBookings.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-100 py-12">
              <Empty />
              <p className="mt-2 text-center text-sm text-slate-500">暂无预约记录</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myBookings.map((booking) => {
                const config = statusConfig[booking.status];
                const StatusIcon = config.icon;
                return (
                  <div
                    key={booking.id}
                    onClick={() => booking.status === 'PENDING' || booking.status === 'IN_USE' ? navigate(`/resident/using/${booking.id}`) : undefined}
                    className={cn(
                      'rounded-2xl p-4 bg-white border border-slate-100 shadow-sm transition-all',
                      (booking.status === 'PENDING' || booking.status === 'IN_USE') && 'cursor-pointer hover:shadow-md hover:scale-[1.01]'
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500">
                          <PawPrint className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{booking.petInfo.nickname}</p>
                          <p className="text-xs text-slate-500">
                            {sizeLabels[booking.petInfo.size]} · {booking.petInfo.building}
                          </p>
                        </div>
                      </div>
                      <div className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium', config.bg, config.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {config.label}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{booking.poolName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{booking.date} {booking.timeSlot}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleQuickBooking}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-teal-500/30 transition-all hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.01] active:scale-[0.99]"
          >
            <CalendarPlus className="h-5 w-5" />
            快速预约
          </button>
        </div>
      </div>
    </div>
  );
}
