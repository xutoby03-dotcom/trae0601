import { Link } from 'react-router-dom';
import type { Equipment, MaintenanceStatus } from '@/types';
import { SPORT_TYPE_LABELS } from '@/types';
import { SportIcon } from './SportIcon';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatDuration } from '@/utils/date';
import { ChevronRight, Calendar, Gauge, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EquipmentCardProps {
  equipment: Equipment;
  maintenanceStatus: MaintenanceStatus;
  delay?: number;
}

export const EquipmentCard = ({
  equipment,
  maintenanceStatus,
  delay = 0,
}: EquipmentCardProps) => {
  const lifespanPct = equipment.lifespanKm
    ? Math.min(100, (maintenanceStatus.totalKm / equipment.lifespanKm) * 100)
    : Math.min(
        100,
        (maintenanceStatus.daysSincePurchase / equipment.lifespanDays) * 100
      );

  const getProgressColor = () => {
    if (lifespanPct >= 90) return 'from-red-400 to-red-500';
    if (lifespanPct >= 70) return 'from-amber-400 to-amber-500';
    if (lifespanPct >= 40) return 'from-brand-400 to-brand-500';
    return 'from-emerald-400 to-emerald-500';
  };

  return (
    <Link
      to={`/equipment/${equipment.id}`}
      className="group card-base card-hover overflow-hidden animate-fade-in-up block"
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      <div className="relative h-32 bg-gradient-to-br from-warm-100 via-warm-50 to-white overflow-hidden">
        {equipment.photoUrl ? (
          <img
            src={equipment.photoUrl}
            alt={equipment.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
              <SportIcon
                type={equipment.sportType}
                size={32}
                className="text-warm-600 group-hover:text-brand-500 transition-colors"
              />
            </div>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <StatusBadge status={equipment.status} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-warm-200/50">
          <div
            className={cn('h-full bg-gradient-to-r transition-all', getProgressColor())}
            style={{ width: `${lifespanPct}%` }}
          />
        </div>
        {equipment.photoUrl && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        )}
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-warm-900 truncate group-hover:text-brand-600 transition-colors">
              {equipment.name}
            </h3>
            <p className="text-sm text-warm-500 mt-0.5 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-warm-300" />
              {SPORT_TYPE_LABELS[equipment.sportType]}
            </p>
          </div>
          <ChevronRight
            size={18}
            className="text-warm-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all shrink-0 mt-1"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-warm-50 rounded-xl py-2.5 px-2">
            <Timer size={16} className="mx-auto text-warm-400 mb-1" />
            <p className="text-xs text-warm-500">累计使用</p>
            <p className="text-sm font-semibold text-warm-800">
              {maintenanceStatus.totalUsageCount} 次
            </p>
          </div>
          <div className="bg-warm-50 rounded-xl py-2.5 px-2">
            <Gauge size={16} className="mx-auto text-warm-400 mb-1" />
            <p className="text-xs text-warm-500">总时长</p>
            <p className="text-sm font-semibold text-warm-800">
              {formatDuration(Math.round(maintenanceStatus.totalMinutes / 60) * 60 || maintenanceStatus.totalMinutes).replace(' 分钟', 'h')}
            </p>
          </div>
          <div className="bg-warm-50 rounded-xl py-2.5 px-2">
            <Calendar size={16} className="mx-auto text-warm-400 mb-1" />
            <p className="text-xs text-warm-500">购入</p>
            <p className="text-sm font-semibold text-warm-800">
              {maintenanceStatus.daysSincePurchase}天
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="text-xs text-warm-500">
            寿命进度 {Math.round(lifespanPct)}%
          </div>
          <div className="text-xs text-warm-500">
            购入 {formatDate(equipment.purchaseDate)}
          </div>
        </div>
      </div>
    </Link>
  );
};
