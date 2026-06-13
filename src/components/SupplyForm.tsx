import { useState, useEffect } from 'react';
import type { Supply, Importance, SupplyCategory } from '@/types';
import { useAppStore } from '@/store/useAppStore';

interface Props {
  supply?: Supply | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const importanceOptions: { value: Importance; label: string }[] = [
  { value: 'high', label: '重要（必备）' },
  { value: 'medium', label: '一般（建议带）' },
  { value: 'low', label: '可选（按需）' },
];

const categoryOptions: { value: SupplyCategory; label: string }[] = [
  { value: 'water', label: '💧 水' },
  { value: 'food', label: '🍞 食品' },
  { value: 'first_aid', label: '❤️ 急救' },
  { value: 'equipment', label: '⛺ 装备' },
  { value: 'other', label: '📦 其他' },
];

export default function SupplyForm({ supply, onSubmit, onCancel }: Props) {
  const addSupply = useAppStore((s) => s.addSupply);
  const updateSupply = useAppStore((s) => s.updateSupply);

  const [form, setForm] = useState({
    name: '',
    weightGrams: 100,
    quantity: 1,
    importance: 'medium' as Importance,
    isFragile: false,
    category: 'other' as SupplyCategory,
    isConsumable: true,
    photoUrl: '',
    note: '',
  });

  useEffect(() => {
    if (supply) {
      setForm({
        name: supply.name,
        weightGrams: supply.weightGrams,
        quantity: supply.quantity,
        importance: supply.importance,
        isFragile: supply.isFragile,
        category: supply.category,
        isConsumable: supply.isConsumable,
        photoUrl: supply.photoUrl || '',
        note: supply.note || '',
      });
    }
  }, [supply]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (supply) {
      updateSupply(supply.id, form);
    } else {
      addSupply(form);
    }
    onSubmit();
  };

  const field =
    'w-full px-3.5 py-2.5 rounded-lg border border-parchment-300 bg-white text-forest-900 placeholder:text-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">物资名称 *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例如：瓶装水 500ml"
          className={field}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">单件重量 (克) *</label>
          <input
            type="number"
            min={0}
            value={form.weightGrams}
            onChange={(e) => setForm({ ...form, weightGrams: Number(e.target.value) })}
            className={field}
            required
          />
        </div>
        <div>
          <label className="label">总数量 *</label>
          <input
            type="number"
            min={1}
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            className={field}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">分类</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as SupplyCategory })}
            className={field}
          >
            {categoryOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">重要程度</label>
          <select
            value={form.importance}
            onChange={(e) => setForm({ ...form, importance: e.target.value as Importance })}
            className={field}
          >
            {importanceOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <label className="flex items-center gap-2 p-3 rounded-lg bg-parchment-50 border border-parchment-200 cursor-pointer hover:border-forest-300 transition-colors">
          <input
            type="checkbox"
            checked={form.isFragile}
            onChange={(e) => setForm({ ...form, isFragile: e.target.checked })}
            className="w-4 h-4 accent-forest-600"
          />
          <span className="text-sm text-forest-800">易碎</span>
        </label>
        <label className="flex items-center gap-2 p-3 rounded-lg bg-parchment-50 border border-parchment-200 cursor-pointer hover:border-forest-300 transition-colors">
          <input
            type="checkbox"
            checked={form.isConsumable}
            onChange={(e) => setForm({ ...form, isConsumable: e.target.checked })}
            className="w-4 h-4 accent-forest-600"
          />
          <span className="text-sm text-forest-800">消耗品</span>
        </label>
      </div>

      <div>
        <label className="label">参考照片 URL</label>
        <input
          type="url"
          value={form.photoUrl}
          onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
          placeholder="https://..."
          className={field}
        />
      </div>

      <div>
        <label className="label">备注</label>
        <textarea
          value={form.note}
          onChange={(e) => setForm({ ...form, note: e.target.value })}
          placeholder="补充说明..."
          rows={2}
          className={`${field} resize-none`}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          取消
        </button>
        <button type="submit" className="btn-primary">
          {supply ? '保存修改' : '添加物资'}
        </button>
      </div>
    </form>
  );
}
