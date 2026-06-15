import type { Medicine, DosageSchedule } from '@/types';
import MedicineAvatar from '../Common/MedicineAvatar';
import { Edit2, Trash2, AlertTriangle, CalendarDays, Clock } from 'lucide-react';
import { daysBetween, formatDate } from '@/utils/dateUtils';
import { calculateDailyUsage } from '@/utils/statisticsUtils';
import { TIME_SLOT_LABELS } from '@/types';

interface Props {
  medicine: Medicine;
  schedules: DosageSchedule[];
  onEdit: () => void;
  onDelete: () => void;
}

export default function MedicineCard({ medicine, schedules, onEdit, onDelete }: Props) {
  const today = formatDate(new Date());
  const daysToExpiry = daysBetween(today, medicine.expiryDate);
  const isExpiringSoon = daysToExpiry <= 30;
  const isExpired = daysToExpiry <= 0;

  const dailyUsage = calculateDailyUsage(medicine.id, schedules);
  const daysRemaining = dailyUsage > 0 ? Math.floor(medicine.remainingPills / dailyUsage) : null;
  const isLowStock = daysRemaining !== null && daysRemaining < 7;

  const medSchedules = schedules.filter((s) => s.medicineId === medicine.id);

  return (
    <div className="group bg-white rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 border border-emerald-100/60 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <MedicineAvatar medicine={medicine} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800 truncate" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                  {medicine.name}
                </h3>
                <p className="text-sm text-emerald-600 font-medium">{medicine.dosage}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={onEdit}
                  className="p-2 rounded-xl hover:bg-emerald-50 text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={onDelete}
                  className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border">
                {medicine.color}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border">
                {medicine.shape}
              </span>
              {isExpired && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                  <AlertTriangle className="h-3 w-3" />
                  已过期
                </span>
              )}
              {!isExpired && isExpiringSoon && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700 border border-orange-200">
                  <AlertTriangle className="h-3 w-3" />
                  {daysToExpiry}天后过期
                </span>
              )}
              {isLowStock && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  <AlertTriangle className="h-3 w-3" />
                  仅够{daysRemaining}天
                </span>
              )}
            </div>

            {medSchedules.length > 0 && (
              <div className="mt-3 space-y-1">
                {medSchedules.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{TIME_SLOT_LABELS[s.timeSlot].emoji} {TIME_SLOT_LABELS[s.timeSlot].label}</span>
                    <span className="font-semibold text-emerald-700">{s.pillsPerTime}片</span>
                    {s.nextVisitDate && (
                      <span className="text-blue-600">
                        · 复诊:{s.nextVisitDate.slice(5)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">剩余片数</p>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold ${isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                {medicine.remainingPills}
              </span>
              <span className="text-sm text-gray-500">片</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${isLowStock ? 'bg-amber-400' : 'bg-emerald-400'}`}
                style={{ width: `${Math.min(100, (medicine.remainingPills / 100) * 100)}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              过期日期
            </p>
            <p className={`text-lg font-semibold ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-orange-600' : 'text-gray-700'}`}>
              {medicine.expiryDate}
            </p>
          </div>
        </div>

        {medicine.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-600 leading-relaxed">{medicine.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
