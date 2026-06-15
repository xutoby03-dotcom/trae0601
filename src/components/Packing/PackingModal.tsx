import { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { TIME_SLOT_LABELS } from '@/types';
import type { TimeSlot } from '@/types';
import { validatePacking, hasFatalErrors } from '@/utils/validationUtils';
import MedicineAvatar from '../Common/MedicineAvatar';
import { ArrowLeft, Camera, CheckCircle2, AlertTriangle, Upload, X } from 'lucide-react';
import { formatDateDisplay } from '@/utils/dateUtils';
import MedicationButtons from '../Record/MedicationButtons';

export default function PackingModal() {
  const { date, slot } = useParams<{ date: string; slot: string }>();
  const navigate = useNavigate();
  const timeSlot = slot as TimeSlot;

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const {
    medicines,
    schedules,
    getSlot,
    getSlotItems,
    savePacking,
    getMedicationRecord,
  } = useAppStore();

  const slotData = getSlot(date!, timeSlot)!;
  const slotInfo = TIME_SLOT_LABELS[timeSlot];
  const existingItems = getSlotItems(slotData?.id || '');
  const record = getMedicationRecord(slotData?.id || '');

  const scheduleMedicines = useMemo(
    () =>
      schedules
        .filter((s) => s.timeSlot === timeSlot)
        .map((s) => ({
          schedule: s,
          medicine: medicines.find((m) => m.id === s.medicineId)!,
        }))
        .filter((x) => x.medicine),
    [schedules, medicines, timeSlot]
  );

  const [selectedItems, setSelectedItems] = useState<{ medicineId: string; pillsCount: number }[]>(
    () =>
      existingItems.length
        ? existingItems.map((i) => ({ medicineId: i.medicineId, pillsCount: i.pillsCount }))
        : scheduleMedicines.map((sm) => ({
            medicineId: sm.medicine.id,
            pillsCount: sm.schedule.pillsPerTime,
          }))
  );

  const [photoUrl, setPhotoUrl] = useState<string | undefined>(slotData?.photoUrl);
  const [showSuccess, setShowSuccess] = useState(false);

  const errors = useMemo(
    () =>
      validatePacking({
        medicines,
        schedules,
        selectedItems,
        timeSlot,
      }),
    [medicines, schedules, selectedItems, timeSlot]
  );

  const hasFatal = hasFatalErrors(errors);
  const hasWarnings = errors.length > 0 && !hasFatal;

  const updateItem = (medicineId: string, field: 'pillsCount' | 'checked', value: any) => {
    setSelectedItems((prev) => {
      const exists = prev.find((p) => p.medicineId === medicineId);
      if (!exists) {
        if (field === 'checked' && value === true) {
          const schedule = scheduleMedicines.find((sm) => sm.medicine.id === medicineId);
          return [...prev, { medicineId, pillsCount: schedule?.schedule.pillsPerTime || 1 }];
        }
        return prev;
      }
      if (field === 'checked') {
        return value ? prev : prev.filter((p) => p.medicineId !== medicineId);
      }
      return prev.map((p) =>
        p.medicineId === medicineId ? { ...p, [field]: value } : p
      );
    });
  };

  const getItem = (medicineId: string) => selectedItems.find((s) => s.medicineId === medicineId);
  const isChecked = (medicineId: string) => !!getItem(medicineId);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPhotoUrl(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    savePacking(date!, timeSlot, selectedItems, photoUrl);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      navigate('/');
    }, 1500);
  };

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
                    {formatDateDisplay(date!)} · {slotInfo.label}
                  </h2>
                  <p className="text-sm text-gray-500">{slotInfo.time} · 分装操作</p>
                </div>
              </div>
            </div>
          </div>

          {showSuccess && (
            <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl bg-emerald-100 border-2 border-emerald-300 animate-successPop">
              <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="font-bold text-emerald-800">分装完成！</div>
                <div className="text-sm text-emerald-700">库存已自动扣除，正在返回...</div>
              </div>
            </div>
          )}

          {errors.length > 0 && !showSuccess && (
            <div className={`mt-4 rounded-2xl border-2 p-4 ${
              hasFatal
                ? 'bg-red-50 border-red-300 animate-shake'
                : 'bg-amber-50 border-amber-300'
            }`}>
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${hasFatal ? 'text-red-500' : 'text-amber-500'}`} />
                <span className={`font-bold ${hasFatal ? 'text-red-700' : 'text-amber-700'}`}>
                  {hasFatal ? '存在错误，无法保存，请先解决' : '请确认以下提示'}
                </span>
              </div>
              <ul className="space-y-1 pl-7">
                {errors.map((e, i) => (
                  <li key={i} className={`text-sm ${hasFatal && (e.type === 'insufficient' || e.type === 'expired') ? 'text-red-700 font-medium' : 'text-amber-700'}`}>
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="h-5 w-1 bg-emerald-500 rounded-full" />
              医嘱药品清单（勾选并确认数量）
            </h3>
            <div className="space-y-3">
              {scheduleMedicines.length === 0 ? (
                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 text-center text-gray-500">
                  此时段暂无医嘱药品
                </div>
              ) : (
                scheduleMedicines.map(({ medicine, schedule }) => {
                  const checked = isChecked(medicine.id);
                  const item = getItem(medicine.id);
                  return (
                    <label
                      key={medicine.id}
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        checked
                          ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                          : 'bg-white border-gray-200 hover:border-emerald-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => updateItem(medicine.id, 'checked', e.target.checked)}
                        className="h-5 w-5 rounded-lg text-emerald-500 focus:ring-emerald-400 border-gray-300"
                      />
                      <MedicineAvatar medicine={medicine} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-gray-800">{medicine.name}</div>
                        <div className="text-sm text-gray-500">
                          {medicine.dosage} · {medicine.color}{medicine.shape}
                        </div>
                        <div className="text-xs text-emerald-600 mt-1">
                          💡 医嘱应放：{schedule.pillsPerTime} 片 · 剩余库存：{medicine.remainingPills} 片
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={!checked}
                          onClick={(e) => {
                            e.preventDefault();
                            updateItem(medicine.id, 'pillsCount', Math.max(0, (item?.pillsCount || 0) - 1));
                          }}
                          className={`h-9 w-9 rounded-xl font-bold text-lg transition-all ${
                            checked
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={0}
                          disabled={!checked}
                          value={item?.pillsCount || 0}
                          onChange={(e) => updateItem(medicine.id, 'pillsCount', parseInt(e.target.value) || 0)}
                          className={`w-16 h-9 text-center font-bold text-lg rounded-xl border-2 transition-all ${
                            checked
                              ? 'border-emerald-300 bg-white text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-200'
                              : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          }`}
                        />
                        <button
                          type="button"
                          disabled={!checked}
                          onClick={(e) => {
                            e.preventDefault();
                            updateItem(medicine.id, 'pillsCount', (item?.pillsCount || 0) + 1);
                          }}
                          className={`h-9 w-9 rounded-xl font-bold text-lg transition-all ${
                            checked
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          +
                        </button>
                      </div>
                    </label>
                  );
                })
              )}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="h-5 w-1 bg-blue-500 rounded-full" />
              分装后整盒照片（可选）
            </h3>
            <div className="flex items-start gap-4">
              <div className="h-32 w-40 rounded-2xl border-2 border-dashed border-emerald-200 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="整盒照片" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto text-emerald-300 mb-1" />
                    <p className="text-xs text-gray-400">暂无照片</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => uploadRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border-2 border-emerald-200 flex items-center gap-1.5"
                >
                  <Upload className="h-4 w-4" />
                  上传图片
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border-2 border-teal-200 flex items-center gap-1.5"
                >
                  <Camera className="h-4 w-4" />
                  拍摄照片
                </button>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border-2 border-gray-200 flex items-center gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    清除
                  </button>
                )}
                <input ref={uploadRef} type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                <input ref={cameraRef} type="file" accept="image/*" capture="environment" onChange={handlePhoto} className="hidden" />
              </div>
            </div>
          </div>

          {slotData && slotData.status !== 'pending' && (
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="h-5 w-1 bg-purple-500 rounded-full" />
                服药状态
              </h3>
              <MedicationButtons slotId={slotData.id} compact />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 p-5 sm:p-6 rounded-b-3xl">
          <div className="flex items-center justify-between gap-3">
            <div className="text-sm text-gray-500">
              共 <span className="font-bold text-gray-700">{scheduleMedicines.length}</span> 种药品，
              已选 <span className="font-bold text-emerald-600">{selectedItems.filter(s => s.pillsCount > 0).length}</span> 种
              {hasWarnings && <span className="ml-2 text-amber-600">⚠️ 有警告</span>}
              {hasFatal && <span className="ml-2 text-red-600">❌ 有错误</span>}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="px-5 py-2.5 rounded-full text-gray-700 font-medium bg-white border-2 border-gray-200 hover:bg-gray-50 transition-all"
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={hasFatal || showSuccess || scheduleMedicines.length === 0}
                className="px-8 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                ✅ 确认分装
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
