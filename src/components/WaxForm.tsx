import { useState } from 'react';
import { X, Diamond, Scale, Ruler, Navigation, Hash, FileText } from 'lucide-react';
import { useWaxStore } from '@/store/useWaxStore';
import { SETTING_SHAPE_OPTIONS, ROD_POSITION_OPTIONS } from '@/utils/constants';
import type { WaxFormInput, SettingShape, RodPosition } from '@/types';

interface WaxFormProps {
  onClose: () => void;
}

const defaultValues: WaxFormInput = {
  orderNo: '',
  ringSize: '',
  weight: 0.4,
  settingShape: 'round',
  stoneSize: '',
  rodPosition: 'bottom',
};

export default function WaxForm({ onClose }: WaxFormProps) {
  const addWaxModel = useWaxStore((s) => s.addWaxModel);
  const [form, setForm] = useState<WaxFormInput>(defaultValues);
  const [errors, setErrors] = useState<Partial<Record<keyof WaxFormInput, string>>>({});

  function validate(): boolean {
    const e: Partial<Record<keyof WaxFormInput, string>> = {};
    if (!form.orderNo.trim()) e.orderNo = '请输入客户单号';
    if (!form.ringSize.trim()) e.ringSize = '请输入戒圈号';
    if (form.weight <= 0) e.weight = '重量需大于 0';
    if (!form.stoneSize.trim()) e.stoneSize = '请输入主石尺寸';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    addWaxModel({
      ...form,
      orderNo: form.orderNo.trim().toUpperCase(),
      ringSize: form.ringSize.trim().toUpperCase(),
      stoneSize: form.stoneSize.trim(),
    });
    onClose();
  }

  function update<K extends keyof WaxFormInput>(key: K, value: WaxFormInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in-up">
      <div
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="gold-border relative z-10 w-full max-w-2xl">
        <form
          onSubmit={handleSubmit}
          className="glass-card p-6 md:p-8 max-h-[90vh] overflow-y-auto scrollbar-thin"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-serif text-xl font-bold text-gold-300">
                录入新蜡模
              </h2>
              <p className="text-xs text-ink-500 mt-1 font-mono">
                系统将自动生成唯一蜡模编号
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost p-1.5"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
            <div className="md:col-span-2">
              <label className="label-text">
                <FileText className="inline w-3 h-3 mr-1.5 -mt-0.5" />
                客户单号
              </label>
              <input
                value={form.orderNo}
                onChange={(e) => update('orderNo', e.target.value)}
                placeholder="例：KH2026062201"
                className={`input-field ${errors.orderNo ? 'border-ruby-500 focus:border-ruby-500' : ''}`}
                autoFocus
              />
              {errors.orderNo && (
                <p className="text-xs text-ruby-400 mt-1">{errors.orderNo}</p>
              )}
            </div>

            <div>
              <label className="label-text">
                <Hash className="inline w-3 h-3 mr-1.5 -mt-0.5" />
                戒圈号
              </label>
              <input
                value={form.ringSize}
                onChange={(e) => update('ringSize', e.target.value)}
                placeholder="例：14# / HK15"
                className={`input-field ${errors.ringSize ? 'border-ruby-500 focus:border-ruby-500' : ''}`}
              />
              {errors.ringSize && (
                <p className="text-xs text-ruby-400 mt-1">{errors.ringSize}</p>
              )}
            </div>

            <div>
              <label className="label-text">
                <Scale className="inline w-3 h-3 mr-1.5 -mt-0.5" />
                蜡模重量（克）
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.weight}
                onChange={(e) => update('weight', parseFloat(e.target.value) || 0)}
                className={`input-field ${errors.weight ? 'border-ruby-500 focus:border-ruby-500' : ''}`}
              />
              {errors.weight && (
                <p className="text-xs text-ruby-400 mt-1">{errors.weight}</p>
              )}
            </div>

            <div>
              <label className="label-text">
                <Diamond className="inline w-3 h-3 mr-1.5 -mt-0.5" />
                镶口形状
              </label>
              <select
                value={form.settingShape}
                onChange={(e) => update('settingShape', e.target.value as SettingShape)}
                className="select-field"
              >
                {SETTING_SHAPE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label-text">
                <Ruler className="inline w-3 h-3 mr-1.5 -mt-0.5" />
                主石尺寸
              </label>
              <input
                value={form.stoneSize}
                onChange={(e) => update('stoneSize', e.target.value)}
                placeholder="例：6.5mm / 1ct / 8×6mm"
                className={`input-field ${errors.stoneSize ? 'border-ruby-500 focus:border-ruby-500' : ''}`}
              />
              {errors.stoneSize && (
                <p className="text-xs text-ruby-400 mt-1">{errors.stoneSize}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="label-text">
                <Navigation className="inline w-3 h-3 mr-1.5 -mt-0.5 rotate-45" />
                支撑杆位置
              </label>
              <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-ink-900/50 border border-ink-700/50">
                <RodBtn
                  label="左上"
                  active={form.rodPosition === 'top_left'}
                  onClick={() => update('rodPosition', 'top_left')}
                />
                <RodBtn
                  label="正上方"
                  active={form.rodPosition === 'top'}
                  onClick={() => update('rodPosition', 'top')}
                />
                <RodBtn
                  label="右上"
                  active={form.rodPosition === 'top_right'}
                  onClick={() => update('rodPosition', 'top_right')}
                />
                <RodBtn
                  label="左侧"
                  active={form.rodPosition === 'left'}
                  onClick={() => update('rodPosition', 'left')}
                />
                <div className="flex items-center justify-center text-[10px] text-ink-500 font-serif bg-ink-800/60 border border-dashed border-ink-600/60 rounded-md">
                  戒圈
                </div>
                <RodBtn
                  label="右侧"
                  active={form.rodPosition === 'right'}
                  onClick={() => update('rodPosition', 'right')}
                />
                <RodBtn
                  label="左下"
                  active={form.rodPosition === 'bottom_left'}
                  onClick={() => update('rodPosition', 'bottom_left')}
                />
                <RodBtn
                  label="正下方"
                  active={form.rodPosition === 'bottom'}
                  onClick={() => update('rodPosition', 'bottom')}
                />
                <RodBtn
                  label="右下"
                  active={form.rodPosition === 'bottom_right'}
                  onClick={() => update('rodPosition', 'bottom_right')}
                />
              </div>
              <p className="text-[10px] text-ink-500 mt-2 font-mono">
                提示：选择 8 个方位中的一个，方便浇铸后追溯支撑杆痕迹
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-3 pt-4 border-t border-ink-700/50">
            <button type="button" onClick={onClose} className="btn-ghost">
              取消
            </button>
            <button type="submit" className="btn-primary">
              确认录入
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RodBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 py-2 rounded-md text-xs font-serif transition-all duration-200 ${
        active
          ? 'bg-gradient-to-br from-gold-500 to-gold-700 text-ink-950 shadow-gold-sm font-bold'
          : 'bg-ink-800/60 border border-ink-700 text-ink-300 hover:border-gold-600/50 hover:text-gold-300'
      }`}
    >
      {label}
    </button>
  );
}

// RodPosition type used in the component
export type { RodPosition };
