import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronLeft,
  ChevronRight,
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

  // Lightbox 状态
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxEquipmentId, setLightboxEquipmentId] = useState<string | null>(null);

  // 加载失败的图片集合
  const [failedPhotoIds, setFailedPhotoIds] = useState<Set<string>>(new Set());

  // 判断装备是否有有效照片（有 photo 且未加载失败）
  const hasValidPhoto = (equipId: string): boolean => {
    const equip = equipment.find((e) => e.id === equipId);
    return !!(equip?.photo && !failedPhotoIds.has(equipId));
  };

  // 标记图片加载失败
  const markPhotoFailed = (equipId: string) => {
    setFailedPhotoIds((prev) => new Set(prev).add(equipId));
    // 如果正在看的图失败了，自动关闭或切图
    if (lightboxEquipmentId === equipId && lightboxOpen) {
      const siblings = getSiblingEquipmentWithPhotos(equipId);
      if (siblings.length > 0) {
        setLightboxEquipmentId(siblings[0].id);
      } else {
        closeLightbox();
      }
    }
  };

  // 获取同类有有效照片的装备列表
  const getSiblingEquipmentWithPhotos = useCallback(
    (currentEquipId: string): Equipment[] => {
      const current = equipment.find((e) => e.id === currentEquipId);
      if (!current) return [];
      return equipment.filter(
        (e) => e.type === current.type && e.photo && !failedPhotoIds.has(e.id)
      );
    },
    [equipment, failedPhotoIds]
  );

  // 获取当前 Lightbox 装备
  const lightboxEquipment = equipment.find((e) => e.id === lightboxEquipmentId) || null;

  // 切换到上一张
  const goToPrev = useCallback(() => {
    if (!lightboxEquipmentId) return;
    const siblings = getSiblingEquipmentWithPhotos(lightboxEquipmentId);
    const idx = siblings.findIndex((e) => e.id === lightboxEquipmentId);
    if (idx > 0) {
      setLightboxEquipmentId(siblings[idx - 1].id);
    } else if (siblings.length > 0) {
      setLightboxEquipmentId(siblings[siblings.length - 1].id);
    }
  }, [lightboxEquipmentId, getSiblingEquipmentWithPhotos]);

  // 切换到下一张
  const goToNext = useCallback(() => {
    if (!lightboxEquipmentId) return;
    const siblings = getSiblingEquipmentWithPhotos(lightboxEquipmentId);
    const idx = siblings.findIndex((e) => e.id === lightboxEquipmentId);
    if (idx < siblings.length - 1) {
      setLightboxEquipmentId(siblings[idx + 1].id);
    } else if (siblings.length > 0) {
      setLightboxEquipmentId(siblings[0].id);
    }
  }, [lightboxEquipmentId, getSiblingEquipmentWithPhotos]);

  // 打开 Lightbox
  const openLightbox = (equipId: string) => {
    if (!hasValidPhoto(equipId)) return;
    setLightboxEquipmentId(equipId);
    setLightboxOpen(true);
  };

  // 关闭 Lightbox
  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxEquipmentId(null);
  };

  // 键盘事件
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, goToPrev, goToNext]);

  // 阻止背景滚动
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightboxOpen]);

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
              {hasValidPhoto(equip.id) ? (
                <div
                  className="relative h-44 bg-slate-100 cursor-zoom-in group/photo"
                  onClick={() => openLightbox(equip.id)}
                >
                  <img
                    src={equip.photo as string}
                    alt={equip.name || EQUIPMENT_TYPE_LABELS[equip.type]}
                    className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-500"
                    loading="lazy"
                    draggable={false}
                    onError={() => markPhotoFailed(equip.id)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 opacity-60 group-hover/photo:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                      点击放大
                    </div>
                  </div>
                  <div
                    className={cn(
                      'absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-sm',
                      statusColors[equip.status]
                    )}
                  >
                    <StatusIcon className="w-3.5 h-3.5" />
                    {EQUIPMENT_STATUS_LABELS[equip.status]}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-white/80 backdrop-blur-sm text-xs font-medium text-slate-700 shadow-sm">
                      {EQUIPMENT_TYPE_LABELS[equip.type]}
                    </span>
                  </div>
                </div>
              ) : (
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
              )}

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
                  照片 URL
                </label>
                <input
                  type="url"
                  value={formData.photo || ''}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  placeholder="https://example.com/photo.jpg 或留空使用图标"
                />
                {formData.photo && (
                  <div className="mt-3">
                    <div className="text-xs text-slate-500 mb-1.5">预览：</div>
                    <div className="relative w-full h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                      <img
                        src={formData.photo}
                        alt="预览"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = 'none';
                          const parent = (e.currentTarget as HTMLImageElement)
                            .parentElement as HTMLElement;
                          if (parent && !parent.querySelector('.preview-error')) {
                            const err = document.createElement('div');
                            err.className =
                              'preview-error absolute inset-0 flex flex-col items-center justify-center text-slate-400';
                            err.innerHTML = `<span class="text-3xl mb-1">⚠️</span><span class="text-xs">图片加载失败</span>`;
                            parent.appendChild(err);
                          }
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, photo: undefined })}
                      className="mt-2 text-xs text-red-500 hover:text-red-600"
                    >
                      清除照片
                    </button>
                  </div>
                )}
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

      {/* Lightbox 大图查看 */}
      {lightboxOpen && lightboxEquipment && hasValidPhoto(lightboxEquipment.id) && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4 sm:p-6"
          onClick={closeLightbox}
        >
          {/* 关闭按钮 */}
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 border border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              closeLightbox();
            }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* 计数 */}
          <div className="absolute top-4 left-4 sm:top-6 sm:left-6 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-sm font-medium border border-white/20">
            {(() => {
              const siblings = getSiblingEquipmentWithPhotos(lightboxEquipment.id);
              const idx = siblings.findIndex((e) => e.id === lightboxEquipment.id);
              return `${idx + 1} / ${siblings.length} · ${EQUIPMENT_TYPE_LABELS[lightboxEquipment.type]}`;
            })()}
          </div>

          {/* 上一张按钮 */}
          <button
            className="absolute left-2 sm:left-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 z-10 border border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
          >
            <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* 下一张按钮 */}
          <button
            className="absolute right-2 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all hover:scale-110 z-10 border border-white/20"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
          >
            <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          {/* 图片 + 信息内容 */}
          <div
            className="w-full max-w-4xl flex flex-col items-center gap-5 animate-[zoomIn_0.25s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 大图 */}
            <div className="relative w-full aspect-square max-w-[500px] sm:max-w-[560px] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <img
                src={lightboxEquipment.photo as string}
                alt={lightboxEquipment.name || EQUIPMENT_TYPE_LABELS[lightboxEquipment.type]}
                className="w-full h-full object-cover"
                onError={() => markPhotoFailed(lightboxEquipment.id)}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/10 to-transparent" />
            </div>

            {/* 信息卡片 */}
            <div className="w-full max-w-[500px] sm:max-w-[560px] bg-white/10 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-white/15 text-white">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-2xl">{equipmentEmojis[lightboxEquipment.type]}</span>
                    <h3 className="text-xl font-bold truncate">
                      {lightboxEquipment.name || EQUIPMENT_TYPE_LABELS[lightboxEquipment.type]}
                    </h3>
                  </div>
                  <div className="text-white/60 text-sm">
                    {EQUIPMENT_TYPE_LABELS[lightboxEquipment.type]}
                  </div>
                </div>
                <div
                  className={cn(
                    'flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0',
                    statusColors[lightboxEquipment.status].replace(
                      /(text-\w+-500)/,
                      'text-white bg-white/20'
                    )
                  )}
                >
                  {(() => {
                    const SIcon = statusIcons[lightboxEquipment.status];
                    return <SIcon className="w-3.5 h-3.5" />;
                  })()}
                  {EQUIPMENT_STATUS_LABELS[lightboxEquipment.status]}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/10">
                <div>
                  <div className="text-white/50 text-xs mb-1">尺码</div>
                  <div className="font-semibold text-lg">{lightboxEquipment.size}</div>
                </div>
                <div>
                  <div className="text-white/50 text-xs mb-1">拥有者</div>
                  <div className="font-semibold text-lg truncate">
                    {getOwnerName(lightboxEquipment.ownerId)}
                  </div>
                </div>
                <div>
                  <div className="text-white/50 text-xs mb-1">使用者</div>
                  <div className="font-semibold text-lg truncate">
                    {lightboxEquipment.assignedTo
                      ? getOwnerName(lightboxEquipment.assignedTo)
                      : '未分配'}
                  </div>
                </div>
              </div>

              {lightboxEquipment.type === 'goggles' && (
                <div className="mt-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-violet-500/20 border border-violet-400/30">
                  <span className="text-sm">
                    {lightboxEquipment.hasMyopiaLens ? '✅' : '⚠️'}
                  </span>
                  <span className="text-sm font-medium">
                    近视镜片：{lightboxEquipment.hasMyopiaLens ? '已配备' : '未配备'}
                  </span>
                </div>
              )}
            </div>

            {/* 键盘提示 */}
            <div className="hidden sm:flex items-center gap-4 text-white/40 text-xs">
              <span className="px-2 py-1 rounded border border-white/20">←</span>
              <span>上一张</span>
              <span className="px-2 py-1 rounded border border-white/20">→</span>
              <span>下一张</span>
              <span className="px-2 py-1 rounded border border-white/20">Esc</span>
              <span>关闭</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
