import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarClock, AlertTriangle, ChevronRight, Snowflake } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import FoodCard from '@/components/FoodCard';
import StatusBadge from '@/components/StatusBadge';
import { getGreeting, formatDate, formatTime, formatDuration } from '@/utils/dateUtils';
import {
  getThawProgress,
  getThawReadyTime,
  getRemainingThawTime,
  canMakeItForDinner,
  getAverageThawTime,
  getThawMethodLabel,
} from '@/utils/thawTime';
import { assessRisk } from '@/utils/riskAssessment';
import { cn } from '@/lib/utils';

export default function Home() {
  const navigate = useNavigate();
  const { foods } = useFoodStore();
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const thawingFoods = foods.filter((f) => f.status === 'thawing');
  const frozenFoods = foods.filter((f) => f.status === 'frozen');

  const getDinnerTime = () => {
    const now = new Date();
    const dinner = new Date(now);
    dinner.setHours(19, 0, 0, 0);
    if (now > dinner) {
      dinner.setDate(dinner.getDate() + 1);
    }
    return dinner;
  };

  const dinnerTime = getDinnerTime();

  const canMakeTonight = frozenFoods.filter((food) => {
    const thawTime = getAverageThawTime(food.weight, 'fridge');
    const takeOutDeadline = new Date(dinnerTime.getTime() - thawTime * 60 * 60 * 1000 - 30 * 60 * 1000);
    return takeOutDeadline > new Date();
  });

  const urgentFoods = frozenFoods
    .filter((food) => {
      const coldWaterTime = getAverageThawTime(food.weight, 'cold_water');
      const deadline = new Date(dinnerTime.getTime() - coldWaterTime * 60 * 60 * 1000 - 30 * 60 * 1000);
      const fridgeTime = getAverageThawTime(food.weight, 'fridge');
      const fridgeDeadline = new Date(dinnerTime.getTime() - fridgeTime * 60 * 60 * 1000 - 30 * 60 * 1000);
      return deadline > new Date() && fridgeDeadline < new Date();
    })
    .slice(0, 5);

  const riskFoods = foods
    .filter((f) => f.status !== 'cooked')
    .filter((f) => assessRisk(f).level !== 'none');

  const totalCount = foods.filter((f) => f.status !== 'cooked').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 via-cream-100/50 to-white pb-24">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-warm-500 text-sm mb-1">{formatDate(new Date())}</p>
            <h1 className="text-2xl font-bold text-warm-900">
              {getGreeting()}！
            </h1>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-soft text-warm-600 hover:text-warm-800 transition-colors"
          >
            <Snowflake size={18} />
            <span className="text-sm font-medium">{totalCount} 件</span>
          </button>
        </div>

        <div className="bg-gradient-to-br from-primary-400 to-primary-500 rounded-3xl p-5 text-white mb-6 shadow-warm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-primary-100 text-sm mb-1">今晚晚餐时间</p>
              <p className="text-3xl font-bold">{formatTime(dinnerTime)}</p>
            </div>
            <button
              onClick={() => navigate('/planner')}
              className="flex items-center gap-1.5 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium hover:bg-white/30 transition-colors"
            >
              <CalendarClock size={16} />
              规划晚餐
            </button>
          </div>
          <p className="text-primary-100 text-sm">
            现在拿出来，{canMakeTonight.length} 块肉来得及冷藏解冻
          </p>
        </div>

        {thawingFoods.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-warm-900">正在解冻中</h2>
              <span className="text-sm text-warm-500">{thawingFoods.length} 件</span>
            </div>
            <div className="space-y-3">
              {thawingFoods.map((food) => {
                const progress = food.thawStartTime && food.thawMethod
                  ? getThawProgress(food.thawStartTime, food.weight, food.thawMethod)
                  : 0;
                const readyTime = food.thawStartTime && food.thawMethod
                  ? getThawReadyTime(food.thawStartTime, food.weight, food.thawMethod)
                  : null;
                const remaining = food.thawStartTime && food.thawMethod
                  ? getRemainingThawTime(food.thawStartTime, food.weight, food.thawMethod)
                  : 0;
                const risk = assessRisk(food);

                return (
                  <div
                    key={food.id}
                    onClick={() => navigate(`/inventory/${food.id}`)}
                    className="bg-white rounded-2xl p-4 shadow-soft cursor-pointer hover:shadow-soft-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center text-2xl">
                          🍖
                        </div>
                        <div>
                          <h3 className="font-semibold text-warm-900">{food.name}</h3>
                          <p className="text-sm text-warm-500">
                            {food.weight}g · {food.thawMethod && getThawMethodLabel(food.thawMethod)}
                          </p>
                        </div>
                      </div>
                      <StatusBadge status="thawing" size="sm" />
                    </div>

                    <div className="mb-2">
                      <div className="h-2.5 bg-warm-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-warm-500">
                        还需 {formatDuration(remaining)}
                      </span>
                      <span className="text-secondary-600 font-medium">
                        预计 {readyTime ? formatTime(readyTime) : '-'} 可以切
                      </span>
                    </div>

                    {risk.level !== 'none' && (
                      <div className="mt-3 text-xs text-orange-500 bg-orange-50 px-3 py-2 rounded-xl">
                        ⚠️ {risk.reasons[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-warm-900">今晚来得及做</h2>
            <button
              onClick={() => navigate('/planner')}
              className="text-sm text-primary-500 flex items-center gap-0.5"
            >
              去规划
              <ChevronRight size={16} />
            </button>
          </div>

          {canMakeTonight.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center shadow-soft">
              <p className="text-warm-400">现在拿出来可能来不及了</p>
              <p className="text-sm text-warm-300 mt-1">试试冷水解冻可能更快</p>
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {canMakeTonight.slice(0, 5).map((food) => (
                <div
                  key={food.id}
                  onClick={() => navigate(`/inventory/${food.id}`)}
                  className="flex-shrink-0 w-40 bg-white rounded-2xl p-3 shadow-soft cursor-pointer hover:shadow-soft-lg transition-all"
                >
                  <div className="relative">
                    <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-4xl mb-3">
                      🍖
                    </div>
                    <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full font-medium">
                      来得及
                    </span>
                  </div>
                  <h3 className="font-semibold text-warm-900 text-sm truncate">
                    {food.name}
                  </h3>
                  <p className="text-xs text-warm-500 mt-0.5">{food.weight}g</p>
                  <p className="text-xs text-secondary-600 mt-2">
                    冷藏约 {formatDuration(getAverageThawTime(food.weight, 'fridge'))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        {urgentFoods.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-orange-500">🔥</span>
              <h2 className="text-lg font-bold text-warm-900">用冷水还来得及</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
              {urgentFoods.map((food) => (
                <div
                  key={food.id}
                  onClick={() => navigate(`/inventory/${food.id}`)}
                  className="flex-shrink-0 w-36 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-3 shadow-soft cursor-pointer hover:shadow-soft-lg transition-all border border-orange-200"
                >
                  <div className="w-full aspect-square rounded-xl bg-white/60 flex items-center justify-center text-3xl mb-2">
                    🍖
                  </div>
                  <h3 className="font-semibold text-warm-900 text-sm truncate">
                    {food.name}
                  </h3>
                  <p className="text-xs text-orange-600 mt-2">
                    💧 冷水 {formatDuration(getAverageThawTime(food.weight, 'cold_water'))}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {riskFoods.length > 0 && (
          <section className="mb-6">
            <button
              onClick={() => navigate('/warnings')}
              className="w-full bg-white rounded-2xl p-4 shadow-soft flex items-center justify-between hover:shadow-soft-lg transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-warm-900">浪费风险提醒</h3>
                  <p className="text-sm text-warm-500">
                    {riskFoods.length} 件食材需要关注
                  </p>
                </div>
              </div>
              <ChevronRight className="text-warm-400" size={20} />
            </button>
          </section>
        )}

        <section className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/inventory')}
            className="bg-white rounded-2xl p-4 shadow-soft text-left hover:shadow-soft-lg transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center mb-3">
              <Snowflake className="text-secondary-500" size={20} />
            </div>
            <h3 className="font-semibold text-warm-900">冷冻食材库</h3>
            <p className="text-sm text-warm-500 mt-1">
              {frozenFoods.length} 件冷冻中
            </p>
          </button>

          <button
            onClick={() => navigate('/planner')}
            className="bg-white rounded-2xl p-4 shadow-soft text-left hover:shadow-soft-lg transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-3">
              <CalendarClock className="text-primary-500" size={20} />
            </div>
            <h3 className="font-semibold text-warm-900">解冻规划</h3>
            <p className="text-sm text-warm-500 mt-1">智能安排解冻时间</p>
          </button>
        </section>
      </div>

      <button
        onClick={() => navigate('/inventory')}
        className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full shadow-warm flex items-center justify-center text-white hover:scale-110 transition-transform z-40"
      >
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
}
