import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { TIME_SLOT_LABELS, MEDICATION_STATUS_LABELS } from '@/types';
import type { TimeSlot } from '@/types';
import MedicineAvatar from '../Common/MedicineAvatar';
import { ArrowLeft, AlertTriangle, CheckCircle2, Package, AlertCircle, Clock, PencilLine } from 'lucide-react';
import { formatDateDisplay } from '@/utils/dateUtils';

interface PackingDetailMedicine {
  medicine: import('@/types').Medicine;
  expected: number;
  actual: number;
  diff: number;
  isConsistent: boolean;
}

export default function PackingDetail() {
  const { date, slot } = useParams<{ date: string; slot: string }>();
  const navigate = useNavigate();
  const timeSlot = slot as TimeSlot;

  const {
    medicines,
    schedules,
    getSlot,
    getSlotItems,
    getMedicationRecord,
  } = useAppStore();

  const slotData = getSlot(date!, timeSlot);
  const slotInfo = TIME_SLOT_LABELS[timeSlot];
  const existingItems = getSlotItems(slotData?.id || '');
  const record = getMedicationRecord(slotData?.id || '');

  const detailList = useMemo<PackingDetailMedicine[]>(() => {
    if (!slotData) return [];
    const relevantSchedules = schedules.filter((s) => s.timeSlot === timeSlot);
    const actualMap = new Map(existingItems.map((i) => [i.medicineId, i.pillsCount]));
    const scheduleMap = new Map(relevantSchedules.map((s) => [s.medicineId, s.pillsPerTime]));

    const allMedicineIds = new Set([
      ...relevantSchedules.map((s) => s.medicineId),
      ...existingItems.map((i) => i.medicineId),
    ]);

    const list: PackingDetailMedicine[] = [];

    allMedicineIds.forEach((mid) => {
      const medicine = medicines.find((m) => m.id === mid);
      if (!medicine) return;
      const expected = scheduleMap.get(mid) || 0;
      const actual = actualMap.get(mid) || 0;
      list.push({
        medicine,
        expected,
        actual,
        diff: actual - expected,
        isConsistent: actual === expected,
      });
    });

    return list;
  }, [schedules, existingItems, medicines, timeSlot, slotData]);

  const inconsistentCount = detailList.filter((d) => !d.isConsistent).length;

  if (!slotData || slotData.status === 'pending') {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">该时段尚未分装</h3>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-6 py-2.5 rounded-full bg-emerald-500 text-white font-medium"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
      <div className="w-full sm:max-w-3xl sm:rounded-3xl rounded-t-3xl bg-gradient-to-br from-amber-50 via-white to-emerald-50 shadow-2xl max-h-[95vh] flex flex-col animate-slideUp">
        <div className="sticky top-0 bg-white/90 backdrop-blur-md p-5 sm:p-6 border-b border-emerald-100 rounded-t-3xl z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-4xl">{slotInfo.emoji}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
                    分装详情 · {formatDateDisplay(date!)} {slotInfo.label}
                  </h2>
                  <p className="text-sm text-gray-500">{slotInfo.time}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/packing/${date}/${slot}`)}
              className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border-2 border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
            >
              <PencilLine className="h-4 w-4" />
              修改分装
            </button>
          </div>
          {record ? (
            <div className="mt-4 flex items-center gap-3 p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200">
              <div className={`h-9 w-9 rounded-full flex items-center justify-center ${MEDICATION_STATUS_LABELS[record.status].bg}`}>
                {record.status === 'taken' && <CheckCircle2 className="h-5 w-5 text-green-700" />}
                {record.status === 'missed' && <AlertCircle className="h-5 w-5 text-red-700" />}
                {record.status === 'vomited' && <Clock className="h-5 w-5 text-amber-700" />}
              </div>
              <div className="flex-1">
                <div className={`font-bold ${MEDICATION_STATUS_LABELS[record.status].color}`}>
                  {MEDICATION_STATUS_LABELS[record.status].label}
                </div>
                <div className="text-xs text-gray-500">
                  标记于 {new Date(record.recordedAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 p-3.5 rounded-2xl bg-gray-50 border-2 border-gray-200">
              <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                <Clock className="h-5 w-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-gray-700">待标记服药状态</div>
                <div className="text-xs text-gray-500">老人服药后请到「服药记录」标记状态</div>
              </div>
            </div>
          )}

          {inconsistentCount > 0 && (
            <div className="mt-4 flex items-start gap-2.5 p-3.5 rounded-2xl bg-red-50 border-2 border-red-300 animate-shake">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-bold text-red-700">
                  有 {inconsistentCount} 种药品分装数量与医嘱不一致，请仔细核对
                </div>
                <div className="text-xs text-red-600">下方标红的行请重点检查</div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="h-5 w-1 bg-blue-500 rounded-full" />
                整盒照片
              </h3>
              {slotData.photoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 bg-white">
                  <img
                    src={slotData.photoUrl}
                    alt="分装照片"
                    className="w-full h-56 object-cover"
                  />
                </div>
              ) : (
                <div className="h-56 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Package className="h-10 w-10 mx-auto mb-1 text-gray-300" />
                    <p className="text-sm">未拍摄照片</p>
                  </div>
                </div>
              )}
              <div className="mt-3 text-xs text-gray-500">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span>分装时间</span>
                  <span className="font-medium text-gray-700">
                    {slotData.packedAt
                      ? new Date(slotData.packedAt).toLocaleString('zh-CN')
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span>药品种类</span>
                  <span className="font-medium text-gray-700">{detailList.length} 种</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="h-5 w-1 bg-emerald-500 rounded-full" />
                药品分装核对表
              </h3>
              <div className="space-y-2.5">
                {detailList.map(({ medicine, expected, actual, diff, isConsistent }) => {
                  const bgClass = isConsistent
                    ? 'bg-gray-50/70 border-gray-100'
                    : 'bg-red-50 border-red-200';
                  const textClass = isConsistent ? 'text-gray-700' : 'text-red-700';
                  const labelClass = isConsistent
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-red-100 text-red-700 border-red-300';
                  return (
                    <div
                      key={medicine.id}
                      className={`rounded-2xl border-2 ${bgClass} p-3.5 transition-all ${!isConsistent && 'animate-shake'}`}
                    >
                      <div className="flex items-start gap-3">
                        <MedicineAvatar medicine={medicine} size="sm" />
                        <div className="flex-1 min-w-0">
                          <div className={`font-bold ${textClass} text-sm truncate`}>
                            {medicine.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {medicine.dosage} · {medicine.color}{medicine.shape}
                          </div>
                        </div>
                        <span
                          className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${labelClass}`}
                        >
                          {isConsistent ? (
                            <>
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              核对一致
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {diff > 0 ? `多放 ${diff} 片` : `少放 ${Math.abs(diff)} 片`}
                            </>
                          )}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-xl bg-white p-2 border border-gray-100">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">医嘱</div>
                          <div className="text-base font-bold text-gray-700">{expected} 片</div>
                        </div>
                        <div className={`rounded-xl p-2 border ${
                          isConsistent ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-200'}`}>
                          <div className={`text-[10px] uppercase tracking-wider font-bold ${isConsistent ? 'text-emerald-600' : 'text-red-600'}`}>实际</div>
                          <div className={`text-base font-bold ${textClass}`}>{actual} 片</div>
                        </div>
                        <div className="rounded-xl bg-white p-2 border border-gray-100">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">扣库存</div>
                          <div className="text-base font-bold text-gray-700">-{actual}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 p-5 sm:p-6 rounded-b-3xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              {inconsistentCount > 0 ? (
                <span className="text-red-600 font-medium">
                  ⚠️ {inconsistentCount} 项异常，建议点击右侧「修改分装」纠正
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">
                  ✅ 所有药品与医嘱一致，核对通过
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-full text-gray-700 font-medium bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all"
              >
                返回
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
