import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  EQUIPMENT_TYPE_LABELS,
  EQUIPMENT_STATUS_LABELS,
} from '@/types';
import type { Equipment, EquipmentType, EquipmentStatus } from '@/types';
import { cn } from '@/lib/utils';

const equipmentEmojis: Record<EquipmentType, string> = {
  snowboard: '🎿',
  shoes: '👟',
  helmet: '⛑️',
  goggles: '🥽',
  gloves: '🧤',
  protector: '🦺',
};

const equipmentColors: Record<EquipmentType, string> = {
  snowboard: 'from-blue-500 to-cyan-400',
  shoes: 'from-emerald-500 to-teal-400',
  helmet: 'from-amber-500 to-orange-400',
  goggles: 'from-violet-500 to-purple-400',
  gloves: 'from-rose-500 to-pink-400',
  protector: 'from-indigo-500 to-blue-400',
};

const statusIcons = {
  good: CheckCircle2,
  worn: AlertTriangle,
  damaged: XCircle,
};

const statusColors: Record<EquipmentStatus, string> = {
  good: 'text-emerald-500 bg-emerald-50',
  worn: 'text-amber-500 bg-amber-50',
  damaged: 'text-red-500 bg-red-50',
};

const emptyEquipment: Omit<Equipment, 'id'> = {
  type: 'snowboard',
  size: '',
  name: '',
  ownerId: '',
  status: 'good',
  hasMyopiaLens: false,
};

export default function EquipmentPage() {
  const { equipment, members, addEquipment, updateEquipment, deleteEquipment } =
    useAppStore();
  const [activeType, setActiveType] = useState<EquipmentType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Omit<Equipment, 'id'>>(emptyEquipment);

  const filteredEquipment =
    activeType === 'all'
      ? equipment
      : equipment.filter((e) => e.type === activeType);

  const getOwnerName = (ownerId: string) => {
    const member = members.find((m) => m.id === ownerId);
    return member?.name || '未知';
  };

  const openAddModal = () => {
    setEditingEquipment(null);
    setFormData(emptyEquipment);
    setIsModalOpen(true);
  };

  const openEditModal = (equip: Equipment) => {
    setEditingEquipment(equip);
    setFormData(equip);
    setIsModalOpen(true);
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

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这件装备吗？')) {
      deleteEquipment(id);
    }
  };

  const types: (EquipmentType | 'all')[] = [
    'all',
    'snowboard',
    'shoes',
    'helmet',
    'goggles',
    'gloves',
    'protector',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">装备清单</h2>
          <p className="text-slate-500 mt-1">
            共 {equipment.length} 件装备 · {members.length} 位成员
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5" />
          添加装备
        </button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {types.map((type) => {
          const emoji = type === 'all' ? '📦' : equipmentEmojis[type];
          const count =
            type === 'all'
              ? equipment.length
              : equipment.filter((e) => e.type === type).length;
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200',
                activeType === type
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
              )}
            >
              <span className="text-lg">{emoji}</span>
              <span>{type === 'all' ? '全部' : EQUIPMENT_TYPE_LABELS[type]}</span>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded-full text-xs font-semibold',
                  activeType === type
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredEquipment.map((equip) => {
          const emoji = equipmentEmojis[equip.type];
          const StatusIcon = statusIcons[equip.status];
          const assignedMember = members.find((m) => m.id === equip.assignedTo);

          return (
            <div
              key={equip.id}
              className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 hover:-translate-y-1"
            >
              <div
                className={cn(
                  'h-28 flex items-center justify-center bg-gradient-to-br relative',
                  equipmentColors[equip.type]
                )}
              >
                <span className="text-5xl">{emoji}</span>
                <div
                  className={cn(
                    'absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium',
                    statusColors[equip.status]
                  )}
                >
                  <StatusIcon className="w-3.5 h-3.5" />
                  {EQUIPMENT_STATUS_LABELS[equip.status]}
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">
                      {equip.name || EQUIPMENT_TYPE_LABELS[equip.type]}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {EQUIPMENT_TYPE_LABELS[equip.type]}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(equip)}
                      className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(equip.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">尺码</span>
                    <span className="font-medium text-slate-700">{equip.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">拥有者</span>
                    <span className="font-medium text-slate-700">
                      {getOwnerName(equip.ownerId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">使用者</span>
                    <span
                      className={cn(
                        'font-medium',
                        assignedMember ? 'text-blue-600' : 'text-slate-400'
                      )}
                    >
                      {assignedMember?.name || '未分配'}
                    </span>
                  </div>
                  {equip.type === 'goggles' && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">近视镜片</span>
                      <span
                        className={cn(
                          'font-medium',
                          equip.hasMyopiaLens ? 'text-emerald-600' : 'text-slate-400'
                        )}
                      >
                        {equip.hasMyopiaLens ? '已配备' : '无'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-800">
                {editingEquipment ? '编辑装备' : '添加装备'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  装备类型
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as EquipmentType })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  {Object.entries(EQUIPMENT_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  名称/品牌
                </label>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="如：Burton Custom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  尺码
                </label>
                <input
                  type="text"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="如：158 / 42 / M / L"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  拥有者
                </label>
                <select
                  value={formData.ownerId}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all bg-white"
                >
                  <option value="">选择拥有者</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  状态
                </label>
                <div className="flex gap-2">
                  {(['good', 'worn', 'damaged'] as EquipmentStatus[]).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setFormData({ ...formData, status })}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium transition-all text-sm',
                        formData.status === status
                          ? status === 'good'
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : status === 'worn'
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'bg-red-500 border-red-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                      )}
                    >
                      {EQUIPMENT_STATUS_LABELS[status]}
                    </button>
                  ))}
                </div>
              </div>

              {formData.type === 'goggles' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    近视镜片
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasMyopiaLens: true })}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium transition-all',
                        formData.hasMyopiaLens
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      )}
                    >
                      已配备
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, hasMyopiaLens: false })}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl border font-medium transition-all',
                        !formData.hasMyopiaLens
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
                      )}
                    >
                      无
                    </button>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all"
                >
                  {editingEquipment ? '保存修改' : '添加装备'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
