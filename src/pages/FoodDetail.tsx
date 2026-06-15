import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit2,
  Trash2,
  Refrigerator,
  Droplets,
  ChefHat,
  Undo2,
  Clock,
  Calendar,
  Package,
  AlertTriangle,
  History,
} from 'lucide-react';
import { useFoodStore } from '@/store/useFoodStore';
import StatusBadge from '@/components/StatusBadge';
import AddFoodModal from '@/components/AddFoodModal';
import { DRAWERS, MEAT_CATEGORIES } from '@/data/drawers';
import {
  getThawProgress,
  getThawReadyTime,
  getRemainingThawTime,
  getThawMethodLabel,
  getAverageThawTime,
  getThawTimeRange,
} from '@/utils/thawTime';
import {
  formatDate,
  formatTime,
  formatDuration,
  formatDateTime,
  daysBetween,
} from '@/utils/dateUtils';
import { assessRisk } from '@/utils/riskAssessment';
import { cn } from '@/lib/utils';
import type { ThawMethod } from '@/types';

export default function FoodDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    foods,
    getFoodById,
    getThawHistoryForFood,
    startThaw,
    returnToFreeze,
    markAsCooked,
    deleteFood,
    updateFood,
  } = useFoodStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showReturnInput, setShowReturnInput] = useState(false);
  const [returnNote, setReturnNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const food = getFoodById(id || '');
  const thawHistory = getThawHistoryForFood(id || '');

  if (!food) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-warm-500 mb-4">食材不存在</p>
          <button
            onClick={() => navigate('/inventory')}
            className="text-primary-500 font-medium"
          >
            返回食材库
          </button>
        </div>
      </div>
    );
  }

  const risk = assessRisk(food);
  const drawer = DRAWERS.find((d) => d.id === food.drawer);
  const meatCategory = MEAT_CATEGORIES.find((m) => m.id === food.category);
  const frozenDays = daysBetween(food.frozenDate, new Date());

  const thawProgress =
    food.status === 'thawing' && food.thawStartTime && food.thawMethod
      ? getThawProgress(food.thawStartTime, food.weight, food.thawMethod)
      : 0;

  const readyTime =
    food.status === 'thawing' && food.thawStartTime && food.thawMethod
      ? getThawReadyTime(food.thawStartTime, food.weight, food.thawMethod)
      : null;

  const remainingTime =
    food.status === 'thawing' && food.thawStartTime && food.thawMethod
      ? getRemainingThawTime(food.thawStartTime, food.weight, food.thawMethod)
      : 0;

  const handleStartThaw = (method: ThawMethod) => {
    startThaw(food.id, method);
  };

  const handleReturn = () => {
    returnToFreeze(food.id, returnNote || undefined);
    setShowReturnInput(false);
    setReturnNote('');
  };

  const handleCooked = () => {
    if (confirm('确认这份食材已经烹饪/使用了吗？')) {
      markAsCooked(food.id);
      navigate('/inventory');
    }
  };

  const handleDelete = () => {
    deleteFood(food.id);
    navigate('/inventory');
  };

  const handleEditSubmit = (data: any) => {
    updateFood(food.id, data);
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      start_thaw: '开始解冻',
      return_freeze: '放回冷冻',
      cook: '已烹饪',
      discard: '已丢弃',
    };
    return labels[action] || action;
  };

  const getActionIcon = (action: string) => {
    const icons: Record<string, string> = {
      start_thaw: '💧',
      return_freeze: '❄️',
      cook: '🍳',
      discard: '🗑️',
    };
    return icons[action] || '📌';
  };

  const fridgeTimeRange = getThawTimeRange(food.weight, 'fridge');
  const coldWaterTimeRange = getThawTimeRange(food.weight, 'cold_water');

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream-50 to-white pb-32">
      <div className="sticky top-0 z-30 bg-gradient-to-b from-cream-50 via-cream-50/95 to-transparent">
        <div className="max-w-lg mx-auto px-4 pt-4 pb-2">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 text-warm-600 hover:text-warm-800 hover:bg-white/50 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2 text-warm-500 hover:text-warm-700 hover:bg-white/50 rounded-full transition-colors"
              >
                <Edit2 size={20} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-6">
          <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-cream-100 via-cream-200 to-cream-300 flex items-center justify-center text-6xl mb-4 shadow-soft">
            {meatCategory?.emoji || '🍖'}
          </div>
          <h1 className="text-2xl font-bold text-warm-900 mb-2">{food.name}</h1>
          <div className="flex items-center justify-center gap-3">
            <StatusBadge status={food.status} />
            <span className="text-warm-400">{food.weight}g</span>
          </div>
        </div>

        {risk.level !== 'none' && (
          <div
            className={cn(
              'rounded-2xl p-4 mb-6 border',
              risk.level === 'high' && 'bg-red-50 border-red-200',
              risk.level === 'medium' && 'bg-orange-50 border-orange-200',
              risk.level === 'low' && 'bg-yellow-50 border-yellow-200'
            )}
          >
            <div className="flex items-start gap-3">
              <AlertTriangle
                className={cn(
                  'flex-shrink-0 mt-0.5',
                  risk.level === 'high' && 'text-red-500',
                  risk.level === 'medium' && 'text-orange-500',
                  risk.level === 'low' && 'text-yellow-500'
                )}
                size={20}
              />
              <div>
                <p
                  className={cn(
                    'font-medium',
                    risk.level === 'high' && 'text-red-700',
                    risk.level === 'medium' && 'text-orange-700',
                    risk.level === 'low' && 'text-yellow-700'
                  )}
                >
                  {risk.reasons.join('、')}
                </p>
                <p
                  className={cn(
                    'text-sm mt-1',
                    risk.level === 'high' && 'text-red-600',
                    risk.level === 'medium' && 'text-orange-600',
                    risk.level === 'low' && 'text-yellow-600'
                  )}
                >
                  {risk.suggestion}
                </p>
              </div>
            </div>
          </div>
        )}

        {food.status === 'thawing' && food.thawMethod && (
          <div className="bg-white rounded-2xl p-5 shadow-soft mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-warm-900">解冻进度</h2>
              <span className="text-sm text-secondary-600 font-medium">
                {getThawMethodLabel(food.thawMethod)}
              </span>
            </div>

            <div className="mb-3">
              <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-secondary-400 to-secondary-500 rounded-full transition-all duration-1000"
                  style={{ width: `${thawProgress}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-cream-50 rounded-xl p-3">
                <p className="text-xs text-warm-400 mb-1">已解冻</p>
                <p className="font-bold text-warm-900">
                  {Math.round(thawProgress)}%
                </p>
              </div>
              <div className="bg-secondary-50 rounded-xl p-3">
                <p className="text-xs text-warm-400 mb-1">预计可切</p>
                <p className="font-bold text-secondary-600">
                  {readyTime ? formatTime(readyTime) : '-'}
                </p>
              </div>
            </div>

            {thawProgress < 100 && (
              <p className="text-center text-sm text-warm-500 mt-3">
                还需约 {formatDuration(remainingTime)}
              </p>
            )}

            {thawProgress >= 100 && (
              <div className="mt-3 p-3 bg-green-50 rounded-xl text-center">
                <p className="text-green-600 font-medium">✅ 已解冻完成，可以切啦！</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl p-5 shadow-soft mb-6">
          <h2 className="font-bold text-warm-900 mb-4">食材信息</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center">
                <Package size={18} className="text-warm-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-warm-400">分类</p>
                <p className="text-warm-900">
                  {meatCategory?.emoji} {meatCategory?.name || '未分类'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center">
                <span className="text-lg">{drawer?.icon}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm text-warm-400">位置</p>
                <p className="text-warm-900">{drawer?.name || '未知'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center">
                <Calendar size={18} className="text-warm-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-warm-400">冷冻日期</p>
                <p className="text-warm-900">
                  {formatDate(food.frozenDate)}
                  <span className="text-warm-400 text-sm ml-2">
                    （{frozenDays} 天前）
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center">
                <Clock size={18} className="text-warm-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-warm-400">保质期</p>
                <p className="text-warm-900">{food.shelfLifeDays} 天</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cream-100 flex items-center justify-center">
                🔄
              </div>
              <div className="flex-1">
                <p className="text-sm text-warm-400">解冻次数</p>
                <p className={cn(
                  food.thawCount > 1 ? 'text-orange-500 font-medium' : 'text-warm-900'
                )}>
                  {food.thawCount} 次
                  {food.thawCount > 1 && ' ⚠️'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {food.suitableDishes.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-soft mb-6">
            <h2 className="font-bold text-warm-900 mb-3">适合菜式</h2>
            <div className="flex flex-wrap gap-2">
              {food.suitableDishes.map((dish) => (
                <span
                  key={dish}
                  className="px-3 py-1.5 bg-cream-50 text-warm-700 rounded-full text-sm"
                >
                  🍽️ {dish}
                </span>
              ))}
            </div>
          </div>
        )}

        {food.status === 'frozen' && (
          <div className="bg-white rounded-2xl p-5 shadow-soft mb-6">
            <h2 className="font-bold text-warm-900 mb-3">解冻时长参考</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Refrigerator className="text-secondary-500" size={20} />
                  <span className="text-warm-700">冷藏解冻</span>
                </div>
                <span className="font-medium text-secondary-600">
                  {fridgeTimeRange.min} - {fridgeTimeRange.max} 小时
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Droplets className="text-blue-500" size={20} />
                  <span className="text-warm-700">冷水解冻</span>
                </div>
                <span className="font-medium text-blue-600">
                  {coldWaterTimeRange.min} - {coldWaterTimeRange.max} 小时
                </span>
              </div>
            </div>
          </div>
        )}

        {thawHistory.length > 0 && (
          <div className="bg-white rounded-2xl p-5 shadow-soft mb-6">
            <div className="flex items-center gap-2 mb-4">
              <History size={20} className="text-warm-500" />
              <h2 className="font-bold text-warm-900">解冻记录</h2>
            </div>
            <div className="space-y-3">
              {thawHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 pb-3 border-b border-warm-50 last:border-0 last:pb-0"
                >
                  <div className="w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center text-lg flex-shrink-0">
                    {getActionIcon(record.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-warm-900">
                      {getActionLabel(record.action)}
                    </p>
                    <p className="text-xs text-warm-400">
                      {formatDateTime(record.timestamp)}
                    </p>
                    {record.note && (
                      <p className="text-sm text-warm-500 mt-1">📝 {record.note}</p>
                    )}
                    {record.method && (
                      <p className="text-xs text-secondary-500 mt-1">
                        方式：{getThawMethodLabel(record.method)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-warm-100 p-4 z-40">
        <div className="max-w-lg mx-auto">
          {food.status === 'frozen' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleStartThaw('fridge')}
                className="flex items-center justify-center gap-2 py-3 bg-secondary-500 text-white rounded-xl font-medium shadow-lg hover:bg-secondary-600 transition-colors"
              >
                <Refrigerator size={20} />
                冷藏解冻
              </button>
              <button
                onClick={() => handleStartThaw('cold_water')}
                className="flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-xl font-medium shadow-lg hover:bg-blue-600 transition-colors"
              >
                <Droplets size={20} />
                冷水解冻
              </button>
            </div>
          )}

          {food.status === 'thawing' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleCooked}
                className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-medium shadow-lg hover:bg-green-600 transition-colors"
              >
                <ChefHat size={20} />
                已切好
              </button>
              <button
                onClick={() => setShowReturnInput(true)}
                className="flex items-center justify-center gap-2 py-3 bg-warm-200 text-warm-700 rounded-xl font-medium hover:bg-warm-300 transition-colors"
              >
                <Undo2 size={20} />
                不放回
              </button>
            </div>
          )}

          {food.thawCount > 1 && (
            <p className="text-center text-xs text-orange-500 mt-2">
              ⚠️ 已反复解冻 {food.thawCount} 次，建议尽快食用，不要再冻回去
            </p>
          )}
        </div>
      </div>

      {showReturnInput && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm mx-4 rounded-2xl p-5 animate-slide-up">
            <h3 className="font-bold text-warm-900 mb-2">放回冷冻？</h3>
            <p className="text-sm text-warm-500 mb-4">
              {food.thawCount >= 1 && (
                <span className="text-orange-500">
                  ⚠️ 这是第 {food.thawCount + 1} 次解冻，反复解冻会影响口感和品质
                </span>
              )}
            </p>
            <textarea
              value={returnNote}
              onChange={(e) => setReturnNote(e.target.value)}
              placeholder="备注（可选）"
              className="w-full px-4 py-3 rounded-xl border border-warm-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition-all mb-4 resize-none"
              rows={2}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowReturnInput(false)}
                className="flex-1 py-2.5 bg-warm-100 text-warm-600 rounded-xl font-medium hover:bg-warm-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleReturn}
                className="flex-1 py-2.5 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                确认放回
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-sm mx-4 rounded-2xl p-5 animate-slide-up">
            <h3 className="font-bold text-warm-900 mb-2">删除食材？</h3>
            <p className="text-sm text-warm-500 mb-4">
              删除后无法恢复，确定要删除 {food.name} 吗？
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 bg-warm-100 text-warm-600 rounded-xl font-medium hover:bg-warm-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}

      <AddFoodModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        editFood={food}
      />
    </div>
  );
}
