import { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import type { Equipment, EquipmentCategory } from '@/types';
import { CATEGORY_META } from '@/types';
import { useStore } from '@/store/useStore';

interface EquipmentFormProps {
  equipment?: Equipment | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const CATEGORIES: EquipmentCategory[] = ['tent', 'sleep', 'cooking', 'lighting', 'firstaid', 'entertainment'];

export default function EquipmentForm({ equipment, onClose, onSubmit }: EquipmentFormProps) {
  const currentTripId = useStore((s) => s.currentTripId);
  const peopleAll = useStore((s) => s.people);
  const people = useMemo(() => peopleAll.filter((p) => p.tripId === currentTripId), [peopleAll, currentTripId]);
  const [form, setForm] = useState({
    name: '',
    category: 'cooking' as EquipmentCategory,
    weightGrams: 0,
    volumeLiters: 0,
    responsiblePersonId: '' as string | null,
    bagName: '' as string | null,
    notes: '',
  });

  useEffect(() => {
    if (equipment) {
      setForm({
        name: equipment.name,
        category: equipment.category,
        weightGrams: equipment.weightGrams,
        volumeLiters: equipment.volumeLiters,
        responsiblePersonId: equipment.responsiblePersonId,
        bagName: equipment.bagName,
        notes: equipment.notes,
      });
    }
  }, [equipment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bark-500/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-card w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-cream-200">
          <h2 className="text-lg font-semibold text-bark-500">
            {equipment ? '编辑装备' : '新增装备'}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-cream-100 text-bark-500/60"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scroll-area">
          <div>
            <label className="label">装备名称</label>
            <input
              type="text"
              className="input"
              placeholder="如：炉头、帐篷..."
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">分类</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const active = form.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`p-3 rounded-xl text-center transition-all border ${
                      active
                        ? 'bg-forest-600 text-white border-forest-600 shadow-softer'
                        : 'bg-cream-50 text-bark-500 border-cream-200 hover:bg-cream-100'
                    }`}
                  >
                    <div className="text-xl">{meta.emoji}</div>
                    <div className="text-xs mt-0.5 font-medium">{meta.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">重量 (克)</label>
              <input
                type="number"
                className="input"
                value={form.weightGrams}
                onChange={(e) => setForm({ ...form, weightGrams: Number(e.target.value) })}
                min="0"
              />
            </div>
            <div>
              <label className="label">体积 (升)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.volumeLiters}
                onChange={(e) => setForm({ ...form, volumeLiters: Number(e.target.value) })}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="label">负责人</label>
            <select
              className="input"
              value={form.responsiblePersonId || ''}
              onChange={(e) => setForm({ ...form, responsiblePersonId: e.target.value || null })}
            >
              <option value="">暂未分配</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">放在哪个包</label>
            <input
              type="text"
              className="input"
              placeholder="如：大包A、厨房包、车顶..."
              value={form.bagName || ''}
              onChange={(e) => setForm({ ...form, bagName: e.target.value || null })}
            />
          </div>

          <div>
            <label className="label">备注</label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="选填，如检查配件、注意事项..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </form>

        <div className="flex items-center justify-end gap-2 p-5 border-t border-cream-200">
          <button type="button" onClick={onClose} className="btn-secondary">
            取消
          </button>
          <button type="submit" onClick={handleSubmit} className="btn-primary">
            {equipment ? '保存修改' : '添加装备'}
          </button>
        </div>
      </div>
    </div>
  );
}
