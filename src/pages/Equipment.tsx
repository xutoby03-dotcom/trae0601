import { useState } from 'react';
import { Plus, Edit2, Trash2, User, Tag, Battery } from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import type { Equipment, EquipmentType, EquipmentStatus } from '@/types';
import { EQUIPMENT_TYPE_LABELS, EQUIPMENT_STATUS_LABELS } from '@/types';

const equipmentTabs: { type: EquipmentType; icon: string; label: string }[] = [
  { type: 'mask', icon: '🤿', label: '面镜' },
  { type: 'snorkel', icon: '🫧', label: '呼吸管' },
  { type: 'fins', icon: '🦶', label: '脚蹼' },
  { type: 'rashGuard', icon: '👕', label: '防晒衣' },
  { type: 'lifeJacket', icon: '🦺', label: '救生衣' },
  { type: 'dryBag', icon: '🎒', label: '防水袋' },
  { type: 'actionCam', icon: '📷', label: '运动相机' },
];

const emptyEquipment: Omit<Equipment, 'id'> = {
  type: 'mask',
  name: '',
  size: '',
  owner: '',
  status: 'good',
  photo: '🤿',
  batteryLevel: 100,
  hasPrescriptionLens: false,
  notes: '',
};

const statusOptions: { value: EquipmentStatus; label: string; color: string }[] = [
  { value: 'good', label: '良好', color: 'success' },
  { value: 'damaged', label: '损坏', color: 'warning' },
  { value: 'maintenance', label: '维修中', color: 'info' },
  { value: 'lost', label: '丢失', color: 'error' },
];

const getStatusBadgeVariant = (status: EquipmentStatus): 'success' | 'warning' | 'error' | 'info' => {
  switch (status) {
    case 'good': return 'success';
    case 'damaged': return 'warning';
    case 'lost': return 'error';
    default: return 'info';
  }
};

