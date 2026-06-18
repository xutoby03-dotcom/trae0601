import { useState } from 'react';
import { Plus, Edit2, Trash2, Coffee, Flame, Droplets, Calendar, Package } from 'lucide-react';
import { useCoffeeStore } from '../store/useCoffeeStore';
import { FlavorCard } from '../components/ui/FlavorCard';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../components/ui/Toast';
import type { CoffeeFlavor, FlavorWithStock, InventoryBatch } from '../types';
import { formatDate } from '../utils/date';

interface FlavorFormData {
  name: string;
  brand: string;
  intensity: number;
  roastLevel: 'light' | 'medium' | 'dark';
  compatibleMachines: string[];
  unitPrice: number;
  boxPhoto: string;
  safetyStock: number;
}

const defaultFormData: FlavorFormData = {
  name: '',
  brand: 'Nespresso',
  intensity: 6,
  roastLevel: 'medium',
  compatibleMachines: ['Nespresso Original'],
  unitPrice: 6.5,
  boxPhoto: '',
  safetyStock: 20,
};

const machineOptions = ['Nespresso Original', 'Nespresso Vertuo', 'Lavazza A Modo Mio', 'Dolce Gusto'];

export function FlavorProfile() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFlavor, setEditingFlavor] = useState<FlavorWithStock | null>(null);
  const [formData, setFormData] = useState<FlavorFormData>(defaultFormData);
  const [selectedFlavorForBatch, setSelectedFlavorForBatch] = useState<FlavorWithStock | null>(null);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

  const flavorsWithStock = useCoffeeStore((state) => state.getAllFlavorsWithStock());
  const batches = useCoffeeStore((state) => state.batches);
  const addFlavor = useCoffeeStore((state) => state.addFlavor);
  const updateFlavor = useCoffeeStore((state) => state.updateFlavor);
  const deleteFlavor = useCoffeeStore((state) => state.deleteFlavor);
  const addBatch = useCoffeeStore((state) => state.addBatch);
  const markBatchStatus = useCoffeeStore((state) => state.markBatchStatus);
  const { showToast } = useToast();

  const handleOpenAdd = () => {
    setEditingFlavor(null);
    setFormData(defaultFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (flavor: FlavorWithStock) => {
    setEditingFlavor(flavor);
    setFormData({
      name: flavor.name,
      brand: flavor.brand,
      intensity: flavor.intensity,
      roastLevel: flavor.roastLevel,
      compatibleMachines: flavor.compatibleMachines,
      unitPrice: flavor.unitPrice,
      boxPhoto: flavor.boxPhoto,
      safetyStock: flavor.safetyStock,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.boxPhoto) {
      formData.boxPhoto = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(`Nespresso coffee capsule box, ${formData.name} flavor, premium packaging, product photography, white background`)}&image_size=square_hd`;
    }

    if (editingFlavor) {
      updateFlavor(editingFlavor.id, formData);
      showToast('success', `已更新 ${formData.name}`);
    } else {
      addFlavor(formData);
      showToast('success', `已添加 ${formData.name}`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (flavor: FlavorWithStock) => {
    if (confirm(`确定要删除 ${flavor.name} 吗？相关库存批次也会被删除。`)) {
      deleteFlavor(flavor.id);
      showToast('success', `已删除 ${flavor.name}`);
    }
  };

  const handleMachineToggle = (machine: string) => {
    setFormData((prev) => ({
      ...prev,
      compatibleMachines: prev.compatibleMachines.includes(machine)
        ? prev.compatibleMachines.filter((m) => m !== machine)
        : [...prev.compatibleMachines, machine],
    }));
  };

  const flavorBatches = selectedFlavorForBatch
    ? batches.filter((b) => b.flavorId === selectedFlavorForBatch.id)
    : [];

  const handleAddBatch = (quantity: number, expiryDate: string) => {
    if (!selectedFlavorForBatch) return;
    addBatch({
      flavorId: selectedFlavorForBatch.id,
      quantity,
      expiryDate,
      status: 'normal',
    });
    showToast('success', `已添加 ${quantity} 颗 ${selectedFlavorForBatch.name}`);
  };

  const handleMarkBatchStatus = (batchId: string, status: 'expired' | 'damp' | 'normal') => {
    markBatchStatus(batchId, status);
    showToast('success', '已更新批次状态');
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-bold text-coffee-900 mb-2">口味档案</h1>
          <p className="text-coffee-500">管理咖啡胶囊的品牌、规格、价格等信息</p>
        </div>
        <button onClick={handleOpenAdd} className="btn-accent">
          <Plus className="w-5 h-5" />
          新增口味
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {flavorsWithStock.map((flavor, index) => (
          <div key={flavor.id} className="relative group">
            <FlavorCard flavor={flavor} index={index} />
            <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => {
                  setSelectedFlavorForBatch(flavor);
                  setIsBatchModalOpen(true);
                }}
                className="btn-secondary p-2 text-sm"
                title="管理批次"
              >
                <Package className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleOpenEdit(flavor)}
                className="btn-secondary p-2 text-sm"
                title="编辑"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(flavor)}
                className="btn-danger p-2 text-sm"
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFlavor ? '编辑口味' : '新增口味'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">口味名称</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input"
                placeholder="如：阿佩奇欧"
                required
              />
            </div>
            <div>
              <label className="label">品牌</label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="input"
                placeholder="如：Nespresso"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">
                <Flame className="w-4 h-4 inline mr-1 text-accent-orange" />
                强度 (1-12)
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={formData.intensity}
                onChange={(e) => setFormData({ ...formData, intensity: parseInt(e.target.value) })}
                className="w-full accent-coffee-800"
              />
              <div className="flex justify-between text-xs text-coffee-500 mt-1">
                <span>1</span>
                <span className="font-bold text-coffee-800">{formData.intensity}</span>
                <span>12</span>
              </div>
            </div>
            <div>
              <label className="label">
                <Coffee className="w-4 h-4 inline mr-1 text-coffee-600" />
                烘焙度
              </label>
              <select
                value={formData.roastLevel}
                onChange={(e) => setFormData({ ...formData, roastLevel: e.target.value as 'light' | 'medium' | 'dark' })}
                className="select"
              >
                <option value="light">浅烘</option>
                <option value="medium">中烘</option>
                <option value="dark">深烘</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="label">
                <Droplets className="w-4 h-4 inline mr-1 text-blue-500" />
                单价 (元/颗)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">
                <Package className="w-4 h-4 inline mr-1 text-green-600" />
                安全库存 (颗)
              </label>
              <input
                type="number"
                min="0"
                value={formData.safetyStock}
                onChange={(e) => setFormData({ ...formData, safetyStock: parseInt(e.target.value) })}
                className="input"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">适配机型</label>
            <div className="flex flex-wrap gap-2">
              {machineOptions.map((machine) => (
                <button
                  key={machine}
                  type="button"
                  onClick={() => handleMachineToggle(machine)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    formData.compatibleMachines.includes(machine)
                      ? 'bg-coffee-800 text-white'
                      : 'bg-coffee-100 text-coffee-600 hover:bg-coffee-200'
                  }`}
                >
                  {machine}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">盒子照片 URL (可选)</label>
            <input
              type="url"
              value={formData.boxPhoto}
              onChange={(e) => setFormData({ ...formData, boxPhoto: e.target.value })}
              className="input"
              placeholder="留空将自动生成产品图片"
            />
          </div>

          {formData.boxPhoto && (
            <div>
              <label className="label">照片预览</label>
              <div className="w-40 h-40 rounded-xl overflow-hidden bg-cream-100 border border-coffee-200">
                <img
                  src={formData.boxPhoto}
                  alt="预览"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editingFlavor ? '保存修改' : '添加口味'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => {
          setIsBatchModalOpen(false);
          setSelectedFlavorForBatch(null);
        }}
        title={`批次管理 - ${selectedFlavorForBatch?.name || ''}`}
        size="lg"
      >
        {selectedFlavorForBatch && (
          <BatchManager
            flavor={selectedFlavorForBatch}
            batches={flavorBatches}
            onAddBatch={handleAddBatch}
            onMarkStatus={handleMarkBatchStatus}
          />
        )}
      </Modal>
    </div>
  );
}

interface BatchManagerProps {
  flavor: FlavorWithStock;
  batches: InventoryBatch[];
  onAddBatch: (quantity: number, expiryDate: string) => void;
  onMarkStatus: (batchId: string, status: 'expired' | 'damp' | 'normal') => void;
}

function BatchManager({ flavor, batches, onAddBatch, onMarkStatus }: BatchManagerProps) {
  const [quantity, setQuantity] = useState(10);
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddBatch(quantity, expiryDate);
    setQuantity(10);
  };

  const statusBadgeClass = {
    normal: 'badge-normal',
    expired: 'badge-expired',
    damp: 'badge-damp',
  };

  const statusLabels = {
    normal: '正常',
    expired: '已过期',
    damp: '已受潮',
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-cream-50 rounded-xl p-4 space-y-4">
        <h4 className="font-bold text-coffee-800">新增批次</h4>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">数量 (颗)</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="input"
            />
          </div>
          <div className="flex-1">
            <label className="label">
              <Calendar className="w-4 h-4 inline mr-1" />
              过期日期
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary">
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
        </div>
      </form>

      <div>
        <h4 className="font-bold text-coffee-800 mb-3">批次列表</h4>
        {batches.length === 0 ? (
          <p className="text-coffee-500 text-center py-8">暂无批次记录</p>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-coffee-100"
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="font-display text-2xl font-bold text-coffee-800">
                      {batch.quantity}
                    </p>
                    <p className="text-xs text-coffee-500">颗</p>
                  </div>
                  <div>
                    <p className="text-sm text-coffee-600">
                      过期: {formatDate(batch.expiryDate)}
                    </p>
                    <p className="text-xs text-coffee-400">
                      入库: {formatDate(batch.createdAt)}
                    </p>
                  </div>
                  <span className={statusBadgeClass[batch.status]}>
                    {statusLabels[batch.status]}
                  </span>
                </div>
                {batch.status === 'normal' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onMarkStatus(batch.id, 'expired')}
                      className="btn-danger text-xs py-1 px-2"
                    >
                      标记过期
                    </button>
                    <button
                      onClick={() => onMarkStatus(batch.id, 'damp')}
                      className="btn-secondary text-xs py-1 px-2"
                    >
                      标记受潮
                    </button>
                  </div>
                )}
                {batch.status !== 'normal' && (
                  <button
                    onClick={() => onMarkStatus(batch.id, 'normal')}
                    className="btn-success text-xs py-1 px-2"
                  >
                    恢复正常
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
