import { useState } from 'react';
import { Plus, Check, Package, Trash2, Edit2 } from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import type { Equipment, Luggage } from '@/types';
import { EQUIPMENT_TYPE_LABELS } from '@/types';

const colorOptions = [
  { value: '#3B82F6', label: '蓝色' },
  { value: '#10B981', label: '绿色' },
  { value: '#F59E0B', label: '橙色' },
  { value: '#EF4444', label: '红色' },
  { value: '#8B5CF6', label: '紫色' },
  { value: '#EC4899', label: '粉色' },
];

export default function Packing() {
  const {
    luggage,
    packingItems,
    equipment,
    addLuggage,
    updateLuggage,
    deleteLuggage,
    addPackingItem,
    togglePacked,
    removePackingItem,
  } = useDiveStore();

  const [isLuggageModalOpen, setIsLuggageModalOpen] = useState(false);
  const [editingLuggage, setEditingLuggage] = useState<Luggage | null>(null);
  const [luggageForm, setLuggageForm] = useState({ name: '', color: '#3B82F6' });

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedLuggageId, setSelectedLuggageId] = useState<string | null>(null);

  const getEquipmentById = (id: string) => equipment.find((e) => e.id === id);

  const getLuggageItems = (luggageId: string) => {
    return packingItems.filter((p) => p.luggageId === luggageId);
  };

  const getPackedCount = (luggageId: string) => {
    return getLuggageItems(luggageId).filter((p) => p.packed).length;
  };

  const getTotalCount = (luggageId: string) => {
    return getLuggageItems(luggageId).length;
  };

  const getUnassignedEquipment = (): Equipment[] => {
    const assignedIds = new Set(packingItems.map((p) => p.equipmentId));
    return equipment.filter((e) => !assignedIds.has(e.id) && e.status !== 'lost');
  };

  const handleAddLuggage = () => {
    setEditingLuggage(null);
    setLuggageForm({ name: '', color: '#3B82F6' });
    setIsLuggageModalOpen(true);
  };

  const handleEditLuggage = (lug: Luggage) => {
    setEditingLuggage(lug);
    setLuggageForm({ name: lug.name, color: lug.color });
    setIsLuggageModalOpen(true);
  };

  const handleSubmitLuggage = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLuggage) {
      updateLuggage(editingLuggage.id, luggageForm);
    } else {
      addLuggage(luggageForm);
    }
    setIsLuggageModalOpen(false);
  };

  const handleAddItem = (luggageId: string) => {
    setSelectedLuggageId(luggageId);
    setIsItemModalOpen(true);
  };

  const handleAddEquipment = (equipmentId: string) => {
    if (selectedLuggageId) {
      addPackingItem(selectedLuggageId, equipmentId);
    }
  };

  const getEquipmentIcon = (type: string) => {
    const icons: Record<string, string> = {
      mask: '🤿',
      snorkel: '🫧',
      fins: '🦶',
      rashGuard: '👕',
      lifeJacket: '🦺',
      dryBag: '🎒',
      actionCam: '📷',
    };
    return icons[type] || '📦';
  };

  const totalPacked = packingItems.filter((p) => p.packed).length;
  const totalItems = packingItems.length;
  const packProgress = totalItems > 0 ? Math.round((totalPacked / totalItems) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="打包清单"
        subtitle="按行李箱整理装备，出发前逐一确认"
      >
        <Button onClick={handleAddLuggage}>
          <Plus className="w-4 h-4" />
          添加行李箱
        </Button>
      </PageHeader>

      {packingItems.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-seafoam-400 to-seafoam-600 flex items-center justify-center text-white">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="font-display font-bold text-ocean-800">
                  打包进度
                </p>
                <p className="text-sm text-ocean-500">
                  {totalPacked} / {totalItems} 件装备已打包
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold text-ocean-700">
                {packProgress}%
              </p>
            </div>
          </div>
          <div className="h-3 bg-ocean-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-seafoam-400 to-seafoam-600 rounded-full transition-all duration-500"
              style={{ width: `${packProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {luggage.map((lug) => {
          const items = getLuggageItems(lug.id);
          const packed = getPackedCount(lug.id);
          const total = getTotalCount(lug.id);
          const progress = total > 0 ? Math.round((packed / total) * 100) : 0;

          return (
            <div
              key={lug.id}
              className="glass-card rounded-2xl overflow-hidden hover:shadow-float transition-all duration-300"
            >
              <div
                className="h-3 w-full"
                style={{ backgroundColor: lug.color }}
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: lug.color + '20' }}
                    >
                      🧳
                    </div>
                    <div>
                      <h3 className="font-display font-bold text-lg text-ocean-800">
                        {lug.name}
                      </h3>
                      <p className="text-sm text-ocean-500">
                        {packed}/{total} 件已打包
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEditLuggage(lug)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-ocean-500 hover:bg-ocean-100 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除这个行李箱吗？')) {
                          deleteLuggage(lug.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-coral-500 hover:bg-coral-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="h-2 bg-ocean-100 rounded-full mb-4 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: lug.color,
                    }}
                  />
                </div>

                <div className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin">
                  {items.map((item) => {
                    const eq = getEquipmentById(item.equipmentId);
                    if (!eq) return null;

                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                          item.packed
                            ? 'bg-seafoam-50 border border-seafoam-200'
                            : 'bg-ocean-50/50 border border-transparent hover:bg-ocean-50'
                        }`}
                      >
                        <button
                          onClick={() => togglePacked(item.id)}
                          className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all ${
                            item.packed
                              ? 'bg-seafoam-500 border-seafoam-500 text-white'
                              : 'border-ocean-300 hover:border-ocean-500'
                          }`}
                        >
                          {item.packed && <Check className="w-4 h-4" />}
                        </button>
                        <span className="text-xl">{getEquipmentIcon(eq.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-medium text-sm truncate ${
                              item.packed
                                ? 'text-seafoam-700 line-through'
                                : 'text-ocean-700'
                            }`}
                          >
                            {eq.name}
                          </p>
                          <p className="text-xs text-ocean-400">
                            {EQUIPMENT_TYPE_LABELS[eq.type]} · {eq.owner}
                          </p>
                        </div>
                        <button
                          onClick={() => removePackingItem(item.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-coral-400 hover:text-coral-600 hover:bg-coral-50 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => handleAddItem(lug.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-ocean-200 text-ocean-500 hover:border-ocean-400 hover:text-ocean-700 transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    添加装备
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {luggage.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🧳</div>
            <p className="text-ocean-500 mb-4">还没有添加行李箱</p>
            <Button onClick={handleAddLuggage}>
              <Plus className="w-4 h-4" />
              添加第一个行李箱
            </Button>
          </div>
        )}
      </div>

      <Modal
        isOpen={isLuggageModalOpen}
        onClose={() => setIsLuggageModalOpen(false)}
        title={editingLuggage ? '编辑行李箱' : '添加行李箱'}
        size="md"
      >
        <form onSubmit={handleSubmitLuggage} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              行李箱名称
            </label>
            <input
              type="text"
              value={luggageForm.name}
              onChange={(e) =>
                setLuggageForm({ ...luggageForm, name: e.target.value })
              }
              className="w-full px-4 py-2.5 rounded-xl border border-ocean-200 focus:border-ocean-500 focus:ring-2 focus:ring-ocean-500/20 outline-none transition-all bg-white"
              placeholder="如：大号行李箱、登机箱"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ocean-700 mb-2">
              颜色标记
            </label>
            <div className="flex gap-2 flex-wrap">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() =>
                    setLuggageForm({ ...luggageForm, color: color.value })
                  }
                  className={`w-10 h-10 rounded-xl transition-all ${
                    luggageForm.color === color.value
                      ? 'ring-2 ring-offset-2 ring-ocean-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsLuggageModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit">
              {editingLuggage ? '保存修改' : '添加行李箱'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="选择装备添加"
        size="lg"
      >
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {getUnassignedEquipment().length > 0 ? (
            getUnassignedEquipment().map((eq) => (
              <button
                key={eq.id}
                onClick={() => handleAddEquipment(eq.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-ocean-50 hover:bg-ocean-100 transition-colors text-left"
              >
                <span className="text-2xl">{getEquipmentIcon(eq.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ocean-800 truncate">
                    {eq.name}
                  </p>
                  <p className="text-sm text-ocean-500">
                    {EQUIPMENT_TYPE_LABELS[eq.type]} · {eq.size} · {eq.owner}
                  </p>
                </div>
                <Plus className="w-5 h-5 text-ocean-500" />
              </button>
            ))
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-ocean-500">所有装备都已分配到行李箱了</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
