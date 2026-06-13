import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGearStore } from '../stores/useGearStore';
import { RainGearCard } from '../components/RainGearCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import type { GearType, GearStatus, CreateGearDto, UpdateGearDto } from '../types';
import { Plus, Search, Filter, Edit2, Trash2, X, Upload, Check } from 'lucide-react';
import { cn } from '../lib/utils';

const typeOptions: { value: GearType; label: string }[] = [
  { value: 'umbrella', label: '雨伞' },
  { value: 'raincoat', label: '雨衣' },
  { value: 'shoecover', label: '鞋套' },
  { value: 'other', label: '其他' },
];

const statusOptions: { value: GearStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'in_cabinet', label: '在柜' },
  { value: 'lent', label: '借出中' },
  { value: 'drying', label: '待晾干' },
  { value: 'damaged', label: '已破损' },
];

const colorOptions = [
  { value: '黑色', label: '黑色', color: '#000000' },
  { value: '白色', label: '白色', color: '#ffffff' },
  { value: '红色', label: '红色', color: '#ef4444' },
  { value: '蓝色', label: '蓝色', color: '#3b82f6' },
  { value: '绿色', label: '绿色', color: '#22c55e' },
  { value: '黄色', label: '黄色', color: '#eab308' },
  { value: '紫色', label: '紫色', color: '#a855f7' },
  { value: '粉色', label: '粉色', color: '#ec4899' },
  { value: '橙色', label: '橙色', color: '#f97316' },
  { value: '墨绿色', label: '墨绿色', color: '#065f46' },
  { value: '透明', label: '透明', color: 'linear-gradient(135deg, #e0e7ff, #f0fdf4)' },
];

