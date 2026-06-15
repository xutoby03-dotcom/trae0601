import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import FoodCard from '@/components/FoodCard';
import AddFoodModal from '@/components/AddFoodModal';
import { DRAWERS } from '@/data/drawers';
import { cn } from '@/lib/utils';

export default function Inventory() {
  const navigate = useNavigate();
  const { foods, addFood, selectedDrawer, setSelectedDrawer } = useFoodStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredFoods = selectedDrawer
    ? foods.filter((f) => f.drawer === selectedDrawer && f.status !== 'cooked')
    : foods.filter((f) => f.status !== 'cooked');

  const activeFoods = foods.filter((f) => f.status !== 'cooked');

  const drawerCounts = DRAWERS.map((drawer) => ({
    ...drawer,
    count: activeFoods.filter((f) => f.drawer === drawer.id).length,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-cream-50 via-cream-50/95 to-transparent pb-4">
        <div className="max-w-lg mx-auto px-4 pt-8 pb-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-warm-900">冷冻食材库</h1>
              <p className="text-sm text-warm-500 mt-1">
                共 {activeFoods.length} 件食材
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary-500 text-white rounded-full font-medium shadow-warm hover:bg-primary-600 transition-colors"
            >
              <Plus size={18} />
              添加
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            <button
              onClick={() => setSelectedDrawer(null)}
              className={cn(
                'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
                !selectedDrawer
                  ? 'bg-primary-500 text-white shadow-warm'
                  : 'bg-white text-warm-600 shadow-soft hover:bg-warm-50'
              )}
            >
              全部
            </button>
            {drawerCounts.map((drawer) => (
              <button
                key={drawer.id}
                onClick={() => setSelectedDrawer(drawer.id)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  selectedDrawer === drawer.id
                    ? 'bg-primary-500 text-white shadow-warm'
                    : 'bg-white text-warm-600 shadow-soft hover:bg-warm-50'
                )}
              >
                <span>{drawer.icon}</span>
                <span>{drawer.name}</span>
                <span className="opacity-70">({drawer.count})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {filteredFoods.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🥶</div>
            <p className="text-warm-600 font-medium mb-2">这个抽屉是空的</p>
            <p className="text-warm-400 text-sm mb-6">点击右上角添加食材吧</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-full font-medium shadow-warm hover:bg-primary-600 transition-colors"
            >
              <Plus size={20} />
              添加第一份食材
            </button>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredFoods.map((food) => (
              <FoodCard key={food.id} food={food} />
            ))}
          </div>
        )}
      </div>

      <AddFoodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addFood}
      />
    </div>
  );
}
