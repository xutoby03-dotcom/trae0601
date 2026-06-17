import { useState, useEffect, useRef } from 'react';
import type { Device, EarSide, BatterySize } from '@/types';
import { Camera, X, Check } from 'lucide-react';

interface DeviceFormProps {
  device?: Device | null;
  onSubmit: (data: Omit<Device, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const today = new Date().toISOString().split('T')[0];
const addYears = (years: number) => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString().split('T')[0];
};

export default function DeviceForm({ device, onSubmit, onCancel }: DeviceFormProps) {
  const [form, setForm] = useState({
    name: device?.name ?? '',
    ear: (device?.ear ?? 'both') as EarSide,
    model: device?.model ?? '',
    batterySize: (device?.batterySize ?? '312') as BatterySize,
    storeName: device?.storeName ?? '',
    warrantyDate: device?.warrantyDate ?? addYears(1),
    photo: device?.photo ?? '',
    nextCheckup: device?.nextCheckup ?? '',
    batteryLifeDays: device?.batteryLifeDays ?? 7,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const isValid = form.name.trim() && form.model.trim() && form.storeName.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label">设备名称 *</label>
          <input
            type="text"
            className="input"
            placeholder="如：爷爷左耳助听器"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">佩戴位置 *</label>
          <div className="grid grid-cols-3 gap-2">
            {(['left', 'right', 'both'] as EarSide[]).map((ear) => (
              <button
                key={ear}
                type="button"
                onClick={() => setForm({ ...form, ear })}
                className={`px-4 py-3 rounded-xl font-medium transition-all ${
                  form.ear === ear
                    ? 'bg-brand-500 text-white shadow-soft'
                    : 'bg-warm-50 text-accent-blue hover:bg-warm-100'
                }`}
              >
                {ear === 'left' ? '左耳' : ear === 'right' ? '右耳' : '双耳'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="label">助听器型号 *</label>
          <input
            type="text"
            className="input"
            placeholder="如：Phonak Audeo M30"
            value={form.model}
            onChange={(e) => setForm({ ...form, model: e.target.value })}
          />
        </div>
        <div>
          <label className="label">电池规格 *</label>
          <div className="grid grid-cols-4 gap-2">
            {(['10', '13', '312', '675'] as BatterySize[]).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setForm({ ...form, batterySize: size })}
                className={`px-3 py-3 rounded-xl font-bold transition-all ${
                  form.batterySize === size
                    ? 'bg-accent-orange text-accent-blue shadow-soft'
                    : 'bg-warm-50 text-accent-blue hover:bg-warm-100'
                }`}
              >
                #{size}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="label">验配门店 *</label>
        <input
          type="text"
          className="input"
          placeholder="如：悦耳听力验配中心（人民广场店）"
          value={form.storeName}
          onChange={(e) => setForm({ ...form, storeName: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <label className="label">保修期截止 *</label>
          <input
            type="date"
            className="input"
            value={form.warrantyDate}
            onChange={(e) => setForm({ ...form, warrantyDate: e.target.value })}
          />
        </div>
        <div>
          <label className="label">下次复诊日期</label>
          <input
            type="date"
            className="input"
            value={form.nextCheckup}
            min={today}
            onChange={(e) => setForm({ ...form, nextCheckup: e.target.value })}
          />
        </div>
        <div>
          <label className="label">电池续航（天）</label>
          <input
            type="number"
            min="1"
            max="30"
            className="input"
            value={form.batteryLifeDays}
            onChange={(e) =>
              setForm({ ...form, batteryLifeDays: Number(e.target.value) || 7 })
            }
          />
        </div>
      </div>

      <div>
        <label className="label">设备照片</label>
        <div className="relative">
          {form.photo ? (
            <div className="relative w-full h-48 rounded-2xl overflow-hidden bg-warm-50 border-2 border-warm-100">
              <img src={form.photo} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, photo: '' })}
                className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/90 backdrop-blur flex items-center justify-center text-accent-red hover:bg-white shadow-soft"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 rounded-2xl border-2 border-dashed border-warm-200 bg-warm-50 flex flex-col items-center justify-center gap-3 text-warm-400 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-500 transition-all"
            >
              <Camera size={36} />
              <span>点击上传助听器照片</span>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoChange}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-warm-100">
        <button type="button" onClick={onCancel} className="btn-secondary">
          取消
        </button>
        <button type="submit" disabled={!isValid} className="btn-primary">
          <Check size={18} />
          {device ? '保存修改' : '添加设备'}
        </button>
      </div>
    </form>
  );
}
