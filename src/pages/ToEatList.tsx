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
  CheckSquare,
  Square,
  Minus,
  ListPlus,
  XCircle,
} from 'lucide-react';
import { useFreezerStore, getExpiryStatus, getExpiryBadgeClass } from '../store';
import { CATEGORY_LABELS, CATEGORY_TEXT_COLORS, FreezerItem } from '../types';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function ToEatList() {
  const navigate = useNavigate();
  const {
    items,
    toEatList,
    removeFromEatList,
    consumeQuantity,
    getExpiringItems,
    clearExpiredItems,
    addToEatList,
  } = useFreezerStore();

  const [activeTab, setActiveTab] = useState<'expiring' | 'list'>('expiring');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const expiring7 = useMemo(() => getExpiringItems(7), [getExpiringItems]);
  const expiring14 = useMemo(() => getExpiringItems(14), [getExpiringItems]);

  const urgentItems = useMemo(
    () => expiring7.filter((it) => differenceInDays(parseISO(it.expiryDate), new Date()) <= 2),
    [expiring7]
  );
  const weekItems = useMemo(
    () =>
      expiring7.filter((it) => {
        const d = differenceInDays(parseISO(it.expiryDate), new Date());
        return d > 2 && d <= 7;
      }),
    [expiring7]
  );
  const twoWeekItems = useMemo(
    () =>
      expiring14.filter((it) => {
        const d = differenceInDays(parseISO(it.expiryDate), new Date());
        return d > 7 && d <= 14;
      }),
    [expiring14]
  );

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

  const allExpiringItems = useMemo(() => {
    const seen = new Set<string>();
    const result: FreezerItem[] = [];
    [...urgentItems, ...weekItems, ...twoWeekItems, ...expiredItems].forEach((it) => {
      if (!seen.has(it.id)) {
        seen.add(it.id);
        result.push(it);
      }
    });
    return result;
  }, [urgentItems, weekItems, twoWeekItems, expiredItems]);

  const selectedItems = useMemo(() => {
    const pool = activeTab === 'expiring' ? allExpiringItems : toEatItems;
    return pool.filter((it) => selectedIds.has(it.id));
  }, [activeTab, allExpiringItems, toEatItems, selectedIds]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = (list: FreezerItem[]) => {
    const allSelected = list.every((it) => selectedIds.has(it.id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        list.forEach((it) => next.delete(it.id));
      } else {
        list.forEach((it) => next.add(it.id));
      }
      return next;
    });
  };

  const handleBatchAddToList = () => {
    if (selectedItems.length === 0) return;
    let count = 0;
    selectedItems.forEach((it) => {
      if (!toEatList.includes(it.id)) {
        addToEatList(it.id);
        count++;
      }
    });
    setSelectedIds(new Set());
    showToast(`✅ 已将 ${count} 项加入待吃清单`);
  };

  const handleBatchConsume = () => {
    if (selectedItems.length === 0) return;
    let count = 0;
    selectedItems.forEach((it) => {
      if (it.quantity >= 1) {
        consumeQuantity(it.id, 1, '批量取用');
        count++;
      }
    });
    setSelectedIds(new Set());
    showToast(`🍽️ 已批量取用 ${count} 项，每项扣 1 份`);
  };

  const handleBatchRemoveFromList = () => {
    if (selectedItems.length === 0) return;
    const count = selectedItems.filter((it) => toEatList.includes(it.id)).length;
    selectedItems.forEach((it) => {
      if (toEatList.includes(it.id)) {
        removeFromEatList(it.id);
      }
    });
    setSelectedIds(new Set());
    showToast(`🗑️ 已从待吃清单移除 ${count} 项`);
  };

  const ItemCard = ({
    item,
    showRemove = false,
    selectable = false,
    selected = false,
    onToggle,
  }: {
    item: FreezerItem;
    showRemove?: boolean;
    selectable?: boolean;
    selected?: boolean;
    onToggle?: (id: string) => void;
  }) => {
    const status = getExpiryStatus(item.expiryDate);
    const daysLeft = differenceInDays(parseISO(item.expiryDate), new Date());

    return (
      <div
        className={`item-card bg-white rounded-2xl p-4 shadow-sm border transition-all ${
          selected
            ? 'border-freezer-accent ring-2 ring-freezer-accent/30 bg-sky-50/40'
            : status === 'urgent' || status === 'expired'
            ? 'border-expiring-urgent/30'
            : status === 'warning'
            ? 'border-expiring-warning/30'
            : 'border-gray-100'
        } ${status === 'urgent' ? 'pulse-warning' : ''}`}
      >
        <div className="flex items-start gap-3">
          {selectable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle?.(item.id);
              }}
              className="mt-1 flex-shrink-0"
            >
              {selected ? (
                <CheckSquare className="w-5 h-5 text-freezer-accent" />
              ) : (
                <Square className="w-5 h-5 text-gray-300 hover:text-gray-400" />
              )}
            </button>
          )}
          <div
            className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer"
            onClick={() => navigate(`/item/${item.id}`)}
          >
            {item.photo ? (
              <img
                src={item.photo}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center text-3xl flex-shrink-0">
                🥩
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-gray-800 truncate hover:text-freezer-accent">
                    {item.name}
                  </h3>
                  <div
                    className={`text-xs font-medium ${CATEGORY_TEXT_COLORS[item.category]}`}
                  >
                    {CATEGORY_LABELS[item.category]}
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getExpiryBadgeClass(
                    status
                  )}`}
                >
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
                    <span className="text-xs text-gray-500 font-normal ml-0.5">
                      {item.unit}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                    第{item.position.drawer + 1}层·{item.position.cell + 1}格
                  </span>
                </div>
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

  const SectionHeader = ({
    title,
    subtitle,
    iconColor,
    iconBg,
    list,
  }: {
    title: string;
    subtitle: string;
    iconColor: string;
    iconBg: string;
    list: FreezerItem[];
  }) => {
    if (list.length === 0) return null;
    const allSelected = list.every((it) => selectedIds.has(it.id));
    const someSelected = list.some((it) => selectedIds.has(it.id));
    return (
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
            <AlertTriangle className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div>
            <div className="font-bold text-gray-800">{title}</div>
            <div className="text-xs text-gray-500">{subtitle}</div>
          </div>
        </div>
        <button
          onClick={() => toggleSelectAll(list)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            allSelected
              ? 'bg-freezer-accent text-white'
              : someSelected
              ? 'bg-sky-100 text-freezer-accent'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {allSelected ? (
            <CheckSquare className="w-3.5 h-3.5" />
          ) : (
            <Square className="w-3.5 h-3.5" />
          )}
          全选 ({list.filter((it) => selectedIds.has(it.id)).length}/{list.length})
        </button>
      </div>
    );
  };

  return (
    <div className="fade-in space-y-6 pb-24">
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
          onClick={() => {
            setActiveTab('expiring');
            setSelectedIds(new Set());
          }}
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
          onClick={() => {
            setActiveTab('list');
            setSelectedIds(new Set());
          }}
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
            <SectionHeader
              title="2天内紧急！"
              subtitle="这些要优先吃，不然就浪费了"
              iconColor="text-expiring-urgent"
              iconBg="bg-expiring-urgent/20"
              list={urgentItems}
            />
            {urgentItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {urgentItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selectable
                    selected={selectedIds.has(item.id)}
                    onToggle={toggleSelect}
                  />
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
            <SectionHeader
              title="一周内要吃"
              subtitle={`${weekItems.length} 件`}
              iconColor="text-expiring-warning"
              iconBg="bg-expiring-warning/20"
              list={weekItems}
            />
            {weekItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {weekItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selectable
                    selected={selectedIds.has(item.id)}
                    onToggle={toggleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">暂无</div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <SectionHeader
              title="两周内提醒"
              subtitle={`${twoWeekItems.length} 件`}
              iconColor="text-yellow-700"
              iconBg="bg-expiring-soon/30"
              list={twoWeekItems}
            />
            {twoWeekItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {twoWeekItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selectable
                    selected={selectedIds.has(item.id)}
                    onToggle={toggleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">暂无</div>
            )}
          </div>

          {expiredItems.length > 0 && (
            <div className="bg-gray-100 rounded-2xl p-5 shadow-sm">
              <SectionHeader
                title="已过期"
                subtitle="建议清理"
                iconColor="text-gray-600"
                iconBg="bg-gray-400/30"
                list={expiredItems}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-70">
                {expiredItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selectable
                    selected={selectedIds.has(item.id)}
                    onToggle={toggleSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {toEatItems.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  共 {toEatItems.length} 项待吃食材
                </div>
                <button
                  onClick={() => toggleSelectAll(toEatItems)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    toEatItems.every((it) => selectedIds.has(it.id))
                      ? 'bg-freezer-accent text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {toEatItems.every((it) => selectedIds.has(it.id)) ? (
                    <CheckSquare className="w-3.5 h-3.5" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  全选
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {toEatItems.map((item) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    selectable
                    selected={selectedIds.has(item.id)}
                    onToggle={toggleSelect}
                    showRemove
                  />
                ))}
              </div>
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

      {selectedIds.size > 0 && (
        <div className="fixed bottom-24 md:bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 z-40 max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 fade-in">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-freezer-accent" />
                <div className="text-sm font-medium text-gray-700">
                  已选择 <span className="text-freezer-accent font-bold">{selectedIds.size}</span>{' '}
                  项食材
                </div>
              </div>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {activeTab === 'expiring' && (
                <button
                  onClick={handleBatchAddToList}
                  className="py-2.5 rounded-xl bg-freezer-accent text-white text-sm font-medium hover:bg-sky-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  <ListPlus className="w-4 h-4" />
                  加入待吃
                </button>
              )}
              <button
                onClick={handleBatchConsume}
                className="py-2.5 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1.5"
              >
                <Minus className="w-4 h-4" />
                各扣 1 份
              </button>
              {activeTab === 'list' && (
                <button
                  onClick={handleBatchRemoveFromList}
                  className="py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" />
                  移出待吃
                </button>
              )}
              {activeTab === 'expiring' && (
                <button
                  onClick={() => {
                    if (confirm('确定将选中的标记为过期丢弃吗？')) {
                      let count = 0;
                      selectedItems.forEach((it) => {
                        if (getExpiryStatus(it.expiryDate) !== 'expired') {
                          // 只是加到已过期清理，走 deleteItem 带 expired reason
                          // 直接调 deleteItem 的话会同时从 items 移除，跟 clearExpiredItems 一致
                          // 这里用 store 的 deleteItem
                          const { deleteItem } = useFreezerStore.getState();
                          deleteItem(it.id, 'expired');
                          count++;
                        }
                      });
                      setSelectedIds(new Set());
                      showToast(`🗑️ 已丢弃 ${count} 项`);
                    }
                  }}
                  className="py-2.5 rounded-xl bg-gray-500 text-white text-sm font-medium hover:bg-gray-600 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  标记丢弃
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 fade-in">
          <div className="bg-gray-800 text-white px-6 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2">
            {toast}
          </div>
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
