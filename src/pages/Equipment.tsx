import { useState, useMemo } from 'react';
import { Package, Plus, Filter } from 'lucide-react';
import type { EquipmentCategory, Equipment } from '@/types';
import { CATEGORY_META } from '@/types';
import { useStore } from '@/store/useStore';
import EquipmentCard from '@/components/equipment/EquipmentCard';
import EquipmentForm from '@/components/equipment/EquipmentForm';
import EmptyState from '@/components/common/EmptyState';

const CATEGORIES: Array<EquipmentCategory | 'all'> = ['all', 'tent', 'sleep', 'cooking', 'lighting', 'firstaid', 'entertainment'];

export default function Equipment() {
  const currentTripId = useStore((s) => s.currentTripId);
  const trips = useStore((s) => s.trips);
  const equipmentAll = useStore((s) => s.equipment);
  const addEquipment = useStore((s) => s.addEquipment);
  const updateEquipment = useStore((s) => s.updateEquipment);
  const removeEquipment = useStore((s) => s.removeEquipment);

  const trip = useMemo(() => trips.find((t) => t.id === currentTripId) || null, [trips, currentTripId]);
  const allEquipment = useMemo(() => equipmentAll.filter((e) => e.tripId === currentTripId), [equipmentAll, currentTripId]);

  const [activeCategory, setActiveCategory] = useState<EquipmentCategory | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<Equipment | null>(null);

  const filteredEquipment = useMemo(() => activeCategory === 'all'
    ? allEquipment
    : allEquipment.filter((e) => e.category === activeCategory), [activeCategory, allEquipment]);

  const handleSubmit = (data: any) => {
    if (editingItem) {
      updateEquipment(editingItem.id, data);
    } else {
      addEquipment(data);
    }
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: Equipment) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定删除这件装备吗？')) {
      removeEquipment(id);
    }
  };

  if (!trip) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <EmptyState
          icon={Package}
          title="请先创建露营计划"
          description="创建计划后才能添加和管理装备"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-bark-500 flex items-center gap-2">
            <Package className="text-forest-600" size={26} />
            装备管理
          </h1>
          <p className="text-bark-500/60 mt-1 text-sm">
            共 {allEquipment.length} 件装备
          </p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="btn-primary"
        >
          <Plus size={18} />
          添加装备
        </button>
      </div>

      {/* 分类筛选 */}
      <div className="card p-2">
        <div className="flex items-center gap-1 overflow-x-auto scroll-area">
          <div className="flex items-center gap-1.5 px-3 text-bark-500/50">
            <Filter size={16} />
            <span className="text-sm whitespace-nowrap">筛选:</span>
          </div>
          {CATEGORIES.map((cat) => {
            const label = cat === 'all' ? '全部' : CATEGORY_META[cat].label;
            const emoji = cat === 'all' ? '📦' : CATEGORY_META[cat].emoji;
            const count = cat === 'all'
              ? allEquipment.length
              : allEquipment.filter((e) => e.category === cat).length;
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-forest-600 text-white shadow-softer'
                    : 'text-bark-500/70 hover:bg-cream-100'
                }`}
              >
                <span>{emoji}</span>
                <span>{label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-white/20' : 'bg-cream-200 text-bark-500/60'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 装备列表 */}
      {filteredEquipment.length === 0 ? (
        <EmptyState
          icon={Package}
          title="暂无装备"
          description="点击右上角「添加装备」开始录入你的露营装备"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
          {filteredEquipment.map((eq) => (
            <EquipmentCard
              key={eq.id}
              equipment={eq}
              onEdit={() => handleEdit(eq)}
              onDelete={() => handleDelete(eq.id)}
            />
          ))}
        </div>
      )}

      {/* 表单弹窗 */}
      {showForm && (
        <EquipmentForm
          equipment={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
