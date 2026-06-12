import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Material, Delivery, AfterSale } from '@/types';
import MaterialCard from '@/components/material/MaterialCard';
import MaterialDetail from '@/components/material/MaterialDetail';
import MaterialForm from '@/components/material/MaterialForm';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Input from '@/components/common/Input';
import { Plus, Search, Filter } from 'lucide-react';
import { defaultRooms, defaultCategories, getMaterialStatus } from '@/utils/helpers';
import { cn } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'partial' | 'complete' | 'delayed';

const MaterialBoard = () => {
  const {
    materials,
    deliveries,
    afterSales,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addDelivery,
    addAfterSale,
  } = useAppStore();

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [roomFilter, setRoomFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredMaterials = useMemo(() => {
    return materials.filter((material) => {
      const status = getMaterialStatus(material, deliveries);

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const match =
          material.name.toLowerCase().includes(query) ||
          material.brand.toLowerCase().includes(query) ||
          material.specification.toLowerCase().includes(query) ||
          material.supplier.toLowerCase().includes(query);
        if (!match) return false;
      }

      if (statusFilter !== 'all' && status !== statusFilter) {
        return false;
      }

      if (roomFilter && material.room !== roomFilter) {
        return false;
      }

      if (categoryFilter && material.category !== categoryFilter) {
        return false;
      }

      return true;
    });
  }, [materials, deliveries, searchQuery, statusFilter, roomFilter, categoryFilter]);

  const handleCardClick = (material: Material) => {
    setSelectedMaterial(material);
    setShowDetail(true);
  };

  const handleEditClick = () => {
    setEditingMaterial(selectedMaterial);
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDeleteClick = () => {
    if (selectedMaterial && window.confirm('确定要删除这个材料吗？相关的到货记录和售后工单也会被删除。')) {
      deleteMaterial(selectedMaterial.id);
      setShowDetail(false);
      setSelectedMaterial(null);
    }
  };

  const handleAddClick = () => {
    setEditingMaterial(null);
    setShowForm(true);
  };

  const handleFormSubmit = (data: Partial<Material>) => {
    if (editingMaterial) {
      updateMaterial(editingMaterial.id, data);
    } else {
      addMaterial(data as Omit<Material, 'id' | 'createdAt' | 'updatedAt'>);
    }
    setShowForm(false);
    setEditingMaterial(null);
  };

  const handleAddDelivery = (delivery: Omit<Delivery, 'id' | 'createdAt'>) => {
    addDelivery(delivery);
  };

  const handleAddAfterSale = (afterSale: Omit<AfterSale, 'id' | 'createdAt'>) => {
    addAfterSale(afterSale);
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待到货' },
    { key: 'partial', label: '部分到货' },
    { key: 'complete', label: '已齐套' },
    { key: 'delayed', label: '已延期' },
  ];

  const stats = useMemo(() => {
    const total = materials.length;
    const complete = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'complete'
    ).length;
    const delayed = materials.filter(
      (m) => getMaterialStatus(m, deliveries) === 'delayed'
    ).length;
    const hasAfterSale = afterSales.filter((a) => a.status !== 'resolved').length;
    return { total, complete, delayed, hasAfterSale };
  }, [materials, deliveries, afterSales]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">材料看板</h1>
          <p className="text-sm text-gray-500 mt-1">
            共 {stats.total} 种材料，已齐套 {stats.complete} 种
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="w-4 h-4 mr-1.5" />
          添加材料
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">总材料数</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">已齐套</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.complete}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">已延期</p>
          <p className="text-2xl font-bold text-red-600">{stats.delayed}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-sm text-gray-500 mb-1">待处理售后</p>
          <p className="text-2xl font-bold text-amber-600">{stats.hasAfterSale}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索材料名称、品牌、规格、供应商..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 h-10 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-32">
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">全部分类</option>
                {defaultCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-32">
              <Select
                value={roomFilter}
                onChange={(e) => setRoomFilter(e.target.value)}
              >
                <option value="">全部房间</option>
                {defaultRooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1">
          {statusTabs.map((tab) => {
            const count =
              tab.key === 'all'
                ? materials.length
                : materials.filter(
                    (m) => getMaterialStatus(m, deliveries) === tab.key
                  ).length;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  statusFilter === tab.key
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-xs rounded-full',
                    statusFilter === tab.key
                      ? 'bg-teal-200 text-teal-700'
                      : 'bg-gray-200 text-gray-600'
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMaterials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              deliveries={deliveries.filter((d) => d.materialId === material.id)}
              onClick={() => handleCardClick(material)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-4">没有找到符合条件的材料</p>
          <Button variant="outline" onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-1.5" />
            添加材料
          </Button>
        </div>
      )}

      <MaterialDetail
        material={selectedMaterial}
        deliveries={deliveries}
        afterSales={afterSales}
        isOpen={showDetail}
        onClose={() => setShowDetail(false)}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onAddDelivery={handleAddDelivery}
        onAddAfterSale={handleAddAfterSale}
      />

      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMaterial(null);
        }}
        title={editingMaterial ? '编辑材料' : '添加材料'}
        className="max-w-lg"
      >
        <MaterialForm
          material={editingMaterial}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingMaterial(null);
          }}
        />
      </Modal>
    </div>
  );
};

export default MaterialBoard;
