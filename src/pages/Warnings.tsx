import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Trash2, Clock, CalendarX } from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import { assessRisk, getRiskLevelLabel, getRiskLevelColor } from '@/utils/riskAssessment';
import { daysBetween, formatDate, hoursBetween } from '@/utils/dateUtils';
import { sortByRisk } from '@/utils/riskAssessment';
import type { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

export default function Warnings() {
  const navigate = useNavigate();
  const { foods, discardFood } = useFoodStore();

  const atRiskFoods = sortByRisk(
    foods.filter((f) => f.status !== 'cooked' && assessRisk(f).level !== 'none')
  );

  const highRisk = atRiskFoods.filter((f) => assessRisk(f).level === 'high');
  const mediumRisk = atRiskFoods.filter((f) => assessRisk(f).level === 'medium');
  const lowRisk = atRiskFoods.filter((f) => assessRisk(f).level === 'low');

  const handleDiscard = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确认丢弃这份食材吗？')) {
      discardFood(id);
    }
  };

  const RiskSection = ({
    level,
    foods,
    icon,
  }: {
    level: RiskLevel;
    foods: typeof atRiskFoods;
    icon: React.ReactNode;
  }) => {
    if (foods.length === 0) return null;

    const colorClasses: Record<RiskLevel, string> = {
      high: 'bg-red-50 border-red-200 text-red-600',
      medium: 'bg-orange-50 border-orange-200 text-orange-600',
      low: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      none: '',
    };

    const bgClasses: Record<RiskLevel, string> = {
      high: 'from-red-50 to-transparent',
      medium: 'from-orange-50 to-transparent',
      low: 'from-yellow-50 to-transparent',
      none: '',
    };

    return (
      <section className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div
            className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center',
              colorClasses[level]
            )}
          >
            {icon}
          </div>
          <div>
            <h2 className="font-bold text-warm-900">
              {getRiskLevelLabel(level)}
            </h2>
            <p className="text-xs text-warm-500">{foods.length} 件食材</p>
          </div>
        </div>

        <div className="space-y-3">
          {foods.map((food) => {
            const risk = assessRisk(food);
            const frozenDays = daysBetween(food.frozenDate, new Date());
            const thawHours = food.thawStartTime
              ? hoursBetween(food.thawStartTime, new Date())
              : 0;

            return (
              <div
                key={food.id}
                onClick={() => navigate(`/inventory/${food.id}`)}
                className={cn(
                  'bg-white rounded-2xl p-4 shadow-soft cursor-pointer',
                  'hover:shadow-soft-lg transition-all border',
                  level === 'high' && 'border-red-200',
                  level === 'medium' && 'border-orange-200',
                  level === 'low' && 'border-yellow-200'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cream-100 to-cream-200 flex items-center justify-center text-3xl flex-shrink-0">
                    🍖
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-warm-900 truncate">
                        {food.name}
                      </h3>
                      <button
                        onClick={(e) => handleDiscard(food.id, e)}
                        className="p-1.5 -mr-1 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="丢弃"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <p className="text-sm text-warm-500 mt-0.5">
                      {food.weight}g · 冷冻 {frozenDays} 天
                    </p>

                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {risk.reasons.map((reason, i) => (
                        <span
                          key={i}
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full',
                            getRiskLevelColor(risk.level || level)
                          )}
                        >
                          {reason}
                        </span>
                      ))}
                    </div>

                    <p className="text-xs text-warm-400 mt-2">{risk.suggestion}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-28">
      <div className="max-w-lg mx-auto px-4 pt-8 pb-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-400 to-orange-400 flex items-center justify-center text-white shadow-lg">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-warm-900">浪费风险区</h1>
              <p className="text-sm text-warm-500">
                共 {atRiskFoods.length} 件食材需要关注
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-red-50 rounded-xl p-3 text-center border border-red-100">
            <p className="text-2xl font-bold text-red-500">{highRisk.length}</p>
            <p className="text-xs text-red-400">高风险</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
            <p className="text-2xl font-bold text-orange-500">{mediumRisk.length}</p>
            <p className="text-xs text-orange-400">中风险</p>
          </div>
          <div className="bg-yellow-50 rounded-xl p-3 text-center border border-yellow-100">
            <p className="text-2xl font-bold text-yellow-500">{lowRisk.length}</p>
            <p className="text-xs text-yellow-400">低风险</p>
          </div>
        </div>

        {atRiskFoods.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-warm-600 font-medium mb-2">太棒了！</p>
            <p className="text-warm-400 text-sm">目前没有需要关注的食材</p>
          </div>
        ) : (
          <>
            <RiskSection level="high" foods={highRisk} icon={<AlertTriangle size={18} />} />
            <RiskSection level="medium" foods={mediumRisk} icon={<Clock size={18} />} />
            <RiskSection level="low" foods={lowRisk} icon={<CalendarX size={18} />} />
          </>
        )}

        {atRiskFoods.length > 0 && (
          <div className="mt-8 bg-gradient-to-br from-secondary-50 to-cream-50 rounded-2xl p-5 border border-secondary-100">
            <h3 className="font-semibold text-warm-900 mb-3">💡 减少浪费小技巧</h3>
            <ul className="space-y-2 text-sm text-warm-600">
              <li>• 先把放得最久的食材吃掉</li>
              <li>• 解冻后的肉尽量当天吃完，不要反复冷冻</li>
              <li>• 买肉时按每次用量分装好，吃多少拿多少</li>
              <li>• 定期检查冰箱，清理过期食材</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
