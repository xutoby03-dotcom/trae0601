import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Search, Thermometer, UtensilsCrossed, Bandage, Shield, Pill, AlertTriangle, Filter } from 'lucide-react';
import { useMedicineStore } from '@/store/medicineStore';
import { MedicineCategory, CATEGORY_LABELS } from '@/types';
import { getMissingCategories, getMedicineStatus } from '@/utils/medicine';
import MedicineCard from '@/components/MedicineCard';
import type { Medicine } from '@/types';

const ALL_CATEGORIES = 'all';

const categoryIcons: Record<MedicineCategory, typeof Thermometer> = {
  [MedicineCategory.COLD_FEVER]: Thermometer,
  [MedicineCategory.GASTROINTESTINAL]: UtensilsCrossed,
  [MedicineCategory.TRAUMA]: Bandage,
  [MedicineCategory.ALLERGY]: Shield,
  [MedicineCategory.CHRONIC]: Pill,
  [MedicineCategory.OTHER]: Pill,
};

export default function MedicineList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { medicines } = useMedicineStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>(
    searchParams.get('category') || ALL_CATEGORIES
  );
  const [sortBy, setSortBy] = useState<'expiry' | 'name' | 'updated'>('expiry');

  useEffect(() => {
    const category = searchParams.get('category');
    if (category) {
      setActiveCategory(category);
    }
  }, [searchParams]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === ALL_CATEGORIES) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    setSearchParams(searchParams);
  };

  const missingCategories = getMissingCategories(medicines);

  const filteredMedicines = medicines.filter((medicine) => {
    const matchesCategory = activeCategory === ALL_CATEGORIES || medicine.category === activeCategory;
    const matchesSearch = medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.specification.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedMedicines = [...filteredMedicines].sort((a, b) => {
    if (sortBy === 'expiry') {
      return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }
  });

  const getMedicinesByStatus = (medicines: Medicine[]) => {
    const expired: Medicine[] = [];
    const expiring: Medicine[] = [];
    const normal: Medicine[] = [];
    
    medicines.forEach(m => {
      const status = getMedicineStatus(m);
      if (status.color === 'red') expired.push(m);
      else if (status.color === 'orange') expiring.push(m);
      else normal.push(m);
    });
    
    return { expired, expiring, normal };
  };

  const { expired, expiring, normal } = getMedicinesByStatus(sortedMedicines);

  const tabs = [
    { id: ALL_CATEGORIES, label: '全部', count: medicines.length },
    ...Object.values(MedicineCategory).map(cat => ({
      id: cat,
      label: CATEGORY_LABELS[cat],
      count: medicines.filter(m => m.category === cat).length
    }))
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">药品列表</h1>
          <p className="text-gray-500 text-sm mt-1">共 {medicines.length} 种药品</p>
        </div>
        <Link
          to="/medicines/add"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-5 h-5" />
          登记药品
        </Link>
      </div>

      {missingCategories.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 mb-1">应急类别待补充</h3>
              <p className="text-sm text-amber-700 mb-3">
                以下关键类别还没有备用药品，建议及时补充以应对突发情况：
              </p>
              <div className="flex flex-wrap gap-2">
                {missingCategories.map((category) => {
                  const Icon = categoryIcons[category];
                  return (
                    <Link
                      key={category}
                      to={`/medicines/add?category=${category}`}
                      className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-amber-200 hover:border-amber-400 hover:bg-amber-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">
                        + 补充{CATEGORY_LABELS[category]}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索药品名称、规格、症状..."
              className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
            >
              <option value="expiry">按有效期排序</option>
              <option value="name">按名称排序</option>
              <option value="updated">按更新时间</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
        <div className="flex gap-1 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.id === ALL_CATEGORIES ? Pill : categoryIcons[tab.id as MedicineCategory];
            const isMissing = tab.id !== ALL_CATEGORIES && missingCategories.includes(tab.id as MedicineCategory);
            return (
              <button
                key={tab.id}
                onClick={() => handleCategoryChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategory === tab.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-200'
                    : isMissing
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                  activeCategory === tab.id
                    ? 'bg-white/20'
                    : 'bg-gray-200'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {sortedMedicines.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Pill className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {searchQuery ? '没有找到匹配的药品' : '该分类暂无药品'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? '试试其他关键词' : '点击下方按钮添加第一种药品'}
          </p>
          {!searchQuery && (
            <Link
              to="/medicines/add"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-primary-200 hover:shadow-xl hover:shadow-primary-300 transition-all"
            >
              <Plus className="w-5 h-5" />
              登记药品
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {expired.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-danger-700 font-semibold mb-3">
                <AlertTriangle className="w-5 h-5" />
                已过期 ({expired.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {expired.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} showDetails />
                ))}
              </div>
            </div>
          )}

          {expiring.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-warning-700 font-semibold mb-3">
                <AlertTriangle className="w-5 h-5" />
                即将过期 ({expiring.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {expiring.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} showDetails />
                ))}
              </div>
            </div>
          )}

          {normal.length > 0 && (
            <div>
              <h3 className="flex items-center gap-2 text-gray-700 font-semibold mb-3">
                <Pill className="w-5 h-5" />
                正常 ({normal.length})
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {normal.map((medicine) => (
                  <MedicineCard key={medicine.id} medicine={medicine} showDetails />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
