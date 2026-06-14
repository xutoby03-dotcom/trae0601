import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Camera,
  X,
  Calendar,
  RotateCcw,
  Ruler,
  Gauge,
  Info,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { today } from '@/utils/date';
import type { SportType, EquipmentStatus } from '@/types';
import { SPORT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '@/types';
import { SportIcon } from '@/components/SportIcon';
import { cn } from '@/lib/utils';

const sportOptions: SportType[] = [
  'running',
  'badminton',
  'yoga',
  'swimming',
  'cycling',
  'basketball',
  'football',
  'tennis',
  'fitness',
  'other',
];

const statusOptions: EquipmentStatus[] = [
  'excellent',
  'good',
  'attention',
  'overdue',
  'retired',
];

const defaultForm = {
  name: '',
  sportType: 'running' as SportType,
  purchaseDate: today(),
  lifespanDays: 365,
  lifespanKm: '' as number | string,
  maintenanceCycleDays: 30,
  maintenanceCycleKm: '' as number | string,
  lastMaintenanceDate: today(),
  status: 'excellent' as EquipmentStatus,
  photoUrl: '',
  notes: '',
};

export default function EquipmentForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const equipment = useAppStore((s) => s.equipment);
  const addEquipment = useAppStore((s) => s.addEquipment);
  const updateEquipment = useAppStore((s) => s.updateEquipment);

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const eq = equipment.find((e) => e.id === id);
      if (eq) {
        setForm({
          name: eq.name,
          sportType: eq.sportType,
          purchaseDate: eq.purchaseDate,
          lifespanDays: eq.lifespanDays,
          lifespanKm: eq.lifespanKm ?? '',
          maintenanceCycleDays: eq.maintenanceCycleDays,
          maintenanceCycleKm: eq.maintenanceCycleKm ?? '',
          lastMaintenanceDate: eq.lastMaintenanceDate ?? eq.purchaseDate,
          status: eq.status,
          photoUrl: eq.photoUrl ?? '',
          notes: eq.notes,
        });
      }
    }
  }, [isEdit, id, equipment]);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = '请输入装备名称';
    if (form.lifespanDays <= 0) errs.lifespanDays = '使用寿命需大于0天';
    if (form.maintenanceCycleDays <= 0) errs.maintenanceCycleDays = '保养周期需大于0天';
    if (form.lifespanKm !== '' && Number(form.lifespanKm) <= 0) {
      errs.lifespanKm = '寿命里程需大于0';
    }
    if (form.maintenanceCycleKm !== '' && Number(form.maintenanceCycleKm) <= 0) {
      errs.maintenanceCycleKm = '保养里程需大于0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      sportType: form.sportType,
      purchaseDate: form.purchaseDate,
      lifespanDays: Number(form.lifespanDays),
      lifespanKm: form.lifespanKm !== '' ? Number(form.lifespanKm) : null,
      maintenanceCycleDays: Number(form.maintenanceCycleDays),
      maintenanceCycleKm:
        form.maintenanceCycleKm !== '' ? Number(form.maintenanceCycleKm) : null,
      lastMaintenanceDate: form.lastMaintenanceDate || null,
      status: form.status,
      photoUrl: form.photoUrl.trim() !== '' ? form.photoUrl.trim() : null,
      notes: form.notes.trim(),
    };

    if (isEdit && id) {
      updateEquipment(id, data);
    } else {
      addEquipment(data);
    }
    navigate('/equipment');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <ArrowLeft size={18} />
            返回
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-warm-900">
              {isEdit ? '编辑装备' : '添加新装备'}
            </h1>
            <p className="text-sm text-warm-500">
              {isEdit ? '更新装备信息和保养参数' : '记录你的新运动伙伴'}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Section */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0 }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-orange-50 flex items-center justify-center">
              <Camera size={14} className="text-orange-600" />
            </div>
            <h2 className="font-display text-lg font-semibold text-warm-900">
              装备照片
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="label-base">图片链接</label>
                <input
                  type="url"
                  value={form.photoUrl}
                  onChange={(e) => handleChange('photoUrl', e.target.value)}
                  placeholder="粘贴图片 URL，例如 https://example.com/photo.jpg"
                  className="input-base"
                />
                <p className="text-xs text-warm-400 mt-1.5">
                  支持 https 图片链接，粘贴后自动预览
                </p>
              </div>
              {form.photoUrl.trim() !== '' && (
                <button
                  type="button"
                  onClick={() => handleChange('photoUrl', '')}
                  className="text-xs text-warm-500 hover:text-red-500 flex items-center gap-1"
                >
                  <X size={12} />
                  清除图片
                </button>
              )}
            </div>
            <div>
              <div className="aspect-square rounded-2xl border-2 border-dashed border-warm-200 bg-warm-50 flex items-center justify-center overflow-hidden">
                {form.photoUrl.trim() !== '' ? (
                  <img
                    src={form.photoUrl.trim()}
                    alt="预览"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-warm-400">
                    <Camera size={28} />
                    <span className="text-xs mt-1.5">预览区域</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '50ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-brand-50 flex items-center justify-center">
              <Info size={14} className="text-brand-600" />
            </div>
            <h2 className="font-display text-lg font-semibold text-warm-900">
              基本信息
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label-base">装备名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="例如：Nike Pegasus 40 跑鞋"
                className={cn('input-base', errors.name && 'border-red-300 bg-red-50')}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="label-base">运动类型 *</label>
              <div className="grid grid-cols-5 gap-2">
                {sportOptions.map((sport) => (
                  <button
                    key={sport}
                    type="button"
                    onClick={() => handleChange('sportType', sport)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs font-medium',
                      form.sportType === sport
                        ? 'border-brand-400 bg-brand-50 text-brand-700 shadow-sm'
                        : 'border-warm-200 bg-warm-50 text-warm-600 hover:border-warm-300'
                    )}
                    title={SPORT_TYPE_LABELS[sport]}
                  >
                    <SportIcon type={sport} size={18} />
                    <span className="truncate w-full text-center">
                      {SPORT_TYPE_LABELS[sport]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label-base">当前状态</label>
              <select
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value as EquipmentStatus)}
                className="input-base"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {EQUIPMENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '100ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
              <Calendar size={14} className="text-teal-600" />
            </div>
            <h2 className="font-display text-lg font-semibold text-warm-900">
              日期信息
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-base">购买日期 *</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => handleChange('purchaseDate', e.target.value)}
                className="input-base"
              />
            </div>
            <div>
              <label className="label-base">上次保养日期</label>
              <input
                type="date"
                value={form.lastMaintenanceDate}
                onChange={(e) => handleChange('lastMaintenanceDate', e.target.value)}
                className="input-base"
              />
            </div>
          </div>
        </div>

        {/* Lifespan */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '150ms' }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center">
              <RotateCcw size={14} className="text-violet-600" />
            </div>
            <h2 className="font-display text-lg font-semibold text-warm-900">
              寿命与保养周期
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-base flex items-center gap-1.5">
                <Ruler size={14} className="text-warm-400" />
                使用寿命（天）*
              </label>
              <input
                type="number"
                min={1}
                value={form.lifespanDays}
                onChange={(e) => handleChange('lifespanDays', Number(e.target.value))}
                className={cn('input-base', errors.lifespanDays && 'border-red-300 bg-red-50')}
              />
              {errors.lifespanDays && (
                <p className="text-xs text-red-500 mt-1">{errors.lifespanDays}</p>
              )}
              <p className="text-xs text-warm-400 mt-1.5">
                建议：跑鞋 365天，球线 180天，瑜伽垫 540天
              </p>
            </div>
            <div>
              <label className="label-base flex items-center gap-1.5">
                <Gauge size={14} className="text-warm-400" />
                寿命里程（km）
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.lifespanKm}
                onChange={(e) =>
                  handleChange('lifespanKm', e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="例如：800（留空表示不按里程计算）"
                className={cn('input-base', errors.lifespanKm && 'border-red-300 bg-red-50')}
              />
              {errors.lifespanKm && (
                <p className="text-xs text-red-500 mt-1">{errors.lifespanKm}</p>
              )}
              <p className="text-xs text-warm-400 mt-1.5">
                跑鞋建议 500-800km，不适用可留空
              </p>
            </div>
            <div>
              <label className="label-base flex items-center gap-1.5">
                <RotateCcw size={14} className="text-warm-400" />
                保养周期（天）*
              </label>
              <input
                type="number"
                min={1}
                value={form.maintenanceCycleDays}
                onChange={(e) => handleChange('maintenanceCycleDays', Number(e.target.value))}
                className={cn('input-base', errors.maintenanceCycleDays && 'border-red-300 bg-red-50')}
              />
              {errors.maintenanceCycleDays && (
                <p className="text-xs text-red-500 mt-1">{errors.maintenanceCycleDays}</p>
              )}
              <p className="text-xs text-warm-400 mt-1.5">
                建议：球线 60天，手套/瑜伽垫 7-14天
              </p>
            </div>
            <div>
              <label className="label-base flex items-center gap-1.5">
                <Gauge size={14} className="text-warm-400" />
                保养周期里程（km）
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.maintenanceCycleKm}
                onChange={(e) =>
                  handleChange('maintenanceCycleKm', e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="例如：100（留空表示不按里程计算）"
                className={cn('input-base', errors.maintenanceCycleKm && 'border-red-300 bg-red-50')}
              />
              {errors.maintenanceCycleKm && (
                <p className="text-xs text-red-500 mt-1">{errors.maintenanceCycleKm}</p>
              )}
              <p className="text-xs text-warm-400 mt-1.5">
                跑鞋建议每 100km 清洗检查
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '200ms' }}>
          <label className="label-base">备注信息</label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="记录装备的特殊信息，例如球线磅数、鞋垫厚度、使用注意事项等..."
            className="input-base resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-warm-50/80 backdrop-blur-sm py-4 -mx-8 px-8 border-t border-warm-200">
          <Link to="/equipment" className="btn-secondary">
            <X size={16} />
            取消
          </Link>
          <button type="submit" className="btn-primary">
            <Save size={16} />
            {isEdit ? '保存修改' : '添加装备'}
          </button>
        </div>
      </form>
    </div>
  );
}
