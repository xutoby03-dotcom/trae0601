import { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import type { FoodItem } from '@/types';
import { DRAWERS, MEAT_CATEGORIES } from '@/data/drawers';
import { DISHES } from '@/data/dishes';
import { getTodayDateString } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'thawCount'>) => void;
  editFood?: FoodItem | null;
}

export default function AddFoodModal({ isOpen, onClose, onSubmit, editFood }: AddFoodModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    weight: 500,
    drawer: 'drawer1',
    category: 'pork',
    frozenDate: getTodayDateString(),
    shelfLifeDays: 180,
    suitableDishes: [] as string[],
    photo: '',
  });

  const [customDish, setCustomDish] = useState('');

  useEffect(() => {
    if (editFood) {
      setFormData({
        name: editFood.name,
        weight: editFood.weight,
        drawer: editFood.drawer,
        category: editFood.category,
        frozenDate: editFood.frozenDate.split('T')[0],
        shelfLifeDays: editFood.shelfLifeDays,
        suitableDishes: [...editFood.suitableDishes],
        photo: editFood.photo || '',
      });
    } else {
      setFormData({
        name: '',
        weight: 500,
        drawer: 'drawer1',
        category: 'pork',
        frozenDate: getTodayDateString(),
        shelfLifeDays: 180,
        suitableDishes: [],
        photo: '',
      });
    }
  }, [editFood, isOpen]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleDish = (dishName: string) => {
    setFormData((prev) => ({
      ...prev,
      suitableDishes: prev.suitableDishes.includes(dishName)
        ? prev.suitableDishes.filter((d) => d !== dishName)
        : [...prev.suitableDishes, dishName],
    }));
  };

  const addCustomDish = () => {
    if (customDish.trim() && !formData.suitableDishes.includes(customDish.trim())) {
      setFormData((prev) => ({
        ...prev,
        suitableDishes: [...prev.suitableDishes, customDish.trim()],
      }));
      setCustomDish('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      frozenDate: new Date(formData.frozenDate).toISOString(),
      shelfLifeDays: Number(formData.shelfLifeDays),
      weight: Number(formData.weight),
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedMeatCategory = MEAT_CATEGORIES.find((m) => m.id === formData.category);
  const relevantDishes = DISHES.filter((d) => d.suitableMeats.includes(formData.category));
  const customDishes = formData.suitableDishes.filter(
    (d) => !DISHES.some((dish) => dish.name === d)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-warm-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-warm-900">
            {editFood ? '编辑食材' : '添加食材'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-warm-400 hover:text-warm-600 hover:bg-warm-50 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              包装照片
            </label>
            <div className="flex items-center gap-4">
              <label className="relative cursor-pointer">
                <div
                  className={cn(
                    'w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors',
                    formData.photo
                      ? 'border-transparent overflow-hidden'
                      : 'border-warm-200 hover:border-primary-300 bg-cream-50'
                  )}
                >
                  {formData.photo ? (
                    <img
                      src={formData.photo}
                      alt="食材照片"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <>
                      <Camera size={28} className="text-warm-400 mb-1" />
                      <span className="text-xs text-warm-400">上传照片</span>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
              {formData.photo && (
                <button
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, photo: '' }))}
                  className="text-sm text-red-500 hover:text-red-600"
                >
                  移除照片
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              食材名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="如：猪五花肉、牛里脊"
              className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                肉类分类
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value,
                    suitableDishes: [],
                  }));
                }}
                className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white"
              >
                {MEAT_CATEGORIES.map((meat) => (
                  <option key={meat.id} value={meat.id}>
                    {meat.emoji} {meat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                重量 (克)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, weight: Number(e.target.value) }))
                }
                min="50"
                step="50"
                className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              所在抽屉
            </label>
            <div className="grid grid-cols-4 gap-2">
              {DRAWERS.map((drawer) => (
                <button
                  key={drawer.id}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, drawer: drawer.id }))}
                  className={cn(
                    'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all',
                    formData.drawer === drawer.id
                      ? 'border-primary-400 bg-primary-50 text-primary-600'
                      : 'border-warm-200 hover:border-warm-300 text-warm-600'
                  )}
                >
                  <span className="text-2xl">{drawer.icon}</span>
                  <span className="text-xs">{drawer.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                冷冻日期
              </label>
              <input
                type="date"
                value={formData.frozenDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, frozenDate: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-warm-700 mb-2">
                保质期 (天)
              </label>
              <input
                type="number"
                value={formData.shelfLifeDays}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    shelfLifeDays: Number(e.target.value),
                  }))
                }
                min="7"
                step="7"
                className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">
              适合菜式
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {relevantDishes.map((dish) => (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => toggleDish(dish.name)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm transition-all',
                    formData.suitableDishes.includes(dish.name)
                      ? 'bg-primary-500 text-white'
                      : 'bg-cream-50 text-warm-600 hover:bg-cream-100'
                  )}
                >
                  {dish.emoji} {dish.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={customDish}
                onChange={(e) => setCustomDish(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomDish())}
                placeholder="自定义菜式"
                className="flex-1 px-3 py-2 rounded-lg border border-warm-200 focus:border-primary-400 outline-none text-sm"
              />
              <button
                type="button"
                onClick={addCustomDish}
                className="px-4 py-2 bg-warm-100 text-warm-600 rounded-lg text-sm hover:bg-warm-200 transition-colors"
              >
                添加
              </button>
            </div>
            {customDishes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {customDishes.map((dish) => (
                  <span
                    key={dish}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm"
                  >
                    {dish}
                    <button
                      type="button"
                      onClick={() => toggleDish(dish)}
                      className="hover:text-secondary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white font-semibold rounded-xl shadow-warm hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
            >
              {editFood ? '保存修改' : '添加到冷冻库'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
