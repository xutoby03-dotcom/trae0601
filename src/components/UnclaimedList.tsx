import { Phone, Calendar, ShieldAlert, MapPin } from 'lucide-react';
import type { Stroller } from '@/types';
import { useStrollerStore } from '@/store/useStrollerStore';
import { daysBetween, cn, relativeTime } from '@/utils/helpers';
import { LONG_TERM_THRESHOLD_DAYS } from '@/utils/constants';

interface Props {
  cars: Stroller[];
}

export default function UnclaimedList({ cars }: Props) {
  const { setActivePatrol, setActiveDetail } = useStrollerStore();

  if (cars.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-7 h-7 text-emerald-500" />
        </div>
        <p className="text-sm text-slate-500">太棒了！暂无超过 {LONG_TERM_THRESHOLD_DAYS} 天未更新的车辆</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cars.map((car, idx) => {
        const days = daysBetween(car.updatedAt);
        const severity = days > 60 ? 'danger' : days > 45 ? 'warning' : 'info';

        return (
          <div
            key={car.id}
            onClick={() => setActiveDetail(car.id)}
            className={cn(
              'p-4 rounded-2xl border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 animate-fade-in-up',
              severity === 'danger'
                ? 'bg-red-50/60 border-red-200 hover:border-red-300'
                : severity === 'warning'
                ? 'bg-amber-50/60 border-amber-200 hover:border-amber-300'
                : 'bg-slate-50 border-slate-200 hover:border-brand-300'
            )}
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-slate-200 border border-white">
                {car.photos[0] ? (
                  <img src={car.photos[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                    无照片
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800">
                    {car.building} {car.room}
                  </span>
                  <span
                    className={cn(
                      'badge',
                      severity === 'danger'
                        ? 'bg-red-500 text-white'
                        : severity === 'warning'
                        ? 'bg-amber-500 text-white'
                        : 'bg-slate-500 text-white'
                    )}
                  >
                    <Calendar className="w-3 h-3" />
                    {days} 天未更新
                  </span>
                  {car.isFireExit && (
                    <span className="badge bg-orange-100 text-orange-700 border-orange-200">
                      <ShieldAlert className="w-3 h-3" />
                      消防通道
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5 truncate">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {car.phone}
                  </span>
                  <span className="flex items-center gap-1.5 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {car.location}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  车主：{car.ownerName} · {car.model}（{car.color}）· 最后更新 {relativeTime(car.updatedAt)}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePatrol(car.id);
                }}
                className={cn(
                  'shrink-0 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all',
                  severity === 'danger'
                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg'
                    : 'bg-brand-600 text-white hover:bg-brand-700 shadow-md hover:shadow-lg'
                )}
              >
                <Phone className="w-4 h-4" />
                标记联系
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
