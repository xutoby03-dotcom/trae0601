import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Package, Calendar, Sparkles, Eye, Pencil, Trash2, Blocks } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  MATERIAL_OPTIONS,
  CLEAN_METHOD_LABEL_MAP,
  MATERIAL_LABEL_MAP,
  formatDateShort,
  daysBetween,
  MATERIAL_CLEAN_CYCLE,
} from '@/utils/constants';
import type { MaterialType, Toy } from '@/types';
import { cn } from '@/lib/utils';

const GRADIENT_MAP: Record<MaterialType, string> = {
  wood: 'from-woody-100 to-woody-200',
  plastic: 'from-clean-100 to-clean-200',
  silicone: 'from-baby-100 to-baby-200',
  plush: 'from-baby-50 to-baby-100',
  rubber: 'from-mint-100 to-mint-200',
  metal: 'from-gray-100 to-gray-200',
  cloth: 'from-woody-50 to-woody-100',
  other: 'from-gray-100 to-gray-200',
};

export default function ToysPage() {
  const navigate = useNavigate();
  const toys = useAppStore((s) => s.toys);
  const deleteToy = useAppStore((s) => s.deleteToy);
  const getLastCleanDate = useAppStore((s) => s.getLastCleanDate);

  const [search, setSearch] = useState('');
  const [filterMaterial, setFilterMaterial] = useState<MaterialType | 'all'>('all');
  const [filterStorage, setFilterStorage] = useState<string>('all');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const storageOptions = useMemo(() => {
    const set = new Set(toys.map((t) => t.storageLocation));
    return Array.from(set);
  }, [toys]);

  const filteredToys = useMemo(() => {
    return toys.filter((toy) => {
      const matchSearch = toy.name.toLowerCase().includes(search.toLowerCase());
      const matchMaterial = filterMaterial === 'all' || toy.material === filterMaterial;
      const matchStorage = filterStorage === 'all' || toy.storageLocation === filterStorage;
      return matchSearch && matchMaterial && matchStorage;
    });
  }, [toys, search, filterMaterial, filterStorage]);

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation();
    if (confirm(`确定要删除玩具"${name}"吗？相关的清洁记录和异常提醒也会被删除。`)) {
      deleteToy(id);
    }
  };

  const renderLastCleanInfo = (toy: Toy) => {
    const lastDate = getLastCleanDate(toy.id);
    if (!lastDate) {
      return <span className="text-gray-400">暂无清洁记录</span>;
    }
    const days = daysBetween(lastDate);
    const cycle = MATERIAL_CLEAN_CYCLE[toy.material] || 5;
    const isOverdue = days >= cycle;
    return (
      <span className={cn(isOverdue ? 'text-alert-400 font-semibold' : 'text-gray-500')}>
        {formatDateShort(lastDate)}
        {days > 0 && <span className="ml-1">({days}天前)</span>}
      </span>
    );
  };

  return (
    <div className="card-base p-6 md:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-mint-300 to-clean-300 flex items-center justify-center">
            <Blocks className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">🧸 玩具档案管理</h1>
            <p className="text-sm text-gray-500">管理所有玩具的基础信息、清洁方式和收纳位置</p>
          </div>
        </div>
        <button onClick={() => navigate('/toys/new')} className="btn-primary whitespace-nowrap self-start lg:self-auto">
          <Plus className="w-5 h-5" />
          新增玩具
        </button>
      </div>

      <div className="card-base p-4 md:p-5 mb-6 !shadow-none !border !border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索玩具名称..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-base pl-12"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filterMaterial}
              onChange={(e) => setFilterMaterial(e.target.value as MaterialType | 'all')}
              className="input-base sm:w-44"
            >
              <option value="all">全部材质</option>
              {MATERIAL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
            <select
              value={filterStorage}
              onChange={(e) => setFilterStorage(e.target.value)}
              className="input-base sm:w-44"
            >
              <option value="all">全部位置</option>
              {storageOptions.map((loc) => (
                <option key={loc} value={loc}>
                  📦 {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredToys.length === 0 ? (
        <div className="card-base p-16 text-center !shadow-none !border !border-gray-100">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">暂无玩具</h3>
          <p className="text-gray-500 mb-6">
            {search || filterMaterial !== 'all' || filterStorage !== 'all'
              ? '没有找到符合筛选条件的玩具'
              : '点击右上角按钮添加第一个玩具档案吧'}
          </p>
          {!search && filterMaterial === 'all' && filterStorage === 'all' && (
            <button onClick={() => navigate('/toys/new')} className="btn-primary">
              <Plus className="w-5 h-5" />
              添加玩具
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredToys.map((toy) => {
            const materialInfo = MATERIAL_LABEL_MAP.get(toy.material);
            const cleanInfo = CLEAN_METHOD_LABEL_MAP.get(toy.cleanMethod);
            const gradient = GRADIENT_MAP[toy.material];
            const isHovered = hoveredCard === toy.id;

            return (
              <div
                key={toy.id}
                onClick={() => navigate(`/toys/${toy.id}`)}
                onMouseEnter={() => setHoveredCard(toy.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  'card-base card-hover cursor-pointer overflow-hidden relative group',
                )}
              >
                <div
                  className={cn(
                    'relative h-40 flex items-center justify-center bg-gradient-to-br overflow-hidden',
                    gradient,
                  )}
                >
                  {toy.photo ? (
                    <img
                      src={toy.photo}
                      alt={toy.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl drop-shadow-sm">
                      {materialInfo?.icon || '📦'}
                    </span>
                  )}

                  <div
                    className={cn(
                      'absolute inset-0 bg-black/40 flex items-center justify-center gap-2 transition-all duration-200',
                      isHovered ? 'opacity-100' : 'opacity-0',
                    )}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/toys/${toy.id}`);
                      }}
                      className="p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:scale-110 transition-all shadow-lg"
                      title="查看详情"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/toys/${toy.id}/edit`);
                      }}
                      className="p-2.5 rounded-full bg-white/90 text-gray-700 hover:bg-white hover:scale-110 transition-all shadow-lg"
                      title="编辑"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, toy.id, toy.name)}
                      className="p-2.5 rounded-full bg-alert-100 text-alert-400 hover:bg-alert-200 hover:scale-110 transition-all shadow-lg"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-1">
                    {toy.name}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className={cn('tag', materialInfo?.color)}>
                      {materialInfo?.icon} {materialInfo?.label}
                    </span>
                    <span className="tag bg-clean-50 text-clean-400">
                      👶 {toy.ageRange}
                    </span>
                    <span className="tag bg-mint-50 text-mint-400">
                      <Sparkles className="w-3 h-3" /> {cleanInfo?.icon}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm border-t border-gray-100 pt-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Package className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{toy.storageLocation}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>购入 {formatDateShort(toy.purchaseDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-gray-400 shrink-0" />
                      {renderLastCleanInfo(toy)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
