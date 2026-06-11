import { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import type { FragilityLevel } from '../../types/communityItem';
import type { CommunityItem } from '../../types/communityItem';
import { fragilityLabels, roommates } from '../../store/useCommunityItemStore';
import { formatCurrency } from '../../utils/format';

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<CommunityItem, 'id' | 'createdAt' | 'status' | 'totalUsageCount'>) => void;
  initialData?: CommunityItem;
}

export const AddItemModal = ({ open, onClose, onSubmit, initialData }: AddItemModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    photoUrl: '',
    purchaser: roommates[0].name,
    price: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    storageLocation: '',
    usageRules: '',
    fragility: 'medium' as FragilityLevel,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData && open) {
      setFormData({
        name: initialData.name,
        photoUrl: initialData.photoUrl || '',
        purchaser: initialData.purchaser,
        price: String(initialData.price),
        purchaseDate: initialData.purchaseDate || new Date().toISOString().split('T')[0],
        storageLocation: initialData.storageLocation,
        usageRules: initialData.usageRules,
        fragility: initialData.fragility,
      });
    } else if (open) {
      setFormData({
        name: '',
        photoUrl: '',
        purchaser: roommates[0].name,
        price: '',
        purchaseDate: new Date().toISOString().split('T')[0],
        storageLocation: '',
        usageRules: '',
        fragility: 'medium',
      });
    }
    setErrors({});
  }, [initialData, open]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入物品名称';
    if (!formData.purchaser) newErrors.purchaser = '请选择购买人';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = '请输入有效价格';
    if (!formData.storageLocation.trim()) newErrors.storageLocation = '请输入存放位置';
    if (!formData.usageRules.trim()) newErrors.usageRules = '请输入使用规矩';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: formData.name.trim(),
      photoUrl: formData.photoUrl.trim() || undefined,
      purchaser: formData.purchaser,
      price: parseFloat(formData.price),
      purchaseDate: formData.purchaseDate,
      storageLocation: formData.storageLocation.trim(),
      usageRules: formData.usageRules.trim(),
      fragility: formData.fragility,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initialData ? '编辑公共物品' : '添加公共物品'}
      size="lg"
      footer={
        <div className="flex gap-3">
          <button className="btn btn-secondary flex-1" onClick={onClose}>
            取消
          </button>
          <button className="btn btn-primary flex-1" onClick={handleSubmit}>
            {initialData ? '保存修改' : '添加物品'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="label">物品名称 *</label>
            <input
              type="text"
              placeholder="例如：极米投影仪"
              className={`input ${errors.name ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name}</p>}
          </div>

          <div>
            <label className="label">购买人 *</label>
            <select
              className={`input ${errors.purchaser ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.purchaser}
              onChange={(e) => setFormData({ ...formData, purchaser: e.target.value })}
            >
              {roommates.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.purchaser && <p className="mt-1 text-sm text-danger-600">{errors.purchaser}</p>}
          </div>

          <div>
            <label className="label">购买价格 (元) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={`input ${errors.price ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            />
            {errors.price && <p className="mt-1 text-sm text-danger-600">{errors.price}</p>}
          </div>

          <div>
            <label className="label">购买日期</label>
            <input
              type="date"
              className="input"
              value={formData.purchaseDate}
              onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
            />
          </div>

          <div>
            <label className="label">易损程度 *</label>
            <div className="flex gap-2 mt-1">
              {(['low', 'medium', 'high'] as FragilityLevel[]).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormData({ ...formData, fragility: level })}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                    formData.fragility === level
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {fragilityLabels[level].label}
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="label">存放位置 *</label>
            <input
              type="text"
              placeholder="例如：客厅电视柜抽屉"
              className={`input ${errors.storageLocation ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.storageLocation}
              onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
            />
            {errors.storageLocation && (
              <p className="mt-1 text-sm text-danger-600">{errors.storageLocation}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">物品照片链接</label>
            <input
              type="url"
              placeholder="https://..."
              className="input"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
            />
            <p className="mt-1 text-xs text-gray-500">留空可使用默认图标</p>
          </div>

          <div className="md:col-span-2">
            <label className="label">使用规矩 *</label>
            <textarea
              rows={4}
              placeholder="逐条列出使用规矩，换行分隔。例如：&#10;1. 使用前请确认镜头无灰尘&#10;2. 观影时避免饮料靠近"
              className={`input resize-none ${errors.usageRules ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              value={formData.usageRules}
              onChange={(e) => setFormData({ ...formData, usageRules: e.target.value })}
            />
            {errors.usageRules && <p className="mt-1 text-sm text-danger-600">{errors.usageRules}</p>}
          </div>
        </div>

        {formData.price && (
          <div className="pt-2 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              购买价值：<span className="font-semibold text-gray-900">{formatCurrency(parseFloat(formData.price) || 0)}</span>
            </p>
          </div>
        )}
      </form>
    </Modal>
  );
};
