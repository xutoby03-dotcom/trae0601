import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Droplets, Refrigerator, ChefHat, ArrowRight, Check, Sparkles } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import { DISHES } from '@/data/dishes';
import { MEAT_CATEGORIES } from '@/data/drawers';
import {
  getAverageThawTime,
  calculateTakeOutTime,
  getThawMethodLabel,
} from '@/utils/thawTime';
import { formatTime, formatDuration } from '@/utils/dateUtils';
import type { FoodItem, ThawMethod, Dish } from '@/types';
import { cn } from '@/lib/utils';

interface MethodPlan {
  method: ThawMethod;
  thawHours: number;
  takeOutTime: Date;
  readyTime: Date;
  canMakeIt: boolean;
  isRecommended: boolean;
}

interface FoodPlan {
  food: FoodItem;
  fridge: MethodPlan;
  coldWater: MethodPlan;
  hasAnyOption: boolean;
  bestLevel: 'fridge' | 'cold_water' | 'none';
}

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
  const [confirmed, setConfirmed] = useState<{ food: string; method: ThawMethod } | null>(null);

  const frozenFoods = foods.filter((f) => f.status === 'frozen');

  const dinnerDate = useMemo(() => {
    const d = new Date();
    const [hours, minutes] = dinnerTime.split(':').map(Number);
    d.setHours(hours, minutes, 0, 0);
    if (d < new Date()) {
      d.setDate(d.getDate() + 1);
    }
    return d;
  }, [dinnerTime]);

  const suitableFoods = useMemo<FoodPlan[]>(() => {
    if (!selectedDish) return [];

    const matched = frozenFoods
      .filter((f) => selectedDish.suitableMeats.includes(f.category))
      .map((food) => {
        const buildPlan = (method: ThawMethod): MethodPlan => {
          const thawHours = getAverageThawTime(food.weight, method);
          const takeOutTime = calculateTakeOutTime(dinnerDate, food.weight, method);
          const readyTime = new Date(takeOutTime.getTime() + thawHours * 60 * 60 * 1000);
          const canMakeIt = takeOutTime >= new Date();
          return {
            method,
            thawHours,
            takeOutTime,
            readyTime,
            canMakeIt,
            isRecommended: false,
          };
        };

        const fridge = buildPlan('fridge');
        const coldWater = buildPlan('cold_water');

        if (fridge.canMakeIt) {
          fridge.isRecommended = true;
        } else if (coldWater.canMakeIt) {
          coldWater.isRecommended = true;
        }

        let bestLevel: 'fridge' | 'cold_water' | 'none' = 'none';
        if (fridge.canMakeIt) bestLevel = 'fridge';
        else if (coldWater.canMakeIt) bestLevel = 'cold_water';

        return {
          food,
          fridge,
          coldWater,
          hasAnyOption: fridge.canMakeIt || coldWater.canMakeIt,
          bestLevel,
        };
      })
      .sort((a, b) => {
        const score = (p: FoodPlan) => {
          if (p.bestLevel === 'fridge') return 0;
          if (p.bestLevel === 'cold_water') return 1;
          return 2;
        };
        if (score(a) !== score(b)) return score(a) - score(b);
        const req = selectedDish.requiredWeight;
        return Math.abs(a.food.weight - req) - Math.abs(b.food.weight - req);
      });

    return matched;
  }, [selectedDish, dinnerDate, frozenFoods]);

  const handleStartThaw = (food: FoodItem, method: ThawMethod) => {
    startThaw(food.id, method);
    setConfirmed({ food: food.name, method });
    setTimeout(() => {
      navigate(`/inventory/${food.id}`);
    }, 1500);
  };

  const categoriesWithFood = useMemo(() => {
    const categories = new Set(frozenFoods.map((f) => f.category));
    return MEAT_CATEGORIES.filter((m) => categories.has(m.id));
  }, [frozenFoods]);

  const MethodPlanCard = ({ plan, food }: { plan: MethodPlan; food: FoodItem }) => {
    const isFridge = plan.method === 'fridge';
    const bgCanMake = isFridge ? 'bg-secondary-50' : 'bg-blue-50';
    const borderCanMake = isFridge ? 'border-secondary-200' : 'border-blue-200';
    const iconBgCanMake = isFridge ? 'bg-secondary-500' : 'bg-blue-500';
    const textColorCanMake = isFridge ? 'text-secondary-600' : 'text-blue-600';
    const timeColorCanMake = isFridge ? 'text-secondary-700' : 'text-blue-700';

    const bgCantMake = 'bg-warm-50';
    const borderCantMake = 'border-warm-200';
    const iconBgCantMake = 'bg-warm-300';

    return (
      <div
        className={cn(
          'relative rounded-xl p-3 border transition-all',
          plan.canMakeIt
            ? cn(bgCanMake, borderCanMake)
            : cn(bgCantMake, borderCantMake, 'opacity-75')
        )}
      >
        {plan.isRecommended && (
          <div className="absolute -top-2 -right-2 flex items-center gap-0.5 px-2 py-0.5 bg-gradient-to-r from-primary-400 to-primary-500 text-white text-xs rounded-full font-medium shadow-warm">
            <Sparkles size={12} />
            推荐
          </div>
        )}

        <div className="flex items-center gap-2 mb-2">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              plan.canMakeIt ? iconBgCanMake : iconBgCantMake
            )}
          >
            {isFridge ? (
              <Refrigerator size={16} className="text-white" />
            ) : (
              <Droplets size={16} className="text-white" />
            )}
          </div>
          <div>
            <p
              className={cn(
                'text-sm font-semibold',
                plan.canMakeIt ? textColorCanMake : 'text-warm-500'
              )}
            >
              {getThawMethodLabel(plan.method)}
            </p>
            <p className="text-xs text-warm-400">
              约 {formatDuration(plan.thawHours)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-warm-400 mb-0.5">取出时间</p>
            <p
              className={cn(
                'text-sm font-bold',
                plan.canMakeIt ? timeColorCanMake : 'text-warm-400'
              )}
            >
              {formatTime(plan.takeOutTime)}
            </p>
          </div>
          <div>
            <p className="text-xs text-warm-400 mb-0.5">可以切</p>
            <p
              className={cn(
                'text-sm font-bold',
                plan.canMakeIt ? timeColorCanMake : 'text-warm-400'
              )}
            >
              {formatTime(plan.readyTime)}
            </p>
          </div>
        </div>

        <button
          onClick={() => handleStartThaw(food, plan.method)}
          disabled={!plan.canMakeIt}
          className={cn(
            'w-full mt-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1 transition-all',
            plan.canMakeIt
              ? isFridge
                ? 'bg-secondary-500 text-white hover:bg-secondary-600 shadow-md'
                : 'bg-blue-500 text-white hover:bg-blue-600 shadow-md'
              : 'bg-warm-200 text-warm-500 cursor-not-allowed'
          )}
        >
          {plan.canMakeIt ? (
            <>
              用这种解冻
              <ArrowRight size={14} />
            </>
          ) : (
            '赶不上了'
          )}
        </button>
      </div>
    );
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white flex items-center justify-center">
        <div className="text-center animate-fade-in px-4">
          <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6 animate-pulse-soft">
            <Check className="text-green-500" size={48} strokeWidth={3} />
          </div>
          <h2 className="text-2xl font-bold text-warm-900 mb-2">已开始解冻！</h2>
          <p className="text-warm-500">
            {confirmed.food} · {getThawMethodLabel(confirmed.method)}
          </p>
          <p className="text-warm-400 text-sm mt-2">正在跳转到详情页...</p>
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

        {selectedDish && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-warm-900">推荐食材</h2>
              <span className="text-xs text-warm-400">
                ⭐ 冷藏赶不上？试试冷水
              </span>
            </div>

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
              <div className="space-y-4">
                {suitableFoods.map((plan) => (
                  <div
                    key={plan.food.id}
                    className={cn(
                      'bg-white rounded-2xl p-4 shadow-soft border-2 transition-all',
                      plan.bestLevel === 'fridge' && 'border-secondary-200',
                      plan.bestLevel === 'cold_water' && 'border-blue-200',
                      plan.bestLevel === 'none' && 'border-warm-100 bg-warm-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-3xl flex-shrink-0">
                        🍖
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-warm-900">
                            {plan.food.name}
                          </h3>
                          {plan.bestLevel === 'fridge' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                              冷藏刚好
                            </span>
                          )}
                          {plan.bestLevel === 'cold_water' && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
                              冷水来得及
                            </span>
                          )}
                          {plan.bestLevel === 'none' && (
                            <span className="px-2 py-0.5 bg-warm-100 text-warm-500 text-xs rounded-full font-medium">
                              都赶不上
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-warm-500 mt-0.5">
                          {plan.food.weight}g
                          {Math.abs(plan.food.weight - selectedDish.requiredWeight) <= 100 && (
                            <span className="text-secondary-500 ml-2">· 分量合适</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <MethodPlanCard plan={plan.fridge} food={plan.food} />
                      <MethodPlanCard plan={plan.coldWater} food={plan.food} />
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
            <p className="text-warm-400 text-sm mt-1">
              系统会自动算冷藏和冷水两种方案
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
