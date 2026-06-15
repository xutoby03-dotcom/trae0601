import type { PackingSlot, TimeSlot } from '@/types';
import { TIME_SLOT_LABELS, MEDICATION_STATUS_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import MedicineAvatar from '../Common/MedicineAvatar';
import { CheckCircle2, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { isToday } from '@/utils/dateUtils';
import { useNavigate } from 'react-router-dom';

interface Props {
  slot: PackingSlot;
}

export default function SlotCard({ slot }: Props) {
  const navigate = useNavigate();
  const { medicines, schedules, getSlotItems, getMedicationRecord } = useAppStore();

  const slotInfo = TIME_SLOT_LABELS[slot.timeSlot];
  const slotItems = getSlotItems(slot.id);
  const record = getMedicationRecord(slot.id);

  const slotMedicines = slotItems.length
    ? slotItems.map((item) => ({
        medicine: medicines.find((m) => m.id === item.medicineId)!,
        count: item.pillsCount,
      })).filter((x) => x.medicine)
    : schedules
        .filter((s) => s.timeSlot === slot.timeSlot)
        .map((s) => ({
          medicine: medicines.find((m) => m.id === s.medicineId)!,
          count: s.pillsPerTime,
        }))
        .filter((x) => x.medicine);

  const isPending = slot.status === 'pending';
  const isPacked = slot.status === 'packed';
  const isRecorded = slot.status === 'recorded';
  const isTodaySlot = isToday(slot.date);

  const statusBadge = () => {
    if (record) {
      const label = MEDICATION_STATUS_LABELS[record.status];
      return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border-2 ${label.bg} ${label.color}`}>
          {record.status === 'taken' && <CheckCircle2 className="h-3.5 w-3.5" />}
          {record.status === 'missed' && <AlertCircle className="h-3.5 w-3.5" />}
          {record.status === 'vomited' && <Clock className="h-3.5 w-3.5" />}
          {label.label}
        </span>
      );
    }
    if (isPacked) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border-2 border-emerald-300">
          <CheckCircle2 className="h-3.5 w-3.5" />
          已分装
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border-2 border-gray-200">
        <Clock className="h-3.5 w-3.5" />
        待分装
      </span>
    );
  };

  const bgClass = isTodaySlot
    ? 'bg-gradient-to-br from-amber-50 via-white to-emerald-50 ring-2 ring-amber-300 shadow-lg'
    : 'bg-white hover:shadow-lg';

  return (
    <button
      onClick={() => navigate(`/packing/${slot.date}/${slot.timeSlot}`)}
      className={`w-full text-left rounded-3xl border border-emerald-100/60 shadow-md transition-all duration-300 overflow-hidden ${bgClass} group`}
    >
      <div className={`p-5 ${isPending ? '' : ''}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-4xl drop-shadow-sm">{slotInfo.emoji}</div>
            <div>
              <div className="text-lg font-bold text-gray-800 flex items-center gap-2">
                {slotInfo.label}
                {isTodaySlot && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-900 font-bold">今天</span>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{slotInfo.time}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge()}
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {slotMedicines.length === 0 ? (
          <div className="py-6 text-center text-sm text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
            此时段暂无药品安排
          </div>
        ) : (
          <div className="space-y-2">
            {slotMedicines.map(({ medicine, count }) => (
              <div
                key={medicine.id}
                className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/70 group-hover:bg-emerald-50/70 transition-colors"
              >
                <MedicineAvatar medicine={medicine} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm truncate">{medicine.name}</div>
                  <div className="text-xs text-gray-500">{medicine.dosage} · {medicine.color}{medicine.shape}</div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    slotItems.length ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    ×{count}
                  </div>
                  <div className="text-[10px] text-gray-400">片</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>{slotMedicines.length} 种药品</span>
          {slot.packedAt && (
            <span>分装于 {new Date(slot.packedAt).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          )}
        </div>
      </div>
    </button>
  );
}
