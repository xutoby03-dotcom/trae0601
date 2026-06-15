import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Droplets, Refrigerator, ChefHat, ArrowRight, Check } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import { DISHES } from '@/data/dishes';
import { MEAT_CATEGORIES } from '@/data/drawers';
import {
  getAverageThawTime,
  calculateTakeOutTime,
  getThawMethodLabel,
  getThawMethodDescription,
} from '@/utils/thawTime';
import { formatTime, formatDuration } from '@/utils/dateUtils';
import type { FoodItem, ThawMethod, Dish } from '@/types';
import { cn } from '@/lib/utils';

export default function Planner() {
  const navigate = useNavigate();
  const { foods, startThaw } = useFoodStore();
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [dinnerTime, setDinnerTime] = useState(() => {
    const d = new Date();
    d.setHours(19, 0, 0, 0);
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [selectedMethod, setSelectedMethod] = useState<ThawMethod>('fridge');
  const [confirmed, setConfirmed] = useState(false);

  const frozenFoods = foods.filter((f) => f.status === 'frozen');

  const suitableFoods = useMemo(() => {
    if (!selectedDish) return [];

    const dinnerDate = new Date();
    const [hours, minutes] = dinnerTime.split(':').map(Number);
    dinnerDate.setHours(hours, minutes, 0, 0);
    if (dinnerDate < new Date()) {
      dinnerDate.setDate(dinnerDate.getDate() + 1);
    }

    const matched = frozenFoods
      .filter((f) => selectedDish.suitableMeats.includes(f.category))
      .map((food) => {
        const thawHours = getAverageThawTime(food.weight, selectedMethod);
        const takeOutTime = calculateTakeOutTime(dinnerDate, food.weight, selectedMethod);
        const canMakeIt = takeOutTime <= new Date();
        const readyTime = new Date(takeOutTime.getTime() + thawHours * 60 * 60 * 1000);

        return {
          food,
          thawHours,
          takeOutTime,
          readyTime,
          canMakeIt,
        };
      })
      .sort((a, b) => {
        if (a.canMakeIt && !b.canMakeIt) return -1;
        if (!a.canMakeIt && b.canMakeIt) return 1;
        return a.food.weight - b.food.weight;
      });

    return matched;
  }, [selectedDish, dinnerTime, selectedMethod, frozenFoods]);

  const handleStartThaw = (food: FoodItem) => {
    startThaw(food.id, selectedMethod);
    setConfirmed(true);
    setTimeout(() => {
      navigate(`/inventory/${food.id}`);
    }, 1500);
  };

  const dinnerDate = useMemo(() => {
    const d = new Date();
    const [hours, minutes] = dinnerTime.split(':').map(Number);
    d.setHours(hours, minutes, 0, 0);
    if (d < new Date()) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }, [dinnerTime]);

  const categoriesWithFood = useMemo(() => {
    const categories = new Set(frozenFoods.map((f) => f.category));
    return MEAT_CATEGORIES.filter((m) => categories.has(m.id));
  }, [frozenFoods]);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
            <Check className="text-green-500" size={48} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 mb-2">已开始解冻！</h2>
          <p className="text-warm-500">正在跳转到详情页...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-warm-900 mb-1">解冻规划</h1>
          <p className="text-warm-500 text-sm">选好菜和时间，帮你安排解冻</p>
        </div>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-warm-900 mb-3">
            <ChefHat className="inline mr-2" size={20} />
            想吃什么？
          </h2>

          {categoriesWithFood.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-soft">
              <p className="text-warm-400">冷冻库里还没有食材</p>
              <button
                onClick={() => navigate('/inventory')}
                className="mt-3 text-primary-500 text-sm font-medium"
              >
                去添加 →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {DISHES.filter((dish) =>
                dish.suitableMeats.some((m) =>
                  frozenFoods.some((f) => f.category === m)
                )
              ).map((dish) => (
                <button
                  key={dish.id}
                  onClick={() => setSelectedDish(dish)}
                  className={cn(
                    'p-4 rounded-2xl text-left transition-all',
                    selectedDish?.id === dish.id
                      ? 'bg-primary-500 text-white shadow-warm scale-[1.02]'
                      : 'bg-white shadow-soft hover:shadow-soft-lg text-warm-700'
                  )}
                >
                  <div className="text-3xl mb-2">{dish.emoji}</div>
                  <h3 className="font-semibold">{dish.name}</h3>
                  <p
                    className={cn(
                      'text-xs mt-1',
                      selectedDish?.id === dish.id
                        ? 'text-primary-100'
                        : 'text-warm-400'
                    )}
                  >
                    {dish.requiredWeight}g · {dish.category}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-warm-900 mb-3">
            <Clock className="inline mr-2" size={20} />
            几点吃饭？
          </h2>
          <div className="bg-white rounded-2xl p-5 shadow-soft">
            <input
              type="time"
              value={dinnerTime}
              onChange={(e) => setDinnerTime(e.target.value)}
              className="w-full text-4xl font-bold text-center bg-transparent text-warm-900 focus:outline-none"
            />
            <p className="text-center text-sm text-warm-400 mt-2">
              {formatTime(dinnerDate)} · 预计 {selectedDish?.name || '菜式'}
            </p>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold text-warm-900 mb-3">解冻方式</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMethod('fridge')}
              className={cn(
                'p-4 rounded-2xl text-left transition-all',
                selectedMethod === 'fridge'
                  ? 'bg-secondary-500 text-white shadow-lg'
                  : 'bg-white shadow-soft hover:shadow-soft-lg'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    selectedMethod === 'fridge'
                      ? 'bg-white/20'
                      : 'bg-secondary-50'
                  )}
                >
                  <Refrigerator
                    size={20}
                    className={selectedMethod === 'fridge' ? 'text-white' : 'text-secondary-500'}
                  />
                </div>
                <span
                  className={cn(
                    'font-semibold',
                    selectedMethod === 'fridge' ? 'text-white' : 'text-warm-900'
                  )}
                >
                  冷藏解冻
                </span>
              </div>
              <p
                className={cn(
                  'text-xs',
                  selectedMethod === 'fridge' ? 'text-secondary-100' : 'text-warm-400'
                )}
              >
                口感更好，适合提前准备
              </p>
            </button>

            <button
              onClick={() => setSelectedMethod('cold_water')}
              className={cn(
                'p-4 rounded-2xl text-left transition-all',
                selectedMethod === 'cold_water'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white shadow-soft hover:shadow-soft-lg'
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    selectedMethod === 'cold_water'
                      ? 'bg-white/20'
                      : 'bg-blue-50'
                  )}
                >
                  <Droplets
                    size={20}
                    className={selectedMethod === 'cold_water' ? 'text-white' : 'text-blue-500'}
                  />
                </div>
                <span
                  className={cn(
                    'font-semibold',
                    selectedMethod === 'cold_water' ? 'text-white' : 'text-warm-900'
                  )}
                >
                  冷水解冻
                </span>
              </div>
              <p
                className={cn(
                  'text-xs',
                  selectedMethod === 'cold_water' ? 'text-blue-100' : 'text-warm-400'
                )}
              >
                速度更快，适合临时决定
              </p>
            </button>
          </div>
        </section>

        {selectedDish && (
          <section className="mb-6">
            <h2 className="text-lg font-bold text-warm-900 mb-3">推荐食材</h2>

            {suitableFoods.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-soft">
                <p className="text-warm-400">没有适合做{selectedDish.name}的食材</p>
                <button
                  onClick={() => navigate('/inventory')}
                  className="mt-3 text-primary-500 text-sm font-medium"
                >
                  去添加 →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {suitableFoods.map(({ food, thawHours, takeOutTime, readyTime, canMakeIt }) => (
                  <div
                    key={food.id}
                    className={cn(
                      'bg-white rounded-2xl p-4 shadow-soft border-2 transition-all',
                      canMakeIt ? 'border-transparent' : 'border-orange-200 bg-orange-50/30'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-3xl flex-shrink-0">
                        🍖
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-warm-900">{food.name}</h3>
                          {canMakeIt ? (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                              来得及
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                              赶时间
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-warm-500">{food.weight}g</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-cream-50 rounded-xl p-3">
                        <p className="text-xs text-warm-400 mb-1">取出时间</p>
                        <p className="font-bold text-warm-900">
                          {formatTime(takeOutTime)}
                        </p>
                      </div>
                      <div className="bg-secondary-50 rounded-xl p-3">
                        <p className="text-xs text-warm-400 mb-1">可以切</p>
                        <p className="font-bold text-secondary-600">
                          {formatTime(readyTime)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-warm-500">
                        解冻约 {formatDuration(thawHours)}
                      </span>
                      <button
                        onClick={() => handleStartThaw(food)}
                        disabled={!canMakeIt}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-all',
                          canMakeIt
                            ? 'bg-primary-500 text-white hover:bg-primary-600 shadow-warm'
                            : 'bg-warm-100 text-warm-400 cursor-not-allowed'
                        )}
                      >
                        开始解冻
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {!selectedDish && (
          <div className="bg-gradient-to-br from-primary-50 to-cream-50 rounded-2xl p-6 text-center border border-primary-100">
            <div className="text-4xl mb-3">👆</div>
            <p className="text-warm-600 font-medium">先选一道菜</p>
            <p className="text-warm-400 text-sm mt-1">系统会推荐适合的食材和解冻方案</p>
          </div>
        )}
      </div>
    </div>
  );
}
