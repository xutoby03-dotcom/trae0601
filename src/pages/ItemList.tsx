import { useState, useMemo } from 'react';
import { Search, Filter, Grid3X3, List, Package } from 'lucide-react';
import { useStore } from '@/store/useStore';
import ItemCard from '@/components/ItemCard';
import EmptyState from '@/components/EmptyState';
import StatusBadge from '@/components/StatusBadge';
import { Link } from 'react-router-dom';

export default function ItemList() {
  const items = useStore((s) => s.items);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return Array.from(set);
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (keyword && !item.name.toLowerCase().includes(keyword.toLowerCase()) && !item.specification.toLowerCase().includes(keyword.toLowerCase())) {
        return false;
      }
      if (category !== 'all' && item.category !== category) return false;
      if (stockFilter === 'danger' && item.currentStock >= item.minStock) return false;
      if (stockFilter === 'normal' && item.currentStock < item.minStock) return false;
      return true;
    });
  }, [items, keyword, category, stockFilter]);

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="card p-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="搜索物品名称、规格..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input !w-auto !py-2 text-sm"
              >
                <option value="all">全部分类</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="input !w-auto !py-2 text-sm"
            >
              <option value="all">全部库存</option>
              <option value="danger">红区预警</option>
              <option value="normal">库存正常</option>
            </select>
            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 transition-colors ${
                  viewMode === 'table' ? 'bg-brand-50 text-brand-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState
          icon={<Package className="w-8 h-8" />}
          title="暂无物品"
          description={keyword || category !== 'all' || stockFilter !== 'all' ? '没有匹配的物品，试试调整筛选条件' : '还没有添加任何物品档案'}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">物品</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">分类</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">库存</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">单价</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">位置</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const isDanger = item.currentStock < item.minStock;
                  const stockStatus = isDanger ? 'danger' : item.currentStock <= item.minStock * 1.5 ? 'warn' : 'normal';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden">
                            {item.photoUrl ? (
                              <img src={item.photoUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-display text-sm">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.specification}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                      <td className="px-6 py-4">
                        <span className={`font-medium ${isDanger ? 'text-danger-600' : 'text-slate-900'}`}>
                          {item.currentStock}
                        </span>
                        <span className="text-slate-400 text-sm"> / {item.minStock}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">¥{item.unitPrice}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">{item.location}</td>
                      <td className="px-6 py-4">
                        <StatusBadge type="stock" value={stockStatus} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link to={`/items/${item.id}`} className="text-sm text-brand-600 hover:text-brand-700 font-medium">
                          查看
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
