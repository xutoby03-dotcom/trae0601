import { useState } from 'react';
import { useFishTankStore } from '@/store/useFishTankStore';
import type { ObservationType, ObservationTargetType } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  onSuccess?: () => void;
}

const typeOptions: { value: ObservationType; label: string }[] = [
  { value: 'white_spot', label: '白点病' },
  { value: 'bottom_sitting', label: '趴缸' },
  { value: 'filter_noise', label: '过滤异响' },
  { value: 'appetite_loss', label: '食欲不振' },
  { value: 'fin_rot', label: '烂尾/烂鳍' },
  { value: 'other', label: '其他' },
];

const targetTypeOptions: { value: ObservationTargetType; label: string }[] = [
  { value: 'fish', label: '鱼只' },
  { value: 'equipment', label: '设备' },
  { value: 'water', label: '水质' },
];

export default function ObservationForm({ onSuccess }: Props) {
  const { addObservation, fishes } = useFishTankStore();
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: today,
    type: 'white_spot' as ObservationType,
    typeLabel: '白点病',
    description: '',
    targetType: 'fish' as ObservationTargetType,
    targetId: fishes[0]?.id || '',
    targetName: fishes[0]?.name || '',
    status: 'pending' as const,
    photo: '',
  });

  const handleTypeChange = (type: ObservationType) => {
    const typeOpt = typeOptions.find((t) => t.value === type);
    setFormData({ ...formData, type, typeLabel: typeOpt?.label || '' });
  };

  const handleTargetTypeChange = (targetType: ObservationTargetType) => {
    let targetId = '';
    let targetName = '';
    if (targetType === 'fish' && fishes.length > 0) {
      targetId = fishes[0].id;
      targetName = fishes[0].name;
    } else if (targetType === 'equipment') {
      targetName = '过滤桶';
    } else if (targetType === 'water') {
      targetName = '水质';
    }
    setFormData({ ...formData, targetType, targetId, targetName });
  };

  const handleTargetChange = (targetId: string) => {
    if (formData.targetType === 'fish') {
      const fish = fishes.find((f) => f.id === targetId);
      setFormData({
        ...formData,
        targetId,
        targetName: fish?.name || '',
      });
    } else {
      setFormData({ ...formData, targetId, targetName: targetId });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addObservation({
      date: formData.date,
      type: formData.type,
      typeLabel: formData.typeLabel,
      description: formData.description,
      targetType: formData.targetType,
      targetId: formData.targetId || undefined,
      targetName: formData.targetName,
      status: formData.status,
      photo: formData.photo || undefined,
    });
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h4 className="font-semibold text-gray-800">新增异常观察</h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">日期</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 mb-1 block">异常类型</label>
          <select
            value={formData.type}
            onChange={(e) => handleTypeChange(e.target.value as ObservationType)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-2 block">关联对象类型</label>
        <div className="flex gap-2">
          {targetTypeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleTargetTypeChange(opt.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium border transition-all',
                formData.targetType === opt.value
                  ? 'bg-amber-100 border-amber-300 text-amber-700'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {formData.targetType === 'fish' && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">选择鱼只</label>
          <select
            value={formData.targetId}
            onChange={(e) => handleTargetChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            {fishes.map((fish) => (
              <option key={fish.id} value={fish.id}>
                {fish.avatar} {fish.name} ({fish.species})
              </option>
            ))}
          </select>
        </div>
      )}

      {formData.targetType === 'equipment' && (
        <div>
          <label className="text-xs text-gray-500 mb-1 block">设备名称</label>
          <input
            type="text"
            value={formData.targetName}
            onChange={(e) => setFormData({ ...formData, targetName: e.target.value })}
            placeholder="如：过滤桶、加热棒..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-gray-500 mb-1 block">详细描述</label>
        <textarea
          placeholder="描述观察到的具体情况..."
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1 block">异常照片 URL</label>
        <input
          type="text"
          placeholder="输入图片链接..."
          value={formData.photo}
          onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
        />
        {formData.photo && (
          <div className="mt-2 w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
            <img src={formData.photo} alt="预览" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="submit"
          className="px-5 py-2 bg-amber-500 text-white rounded-full text-sm font-medium hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg"
        >
          保存观察
        </button>
      </div>
    </form>
  );
}
