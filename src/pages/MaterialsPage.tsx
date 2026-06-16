import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, DollarSign, Box, AlertTriangle } from 'lucide-react';
import { MaterialCard } from '../components/materials/MaterialCard';
import { StatCard } from '../components/ui/StatCard';
import { Button } from '../components/ui/Button';
import { SearchBar } from '../components/kanban/SearchBar';
import { useMaterialStore } from '../store/materialStore';
import type { Material, InventoryLogType } from '../types';
import { InventoryAdjustModal } from '../components/modals/InventoryAdjustModal';

export default function MaterialsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  const { materials, adjustInventory } = useMaterialStore();

  const filteredMaterials = materials.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.name.toLowerCase().includes(query) ||
      m.producer.toLowerCase().includes(query) ||
      m.bagNumber.toLowerCase().includes(query)
    );
  });

  const totalValue = materials.reduce((sum, m) => sum + m.cost * m.remainingQuantity, 0);
  const totalItems = materials.reduce((sum, m) => sum + m.remainingQuantity, 0);
  const lowStockCount = materials.filter((m) => m.remainingQuantity / m.totalQuantity < 0.3).length;

  const handleAdjustInventory = (material: Material) => {
    setSelectedMaterial(material);
    setShowAdjustModal(true);
  };

  const handleConfirmAdjust = (type: InventoryLogType, quantity: number, reason: string) => {
    if (selectedMaterial) {
      adjustInventory(selectedMaterial.id, type, quantity, reason, '管理员');
    }
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white font-display">物料管理</h1>
          <p className="text-gray-400 mt-1">管理演唱会应援物料库存</p>
        </div>
        <Button variant="gradient" size="md">
          <Plus className="w-4 h-4 mr-2" />
          添加物料
        </Button>
      </motion.div>

      <div className="grid grid-cols-4 gap-4">
        <StatCard
          title="物料种类"
          value={materials.length}
          icon={<Package className="w-6 h-6" />}
          color="purple"
          delay={0.1}
        />
        <StatCard
          title="总库存数量"
          value={totalItems}
          icon={<Box className="w-6 h-6" />}
          color="pink"
          delay={0.2}
        />
        <StatCard
          title="库存总价值"
          value={`¥${totalValue.toFixed(0)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="gold"
          delay={0.3}
        />
        <StatCard
          title="库存不足"
          value={lowStockCount}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="green"
          delay={0.4}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-white">物料列表</h2>
          <span className="text-sm text-gray-500">共 {filteredMaterials.length} 种</span>
        </div>
        <div className="w-80">
          <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="搜索物料名称、制作人..." />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-5">
        {filteredMaterials.map((material, index) => (
          <MaterialCard
            key={material.id}
            material={material}
            index={index}
            onAdjustInventory={() => handleAdjustInventory(material)}
          />
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Package className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg">没有找到相关物料</p>
          <p className="text-sm mt-1">试试其他关键词搜索</p>
        </div>
      )}

      <InventoryAdjustModal
        isOpen={showAdjustModal}
        onClose={() => setShowAdjustModal(false)}
        material={selectedMaterial}
        onConfirm={handleConfirmAdjust}
      />
    </div>
  );
}
