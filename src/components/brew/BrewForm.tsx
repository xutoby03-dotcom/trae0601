import { FC, useState, useEffect } from 'react';
import { FlavorTag, BrewRecord, CoffeeBean } from '../../types';
import { useCoffeeStore } from '../../store/useCoffeeStore';
import Button from '../ui/Button';
import Tag from '../ui/Tag';
import { Star } from 'lucide-react';

interface BrewFormProps {
  preselectedBeanId?: string;
  onSubmit: (data: Omit<BrewRecord, 'id'>) => void;
  onCancel: () => void;
}

const allFlavorTags: FlavorTag[] = [
  'sour',
  'sweet',
  'bitter',
  'nutty',
  'floral',
  'fruity',
  'chocolate',
  'caramel',
];

const equipments = [
  'V60 手冲',
  '聪明杯',
  '法压壶',
  '摩卡壶',
  '爱乐压',
  '意式咖啡机',
  '冷萃',
];

const BrewForm: FC<BrewFormProps> = ({ preselectedBeanId, onSubmit, onCancel }) => {
  const { beans } = useCoffeeStore();
  const availableBeans = beans.filter((bean) => bean.remainingWeight > 0);

  const [formData, setFormData] = useState({
    beanId: preselectedBeanId || '',
    brewTime: new Date().toISOString().slice(0, 16),
    equipment: 'V60 手冲',
    coffeeDose: 15,
    waterAmount: 240,
    waterTemp: 92,
    brewTimeSec: 150,
    rating: 4,
    notes: '',
    flavorTags: [] as FlavorTag[],
  });

  useEffect(() => {
    if (preselectedBeanId) {
      setFormData((prev) => ({ ...prev, beanId: preselectedBeanId }));
    }
  }, [preselectedBeanId]);

  const handleChange = (field: string, value: string | number | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFlavorTag = (tag: FlavorTag) => {
    setFormData((prev) => ({
      ...prev,
      flavorTags: prev.flavorTags.includes(tag)
        ? prev.flavorTags.filter((t) => t !== tag)
        : [...prev.flavorTags, tag],
    }));
  };

  const setRating = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.beanId) {
      alert('请选择咖啡豆');
      return;
    }
    onSubmit({
      beanId: formData.beanId,
      brewTime: new Date(formData.brewTime).toISOString(),
      equipment: formData.equipment,
      coffeeDose: Number(formData.coffeeDose),
      waterAmount: Number(formData.waterAmount),
      waterTemp: Number(formData.waterTemp),
      brewTimeSec: Number(formData.brewTimeSec),
      rating: Number(formData.rating),
      notes: formData.notes,
      flavorTags: formData.flavorTags,
    });
  };

  const selectedBean = beans.find((b) => b.id === formData.beanId);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
          选择咖啡豆 <span className="text-[#C2563B]">*</span>
        </label>
        <select
          value={formData.beanId}
          onChange={(e) => handleChange('beanId', e.target.value)}
          className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          required
        >
          <option value="">请选择咖啡豆</option>
          {availableBeans.map((bean) => (
            <option key={bean.id} value={bean.id}>
              {bean.name} (剩余 {bean.remainingWeight}g)
            </option>
          ))}
        </select>
        {availableBeans.length === 0 && (
          <p className="text-xs text-[#C2563B] mt-1">没有可用的咖啡豆，请先添加</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            冲煮时间
          </label>
          <input
            type="datetime-local"
            value={formData.brewTime}
            onChange={(e) => handleChange('brewTime', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            器具
          </label>
          <select
            value={formData.equipment}
            onChange={(e) => handleChange('equipment', e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          >
            {equipments.map((eq) => (
              <option key={eq} value={eq}>
                {eq}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            粉量 (g)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={formData.coffeeDose}
            onChange={(e) => handleChange('coffeeDose', Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            水量 (g)
          </label>
          <input
            type="number"
            min="0"
            value={formData.waterAmount}
            onChange={(e) => handleChange('waterAmount', Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
            水温 (°C)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.waterTemp}
            onChange={(e) => handleChange('waterTemp', Number(e.target.value))}
            className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
          萃取时间 (秒)
        </label>
        <input
          type="number"
          min="0"
          value={formData.brewTimeSec}
          onChange={(e) => handleChange('brewTimeSec', Number(e.target.value))}
          className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-2">
          风味评分
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 transition-transform hover:scale-110"
            >
              <Star
                className={`w-7 h-7 transition-colors ${
                  star <= formData.rating
                    ? 'text-[#D4A574] fill-[#D4A574]'
                    : 'text-[#D4A574]/30'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-[#6B5748]">{formData.rating} 分</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-2">
          风味标签
        </label>
        <div className="flex flex-wrap gap-2">
          {allFlavorTags.map((tag) => (
            <Tag
              key={tag}
              tag={tag}
              selected={formData.flavorTags.includes(tag)}
              onClick={() => toggleFlavorTag(tag)}
              size="md"
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[#4A3728] mb-1.5">
          口感备注
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="记录一下这杯的口感和体验..."
          rows={3}
          className="w-full px-4 py-2.5 bg-white border border-[#D4A574]/30 rounded-xl text-[#4A3728] placeholder:text-[#B8A99A] focus:outline-none focus:ring-2 focus:ring-[#D4A574]/50 focus:border-[#D4A574] transition-colors resize-none"
        />
      </div>

      {selectedBean && (
        <div className="bg-[#FFF8F0] border border-[#D4A574]/30 rounded-xl p-3">
          <p className="text-xs text-[#6B5748]">
            扣减后 <span className="font-medium text-[#4A3728]">{selectedBean.name}</span> 剩余
            <span className="font-semibold text-[#C2563B]">
              {' '}
              {Math.max(0, selectedBean.remainingWeight - Number(formData.coffeeDose))}g
            </span>
          </p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">
          取消
        </Button>
        <Button type="submit" className="flex-1" disabled={!formData.beanId}>
          保存记录
        </Button>
      </div>
    </form>
  );
};

export default BrewForm;
