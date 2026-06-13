import { useState, useMemo } from 'react';
import { Plus, Filter, Search, PackageOpen } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import SupplyCard from '@/components/SupplyCard';
import SupplyForm from '@/components/SupplyForm';
import Modal from '@/components/Modal';
import CategoryTag from '@/components/CategoryTag';
import type { Supply, SupplyCategory } from '@/types';

const allCategories: SupplyCategory[] = ['water', 'food', 'first_aid', 'equipment', 'other'];

export default function Supplies() {
  const supplies = useAppStore((s) => s.supplies);
  const removeSupply = useAppStore((s) => s.removeSupply);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supply | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<SupplyCategory | 'all'>('all');

  const filtered = useMemo(() => {
    return supplies.filter((s) => {
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = activeCategory === 'all' || s.category === activeCategory;
      return matchSearch && matchCategory;
    });
  }, [supplies, search, activeCategory]);

  const totalWeight = supplies.reduce(
    (sum, s) => sum + s.weightGrams * s.quantity,
    0
  );

  const handleEdit = (supply: Supply) => {
    setEditing(supply);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除此物资？相关分配记录也会被移除。')) {
      removeSupply(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="section-title mb-1">
            <PackageOpen size={24} />
            物资清单
          </h3>
          <p className="text-sm text-earth-600">
            共 {supplies.length} 种物资 · 总重量 {(totalWeight / 1000).toFixed(1)}kg
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary">
          <Plus size={18} />
          添加物资
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索物资名称..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-parchment-300 bg-white text-forest-900 placeholder:text-forest-300 focus:outline-none focus:ring-2 focus:ring-forest-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter size={16} className="text-earth-600 mr-1" />
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeCategory === 'all'
                  ? 'bg-forest-700 text-white shadow-card'
                  : 'bg-parchment-50 text-forest-700 hover:bg-parchment-200'
              }`}
            >
              全部
            </button>
            {allCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activeCategory === cat
                    ? 'bg-forest-700 text-white shadow-card'
                    : 'bg-parchment-50 text-forest-700 hover:bg-parchment-200'
                }`}
              >
                <CategoryTag category={cat} size="sm" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <PackageOpen size={48} className="mx-auto text-forest-300 mb-4" />
          <h4 className="font-display text-lg font-bold text-forest-800 mb-1">暂无物资</h4>
          <p className="text-sm text-earth-600 mb-4">点击"添加物资"开始管理清单</p>
          <button onClick={handleAdd} className="btn-primary">
            <Plus size={18} />
            添加第一个物资
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((supply, i) => (
            <div
              key={supply.id}
              style={{ animationDelay: `${i * 30}ms` }}
              className="animate-fade-up opacity-0"
            >
              <SupplyCard
                supply={supply}
                onEdit={() => handleEdit(supply)}
                onDelete={() => handleDelete(supply.id)}
              />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        title={editing ? '编辑物资' : '添加物资'}
      >
        <SupplyForm
          supply={editing}
          onSubmit={() => {
            setModalOpen(false);
            setEditing(null);
          }}
          onCancel={() => {
            setModalOpen(false);
            setEditing(null);
          }}
        />
      </Modal>
    </div>
  );
}
