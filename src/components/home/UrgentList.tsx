import { Clock, ChefHat } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import { FoodCard } from '@/components/food/FoodCard';
import { NavLink } from 'react-router-dom';

export function UrgentList() {
  const getUrgentFoods = useFoodStore((s) => s.getUrgentFoods);
  const foods = getUrgentFoods();

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center shadow-lg shadow-orange-200/60">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              🍽️ 今晚先吃这些
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">24小时内过期或开封后急需处理</p>
          </div>
          {foods.length > 0 && (
            <span className="ml-3 px-3 py-1 rounded-xl bg-red-100 text-red-700 text-sm font-semibold animate-pulse">
              {foods.length} 件紧急
            </span>
          )}
        </div>
      </div>

      {foods.length === 0 ? (
        <div className="p-10 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 text-center">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="text-lg font-semibold text-emerald-700 mb-1">太棒了！</h3>
          <p className="text-sm text-emerald-600/80">没有需要紧急处理的食材</p>
        </div>
      ) : (
        <div className="space-y-3">
          {foods.map((food, idx) => (
            <div key={food.id} style={{ animationDelay: `${idx * 60}ms` }}>
              <FoodCard food={food} compact borderStyle="accent" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
