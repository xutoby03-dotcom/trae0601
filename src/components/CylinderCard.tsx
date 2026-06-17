import { MapPin, Calendar, DollarSign, Gauge, Cylinder } from 'lucide-react';
import type { Cylinder as CylinderType } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDate, isNearExpiry, daysUntil } from '@/utils/date';
import { calculatePressurePercentage } from '@/utils/calculator';

interface CylinderCardProps {
  cylinder: CylinderType;
  onClick?: () => void;
}

export function CylinderCard({ cylinder, onClick }: CylinderCardProps) {
  const pressurePercent = calculatePressurePercentage(cylinder.pressure, cylinder.ratedPressure);
  const nearExpiry = isNearExpiry(cylinder.nextInspectionDate) && cylinder.status !== 'expired';
  const daysLeft = daysUntil(cylinder.nextInspectionDate);

  const getPressureBarColor = () => {
    if (pressurePercent > 60) return 'bg-emerald-500';
    if (pressurePercent > 30) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const gradientClass = cylinder.photoUrl && cylinder.photoUrl.startsWith('from-')
    ? `bg-gradient-to-br ${cylinder.photoUrl}`
    : 'bg-gradient-to-br from-primary-500 to-primary-700';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-all duration-200 cursor-pointer overflow-hidden group"
    >
      <div className={`relative h-40 ${gradientClass} flex items-center justify-center`}>
        <Cylinder className="w-20 h-20 text-white/30 group-hover:scale-110 transition-transform duration-300" />
        <div className="absolute top-3 right-3">
          <StatusBadge status={cylinder.status} size="sm" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <h3 className="text-white font-display font-bold text-lg">{cylinder.cylinderNo}</h3>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">容量</span>
          <span className="font-medium text-slate-700">{cylinder.capacity}L</span>
        </div>

        <div>
          <div className="flex items-center justify-between text-sm mb-1.5">
            <div className="flex items-center gap-1.5 text-slate-500">
              <Gauge className="w-4 h-4" />
              <span>压力表</span>
            </div>
            <span className="font-medium text-slate-700">
              {cylinder.pressure} / {cylinder.ratedPressure} MPa
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${getPressureBarColor()} transition-all duration-500 rounded-full`}
              style={{ width: `${pressurePercent}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-400 mt-1 text-right">{pressurePercent}%</p>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-slate-500">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{cylinder.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 justify-end">
            <DollarSign className="w-3.5 h-3.5" />
            <span>¥{cylinder.deposit}</span>
          </div>
        </div>

        <div className={`flex items-center gap-1.5 text-sm pt-2 border-t border-slate-100 ${nearExpiry ? 'text-amber-600' : 'text-slate-500'}`}>
          <Calendar className="w-3.5 h-3.5" />
          <span>下次检验：{formatDate(cylinder.nextInspectionDate)}</span>
          {nearExpiry && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded">
              剩{daysLeft}天
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
