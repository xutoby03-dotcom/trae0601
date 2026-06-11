import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useStore } from '@/store/useStore';
import MedicineCard from '@/components/MedicineCard';
import UseMedicineModal from '@/components/UseMedicineModal';
import RestockModal from '@/components/RestockModal';
import FloatingAddButton from '@/components/FloatingAddButton';
import { isExpired } from '@/utils/dateUtils';
import { CATEGORY_LIST } from '@/types';
import type { Medicine, Category } from '@/types';

type SortKey = 'name' | 'expiry' | 'quantity' | 'created';

export default function MedicineList() {
  const allMedicines = useStore((s) => s.medicines);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortKey>('expiry');
  const [showExpired, setShowExpired] = useState(false);
  const [useTarget, setUseTarget] = useState<Medicine | null>(null);
  const [restockTarget, setRestockTarget] = useState<Medicine | null>(null);

  const medicines = useMemo(() => {
    let list = allMedicines.filter((m) => !m.disposed);
    if (!showExpired) list = list.filter((m) => !isExpired(m.expiryDate));
    if (categoryFilter !== 'all') list = list.filter((m) => m.category === categoryFilter);
    if (search.trim()) {
      const kw = search.trim();
      list = list.filter(
        (m) => m.name.includes(kw) || m.category.includes(kw) || m.storageLocation.includes(kw)
      );
    }
    const sorted = [...list];
    switch (sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'expiry':
        sorted.sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
        break;
      case 'quantity':
        sorted.sort((a, b) => a.quantity - b.quantity);
        break;
      case 'created':
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
    }
    return sorted;
  }, [allMedicines, categoryFilter, search, sortBy, showExpired]);

  return (
    <div className="pb-24 md:pb-8">
      <div className="card p-5 mb-6">
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索药品名称、品类、存放位置..."
              className="input pl-10"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />

            <div className="flex flex-wrap gap-1.5 scrollbar-hide overflow-x-auto">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                全部
              </button>
              {CATEGORY_LIST.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategoryFilter(c)}
                  className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                    categoryFilter === c
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-3 text-sm">
              <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExpired}
                  onChange={(e) => setShowExpired(e.target.checked)}
                  className="rounded text-primary-500 focus:ring-primary-400"
                />
                显示过期
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortKey)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              >
                <option value="expiry">按有效期排序</option>
                <option value="name">按名称排序</option>
                <option value="quantity">按库存排序</option>
                <option value="created">按添加时间</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {medicines.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">📦</p>
          <p className="text-gray-500">暂无匹配的药品</p>
          <p className="text-sm text-gray-400 mt-1">点击右下角按钮添加新药品</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 fade-in-stagger">
          {medicines.map((m) => (
            <MedicineCard
              key={m.id}
              medicine={m}
              onUse={(med) => setUseTarget(med)}
              onRestock={(med) => setRestockTarget(med)}
            />
          ))}
        </div>
      )}

      <UseMedicineModal medicine={useTarget} onClose={() => setUseTarget(null)} />
      <RestockModal medicine={restockTarget} onClose={() => setRestockTarget(null)} />
      <FloatingAddButton />
    </div>
  );
}
