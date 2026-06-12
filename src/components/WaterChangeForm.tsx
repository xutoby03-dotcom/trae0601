import { useState } from 'react';
import { Check } from 'lucide-react';
import { useFishTankStore } from '@/store/useFishTankStore';
import type { WaterChangeRecord } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  onSuccess?: () => void;
}

export default function WaterChangeForm({ onSuccess }: Props) {
  const { addWaterChange, tank } = useFishTankStore();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: today,
    ratio: 25,
    temperature: (tank.minTemp + tank.maxTemp) / 2,
    ph: 7.0,
    addMedicine: false,
    medicineName: '',
    cleanFilter: false,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: Omit<WaterChangeRecord, 'id'> = {
      ...formData,
    };
    addWaterChange(record);
    onSuccess?.();
  };

  const toggleOption = (key: 'addMedicine' | 'cleanFilter') => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-semibold text-gray-800">新增换水记录</h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">日期</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">换水比例 (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.ratio}
            onChange={(e) => setFormData({ ...formData, ratio: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">水温 (°C)</label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => setFormData({ ...formData, temperature: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">PH值</label>
          <input
            type="number"
            step="0.1"
            value={formData.ph}
            onChange={(e) => setFormData({ ...formData, ph: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => toggleOption('addMedicine')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
            formData.addMedicine
              ? 'bg-rose-100 border-rose-300 text-rose-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          <Check size={16} className={cn('opacity-0', formData.addMedicine && 'opacity-100')} />
          加药
        </button>

        <button
          type="button"
          onClick={() => toggleOption('cleanFilter')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all',
            formData.cleanFilter
              ? 'bg-emerald-100 border-emerald-300 text-emerald-700'
              : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
          )}
        >
          <Check size={16} className={cn('opacity-0', formData.cleanFilter && 'opacity-100')} />
          清洗滤棉
        </button>
      </div>

      {formData.addMedicine && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">药品名称</label>
          <input
            type="text"
            placeholder="如：硝化细菌、白点净..."
            value={formData.medicineName}
            onChange={(e) => setFormData({ ...formData, medicineName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-gray-500 mb-1 block">备注</label>
        <textarea
          placeholder="记录观察到的情况..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="px-5 py-2 bg-sky-600 text-white rounded-full text-sm font-medium hover:bg-sky-700 transition-colors shadow-md hover:shadow-lg"
        >
          保存记录
        </button>
      </div>
    </form>
  );
}
