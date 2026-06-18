import { useState } from 'react';
import { Plus, Check, Package, Trash2, Edit2, RefreshCw, Users } from 'lucide-react';
import { useDiveStore } from '@/store/useDiveStore';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
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
    members,
    allocations,
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

  const getMemberByEquipmentId = (equipmentId: string) => {
    const alloc = allocations.find((a) => a.equipmentId === equipmentId);
    if (!alloc) return null;
    return members.find((m) => m.id === alloc.memberId) || null;
  };

  const getLuggageItems = (luggageId: string) => {
    return packingItems.filter((p) => p.luggageId === luggageId);
  };

  const getPackedCount = (luggageId: string) => {
    return getLuggageItems(luggageId).filter((p) => p.packed).length;
  };

  const getTotalCount = (luggageId: string) => {
    return getLuggageItems(luggageId).length;
  };

  const getAssignedButUnpackedEquipment = (): Array<{
    eq: Equipment;
    ownerName: string;
    ownerAvatar: string;
  }> => {
    const packedIds = new Set(packingItems.map((p) => p.equipmentId));
    const result: Array<{
      eq: Equipment;
      ownerName: string;
      ownerAvatar: string;
    }> = [];

    allocations.forEach((alloc) => {
      if (packedIds.has(alloc.equipmentId)) return;
      const eq = equipment.find((e) => e.id === alloc.equipmentId);
      const member = members.find((m) => m.id === alloc.memberId);
      if (!eq || eq.status === 'lost' || !member) return;
      result.push({
        eq,
        ownerName: member.name,
        ownerAvatar: member.avatar || '🧑',
      });
    });

    return result;
  };

  const getSyncCount = () => {
    return getAssignedButUnpackedEquipment().length;
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

  const handleSyncFromAllocations = (luggageId: string) => {
    const packedIds = new Set(packingItems.map((p) => p.equipmentId));
    let addedCount = 0;

    allocations.forEach((alloc) => {
      if (packedIds.has(alloc.equipmentId)) return;
      const eq = equipment.find((e) => e.id === alloc.equipmentId);
      if (!eq || eq.status === 'lost') return;
      addPackingItem(luggageId, alloc.equipmentId);
      addedCount++;
    });

    if (addedCount > 0) {
      alert(`已同步 ${addedCount} 件分配好的装备到行李箱`);
    } else {
      alert('没有需要同步的新装备，所有已分配的装备都已经在行李箱里了');
    }
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

      {getSyncCount() > 0 && (
        <div className="glass-card rounded-2xl p-5 mb-6 flex items-center justify-between bg-gradient-to-r from-sand-50 to-ocean-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sand-400/30 flex items-center justify-center text-2xl">
              📋
            </div>
            <div>
              <p className="font-medium text-ocean-800">
                智能分配页有 <span className="font-bold text-coral-600">{getSyncCount()}</span> 件已分配的装备还没装箱
              </p>
              <p className="text-sm text-ocean-500">
                点击下方任意行李箱卡片的「同步分配装备」按钮即可快速装箱
              </p>
            </div>
          </div>
          <Badge variant="warning" size="md">
            {getSyncCount()} 件待装箱
          </Badge>
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
              className="glass-card rounded-2xl overflow-hidden hover:shadow-float transition-all duration-300 group"
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
                      title="编辑行李箱"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('确定删除这个行李箱吗？里面的装备会从打包清单移除，但不会影响分配结果')) {
                          deleteLuggage(lug.id);
                        }
                      }}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-coral-500 hover:bg-coral-50 transition-colors"
                      title="删除行李箱"
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
                    const owner = getMemberByEquipmentId(item.equipmentId);

                    return (
                      <div
                        key={item.id}
                        className={`group/item flex items-center gap-3 p-3 rounded-xl transition-all ${
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
                          title={item.packed ? '取消已打包' : '标记为已打包'}
                        >
                          {item.packed && <Check className="w-4 h-4" />}
                        </button>
                        <span className="text-xl shrink-0">{getEquipmentIcon(eq.type)}</span>
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
                          <p className="text-xs text-ocean-400 flex items-center gap-1">
                            <span>{EQUIPMENT_TYPE_LABELS[eq.type]}</span>
                            {owner && (
                              <>
                                <span>·</span>
                                <span className="inline-flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {owner.avatar} {owner.name}
                                </span>
                              </>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => removePackingItem(item.id)}
                          className="w-7 h-7 rounded-md flex items-center justify-center text-coral-400 hover:text-coral-600 hover:bg-coral-50 opacity-0 group-hover/item:opacity-100 transition-all"
                          title="从行李箱移除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleSyncFromAllocations(lug.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-ocean-600 text-white text-sm font-medium hover:from-ocean-600 hover:to-ocean-700 shadow-md shadow-ocean-500/20 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      同步分配装备
                      {getSyncCount() > 0 && (
                        <span className="ml-0.5 px-1.5 py-0.5 rounded-md bg-white/20 text-xs">
                          {getSyncCount()}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => handleAddItem(lug.id)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-dashed border-ocean-200 text-ocean-500 hover:border-ocean-400 hover:text-ocean-700 text-sm font-medium transition-colors"
                      title="手动添加单个装备"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {luggage.length === 0 && (
          <div className="col-span-full glass-card rounded-2xl p-12 text-center">
            <div className="text-5xl mb-4">🧳</div>
            <p className="text-ocean-500 mb-4">还没有添加行李箱</p>
            <div className="flex items-center justify-center gap-3">
              <Button onClick={handleAddLuggage}>
                <Plus className="w-4 h-4" />
                添加第一个行李箱
              </Button>
            </div>
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
        title="从已分配装备中选择添加"
        size="lg"
      >
        <div className="mb-3 text-sm text-ocean-500 flex items-center gap-2">
          <Users className="w-4 h-4" />
          以下是智能分配页已经分配给成员、但还没进任何行李箱的装备
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          {getAssignedButUnpackedEquipment().length > 0 ? (
            getAssignedButUnpackedEquipment().map(({ eq, ownerName, ownerAvatar }) => (
              <button
                key={eq.id}
                onClick={() => handleAddEquipment(eq.id)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-ocean-50 hover:bg-ocean-100 transition-colors text-left"
              >
                <span className="text-2xl shrink-0">{getEquipmentIcon(eq.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-ocean-800 truncate">
                    {eq.name}
                  </p>
                  <p className="text-sm text-ocean-500">
                    {EQUIPMENT_TYPE_LABELS[eq.type]} · {eq.size} · {eq.owner}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="info" size="sm">
                    {ownerAvatar} {ownerName}
                  </Badge>
                  <Plus className="w-5 h-5 text-ocean-500" />
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">🎉</div>
              <p className="text-ocean-600 font-medium mb-1">
                分配好的装备都装箱啦
              </p>
              <p className="text-ocean-400 text-sm">
                去智能分配页给更多成员分配装备，或者用「同步分配装备」按钮一键装箱
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