export default function EquipmentPage() {
  const { equipment, addEquipment, updateEquipment, deleteEquipment, getEquipmentByType } =
    useDiveStore();
  const [activeTab, setActiveTab] = useState<EquipmentType>('mask');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>(emptyEquipment);

  const filteredEquipment = getEquipmentByType(activeTab);

  const handleAdd = () => {
    setEditingEquipment(null);
    setFormData({ ...emptyEquipment, type: activeTab });
    setIsModalOpen(true);
  };

  const handleEdit = (eq: Equipment) => {
    setEditingEquipment(eq);
    setFormData(eq);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这件装备吗？')) {
      deleteEquipment(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEquipment) {
      updateEquipment(editingEquipment.id, formData);
    } else {
      addEquipment(formData);
    }
    setIsModalOpen(false);
  };

  const getEquipmentIcon = (type: EquipmentType) => {
    return equipmentTabs.find((t) => t.type === type)?.icon || '📦';
  };

  const getBatteryColor = (level?: number) => {
    if (level === undefined) return '';
    if (level > 60) return 'text-seafoam-500';
    if (level > 30) return 'text-sand-500';
    return 'text-coral-500';
  };

  return (
    <div>
      <PageHeader
        title="装备档案"
        subtitle="管理所有潜水装备"
      >
        <Button onClick={handleAdd}>
          <Plus className="w-4 h-4" />
          添加装备
        </Button>
      </PageHeader>

      <div className="glass-card rounded-2xl p-2 mb-6">
        <div className="flex gap-1 flex-wrap">
          {equipmentTabs.map((tab) => {
            const count = getEquipmentByType(tab.type).length;
            return (
              <button
                key={tab.type}
                onClick={() => setActiveTab(tab.type)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                  activeTab === tab.type
                    ? 'bg-gradient-to-r from-ocean-500 to-ocean-600 text-white shadow-lg shadow-ocean-500/30'
                    : 'text-ocean-600 hover:bg-ocean-50'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                <Badge
                  variant={activeTab === tab.type ? 'default' : 'info'}
                  size="sm"
                  className={activeTab === tab.type ? 'bg-white/20 text-white' : ''}
                >
                  {count}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEquipment.map((eq) => (
          <div
            key={eq.id}
            className="glass-card rounded-2xl p-5 hover:shadow-float transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-ocean-100 to-ocean-200 flex items-center justify-center text-4xl">
                {eq.photo || getEquipmentIcon(eq.type)}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(eq)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ocean-500 hover:bg-ocean-100 hover:text-ocean-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(eq.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-coral-500 hover:bg-coral-50 hover:text-coral-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="font-display font-bold text-ocean-800 mb-1 truncate">
              {eq.name}
            </h3>
            <Badge variant={getStatusBadgeVariant(eq.status)} size="sm">
              {EQUIPMENT_STATUS_LABELS[eq.status]}
            </Badge>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-ocean-600">
                <Tag className="w-4 h-4 text-ocean-400" />
                <span>尺码: {eq.size}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ocean-600">
                <User className="w-4 h-4 text-ocean-400" />
                <span>拥有者: {eq.owner}</span>
              </div>
              {eq.type === 'actionCam' && eq.batteryLevel !== undefined && (
                <div className="flex items-center gap-2 text-sm">
                  <Battery className={`w-4 h-4 ${getBatteryColor(eq.batteryLevel)}`} />
                  <span className={getBatteryColor(eq.batteryLevel)}>
                    电量: {eq.batteryLevel}%
                  </span>
                </div>
              )}
              {eq.type === 'mask' && (
                <div className="text-sm">
                  {eq.hasPrescriptionLens ? (
                    <Badge variant="success" size="sm">
                      ✓ 带度数镜片
                    </Badge>
                  ) : (
                    <Badge variant="warning" size="sm">
                      无度数镜片
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {eq.notes && (
              <div className="mt-3 pt-3 border-t border-ocean-100">
                <p className="text-xs text-ocean-500 line-clamp-2">{eq.notes}</p>
              </div>
            )}
          </div>
        ))}

        {filteredEquipment.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">{getEquipmentIcon(activeTab)}</div>
            <p className="text-ocean-500 mb-4">
              还没有{EQUIPMENT_TYPE_LABELS[activeTab]}
            </p>
            <Button onClick={handleAdd}>
              <Plus className="w-4 h-4" />
              添加第一件
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEquipment ? '编辑装备' : '添加装备'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                装备类型
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as EquipmentType,
                    photo: getEquipmentIcon(e.target.value as EquipmentType),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
              >
                {equipmentTabs.map((tab) => (
                  <option key={tab.type} value={tab.type}>
                    {tab.icon} {tab.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                状态
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as EquipmentStatus,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              装备名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
              placeholder="请输入装备名称"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                尺码
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
                placeholder="如：M码、42-43码"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                拥有者
              </label>
              <input
                type="text"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
                placeholder="谁的装备"
              />
            </div>
          </div>

          {formData.type === 'mask' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="prescriptionLens"
                checked={formData.hasPrescriptionLens}
                onChange={(e) =>
                  setFormData({ ...formData, hasPrescriptionLens: e.target.checked })
                }
                className="w-5 h-5 rounded border-ocean-300 text-ocean-600 focus:ring-ocean-500"
              />
              <label htmlFor="prescriptionLens" className="text-sm font-medium text-ocean-700">
                带度数镜片
              </label>
            </div>
          )}

          {formData.type === 'actionCam' && (
            <div>
              <label className="block text-sm font-medium text-ocean-700 mb-2">
                电池电量 ({formData.batteryLevel}%)
              </label>
              <input
                type="range"
                value={formData.batteryLevel || 100}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    batteryLevel: parseInt(e.target.value),
                  })
                }
                min="0"
                max="100"
                className="w-full h-2 bg-ocean-100 rounded-lg appearance-none cursor-pointer accent-ocean-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              备注
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white resize-none"
              rows={3}
              placeholder="装备描述、注意事项等"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit">
              {editingEquipment ? '保存修改' : '添加装备'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
