import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  X,
  Clock,
  Gauge,
  MapPin,
  Wallet,
  FileText,
  Zap,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { today } from '@/utils/date';
import type { SportType, IntensityLevel } from '@/types';
import {
  SPORT_TYPE_LABELS,
  INTENSITY_LABELS,
} from '@/types';
import { SportIcon } from '@/components/SportIcon';
import { cn } from '@/lib/utils';

const intensityOptions: { value: IntensityLevel; label: string; desc: string; color: string }[] = [
  { value: 'low', label: '低强度', desc: '轻松活动，微微出汗', color: 'border-green-400 bg-green-50 text-green-700' },
  { value: 'medium', label: '中等', desc: '心率上升，呼吸加快', color: 'border-amber-400 bg-amber-50 text-amber-700' },
  { value: 'high', label: '高强度', desc: '剧烈运动，大汗淋漓', color: 'border-red-400 bg-red-50 text-red-700' },
];

const presetLocations: Record<SportType, string[]> = {
  running: ['小区附近', '公园步道', '专业跑道', '公路', '跑步机'],
  badminton: ['社区球馆', '专业羽毛球馆', '学校体育馆', '活动中心'],
  yoga: ['家中客厅', '瑜伽馆', '健身房瑜伽室', '户外草坪'],
  swimming: ['小区泳池', '专业游泳馆', '学校泳池', '公开水域'],
  cycling: ['市区通勤', '绿道骑行', '山路爬坡', '动感单车'],
  basketball: ['社区球场', '学校篮球场', '室内球馆', '公园球场'],
  football: ['足球场', '学校操场', '社区球场', '室内五人制'],
  tennis: ['网球场', '俱乐部', '学校球场'],
  fitness: ['健身房', '家中', 'CrossFit馆'],
  other: ['户外', '室内', '其他场地'],
};

