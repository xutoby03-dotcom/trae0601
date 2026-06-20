import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Plus, Filter, Grid, List } from 'lucide-react';
import type { EquipmentType } from '../../types';
import { equipmentTypeLabels } from '../../types';
import { EquipmentCard } from '../../components/ui/EquipmentCard';
import { useEquipmentStore } from '../../store/equipmentStore';
import { EquipmentTypeIcon } from '../../components/ui/EquipmentTypeIcon';

const typeFilters: (EquipmentType | 'all')[] = ['all', 'camera', 'lens', 'flash', 'stabilizer', 'memory_card', 'battery', 'charger', 'cable'];

export function EquipmentList() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { equipment, deleteEquipment } = useEquipmentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<EquipmentType | 'all'>(
    (searchParams.get('filter') as EquipmentType) || 'all'
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredEquipment = useMemo(() => {
    return equipment.filter(eq => {
      const matchesSearch =
        eq.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        eq.notes?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = typeFilter === 'all' || eq.type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [equipment, searchQuery, typeFilter]);

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个器材吗？此操作不可撤销。')) {
      deleteEquipment(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">器材档案</h1>
          <p className="text-neutral-400">管理所有摄影器材及其配件</p>
        </div>
        <button
          onClick={() => navigate('/equipment/new')}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          添加器材
        </button>
      </div>

      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
            <input
              type="text"
              placeholder="搜索器材品牌、型号..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-neutral-500" />
            <div className="flex flex-wrap gap-1">
              {typeFilters.map((type) => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    typeFilter === type
                      ? 'bg-primary text-white'
                      : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                  }`}
                >
                  {type !== 'all' && <EquipmentTypeIcon type={type} size={14} />}
                  {type === 'all' ? '全部' : equipmentTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 border border-neutral-700 rounded p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary/20 text-primary' : 'text-neutral-500 hover:text-white'}`}
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary/20 text-primary' : 'text-neutral-500 hover:text-white'}`}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {filteredEquipment.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-800 flex items-center justify-center">
            <Search size={32} className="text-neutral-600" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">没有找到器材</h3>
          <p className="text-neutral-500 mb-4">尝试调整搜索条件或添加新器材</p>
          <button
            onClick={() => navigate('/equipment/new')}
            className="btn-primary"
          >
            添加第一个器材
          </button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'space-y-3'
        }>
          {filteredEquipment.map((eq, idx) => (
            <div
              key={eq.id}
              className="animate-slide-up"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <EquipmentCard
                equipment={eq}
                onEdit={() => navigate(`/equipment/${eq.id}/edit`)}
                onDelete={() => handleDelete(eq.id)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="text-sm text-neutral-500 text-center">
        共 {filteredEquipment.length} 个器材
      </div>
    </div>
  );
}
