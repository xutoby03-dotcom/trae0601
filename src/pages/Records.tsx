import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { TIME_SLOT_LABELS, MEDICATION_STATUS_LABELS } from '@/types';
import MedicationButtons from '../components/Record/MedicationButtons';
import MedicineAvatar from '../components/Common/MedicineAvatar';
import { formatDate, formatDateDisplay, isToday } from '@/utils/dateUtils';
import { ClipboardList, AlertCircle, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Records() {
  const navigate = useNavigate();
  const { packingSlots, packingItems, medicationRecords, medicines, schedules } = useAppStore();

  const sortedSlots = useMemo(() => {
    return [...packingSlots]
      .filter((s) => s.status !== 'pending')
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date);
        const order = ['morning', 'noon', 'evening', 'bedtime'];
        return order.indexOf(b.timeSlot) - order.indexOf(a.timeSlot);
      });
  }, [packingSlots]);

  const getSlotMedicines = (slotId: string) => {
    return packingItems
      .filter((i) => i.slotId === slotId)
      .map((i) => ({
        medicine: medicines.find((m) => m.id === i.medicineId)!,
        count: i.pillsCount,
      }))
      .filter((x) => x.medicine);
  };

  const getRecord = (slotId: string) => medicationRecords.find((r) => r.slotId === slotId);

  if (sortedSlots.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
            📋 服药记录
          </h1>
          <p className="mt-1 text-gray-600">标记每次服药的状态，追踪老人服药情况</p>
        </div>
        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-12 text-center">
          <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
            <ClipboardList className="h-10 w-10 text-blue-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">还没有分装记录</h3>
          <p className="text-gray-600">前往「分装计划」页面先进行药盒分装</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
          📋 服药记录
        </h1>
        <p className="mt-1 text-gray-600">标记每次服药的状态，追踪老人服药情况</p>
      </div>

      <div className="grid gap-5">
        {sortedSlots.map((slot, idx) => {
          const record = getRecord(slot.id);
          const slotInfo = TIME_SLOT_LABELS[slot.timeSlot];
          const medMedicines = getSlotMedicines(slot.id);
          const today = isToday(slot.date);
          const missedNotRecorded = !record && slot.status === 'packed';

          return (
            <div
              key={slot.id}
              className={`bg-white rounded-3xl shadow-md border overflow-hidden transition-all ${
                today ? 'border-amber-300 ring-2 ring-amber-100' : 'border-emerald-100/60'
              }`}
              style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.04}s both` }}
            >
              <div className="flex items-start justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{slotInfo.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-gray-800">
                        {formatDateDisplay(slot.date)} · {slotInfo.label}
                      </h3>
                      {today && (
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-900 font-bold">
                          今天
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{slotInfo.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/packing-detail/${slot.date}/${slot.timeSlot}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border-2 border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    查看详情
                  </button>
                  {record ? (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border-2 ${MEDICATION_STATUS_LABELS[record.status].bg} ${MEDICATION_STATUS_LABELS[record.status].color}`}>
                      {MEDICATION_STATUS_LABELS[record.status].label}
                    </span>
                  ) : missedNotRecorded ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-600 border-2 border-gray-200">
                      <AlertCircle className="h-4 w-4" />
                      待标记
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="p-5 grid md:grid-cols-2 gap-5">
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    药品清单
                  </h4>
                  <div className="space-y-2">
                    {medMedicines.length === 0 ? (
                      <p className="text-sm text-gray-400">无药品</p>
                    ) : (
                      medMedicines.map(({ medicine, count }) => (
                        <div
                          key={medicine.id}
                          className="flex items-center gap-3 p-2.5 rounded-2xl bg-gray-50/70"
                        >
                          <MedicineAvatar medicine={medicine} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-sm truncate">
                              {medicine.name}
                            </div>
                            <div className="text-xs text-gray-500">{medicine.dosage}</div>
                          </div>
                          <div className="text-emerald-600 font-bold text-sm">×{count}片</div>
                        </div>
                      ))
                    )}
                  </div>
                  {slot.photoUrl && (
                    <div className="mt-4">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                        分装照片
                      </p>
                      <img
                        src={slot.photoUrl}
                        alt="分装照片"
                        className="h-32 w-full object-cover rounded-2xl border border-gray-200"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                    服药状态
                  </h4>
                  <MedicationButtons slotId={slot.id} />
                  {record && (
                    <p className="mt-4 text-xs text-gray-400 text-center">
                      标记于 {new Date(record.recordedAt).toLocaleString('zh-CN')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