interface GearFormProps {
  initialData?: any;
  onSubmit: (data: CreateGearDto | UpdateGearDto) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

function GearForm({ initialData, onSubmit, onCancel, isEdit }: GearFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    type: (initialData?.type as GearType) || 'umbrella',
    color: initialData?.color || '黑色',
    location: initialData?.location || '',
    suitableFor: initialData?.suitableFor || '',
    isDamaged: initialData?.isDamaged || false,
    photoUrl: initialData?.photoUrl || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入雨具名称';
    if (!formData.location.trim()) newErrors.location = '请输入存放位置';
    if (!formData.suitableFor.trim()) newErrors.suitableFor = '请输入适用人';
    if (!formData.photoUrl.trim()) newErrors.photoUrl = '请上传照片';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const generatePhotoUrl = () => {
    const typeLabel = typeOptions.find((t) => t.value === formData.type)?.label || '雨具';
    const colorLabel = formData.color;
    const prompt = `${colorLabel}%20${typeLabel}%20product%20photo%20on%20white%20background`;
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${prompt}&image_size=square`;
    setFormData({ ...formData, photoUrl: url });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          雨具名称 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="例如：大黑伞、粉色折叠伞"
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.name ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
          )}
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            类型 <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as GearType })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {typeOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            颜色 <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, color: opt.value })}
                className={cn(
                  'w-8 h-8 rounded-full border-2 transition-all relative',
                  formData.color === opt.value ? 'border-blue-500 scale-110' : 'border-slate-200 hover:border-slate-400'
                )}
                style={{ background: opt.color }}
                title={opt.label}
              >
                {formData.color === opt.value && (
                  <Check className="w-4 h-4 absolute inset-0 m-auto text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          存放位置 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="例如：门口雨伞架-第一层"
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.location ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
          )}
        />
        {errors.location && <p className="mt-1 text-sm text-red-500">{errors.location}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          适用人 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.suitableFor}
          onChange={(e) => setFormData({ ...formData, suitableFor: e.target.value })}
          placeholder="例如：爸爸、妈妈、孩子、全家"
          className={cn(
            'w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
            errors.suitableFor ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
          )}
        />
        {errors.suitableFor && <p className="mt-1 text-sm text-red-500">{errors.suitableFor}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          照片 <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="flex-1">
            <input
              type="text"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="图片URL"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500',
                errors.photoUrl ? 'border-red-300 focus:ring-red-500' : 'border-slate-200'
              )}
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={generatePhotoUrl}
            className="shrink-0"
          >
            <Upload className="w-4 h-4 mr-1.5" />
            自动生成
          </Button>
        </div>
        {formData.photoUrl && (
          <div className="mt-3 w-32 h-32 rounded-xl overflow-hidden border border-slate-200">
            <img
              src={formData.photoUrl}
              alt="预览"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        {errors.photoUrl && <p className="mt-1 text-sm text-red-500">{errors.photoUrl}</p>}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isDamaged"
          checked={formData.isDamaged}
          onChange={(e) => setFormData({ ...formData, isDamaged: e.target.checked })}
          className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="isDamaged" className="text-sm text-slate-700">
          该雨具有破损
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          取消
        </Button>
        <Button type="submit" className="flex-1">
          {isEdit ? '保存修改' : '新增雨具'}
        </Button>
      </div>
    </form>
  );
}

export function GearArchive() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { gears, fetchGears, createGear, updateGear, deleteGear, loading } = useGearStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<GearType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<GearStatus | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGear, setEditingGear] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchGears();
    if (searchParams.get('action') === 'add') {
      setShowAddModal(true);
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [fetchGears, searchParams, setSearchParams]);

  const filteredGears = useMemo(() => {
    return gears.filter((gear) => {
      const matchesSearch = gear.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gear.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gear.suitableFor.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === 'all' || gear.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || gear.status === statusFilter;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [gears, searchQuery, typeFilter, statusFilter]);

  const handleCreate = async (data: CreateGearDto) => {
    const result = await createGear(data);
    if (result) {
      setShowAddModal(false);
    }
  };

  const handleUpdate = async (data: UpdateGearDto) => {
    if (editingGear) {
      const result = await updateGear(editingGear.id, data);
      if (result) {
        setEditingGear(null);
      }
    }
  };

  const handleDelete = async (id: string) => {
    const success = await deleteGear(id);
    if (success) {
      setDeleteConfirm(null);
    }
  };

  if (loading && gears.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in fade-in slide-in-from-bottom-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">雨具档案</h1>
          <p className="text-slate-500">管理所有雨具信息</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          新增雨具
        </Button>
      </div>

      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: '100ms' }}>
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索雨具名称、位置、适用人..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-400" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as GearType | 'all')}
              className="px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部类型</option>
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GearStatus | 'all')}
              className="px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all',
                statusFilter === opt.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {opt.label}
              {opt.value !== 'all' && (
                <span className="ml-1">
                  ({gears.filter((g) => g.status === opt.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {filteredGears.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200/50 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 mb-1">没有找到雨具</h3>
          <p className="text-slate-500 mb-4">试试调整搜索条件或添加新雨具</p>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            新增雨具
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGears.map((gear, index) => (
            <div
              key={gear.id}
              className="relative group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${200 + index * 50}ms` }}
            >
              <RainGearCard gear={gear} showFrequency />
              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingGear(gear);
                  }}
                  className="p-2 rounded-lg bg-white shadow-lg hover:bg-blue-50 transition-colors"
                  title="编辑"
                >
                  <Edit2 className="w-4 h-4 text-blue-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirm(gear.id);
                  }}
                  className="p-2 rounded-lg bg-white shadow-lg hover:bg-red-50 transition-colors"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="新增雨具"
      >
        <GearForm
          onSubmit={handleCreate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingGear}
        onClose={() => setEditingGear(null)}
        title="编辑雨具"
      >
        {editingGear && (
          <GearForm
            initialData={editingGear}
            onSubmit={handleUpdate}
            onCancel={() => setEditingGear(null)}
            isEdit
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="确认删除"
      >
        <div className="space-y-4">
          <p className="text-slate-600">确定要删除这件雨具吗？此操作无法撤销。</p>
          {deleteConfirm && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              <img
                src={gears.find((g) => g.id === deleteConfirm)?.photoUrl}
                alt=""
                className="w-12 h-12 rounded-lg object-cover"
              />
              <span className="font-medium text-slate-900">
                {gears.find((g) => g.id === deleteConfirm)?.name}
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)} className="flex-1">
              取消
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="flex-1"
            >
              确认删除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
