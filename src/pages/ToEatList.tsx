import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ChefHat,
  Sparkles,
  X,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { useFreezerStore, getExpiryStatus, getExpiryBadgeClass } from '../store';
import { CATEGORY_LABELS, CATEGORY_TEXT_COLORS, FreezerItem } from '../types';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function ToEatList() {
  const navigate = useNavigate();
  const { items, toEatList, removeFromEatList, consumeQuantity, getExpiringItems, clearExpiredItems } =
    useFreezerStore();

  const [activeTab, setActiveTab] = useState<'expiring' | 'list'>('expiring');
  const expiring7 = useMemo(() => getExpiringItems(7), [getExpiringItems]);
  const expiring14 = useMemo(() => getExpiringItems(14), [getExpiringItems]);

  const toEatItems = useMemo(
    () =>
      toEatList
        .map((id) => items.find((i) => i.id === id))
        .filter((i): i is FreezerItem => !!i)
        .sort(
          (a, b) => parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime()
        ),
    [toEatList, items]
  );

  const expiredItems = useMemo(
    () => items.filter((it) => getExpiryStatus(it.expiryDate) === 'expired'),
    [items]
  );

  const ItemCard = ({ item, showRemove = false }: { item: FreezerItem; showRemove?: boolean }) => {
    const status = getExpiryStatus(item.expiryDate);
    const daysLeft = differenceInDays(parseISO(item.expiryDate), new Date());

    return (
      <div
        className={`item-card bg-white rounded-2xl p-4 shadow-sm border ${
          status === 'urgent' || status === 'expired'
            ? 'border-expiring-urgent/30'
            : status === 'warning'
            ? 'border-expiring-warning/30'
            : 'border-gray-100'
        } ${status === 'urgent' ? 'pulse-warning' : ''}`}
      >
        <div className="flex items-start gap-3" onClick={() => navigate(`/item/${item.id}`)}>
          {item.photo ? (
            <img
              src={item.photo}
              alt={item.name}
              className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0 cursor-pointer"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-3xl flex-shrink-0 cursor-pointer">
              🥩
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-gray-800 truncate cursor-pointer hover:text-freezer-accent">
                  {item.name}
                </h3>
                <div className={`text-xs font-medium ${CATEGORY_TEXT_COLORS[item.category]}`}>
                  {CATEGORY_LABELS[item.category]}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getExpiryBadgeClass(status)}`}>
                {daysLeft < 0
                  ? `过期${-daysLeft}天`
                  : daysLeft === 0
                  ? '今天'
                  : `${daysLeft}天`}
              </span>
            </div>

            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-gray-800">
                  {item.quantity}
                  <span className="text-xs text-gray-500 font-normal ml-0.5">{item.unit}</span>
                </div>
                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  第{item.position.drawer + 1}层·{item.position.cell + 1}格
                </span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              consumeQuantity(item.id, 1);
            }}
            className="flex-1 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            吃 1{item.unit}
          </button>
          {item.quantity > 1 && (
            <button
              onClick={() => consumeQuantity(item.id, Math.min(2, item.quantity))}
              className="flex-1 py-2 rounded-xl bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200 transition-colors"
            >
              吃 2{item.unit}
            </button>
          )}
          <button
            onClick={() => navigate(`/item/${item.id}`)}
            className="py-2 px-3 rounded-xl bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200 transition-colors flex items-center gap-1"
          >
            详情 <ArrowRight className="w-3.5 h-3.5" />
          </button>
          {showRemove && (
            <button
              onClick={() => removeFromEatList(item.id)}
              className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              title="从待吃清单移除"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
          🛒 待吃清单
        </h1>
        <p className="text-gray-500 mt-1 text-sm">先入先出，别让好食材浪费了</p>
      </div>

      {expiredItems.length > 0 && (
        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-5 shadow-sm border border-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 bg-gray-400/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-6 h-6 text-gray-600" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-gray-800">
                🗑️ 有 {expiredItems.length} 件食材已过期
              </div>
              <div className="text-sm text-gray-600 mt-1">
                清理过期食材，保持冷冻库整洁
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={clearExpiredItems}
                  className="px-4 py-2 rounded-xl bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  一键清理过期
                </button>
                <button
                  onClick={() => setActiveTab('expiring')}
                  className="px-4 py-2 rounded-xl bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  查看详情
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 bg-white rounded-xl p-1.5 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('expiring')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'expiring'
              ? 'bg-freezer-accent text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          快过期 ({expiring7.length})
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'list'
              ? 'bg-freezer-accent text-white shadow-sm'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          我的待吃 ({toEatItems.length})
        </button>
      </div>

      {activeTab === 'expiring' ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 via-orange-50 to-amber-50 rounded-2xl p-5 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-expiring-urgent/20 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-expiring-urgent" />
              </div>
              <div>
                <div className="font-bold text-gray-800">2天内紧急！</div>
                <div className="text-xs text-gray-500">这些要优先吃，不然就浪费了</div>
              </div>
            </div>
            {expiring7.filter((it) => differenceInDays(parseISO(it.expiryDate), new Date()) <= 2)
              .length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expiring7
                  .filter((it) => differenceInDays(parseISO(it.expiryDate), new Date()) <= 2)
                  .map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🎉</div>
                <div>太棒了，没有紧急过期的食材！</div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-expiring-warning/20 rounded-xl flex items-center justify-center">
                  <ChefHat className="w-5 h-5 text-expiring-warning" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">一周内要吃</div>
                  <div className="text-xs text-gray-500">
                    {expiring7.filter((it) => {
                      const d = differenceInDays(parseISO(it.expiryDate), new Date());
                      return d > 2 && d <= 7;
                    }).length}{' '}
                    件
                  </div>
                </div>
              </div>
            </div>
            {expiring7.filter((it) => {
              const d = differenceInDays(parseISO(it.expiryDate), new Date());
              return d > 2 && d <= 7;
            }).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {expiring7
                  .filter((it) => {
                    const d = differenceInDays(parseISO(it.expiryDate), new Date());
                    return d > 2 && d <= 7;
                  })
                  .map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">暂无</div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-expiring-soon/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-700" />
                </div>
                <div>
                  <div className="font-bold text-gray-800">两周内提醒</div>
                  <div className="text-xs text-gray-500">
                    {expiring14.filter((it) => {
                      const d = differenceInDays(parseISO(it.expiryDate), new Date());
                      return d > 7 && d <= 14;
                    }).length}{' '}
                    件
                  </div>
                </div>
              </div>
            </div>
            {expiring14.filter((it) => {
              const d = differenceInDays(parseISO(it.expiryDate), new Date());
              return d > 7 && d <= 14;
            }).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {expiring14
                  .filter((it) => {
                    const d = differenceInDays(parseISO(it.expiryDate), new Date());
                    return d > 7 && d <= 14;
                  })
                  .map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">暂无</div>
            )}
          </div>

          {expiredItems.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gray-400/30 rounded-xl flex items-center justify-center">
                    <Trash2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-700">已过期 ({expiredItems.length})</div>
                    <div className="text-xs text-gray-500">建议清理</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70">
                {expiredItems.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {toEatItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {toEatItems.map((item) => (
                <ItemCard key={item.id} item={item} showRemove />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
              <div className="text-6xl mb-4">🍽️</div>
              <div className="text-xl font-bold text-gray-700 mb-2">待吃清单是空的</div>
              <div className="text-gray-500 mb-6 text-sm">
                把快过期或想吃的食材加进来吧，从快过期页面开始
              </div>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setActiveTab('expiring')}
                  className="px-5 py-2.5 rounded-xl bg-freezer-accent text-white font-medium hover:bg-sky-700 transition-colors flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  查看快过期
                </button>
                <button
                  onClick={() => navigate('/recipes')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 text-white font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <ChefHat className="w-4 h-4" />
                  看菜谱灵感
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="fixed bottom-24 md:bottom-8 right-4 md:right-8 z-20">
        <button
          onClick={() => navigate('/add')}
          className="w-14 h-14 rounded-2xl bg-freezer-accent text-white shadow-lg shadow-sky-300/50 hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