export default function UsageForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedEquipmentId = searchParams.get('equipmentId');

  const equipment = useAppStore((s) => s.equipment);
  const addUsageRecord = useAppStore((s) => s.addUsageRecord);

  const activeEquipment = equipment.filter((e) => e.status !== 'retired');

  const [form, setForm] = useState({
    equipmentId: preselectedEquipmentId || (activeEquipment[0]?.id ?? ''),
    date: today(),
    durationMinutes: 60,
    intensity: 'medium' as IntensityLevel,
    location: '',
    distanceKm: '' as number | string,
    wearNotes: '',
    maintenanceCost: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedEquipment = equipment.find((e) => e.id === form.equipmentId);
  const selectedSport = selectedEquipment?.sportType as SportType | undefined;

  useEffect(() => {
    if (selectedSport && !form.location) {
      setForm((prev) => ({
        ...prev,
        location: presetLocations[selectedSport]?.[0] || '',
      }));
    }
  }, [selectedSport]);

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
    if (!form.equipmentId) errs.equipmentId = '请选择装备';
    if (!form.date) errs.date = '请选择日期';
    if (form.durationMinutes < 0) errs.durationMinutes = '时长不能为负数';
    if (form.distanceKm !== '' && Number(form.distanceKm) < 0) {
      errs.distanceKm = '里程不能为负数';
    }
    if (form.maintenanceCost < 0) errs.maintenanceCost = '花费不能为负数';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addUsageRecord({
      equipmentId: form.equipmentId,
      date: form.date,
      durationMinutes: Number(form.durationMinutes),
      intensity: form.intensity,
      location: form.location.trim(),
      distanceKm: form.distanceKm !== '' ? Number(form.distanceKm) : null,
      wearNotes: form.wearNotes.trim(),
      maintenanceCost: Number(form.maintenanceCost) || 0,
    });

    navigate('/usage');
  };

  const durationPresets = [15, 30, 45, 60, 90, 120];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <ArrowLeft size={18} />
            返回
          </button>
          <div>
            <h1 className="font-display text-2xl font-bold text-warm-900">
              记录使用
            </h1>
            <p className="text-sm text-warm-500">
              记录一次运动，追踪装备磨损情况
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Equipment Select */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0 }}>
          <label className="label-base flex items-center gap-1.5">
            <Zap size={14} className="text-warm-400" />
            选择装备 *
          </label>
          {errors.equipmentId && (
            <p className="text-xs text-red-500 mb-2">{errors.equipmentId}</p>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-thin">
            {activeEquipment.length > 0 ? (
              activeEquipment.map((eq) => {
                const isSelected = form.equipmentId === eq.id;
                const sport = eq.sportType as SportType;
                return (
                  <button
                    key={eq.id}
                    type="button"
                    onClick={() => handleChange('equipmentId', eq.id)}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all',
                      isSelected
                        ? 'border-brand-400 bg-brand-50/50 shadow-sm'
                        : 'border-warm-200 bg-warm-50 hover:border-warm-300'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                        isSelected ? 'bg-white shadow-sm' : 'bg-white/60'
                      )}
                    >
                      <SportIcon
                        type={sport}
                        size={18}
                        className={isSelected ? 'text-brand-600' : 'text-warm-500'}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'font-medium truncate',
                          isSelected ? 'text-brand-700' : 'text-warm-800'
                        )}
                      >
                        {eq.name}
                      </p>
                      <p className="text-xs text-warm-500 truncate">
                        {SPORT_TYPE_LABELS[sport]}
                      </p>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="sm:col-span-2 text-center py-8 text-warm-500">
                <p>还没有可用的装备</p>
                <Link to="/equipment/new" className="btn-primary mt-3 inline-flex text-sm">
                  添加装备
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Date + Duration */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '50ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label-base">使用日期 *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => handleChange('date', e.target.value)}
                className={cn('input-base', errors.date && 'border-red-300 bg-red-50')}
              />
              {errors.date && (
                <p className="text-xs text-red-500 mt-1">{errors.date}</p>
              )}
            </div>
            <div>
              <label className="label-base flex items-center gap-1.5">
                <Clock size={14} className="text-warm-400" />
                时长（分钟）
              </label>
              <input
                type="number"
                min={0}
                value={form.durationMinutes}
                onChange={(e) =>
                  handleChange('durationMinutes', Number(e.target.value))
                }
                className={cn(
                  'input-base',
                  errors.durationMinutes && 'border-red-300 bg-red-50'
                )}
              />
              {errors.durationMinutes && (
                <p className="text-xs text-red-500 mt-1">{errors.durationMinutes}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-2">
                {durationPresets.map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleChange('durationMinutes', mins)}
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-colors',
                      form.durationMinutes === mins
                        ? 'bg-brand-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    )}
                  >
                    {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Intensity */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '100ms' }}>
          <label className="label-base mb-3">运动强度</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {intensityOptions.map((opt) => {
              const isSelected = form.intensity === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleChange('intensity', opt.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-left transition-all',
                    isSelected ? opt.color : 'border-warm-200 bg-warm-50 hover:border-warm-300'
                  )}
                >
                  <p className={cn('font-semibold', isSelected ? '' : 'text-warm-800')}>
                    {opt.label}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      isSelected ? 'opacity-80' : 'text-warm-500'
                    )}
                  >
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Location + Distance + Cost */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '150ms' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="label-base flex items-center gap-1.5">
                <MapPin size={14} className="text-warm-400" />
                运动场地
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="例如：朝阳公园、李宁羽毛球馆..."
                className="input-base"
              />
              {selectedSport && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {presetLocations[selectedSport]?.map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => handleChange('location', loc)}
                      className={cn(
                        'px-3 py-1 rounded-full text-xs font-medium transition-colors',
                        form.location === loc
                          ? 'bg-teal-500 text-white'
                          : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                      )}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Gauge size={14} className="text-warm-400" />
                里程（km）
              </label>
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.distanceKm}
                onChange={(e) =>
                  handleChange(
                    'distanceKm',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                placeholder="跑步/骑行等适用，留空表示无"
                className={cn('input-base', errors.distanceKm && 'border-red-300 bg-red-50')}
              />
              {errors.distanceKm && (
                <p className="text-xs text-red-500 mt-1">{errors.distanceKm}</p>
              )}
            </div>

            <div>
              <label className="label-base flex items-center gap-1.5">
                <Wallet size={14} className="text-warm-400" />
                花费（元）
              </label>
              <input
                type="number"
                min={0}
                step="1"
                value={form.maintenanceCost}
                onChange={(e) =>
                  handleChange('maintenanceCost', Number(e.target.value) || 0)
                }
                placeholder="场地费、耗材费等"
                className={cn(
                  'input-base',
                  errors.maintenanceCost && 'border-red-300 bg-red-50'
                )}
              />
              {errors.maintenanceCost && (
                <p className="text-xs text-red-500 mt-1">{errors.maintenanceCost}</p>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card-base p-6 animate-fade-in-up" style={{ opacity: 0, animationDelay: '200ms' }}>
          <label className="label-base flex items-center gap-1.5">
            <FileText size={14} className="text-warm-400" />
            磨损 / 备注
          </label>
          <textarea
            rows={3}
            value={form.wearNotes}
            onChange={(e) => handleChange('wearNotes', e.target.value)}
            placeholder="记录装备的磨损情况、异常情况或其他备注信息...例如：鞋底磨损加重，拍线有点松动等"
            className="input-base resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 bg-warm-50/80 backdrop-blur-sm py-4 -mx-8 px-8 border-t border-warm-200">
          <Link to="/usage" className="btn-secondary">
            <X size={16} />
            取消
          </Link>
          <button type="submit" className="btn-primary" disabled={activeEquipment.length === 0}>
            <Save size={16} />
            保存记录
          </button>
        </div>
      </form>
    </div>
  );
}
