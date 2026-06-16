import { AlertCircle, ArrowRight } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import { FoodCard } from '@/components/food/FoodCard';
import { NavLink } from 'react-router-dom';

export function WarningList() {
  const getWarningFoods = useFoodStore((s) => s.getWarningFoods);
  const foods = getWarningFoods();

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-200/60">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Fraunces', serif" }}>
              ⚠️ 三天内风险
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">未来3天将过期，提前规划菜单</p>
          </div>
          {foods.length > 0 && (
            <span className="ml-3 px-3 py-1 rounded-xl bg-amber-100 text-amber-700 text-sm font-semibold">
              {foods.length} 件注意
            </span>
          )}
        </div>
        <NavLink
          to="/fridge"
          className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors group"
        >
          查看全部
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </NavLink>
      </div>

      {foods.length === 0 ? (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-100 text-center">
          <div className="text-4xl mb-2">🗓️</div>
          <p className="text-sm text-slate-500">未来3天内没有即将过期的食材</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food, idx) => (
            <div key={food.id} style={{ animationDelay: `${idx * 80}ms` }}>
              <FoodCard food={food} borderStyle="accent" />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
