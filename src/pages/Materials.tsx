import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Plus, Package, AlertTriangle, X } from 'lucide-react';
import MaterialCard from '@/components/MaterialCard';
import { useJournalStore } from '@/store/useJournalStore';
import { MaterialType, MATERIAL_TYPE_LABELS, OVERSTOCK_THRESHOLD } from '@/types';

const TYPE_FILTERS: { label: string; value: MaterialType | 'all' }[] = [
  { label: '全部', value: 'all' },
  { label: '贴纸', value: 'sticker' },
  { label: '胶带', value: 'tape' },
  { label: '便签', value: 'memo' },
  { label: '印章', value: 'stamp' },
];

const TYPE_BADGE_CLASS: Record<MaterialType, string> = {
  sticker: 'badge-sticker',
  tape: 'badge-tape',
  memo: 'badge-memo',
  stamp: 'badge-stamp',
};

export default function Materials() {
  const { materials } = useJournalStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState('');

  const typeParam = searchParams.get('type') as MaterialType | null;
  const activeType: MaterialType | 'all' =
    typeParam && Object.keys(MATERIAL_TYPE_LABELS).includes(typeParam) ? typeParam : 'all';

  const justAddedTheme = searchParams.get('dupTheme') || '';
  const [dismissedDup, setDismissedDup] = useState('');

  const duplicateAlert = useMemo(() => {
    if (!justAddedTheme || justAddedTheme === dismissedDup) return null;
    const sameTheme = materials.filter(
      (m) => m.theme.toLowerCase() === justAddedTheme.toLowerCase()
    );
    if (sameTheme.length < 2) return null;
    const overstockCount = sameTheme.filter((m) => m.quantity >= OVERSTOCK_THRESHOLD).length;
    return { theme: justAddedTheme, items: sameTheme, overstockCount };
  }, [materials, justAddedTheme, dismissedDup]);

  const handleDismissDup = () => {
    setDismissedDup(justAddedTheme);
    const next = new URLSearchParams(searchParams);
    next.delete('dupTheme');
    setSearchParams(next);
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesType = activeType === 'all' || m.type === activeType;
      const keyword = search.toLowerCase().trim();
      const matchesSearch =
        !keyword ||
        m.name.toLowerCase().includes(keyword) ||
        m.brand.toLowerCase().includes(keyword);
      return matchesType && matchesSearch;
    });
  }, [materials, activeType, search]);

  const handleTypeChange = (value: MaterialType | 'all') => {
    if (value === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ type: value });
    }
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">素材库存</h1>
        <Link to="/materials/add" className="btn-primary inline-flex items-center gap-1.5">
          <Plus size={16} />
          添加素材
        </Link>
      </div>

      {duplicateAlert && (
        <div className="mb-4 rounded-xl border border-coral/30 bg-coral/5 p-4 relative">
          <button
            type="button"
            onClick={handleDismissDup}
            className="absolute top-2.5 right-2.5 p-0.5 rounded text-brown-muted/50 hover:text-coral transition-colors"
          >
            <X size={14} />
          </button>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={16} className="text-coral shrink-0" />
            <span className="text-coral text-sm font-semibold">
              「{duplicateAlert.theme}」主题已有 {duplicateAlert.items.length} 件素材
            </span>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mb-1.5">
            {duplicateAlert.items.map((m) => (
              <span key={m.id} className="text-xs text-brown-dark">
                <span className={`badge-${m.type} mr-1`}>{MATERIAL_TYPE_LABELS[m.type]}</span>
                {m.name}
                <span className="text-brown-muted ml-1">×{m.quantity}</span>
                {m.quantity >= OVERSTOCK_THRESHOLD && (
                  <span className="text-coral font-semibold ml-1">囤太多</span>
                )}
              </span>
            ))}
          </div>
          {duplicateAlert.overstockCount > 0 && (
            <p className="text-coral text-xs flex items-center gap-1">
              <AlertTriangle size={11} />
              其中 {duplicateAlert.overstockCount} 件库存 ≥ {OVERSTOCK_THRESHOLD}，这个主题真的够用了！
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-muted/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索名称或品牌..."
            className="input-field pl-9"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {TYPE_FILTERS.map((filter) => {
          const isActive = activeType === filter.value;
          return (
            <button
              key={filter.value}
              onClick={() => handleTypeChange(filter.value)}
              className={`transition-all ${
                filter.value === 'all'
                  ? isActive
                    ? 'badge bg-brown text-cream-light'
                    : 'badge bg-cream-dark/50 text-brown-muted hover:bg-cream-dark'
                  : isActive
                    ? TYPE_BADGE_CLASS[filter.value as MaterialType]
                    : 'badge bg-cream-dark/30 text-brown-muted hover:bg-cream-dark/60'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="card-paper rounded-xl py-16 flex flex-col items-center justify-center">
          <Package size={48} className="text-brown-muted/25 mb-3" />
          <p className="text-brown-muted font-serif text-lg">还没有素材</p>
          <p className="text-brown-muted/60 text-sm mt-1">点击右上角添加你的第一个素材吧</p>
          <Link to="/materials/add" className="btn-primary mt-4 inline-flex items-center gap-1.5">
            <Plus size={16} />
            添加素材
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredMaterials.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      )}
    </div>
  );
}
