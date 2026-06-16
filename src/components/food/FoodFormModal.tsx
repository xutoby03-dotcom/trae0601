import { useState, useEffect } from 'react';
import { X, Calendar, Tag, Package, MapPin, Receipt, StickyNote, Sparkles } from 'lucide-react';
import type { FoodFormData, FoodItem, StorageZone } from '@/types';
import { useFoodStore } from '@/store/useFoodStore';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import {
  COMMON_UNITS,
  FOOD_CATEGORIES,
  FOOD_EMOJI_OPTIONS,
  STORAGE_ZONE_LABEL,
  STORAGE_ZONE_EMOJI,
  OPENED_SHELF_LIFE_OVERRIDE,
} from '@/utils/constants';
import { todayStr } from '@/utils/date';
import { clsx } from 'clsx';

interface FoodFormModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  editFood?: FoodItem | null;
}

const zones: StorageZone[] = ['fridge', 'freezer', 'door'];

export function FoodFormModal({ open, onClose, onSuccess, editFood }: FoodFormModalProps) {
  const addFood = useFoodStore((s) => s.addFood);
  const updateFood = useFoodStore((s) => s.updateFood);

  const [form, setForm] = useState<FoodFormData>({
    name: '',
    emoji: '🥬',
    category: '蔬菜',
    zone: 'fridge',
    quantity: 1,
    unit: '个',
    purchaseDate: todayStr(),
    shelfLifeDays: 7,
    openedShelfLifeDays: 3,
    isOpened: false,
    price: 0,
    notes: '',
  });

  useEffect(() => {
    if (editFood) {
      setForm({
        name: editFood.name,
        emoji: editFood.emoji,
        category: editFood.category,
        zone: editFood.zone,
        quantity: editFood.quantity,
        unit: editFood.unit,
        purchaseDate: editFood.purchaseDate,
        shelfLifeDays: editFood.shelfLifeDays,
        openedShelfLifeDays: editFood.openedShelfLifeDays,
        isOpened: !!editFood.openedAt,
        openedAt: editFood.openedAt ?? undefined,
        price: editFood.price,
        notes: editFood.notes,
      });
    } else if (open) {
      setForm({
        name: '',
        emoji: '🥬',
        category: '蔬菜',
        zone: 'fridge',
        quantity: 1,
        unit: '个',
        purchaseDate: todayStr(),
        shelfLifeDays: 7,
        openedShelfLifeDays: 3,
        isOpened: false,
        price: 0,
        notes: '',
      });
    }
  }, [editFood, open]);

  const updateField = <K extends keyof FoodFormData>(key: K, value: FoodFormData[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === 'name' && typeof value === 'string') {
        const override = OPENED_SHELF_LIFE_OVERRIDE[value];
        if (override && !editFood) {
          next.openedShelfLifeDays = override;
        }
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    if (editFood) {
      updateFood(editFood.id, {
        name: form.name,
        emoji: form.emoji,
        category: form.category,
        zone: form.zone,
        quantity: form.quantity,
        unit: form.unit,
        purchaseDate: form.purchaseDate,
        shelfLifeDays: form.shelfLifeDays,
        openedShelfLifeDays: form.openedShelfLifeDays,
        price: form.price,
        notes: form.notes,
      });
    } else {
      addFood(form);
    }
    onSuccess?.();
    onClose();
  };

  return (
    <div className={clsx('fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto py-8', !open && 'pointer-events-none')}>
      <div
        className={clsx(
          'absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          'relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 my-auto',
          open ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
        )}
      >
        <div className="px-7 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
                {editFood ? '✏️ 编辑食材' : '✨ 录入新食材'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">记录详细信息，帮你更好地管理</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 -mr-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-7 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                <Tag className="w-4 h-4" /> 食材名称
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="如：草莓酸奶"
                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-sm"
              />
              {OPENED_SHELF_LIFE_OVERRIDE[form.name] && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg px-2.5 py-1.5 inline-flex">
                  <Sparkles className="w-3 h-3" />
                  {form.name}开封后建议 {OPENED_SHELF_LIFE_OVERRIDE[form.name]} 天内吃完
                </div>
              )}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                图标
              </label>
              <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-slate-200 bg-slate-50 max-h-24 overflow-y-auto">
                {FOOD_EMOJI_OPTIONS.slice(0, 28).map((e) => (
                  <button
                    key={e}
                    onClick={() => updateField('emoji', e)}
                    className={clsx(
                      'w-8 h-8 rounded-lg text-lg transition-all',
                      form.emoji === e
                        ? 'bg-emerald-500 scale-110 shadow-md'
                        : 'bg-white hover:bg-emerald-50'
                    )}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
              <MapPin className="w-4 h-4" /> 存放位置
            </label>
            <div className="grid grid-cols-3 gap-3">
              {zones.map((zone) => (
                <button
                  key={zone}
                  onClick={() => updateField('zone', zone)}
                  className={clsx(
                    'p-4 rounded-2xl border-2 text-center transition-all',
                    form.zone === zone
                      ? 'border-emerald-400 bg-emerald-50 shadow-md -translate-y-0.5'
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  )}
                >
                  <div className="text-2xl mb-1">{STORAGE_ZONE_EMOJI[zone]}</div>
                  <div className={clsx(
                    'text-sm font-medium',
                    form.zone === zone ? 'text-emerald-700' : 'text-slate-700'
                  )}>
                    {STORAGE_ZONE_LABEL[zone]}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                <Package className="w-4 h-4" /> 数量
              </label>
              <input
                type="number"
                min={0.1}
                step={0.1}
                value={form.quantity}
                onChange={(e) => updateField('quantity', Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">单位</label>
              <select
                value={form.unit}
                onChange={(e) => updateField('unit', e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-sm bg-white"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                <Calendar className="w-4 h-4" /> 买入日期
              </label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => updateField('purchaseDate', e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-sm"
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
                <Receipt className="w-4 h-4" /> 小票金额
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">¥</span>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.price}
                  onChange={(e) => updateField('price', Number(e.target.value))}
                  placeholder="0.00"
                  className="w-full h-11 pl-8 pr-4 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                未开封保质期 (天)
              </label>
              <div className="flex gap-2 flex-wrap">
                {[3, 7, 14, 30, 90, 180].map((d) => (
                  <button
                    key={d}
                    onClick={() => updateField('shelfLifeDays', d)}
                    className={clsx(
                      'h-9 px-3 rounded-xl text-sm transition-all',
                      form.shelfLifeDays === d
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {d}天
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  value={form.shelfLifeDays}
                  onChange={(e) => updateField('shelfLifeDays', Number(e.target.value))}
                  className="w-20 h-9 px-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-400 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                开封后保质期 (天)
              </label>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 5, 7, 14].map((d) => (
                  <button
                    key={d}
                    onClick={() => updateField('openedShelfLifeDays', d)}
                    className={clsx(
                      'h-9 px-3 rounded-xl text-sm transition-all',
                      form.openedShelfLifeDays === d
                        ? 'bg-orange-500 text-white shadow-md'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    )}
                  >
                    {d}天
                  </button>
                ))}
                <input
                  type="number"
                  min={1}
                  value={form.openedShelfLifeDays}
                  onChange={(e) => updateField('openedShelfLifeDays', Number(e.target.value))}
                  className="w-20 h-9 px-3 rounded-xl border border-slate-200 text-sm focus:border-orange-400 outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              分类
            </label>
            <div className="flex gap-2 flex-wrap">
              {FOOD_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => updateField('category', cat)}
                  className={clsx(
                    'h-9 px-4 rounded-xl text-sm transition-all',
                    form.category === cat
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm font-medium text-slate-700">是否已经开封？</span>
                <p className="text-xs text-slate-500 mt-0.5">开封后会重新计算保质期倒计时</p>
              </div>
              <button
                type="button"
                onClick={() => updateField('isOpened', !form.isOpened)}
                className={clsx(
                  'w-12 h-7 rounded-full transition-all relative',
                  form.isOpened ? 'bg-orange-500' : 'bg-slate-200'
                )}
              >
                <span
                  className={clsx(
                    'absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all',
                    form.isOpened ? 'left-[22px]' : 'left-0.5'
                  )}
                />
              </button>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-2">
              <StickyNote className="w-4 h-4" /> 备注（可选）
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="如：原味+草莓味、做麻婆豆腐用..."
              rows={2}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50 transition-all outline-none text-sm resize-none"
            />
          </div>
        </div>

        <div className="px-7 py-5 border-t border-slate-100 bg-slate-50/50 flex gap-3">
          <Button variant="secondary" onClick={onClose} fullWidth>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!form.name.trim()} fullWidth>
            {editFood ? '保存修改' : '录入冰箱'}
          </Button>
        </div>
      </div>
    </div>
  );
}
