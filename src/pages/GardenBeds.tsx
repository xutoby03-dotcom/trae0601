import React, { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Filter,
  MapPin,
  User,
  Calendar,
  Droplets,
  Sun,
  CloudSun,
  Cloud,
  Edit,
  Trash2,
  Info,
  Sprout,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../store/useStore.js';
import GardenBedCard from '../components/GardenBedCard.js';
import {
  CROP_EMOJIS,
  SHADE_CONDITION_LABELS,
  CROP_STATUS_LABELS,
  CROP_GROWTH_CYCLES,
} from '@shared/types.js';
import { formatDate, calculateGrowthProgress } from '../utils/dateUtils.js';
import type { GardenBed, ShadeCondition, CropStatus } from '@shared/types.js';

const GardenBeds: React.FC = () => {
  const {
    gardenBeds,
    loading,
    fetchGardenBeds,
    createGardenBed,
    updateGardenBed,
    deleteGardenBed,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCrop, setFilterCrop] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<CropStatus | 'all'>('all');
  const [selectedBed, setSelectedBed] = useState<GardenBed | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<GardenBed>>({});

  useEffect(() => {
    fetchGardenBeds();
  }, [fetchGardenBeds]);

  const crops = Array.from(new Set(gardenBeds.map((b) => b.crop)));

  const filteredBeds = gardenBeds.filter((bed) => {
    const matchesSearch =
      bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.crop.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.growerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = filterCrop === 'all' || bed.crop === filterCrop;
    const matchesStatus = filterStatus === 'all' || bed.status === filterStatus;
    return matchesSearch && matchesCrop && matchesStatus;
  });

  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      bedNumber: '',
      growerName: '',
      crop: '',
      plantDate: formatDate(new Date()),
      wateringFrequency: 2,
      shadeCondition: 'full_sun',
      status: 'growing',
    });
    setShowModal(true);
  };

  const handleEdit = (bed: GardenBed) => {
    setIsEditing(true);
    setSelectedBed(bed);
    setFormData(bed);
    setShowModal(true);
  };

  const handleViewDetails = (bed: GardenBed) => {
    setSelectedBed(bed);
    setShowModal(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要删除这个菜畦档案吗？')) {
      await deleteGardenBed(id);
      setSelectedBed(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedBed) {
        await updateGardenBed(selectedBed.id, formData);
      } else {
        await createGardenBed(formData as Omit<GardenBed, 'id'>);
      }
      setShowModal(false);
      setFormData({});
    } catch (error) {
      alert('保存失败，请重试');
    }
  };

  const getShadeIcon = (condition: ShadeCondition) => {
    switch (condition) {
      case 'full_sun':
        return <Sun size={18} className="text-sun-500" />;
      case 'partial_shade':
        return <CloudSun size={18} className="text-sky-500" />;
      case 'full_shade':
        return <Cloud size={18} className="text-forest-500" />;
    }
  };

  const getStatusIcon = (status: CropStatus) => {
    switch (status) {
      case 'growing':
        return <Sprout size={18} className="text-primary-500" />;
      case 'ready_to_harvest':
        return <CheckCircle size={18} className="text-sun-500" />;
      case 'needs_attention':
        return <AlertCircle size={18} className="text-red-500" />;
      case 'dormant':
        return <Info size={18} className="text-soil-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-forest-800">菜畦档案</h1>
          <p className="text-forest-600 mt-1">
            共 {gardenBeds.length} 块菜畦 · {crops.length} 种作物
          </p>
        </div>
        <button onClick={handleAddNew} className="btn btn-primary">
          <Plus size={18} />
          新增菜畦
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-forest-400" />
            <input
              type="text"
              placeholder="搜索菜畦编号、作物、种植人..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterCrop}
              onChange={(e) => setFilterCrop(e.target.value)}
              className="input min-w-[120px]"
            >
              <option value="all">全部作物</option>
              {crops.map((crop) => (
                <option key={crop} value={crop}>
                  {CROP_EMOJIS[crop] || '🌱'} {crop}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as CropStatus | 'all')}
              className="input min-w-[120px]"
            >
              <option value="all">全部状态</option>
              {Object.entries(CROP_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map((bed) => {
          const growthProgress = calculateGrowthProgress(
            bed.plantDate,
            CROP_GROWTH_CYCLES[bed.crop] || CROP_GROWTH_CYCLES['默认']
          );
          return (
            <GardenBedCard
              key={bed.id}
              gardenBed={bed}
              growthProgress={growthProgress}
              showDetails={true}
              onClick={() => handleViewDetails(bed)}
            />
          );
        })}
      </div>

      {filteredBeds.length === 0 && (
        <div className="card text-center py-12">
          <MapPin size={48} className="mx-auto mb-3 text-forest-300" />
          <p className="text-forest-500">
            {searchTerm || filterCrop !== 'all' || filterStatus !== 'all'
              ? '没有找到匹配的菜畦'
              : '暂无菜畦档案，点击右上角新增'}
          </p>
        </div>
      )}

      {selectedBed && !showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream-50 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-cream-50 border-b border-cream-200 p-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-serif font-bold text-forest-800 flex items-center gap-2">
                  <MapPin size={22} className="text-primary-600" />
                  菜畦 {selectedBed.bedNumber}
                </h2>
                <span
                  className={`inline-flex items-center gap-1 mt-1 badge ${selectedBed.status}`}
                >
                  {getStatusIcon(selectedBed.status)}
                  {CROP_STATUS_LABELS[selectedBed.status]}
                </span>
              </div>
              <button
                onClick={() => setSelectedBed(null)}
                className="text-forest-400 hover:text-forest-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedBed.photoUrl && (
                <img
                  src={selectedBed.photoUrl}
                  alt={`菜畦 ${selectedBed.bedNumber}`}
                  className="w-full h-48 object-cover rounded-xl"
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/70 rounded-xl p-4">
                  <p className="text-sm text-forest-500 mb-1 flex items-center gap-1">
                    <Sprout size={14} /> 作物
                  </p>
                  <p className="font-medium text-forest-800">
                    {CROP_EMOJIS[selectedBed.crop] || '🌱'} {selectedBed.crop}
                  </p>
                </div>
                <div className="bg-white/70 rounded-xl p-4">
                  <p className="text-sm text-forest-500 mb-1 flex items-center gap-1">
                    <User size={14} /> 种植人
                  </p>
                  <p className="font-medium text-forest-800">{selectedBed.growerName}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4">
                  <p className="text-sm text-forest-500 mb-1 flex items-center gap-1">
                    <Calendar size={14} /> 播种日期
                  </p>
                  <p className="font-medium text-forest-800">{selectedBed.plantDate}</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4">
                  <p className="text-sm text-forest-500 mb-1 flex items-center gap-1">
                    <Droplets size={14} /> 浇水频率
                  </p>
                  <p className="font-medium text-forest-800">每 {selectedBed.wateringFrequency} 天</p>
                </div>
                <div className="bg-white/70 rounded-xl p-4">
                  <p className="text-sm text-forest-500 mb-1 flex items-center gap-1">
                    {getShadeIcon(selectedBed.shadeCondition)} 遮阴情况
                  </p>
                  <p className="font-medium text-forest-800">
                    {SHADE_CONDITION_LABELS[selectedBed.shadeCondition]}
                  </p>
                </div>
                <div className="bg-white/70 rounded-xl p-4">
                  <p className="text-sm text-forest-500 mb-1">上次浇水</p>
                  <p className="font-medium text-forest-800">
                    {selectedBed.lastWateredAt
                      ? formatDate(new Date(selectedBed.lastWateredAt))
                      : '暂无记录'}
                  </p>
                </div>
              </div>

              <div className="bg-white/70 rounded-xl p-4">
                <p className="text-sm text-forest-500 mb-2">生长进度</p>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${calculateGrowthProgress(
                        selectedBed.plantDate,
                        CROP_GROWTH_CYCLES[selectedBed.crop] || CROP_GROWTH_CYCLES['默认']
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-forest-600 mt-2">
                  {calculateGrowthProgress(
                    selectedBed.plantDate,
                    CROP_GROWTH_CYCLES[selectedBed.crop] || CROP_GROWTH_CYCLES['默认']
                  )}
                  % 成熟期 (预计 {Math.ceil(
                    (CROP_GROWTH_CYCLES[selectedBed.crop] || CROP_GROWTH_CYCLES['默认']) *
                      (1 -
                        calculateGrowthProgress(
                          selectedBed.plantDate,
                          CROP_GROWTH_CYCLES[selectedBed.crop] || CROP_GROWTH_CYCLES['默认']
                        ) /
                        100)
                  )}{' '}
                  天后可采摘)
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(selectedBed)}
                  className="flex-1 btn btn-secondary"
                >
                  <Edit size={18} />
                  编辑
                </button>
                <button
                  onClick={() => handleDelete(selectedBed.id)}
                  className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-cream-50 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="sticky top-0 bg-cream-50 border-b border-cream-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-serif font-bold text-forest-800">
                {isEditing ? '编辑菜畦' : '新增菜畦'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-forest-400 hover:text-forest-600 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">
                  菜畦编号 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.bedNumber || ''}
                  onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
                  placeholder="如: A-01"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">
                  种植人 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.growerName || ''}
                  onChange={(e) => setFormData({ ...formData, growerName: e.target.value })}
                  placeholder="种植人姓名"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">
                  作物 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.crop || ''}
                  onChange={(e) => setFormData({ ...formData, crop: e.target.value })}
                  placeholder="如: 番茄、黄瓜、生菜"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">
                    播种日期 *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.plantDate || ''}
                    onChange={(e) => setFormData({ ...formData, plantDate: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-forest-700 mb-1">
                    浇水频率(天) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="14"
                    required
                    value={formData.wateringFrequency || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, wateringFrequency: parseInt(e.target.value) })
                    }
                    className="input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">
                  遮阴情况 *
                </label>
                <select
                  required
                  value={formData.shadeCondition || 'full_sun'}
                  onChange={(e) =>
                    setFormData({ ...formData, shadeCondition: e.target.value as ShadeCondition })
                  }
                  className="input"
                >
                  {Object.entries(SHADE_CONDITION_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">
                  作物状态 *
                </label>
                <select
                  required
                  value={formData.status || 'growing'}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as CropStatus })
                  }
                  className="input"
                >
                  {Object.entries(CROP_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-forest-700 mb-1">
                  照片URL
                </label>
                <input
                  type="url"
                  value={formData.photoUrl || ''}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="https://..."
                  className="input"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn btn-outline"
                >
                  取消
                </button>
                <button type="submit" className="flex-1 btn btn-primary">
                  {isEditing ? '保存修改' : '创建菜畦'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GardenBeds;
