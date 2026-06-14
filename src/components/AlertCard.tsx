import { Link } from 'react-router-dom';
import type { Equipment, MaintenanceStatus } from '@/types';
import { SPORT_TYPE_LABELS, MAINTENANCE_ACTION_LABELS } from '@/types';
import { SportIcon } from './SportIcon';
import { MaintenanceIcon } from './MaintenanceIcon';
import { StatusBadge } from './StatusBadge';
import { ChevronRight, AlertTriangle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertCardProps {
  equipment: Equipment;
  status: MaintenanceStatus;
  isOverdue: boolean;
  delay?: number;
}

export const AlertCard = ({ equipment, status, isOverdue, delay = 0 }: AlertCardProps) => {
  const daysDisplay = isOverdue
    ? `已超期 ${Math.abs(status.daysUntilNextMaintenance)} 天`
    : `还剩 ${status.daysUntilNextMaintenance} 天`;

  const kmDisplay =
    status.kmUntilNextMaintenance !== null && equipment.maintenanceCycleKm
      ? status.kmUntilNextMaintenance < 0
        ? `已超 ${Math.abs(status.kmUntilNextMaintenance).toFixed(0)} km`
        : `还剩 ${status.kmUntilNextMaintenance.toFixed(0)} km`
      : null;

  const lifespanAlert =
    status.isLifespanOverdue || status.isLifespanUpcoming;

  return (
    <Link
      to={`/equipment/${equipment.id}`}
      className={cn(
        'group card-base card-hover p-5 block relative overflow-hidden animate-fade-in-up',
        isOverdue ? 'animate-pulse-border' : ''
      )}
      style={{ animationDelay: `${delay}ms`, opacity: 0 }}
    >
      {isOverdue && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl ring-2 ring-red-400 ring-offset-2 animate-pulse opacity-60" />
        </div>
      )}

      {!isOverdue && (
        <div className="absolute top-0 right-0 w-32 h-32 -translate-y-16 translate-x-16 rounded-full bg-gradient-to-br from-brand-200/30 to-transparent blur-2xl" />
      )}

      <div className="relative space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                isOverdue
                  ? 'bg-red-50 text-red-600'
                  : 'bg-brand-50 text-brand-600'
              )}
            >
              <SportIcon type={equipment.sportType} size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-warm-900 truncate group-hover:text-brand-600 transition-colors">
                {equipment.name}
              </h3>
              <p className="text-sm text-warm-500 mt-0.5">
                {SPORT_TYPE_LABELS[equipment.sportType]}
              </p>
            </div>
          </div>
          <ChevronRight
            size={20}
            className="text-warm-400 group-hover:text-brand-500 group-hover:translate-x-1 transition-all shrink-0 mt-1"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isOverdue ? (
              <XCircle size={16} className="text-red-500 shrink-0" />
            ) : lifespanAlert ? (
              <Clock size={16} className="text-amber-500 shrink-0" />
            ) : (
              <AlertTriangle size={16} className="text-brand-500 shrink-0" />
            )}
            <span
              className={cn(
                'text-sm font-medium',
                isOverdue ? 'text-red-600' : 'text-warm-700'
              )}
            >
              {lifespanAlert
                ? status.isLifespanOverdue
                  ? `使用寿命已超期 ${Math.abs(status.lifespanDaysRemaining)} 天`
                  : `距寿命期还剩 ${status.lifespanDaysRemaining} 天`
                : daysDisplay}
            </span>
            {kmDisplay && !lifespanAlert && (
              <span className="text-sm text-warm-500">· {kmDisplay}</span>
            )}
          </div>

          {status.totalKm > 0 && equipment.lifespanKm && (
            <div className="flex items-center gap-2 ml-7">
              <div className="h-1.5 flex-1 bg-warm-100 rounded-full overflow-hidden max-w-[140px]">
                <div
                  className={cn(
                    'h-full rounded-full transition-all',
                    isOverdue
                      ? 'bg-gradient-to-r from-red-400 to-red-500'
                      : 'bg-gradient-to-r from-brand-400 to-brand-500'
                  )}
                  style={{
                    width: `${Math.min(
                      100,
                      (status.totalKm / equipment.lifespanKm) * 100
                    )}%`,
                  }}
                />
              </div>
              <span className="text-xs text-warm-500">
                {status.totalKm.toFixed(0)} / {equipment.lifespanKm} km
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-warm-100">
          <div
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium',
              isOverdue
                ? 'bg-red-50 text-red-700'
                : 'bg-gradient-to-r from-brand-50 to-brand-100/50 text-brand-700'
            )}
          >
            <MaintenanceIcon action={status.suggestedAction} size={16} />
            {MAINTENANCE_ACTION_LABELS[status.suggestedAction]}
          </div>
          <StatusBadge status={equipment.status} />
        </div>
      </div>
    </Link>
  );
};
