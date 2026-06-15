import { useState, useEffect, useRef } from 'react';
import type { Medicine, DosageSchedule, TimeSlot } from '@/types';
import { TIME_SLOT_LABELS } from '@/types';
import { ArrowLeft, Plus, X, Upload, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  initialMedicine?: Medicine;
  initialSchedules?: DosageSchedule[];
  onSubmit: (
    medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>,
    schedules: Omit<DosageSchedule, 'id'>[]
  ) => void;
  onCancel: () => void;
  title: string;
}

const COLOR_OPTIONS = ['白色', '浅粉色', '淡黄色', '透明黄色', '蓝色', '绿色', '红色', '紫色', '橙色', '其他'];
const SHAPE_OPTIONS = ['圆形', '椭圆形', '胶囊', '滴丸', '方形', '三角形', '其他'];

export default function MedicineForm({ initialMedicine, initialSchedules, onSubmit, onCancel, title }: Props) {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialMedicine?.name || '');
  const [dosage, setDosage] = useState(initialMedicine?.dosage || '');
  const [color, setColor] = useState(initialMedicine?.color || '白色');
  const [shape, setShape] = useState(initialMedicine?.shape || '圆形');
  const [remainingPills, setRemainingPills] = useState<number>(initialMedicine?.remainingPills ?? 30);
  const [expiryDate, setExpiryDate] = useState(initialMedicine?.expiryDate || '');
  const [photoUrl, setPhotoUrl] = useState(initialMedicine?.photoUrl || '');
  const [notes, setNotes] = useState(initialMedicine?.notes || '');

  const [schedules, setSchedules] = useState<
    { timeSlot: TimeSlot; pillsPerTime: number; nextVisitDate: string; notes: string }[]
  >(
    initialSchedules?.length
      ? initialSchedules.map((s) => ({
          timeSlot: s.timeSlot,
          pillsPerTime: s.pillsPerTime,
          nextVisitDate: s.nextVisitDate || '',
          notes: s.notes || '',
        }))
      : [{ timeSlot: 'morning', pillsPerTime: 1, nextVisitDate: '', notes: '' }]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!expiryDate) {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      setExpiryDate(d.toISOString().slice(0, 10));
    }
  }, [expiryDate]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotoUrl(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = '请输入药品名称';
    if (!dosage.trim()) newErrors.dosage = '请输入剂量规格';
    if (remainingPills < 0) newErrors.remainingPills = '剩余片数不能为负数';
    if (!expiryDate) newErrors.expiryDate = '请选择过期日期';

    schedules.forEach((s, i) => {
      if (s.pillsPerTime <= 0) {
        newErrors[`schedule_${i}_pills`] = '每次片数必须大于0';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const medicineData = {
      name: name.trim(),
      dosage: dosage.trim(),
      color,
      shape,
      remainingPills,
      expiryDate,
      photoUrl,
      notes: notes.trim(),
    };

    const schedulesData = schedules.map((s) => ({
      medicineId: initialMedicine?.id || '',
      timeSlot: s.timeSlot,
      pillsPerTime: s.pillsPerTime,
      nextVisitDate: s.nextVisitDate || undefined,
      notes: s.notes || undefined,
    }));

    onSubmit(medicineData, schedulesData);
    navigate('/medicines');
  };

  const addSchedule = () => {
    setSchedules([...schedules, { timeSlot: 'morning', pillsPerTime: 1, nextVisitDate: '', notes: '' }]);
  };

  const removeSchedule = (index: number) => {
    setSchedules(schedules.filter((_, i) => i !== index));
  };

  const updateSchedule = (index: number, field: string, value: any) => {
    const newSchedules = [...schedules];
    (newSchedules[index] as any)[field] = value;
    setSchedules(newSchedules);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={onCancel}
          className="p-2 rounded-xl hover:bg-white/70 text-gray-600 hover:text-gray-800 transition-colors border border-gray-200 bg-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-2xl font-bold text-gray-800" style={{ fontFamily: '"Noto Serif SC", serif' }}>
          {title}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="h-6 w-1.5 bg-emerald-500 rounded-full" />
            基本信息
          </h3>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">药品照片</label>
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 flex items-center justify-center overflow-hidden">
                  {photoUrl ? (
                    <img src={photoUrl} alt="药品" className="h-full w-full object-cover" />
                  ) : (
                    <Upload className="h-8 w-8 text-emerald-300" />
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-200"
                  >
                    上传图片
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-200 flex items-center gap-1.5"
                  >
                    <Camera className="h-4 w-4" />
                    拍照
                  </button>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      清除
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                药品名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-400'
                }`}
                placeholder="例如：苯磺酸氨氯地平片"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                剂量规格 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  errors.dosage ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-400'
                }`}
                placeholder="例如：5mg / 0.5g"
              />
              {errors.dosage && <p className="mt-1 text-sm text-red-600">{errors.dosage}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                剩余片数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={0}
                value={remainingPills}
                onChange={(e) => setRemainingPills(parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  errors.remainingPills ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-emerald-400'
                }`}
              />
              {errors.remainingPills && <p className="mt-1 text-sm text-red-600">{errors.remainingPills}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                      color === c
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">形状</label>
              <div className="flex flex-wrap gap-2">
                {SHAPE_OPTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setShape(s)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all border-2 ${
                      shape === s
                        ? 'bg-emerald-500 text-white border-emerald-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                过期日期 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">备注说明</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-emerald-400 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-200 resize-none"
                placeholder="例如：降压药，空腹服用..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-md border border-emerald-100/60 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="h-6 w-1.5 bg-blue-500 rounded-full" />
              医嘱时间
            </h3>
            <button
              type="button"
              onClick={addSchedule}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
            >
              <Plus className="h-4 w-4" />
              添加时段
            </button>
          </div>

          <div className="space-y-4">
            {schedules.map((schedule, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50/50 to-white relative"
              >
                {schedules.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSchedule(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">时段</label>
                    <select
                      value={schedule.timeSlot}
                      onChange={(e) => updateSchedule(idx, 'timeSlot', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 transition-all focus:outline-none text-sm"
                    >
                      {(Object.keys(TIME_SLOT_LABELS) as TimeSlot[]).map((ts) => (
                        <option key={ts} value={ts}>
                          {TIME_SLOT_LABELS[ts].emoji} {TIME_SLOT_LABELS[ts].label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">每次片数</label>
                    <input
                      type="number"
                      min={1}
                      value={schedule.pillsPerTime}
                      onChange={(e) => updateSchedule(idx, 'pillsPerTime', parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 transition-all focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">下次复诊（可选）</label>
                    <input
                      type="date"
                      value={schedule.nextVisitDate}
                      onChange={(e) => updateSchedule(idx, 'nextVisitDate', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 transition-all focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">医嘱备注（可选）</label>
                    <input
                      type="text"
                      value={schedule.notes}
                      onChange={(e) => updateSchedule(idx, 'notes', e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 transition-all focus:outline-none text-sm"
                      placeholder="例如：餐后"
                    />
                  </div>
                </div>
                {errors[`schedule_${idx}_pills`] && (
                  <p className="mt-2 text-sm text-red-600">{errors[`schedule_${idx}_pills`]}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 sticky bottom-0 py-4 bg-gradient-to-t from-amber-50 via-amber-50/80 to-transparent">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-full text-gray-700 font-medium bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all shadow-sm"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-8 py-3 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl active:scale-95"
          >
            {initialMedicine ? '保存修改' : '添加药品'}
          </button>
        </div>
      </form>
    </div>
  );
}
