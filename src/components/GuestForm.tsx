import { useState, useEffect } from 'react';
import { useWedding } from '../context/WeddingContext';
import { Guest } from '../types';

interface GuestFormProps {
  guest: Guest | null;
  onClose: () => void;
}

const DIETARY_OPTIONS = [
  '素食', '纯素', '无麸质', '不吃海鲜', '不食猪肉',
  '不吃牛肉', '儿童餐', '软食', '低糖', '低盐',
];

const ALLERGEN_OPTIONS = [
  '海鲜', '花生', '牛奶', '鸡蛋', '小麦',
  '大豆', '坚果', '芒果', '虾', '蟹',
];

const GROUP_OPTIONS = [
  { value: 'bride', label: '女方亲友' },
  { value: 'groom', label: '男方亲友' },
  { value: 'friend', label: '朋友' },
  { value: 'colleague', label: '同事' },
  { value: 'other', label: '其他' },
];

export default function GuestForm({ guest, onClose }: GuestFormProps) {
  const { addGuest, updateGuest } = useWedding();
  const [formData, setFormData] = useState({
    name: '',
    relation: '',
    group: 'friend' as Guest['group'],
    headCount: 1,
    contact: '',
    dietaryRestrictions: [] as string[],
    allergens: [] as string[],
    isChild: false,
    isElderly: false,
    needsSpecialMeal: false,
    notes: '',
    confirmed: true,
  });

  useEffect(() => {
    if (guest) {
      setFormData({
        name: guest.name,
        relation: guest.relation,
        group: guest.group,
        headCount: guest.headCount,
        contact: guest.contact,
        dietaryRestrictions: [...guest.dietaryRestrictions],
        allergens: [...guest.allergens],
        isChild: guest.isChild,
        isElderly: guest.isElderly,
        needsSpecialMeal: guest.needsSpecialMeal,
        notes: guest.notes,
        confirmed: guest.confirmed,
      });
    }
  }, [guest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guest) {
      updateGuest(guest.id, formData);
    } else {
      addGuest(formData);
    }
    onClose();
  };

  const toggleDietary = (item: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(item)
        ? prev.dietaryRestrictions.filter(d => d !== item)
        : [...prev.dietaryRestrictions, item],
    }));
  };

  const toggleAllergen = (item: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(item)
        ? prev.allergens.filter(a => a !== item)
        : [...prev.allergens, item],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-wedding-dark">
              {guest ? '编辑宾客' : '添加宾客'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                关系 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.relation}
                onChange={e => setFormData(prev => ({ ...prev, relation: e.target.value }))}
                placeholder="如：新郎表哥、新娘闺蜜"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                分组
              </label>
              <select
                value={formData.group}
                onChange={e => setFormData(prev => ({ ...prev, group: e.target.value as Guest['group'] }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
              >
                {GROUP_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                人数
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.headCount}
                onChange={e => setFormData(prev => ({ ...prev, headCount: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              联系方式
            </label>
            <input
              type="text"
              value={formData.contact}
              onChange={e => setFormData(prev => ({ ...prev, contact: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              饮食禁忌
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleDietary(option)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.dietaryRestrictions.includes(option)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              过敏原
            </label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_OPTIONS.map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggleAllergen(option)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    formData.allergens.includes(option)
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isChild}
                onChange={e => setFormData(prev => ({ ...prev, isChild: e.target.checked }))}
                className="w-4 h-4 text-wedding-gold"
              />
              <span className="text-sm text-gray-700">儿童</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isElderly}
                onChange={e => setFormData(prev => ({ ...prev, isElderly: e.target.checked }))}
                className="w-4 h-4 text-wedding-gold"
              />
              <span className="text-sm text-gray-700">老人</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.needsSpecialMeal}
                onChange={e => setFormData(prev => ({ ...prev, needsSpecialMeal: e.target.checked }))}
                className="w-4 h-4 text-wedding-gold"
              />
              <span className="text-sm text-gray-700">需要特殊餐</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.confirmed}
                onChange={e => setFormData(prev => ({ ...prev, confirmed: e.target.checked }))}
                className="w-4 h-4 text-wedding-gold"
              />
              <span className="text-sm text-gray-700">已确认出席</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-wedding-gold/50 resize-none"
              placeholder="其他需要注意的事项..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-wedding-gold text-white rounded-lg hover:bg-wedding-gold/90 transition-colors font-medium"
            >
              {guest ? '保存修改' : '添加宾客'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
