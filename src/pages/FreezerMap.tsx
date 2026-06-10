import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  Clock,
  Filter,
  X,
  ChevronRight,
} from 'lucide-react';
import { useFreezerStore, getExpiryStatus, getExpiryBadgeClass } from '../store';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_TEXT_COLORS, Category, FreezerItem } from '../types';
import { differenceInDays, parseISO, format } from 'date-fns';

type ColorMode = 'expiry' | 'category' | 'opened';

export default function FreezerMap() {
  const navigate = useNavigate();
  const { items, layout, getExpiringItems, searchItemsByName } = useFreezerStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [colorMode, setColorMode] = useState<ColorMode>('expiry');
  const [selectedCell, setSelectedCell] = useState<{ drawer: number; cell: number } | null>(null);
  const [filterCategory, setFilterCategory] = useState<Category | 'all'>('all');

  const expiringItems = useMemo(() => getExpiringItems(7), [getExpiringItems]);
  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchItemsByName(searchQuery) : []),
    [searchQuery, searchItemsByName]
  );

  const itemsFiltered = useMemo(() => {
    let list = items;
    if (filterCategory !== 'all') {
      list = list.filter((it) => it.category === filterCategory);
    }
    return list;
  }, [items, filterCategory]);

  const getCellColor = (drawer: number, cell: number): string => {
    const cellItems = itemsFiltered.filter(
      (it) => it.position.drawer === drawer && it.position.cell === cell
    );
    if (cellItems.length === 0) return 'bg-white border-2 border-dashed border-gray-200';

    if (colorMode === 'expiry') {
      const mostUrgent = cellItems
        .map((it) => ({ item: it, status: getExpiryStatus(it.expiryDate) }))
        .sort((a, b) => {
          const order = ['expired', 'urgent', 'warning', 'soon', 'normal'];
          return order.indexOf(a.status) - order.indexOf(b.status);
        })[0];
      switch (mostUrgent.status) {
        case 'expired':
          return 'bg-gray-300';
        case 'urgent':
          return 'bg-expiring-urgent/90 pulse-warning';
        case 'warning':
          return 'bg-expiring-warning/80';
        case 'soon':
          return 'bg-expiring-soon/70';
        default:
          return 'bg-green-100';
      }
    } else if (colorMode === 'category') {
      const cat = cellItems[0].category;
      return CATEGORY_COLORS[cat] + '/80';
    } else {
      const hasOpened = cellItems.some((it) => it.isOpened);
      return hasOpened ? 'bg-purple-200' : 'bg-green-100';
    }
  };

  const getCellTextColor = (drawer: number, cell: number): string => {
    const cellItems = itemsFiltered.filter(
      (it) => it.position.drawer === drawer && it.position.cell === cell
    );
    if (cellItems.length === 0) return 'text-gray-400';

    if (colorMode === 'expiry') {
      const status = getExpiryStatus(
        cellItems.sort(
          (a, b) => parseISO(a.expiryDate).getTime() - parseISO(b.expiryDate).getTime()
        )[0].expiryDate
      );
      if (status === 'normal' || status === 'soon') return 'text-gray-800';
      return 'text-white';
    } else if (colorMode === 'category') {
      return 'text-white';
    } else {
      return 'text-gray-800';
    }
  };

  const getCellItems = (drawer: number, cell: number) =>
    itemsFiltered.filter((it) => it.position.drawer === drawer && it.position.cell === cell);

  const totalValue = useMemo(
    () => items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity / 1), 0),
    [items]
  );
  const totalItems = items.length;
  const expiringCount = expiringItems.filter(
    (it) => getExpiryStatus(it.expiryDate) === 'urgent' || getExpiryStatus(it.expiryDate) === 'expired'
  ).length;

  const ItemCard = ({ item, compact = false }: { item: FreezerItem; compact?: boolean }) => {
    const status = getExpiryStatus(item.expiryDate);
    const badgeClass = getExpiryBadgeClass(status);
    const daysLeft = differenceInDays(parseISO(item.expiryDate), new Date());

    return (
      <div
        onClick={() => navigate(`/item/${item.id}`)}
        className={`item-card bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md ${
          compact ? 'p-2' : ''
        }`}
      >
        <div className="flex items-start gap-2">
          {item.photo && (
            <img
              src={item.photo}
              alt={item.name}
              className={`${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-lg object-cover flex-shrink-0 bg-gray-100`}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-gray-800 truncate">{item.name}</span>
              {item.isOpened && (
                <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded-full">
                  已开封
                </span>
              )}
            </div>
            <div className={`text-xs ${CATEGORY_TEXT_COLORS[item.category]} font-medium`}>
              {CATEGORY_LABELS[item.category]}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-gray-700">
                {item.quantity}
                <span className="text-xs text-gray-500 font-normal ml-0.5">{item.unit}</span>
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badgeClass}`}>
                {daysLeft < 0
                  ? `已过期${-daysLeft}天`
                  : daysLeft === 0
                  ? '今天到期'
                  : `还剩${daysLeft}天`}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fade-in space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            🧊 冷冻库存地图
          </h1>
          <p className="text-gray-500 mt-1 text-sm">一目了然，找食材不翻箱倒柜</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="stats-grid grid grid-cols-3 gap-2 md:gap-4">
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="text-xl md:text-2xl font-bold text-freezer-accent">{totalItems}</div>
              <div className="text-[10px] md:text-xs text-gray-500">食材种类</div>
            </div>
            <div className="bg-white rounded-xl p-3 shadow-sm text-center">
              <div className="text-xl md:text-2xl font-bold text-green-600">
                ¥{totalValue.toFixed(0)}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500">库存价值</div>
            </div>
            <div
              className={`bg-white rounded-xl p-3 shadow-sm text-center cursor-pointer ${
                expiringCount > 0 ? 'ring-2 ring-expiring-urgent/30' : ''
              }`}
              onClick={() => navigate('/to-eat')}
            >
              <div
                className={`text-xl md:text-2xl font-bold ${
                  expiringCount > 0 ? 'text-expiring-urgent' : 'text-gray-400'
                }`}
              >
                {expiringCount}
              </div>
              <div className="text-[10px] md:text-xs text-gray-500">要过期</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 md:p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索食材名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-200 focus:border-freezer-accent focus:ring-2 focus:ring-freezer-accent/20 outline-none text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {(
                [
                  { key: 'expiry', label: '保质期' },
                  { key: 'category', label: '分类' },
                  { key: 'opened', label: '已开封' },
                ] as { key: ColorMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.key}
                  onClick={() => setColorMode(m.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    colorMode === m.key
                      ? 'bg-white text-freezer-accent shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setFilterCategory('all')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterCategory === 'all'
                    ? 'bg-white text-freezer-accent shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
              </button>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filterCategory === cat
                      ? `${CATEGORY_COLORS[cat]} text-white shadow-sm`
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {searchQuery && searchResults.length > 0 && (
          <div className="bg-sky-50 rounded-xl p-3 border border-sky-100">
            <div className="text-xs text-sky-700 font-medium mb-2">
              找到 {searchResults.length} 个匹配的食材：
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {searchResults.slice(0, 6).map((item) => (
                <ItemCard key={item.id} item={item} compact />
              ))}
            </div>
          </div>
        )}

        {colorMode === 'expiry' && (
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-200" /> 正常
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-expiring-soon/70" /> 两周内
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-expiring-warning/80" /> 一周内
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-expiring-urgent/90" /> 2天内
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-gray-300" /> 已过期
            </span>
          </div>
        )}

        <div className="space-y-5">
          {Array.from({ length: layout.drawers }).map((_, drawerIdx) => (
            <div key={drawerIdx} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-6 rounded-full bg-freezer-accent" />
                <h3 className="font-bold text-gray-700">{layout.drawerNames[drawerIdx]}</h3>
                <div className="text-xs text-gray-400">
                  (
                  {itemsFiltered.filter((it) => it.position.drawer === drawerIdx).length} 件食材)
                </div>
              </div>
              <div
                className="grid gap-2 md:gap-3"
                style={{ gridTemplateColumns: `repeat(${layout.cellsPerDrawer}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: layout.cellsPerDrawer }).map((_, cellIdx) => {
                  const cellItems = getCellItems(drawerIdx, cellIdx);
                  const isSelected =
                    selectedCell?.drawer === drawerIdx && selectedCell?.cell === cellIdx;

                  return (
                    <div key={cellIdx} className="relative">
                      <div
                        onClick={() =>
                          cellItems.length > 0
                            ? setSelectedCell(
                                isSelected ? null : { drawer: drawerIdx, cell: cellIdx }
                              )
                            : navigate('/add', {
                                state: {
                                  prefill: {
                                    position: { drawer: drawerIdx, cell: cellIdx },
                                  },
                                },
                              })
                        }
                        className={`drawer-cell aspect-[4/3] rounded-xl flex flex-col items-center justify-center cursor-pointer p-1.5 md:p-2 ${getCellColor(
                          drawerIdx,
                          cellIdx
                        )} ${getCellTextColor(drawerIdx, cellIdx)} ${
                          isSelected ? 'ring-4 ring-freezer-accent ring-offset-2' : ''
                        }`}
                      >
                        {cellItems.length === 0 ? (
                          <div className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="text-[10px] font-medium">
                              第{cellIdx + 1}格
                            </span>
                          </div>
                        ) : (
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] md:text-xs font-bold opacity-80">
                                第{cellIdx + 1}格
                              </span>
                              <span className="text-[10px] bg-black/20 text-white px-1.5 py-0.5 rounded-full font-medium">
                                {cellItems.length}
                              </span>
                            </div>
                            <div className="text-center">
                              <div className="text-[10px] md:text-xs font-bold line-clamp-1">
                                {cellItems[0].name}
                                {cellItems.length > 1 && ` 等${cellItems.length}项`}
                              </div>
                              <div className="text-[9px] md:text-[10px] mt-0.5 opacity-75">
                                {cellItems.reduce((s, i) => s + i.quantity, 0)}件
                              </div>
                            </div>
                            <div className="flex justify-center gap-0.5">
                              {cellItems.slice(0, 3).map((it) => (
                                <div
                                  key={it.id}
                                  className={`w-1.5 h-1.5 rounded-full ${CATEGORY_COLORS[it.category]}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {isSelected && cellItems.length > 0 && (
                        <div className="absolute z-20 left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 p-3 fade-in min-w-[240px]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-xs font-bold text-gray-700">
                              第{drawerIdx + 1}层 · 第{cellIdx + 1}格
                            </div>
                            <button
                              onClick={() => setSelectedCell(null)}
                              className="p-1 hover:bg-gray-100 rounded-lg"
                            >
                              <X className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                          </div>
                          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
                            {cellItems.map((item) => (
                              <ItemCard key={item.id} item={item} compact />
                            ))}
                          </div>
                          <button
                            onClick={() =>
                              navigate('/add', {
                                state: {
                                  prefill: {
                                    position: { drawer: drawerIdx, cell: cellIdx },
                                  },
                                },
                              })
                            }
                            className="w-full mt-2 py-2 text-xs font-medium text-freezer-accent bg-sky-50 rounded-lg hover:bg-sky-100 transition-colors flex items-center justify-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" /> 放更多食材
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {expiringItems.length > 0 && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-5 shadow-sm border border-orange-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-expiring-warning/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-expiring-warning" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">⚠️ 先入先出提醒</h3>
                <p className="text-xs text-gray-500">以下食材快过期了，优先吃掉！</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/to-eat')}
              className="text-sm font-medium text-freezer-accent hover:underline flex items-center gap-1"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiringItems.slice(0, 6).map((item) => (
              <ItemCard key={item.id} item={item} compact />
            ))}
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
