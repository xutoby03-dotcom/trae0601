import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Grid3X3,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { CATEGORY_LABEL, ITEM_STATUS_LABEL, ItemCategory, InventoryItem, ItemStatus } from '@/types';
import Button from '@/components/Button';

const statusBadgeClass: Record<string, string> = {
  normal: 'badge-success',
  expired: 'badge-danger',
  damaged: 'badge-danger',
  'low-stock': 'badge-warning',
};

const statusFilterOptions: { value: ItemStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'normal', label: '正常' },
  { value: 'expired', label: '已过期' },
  { value: 'damaged', label: '已破损' },
  { value: 'low-stock', label: '库存不足' },
];

export default function InventoryList() {
  const { boxes, items, deleteItem, updateItem } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ItemStatus | 'all'>(
    (searchParams.get('status') as ItemStatus) ?? 'all'
  );
  const initialBoxId = searchParams.get('boxId');
  const [expandedBoxes, setExpandedBoxes] = useState<Set<string>>(() => {
    if (initialBoxId && boxes.some(b => b.id === initialBoxId)) {
      return new Set([initialBoxId]);
    }
    return new Set(boxes.map(b => b.id));
  });

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; value: string }[] = [];
    if (searchParams.get('search')) {
      list.push({ key: 'search', label: '搜索', value: searchParams.get('search')! });
    }
    if (searchParams.get('boxId')) {
      const box = boxes.find(b => b.id === searchParams.get('boxId'));
      if (box) list.push({ key: 'boxId', label: '药箱', value: box.location });
    }
    if (searchParams.get('status')) {
      list.push({
        key: 'status',
        label: '状态',
        value: ITEM_STATUS_LABEL[searchParams.get('status') as ItemStatus] ?? searchParams.get('status')!,
      });
    }
    return list;
  }, [searchParams, boxes]);

  const clearFilter = (key: string) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    if (key === 'search') setSearch('');
    if (key === 'boxId') setExpandedBoxes(new Set(boxes.map(b => b.id)));
    if (key === 'status') setStatusFilter('all');
    setSearchParams(next, { replace: true });
  };

  const clearAllFilters = () => {
    setSearch('');
    setCategoryFilter('all');
    setStatusFilter('all');
    setExpandedBoxes(new Set(boxes.map(b => b.id)));
    setSearchParams({}, { replace: true });
  };

  const toggleBox = (boxId: string) => {
    const next = new Set(expandedBoxes);
    if (next.has(boxId)) next.delete(boxId);
    else next.add(boxId);
    setExpandedBoxes(next);
  };

  const filteredItems = items.filter(i => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    if (initialBoxId && i.boxId !== initialBoxId) return false;
    if (search && !i.name.includes(search) && !i.storageCell.includes(search)) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">库存管理</h1>
          <p className="text-sm text-zinc-500 mt-1">管理各类物品库存、效期和存放位置</p>
        </div>
        <Link to="/inventory/new">
          <Button>
            <Plus className="w-4 h-4" />
            物品入库
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-100 p-4 shadow-card space-y-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="搜索物品名称、存放格..."
              className="input pl-10"
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set('search', e.target.value);
                else next.delete('search');
                setSearchParams(next, { replace: true });
              }}
            />
          </div>
          <select
            className="input max-w-[180px]"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as ItemCategory | 'all')}
          >
            <option value="all">全部类别</option>
            {(Object.keys(CATEGORY_LABEL) as ItemCategory[]).map(c => (
              <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
            ))}
          </select>
          <select
            className="input max-w-[160px]"
            value={statusFilter}
            onChange={e => {
              const v = e.target.value as ItemStatus | 'all';
              setStatusFilter(v);
              const next = new URLSearchParams(searchParams);
              if (v !== 'all') next.set('status', v);
              else next.delete('status');
              setSearchParams(next, { replace: true });
            }}
          >
            {statusFilterOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center pt-2 border-t border-zinc-100">
            <span className="text-xs text-zinc-500">当前筛选:</span>
            {activeFilters.map(f => (
              <span
                key={f.key}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md"
              >
                {f.label}: {f.value}
                <button
                  onClick={() => clearFilter(f.key)}
                  className="ml-0.5 hover:text-primary-900"
                  aria-label="清除筛选"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <button
              onClick={clearAllFilters}
              className="text-xs text-zinc-500 hover:text-zinc-700 underline ml-1"
            >
              清除全部
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {boxes.map(box => {
          const boxItems = filteredItems.filter(i => i.boxId === box.id);
          const isExpanded = expandedBoxes.has(box.id);
          const totalQty = items.filter(i => i.boxId === box.id).reduce((s, i) => s + i.quantity, 0);

          return (
            <div key={box.id} className="card overflow-hidden">
              <button
                onClick={() => toggleBox(box.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-zinc-400" />
                  )}
                  <Grid3X3 className="w-5 h-5 text-primary-600" />
                  <div>
                    <h3 className="font-semibold text-zinc-900">{box.location}</h3>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      负责人: {box.manager} · 共 {boxItems.length} 类 / {totalQty} 件
                    </p>
                  </div>
                </div>
                <span className="badge-neutral">{boxItems.length} 类物品</span>
              </button>

              {isExpanded && boxItems.length > 0 && (
                <div className="border-t border-zinc-100 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50">
                      <tr>
                        <th className="text-left px-5 py-2.5 font-medium text-zinc-600">物品名称</th>
                        <th className="text-left px-5 py-2.5 font-medium text-zinc-600">类别</th>
                        <th className="text-left px-5 py-2.5 font-medium text-zinc-600">效期</th>
                        <th className="text-left px-5 py-2.5 font-medium text-zinc-600">数量</th>
                        <th className="text-left px-5 py-2.5 font-medium text-zinc-600">存放格</th>
                        <th className="text-left px-5 py-2.5 font-medium text-zinc-600">状态</th>
                        <th className="text-right px-5 py-2.5 font-medium text-zinc-600">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50">
                      {boxItems.map(item => (
                        <tr key={item.id} className="hover:bg-zinc-50">
                          <td className="px-5 py-3 font-medium text-zinc-900">{item.name}</td>
                          <td className="px-5 py-3 text-zinc-600">{CATEGORY_LABEL[item.category]}</td>
                          <td className="px-5 py-3 text-zinc-600 font-mono">{item.expiryDate}</td>
                          <td className="px-5 py-3 text-zinc-900 font-mono font-medium">{item.quantity}</td>
                          <td className="px-5 py-3 text-zinc-600">{item.storageCell}</td>
                          <td className="px-5 py-3">
                            <span className={statusBadgeClass[item.status]}>
                              {ITEM_STATUS_LABEL[item.status]}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="inline-flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                title={item.status === 'damaged' ? '取消破损标记' : '标记为破损'}
                                className={item.status === 'damaged' ? 'text-primary-600 hover:bg-primary-50 hover:text-primary-700' : 'text-warning-600 hover:bg-warning-50 hover:text-warning-700'}
                                onClick={() => {
                                  if (item.status === 'damaged') {
                                    if (confirm('取消破损标记，恢复为正常可用？')) {
                                      updateItem(item.id, { status: 'normal' } as Partial<InventoryItem>);
                                    }
                                  } else {
                                    if (confirm('确定将该物品标记为破损吗？')) {
                                      updateItem(item.id, { status: 'damaged' });
                                    }
                                  }
                                }}
                              >
                                {item.status === 'damaged' ? (
                                  <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4" />
                                )}
                              </Button>
                              <Link to={'/inventory/' + item.id + '/edit'}>
                                <Button variant="ghost" size="sm">
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-danger-600 hover:bg-danger-50 hover:text-danger-700"
                                onClick={() => {
                                  if (confirm('确定删除该物品吗？')) {
                                    deleteItem(item.id);
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {isExpanded && boxItems.length === 0 && (
                <div className="border-t border-zinc-100 p-8 text-center text-zinc-400 text-sm">
                  该分类下暂无物品
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
