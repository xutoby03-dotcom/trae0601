import { useState, useEffect } from 'react';
import { X, Backpack, Upload } from 'lucide-react';
import { useStore } from '@/store/useStore';
import type { Bag } from '@/types';

interface BagFormProps {
  bag?: Bag | null;
  onSubmit: (data: Omit<Bag, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const colorOptions = [
  { name: '蓝色', value: '#3b82f6' },
  { name: '橙色', value: '#f97316' },
  { name: '黑色', value: '#1f2937' },
  { name: '绿色', value: '#22c55e' },
  { name: '红色', value: '#ef4444' },
  { name: '紫色', value: '#a855f7' },
  { name: '黄色', value: '#eab308' },
  { name: '灰色', value: '#6b7280' },
];

const capacityOptions = ['5L', '10L', '15L', '20L', '25L', '30L'];

export default function BagForm({ bag, onSubmit, onCancel }: BagFormProps) {
  const members = useStore(state => state.members);
  const [formData, setFormData] = useState({
    capacity: '15L',
    color: '蓝色',
    number: '',
    ownerId: '',
    sealStatus: 'unsealed' as Bag['sealStatus'],
    photoUrl: '',
  });

  useEffect(() => {
    if (bag) {
      setFormData({
        capacity: bag.capacity,
        color: bag.color,
        number: bag.number,
        ownerId: bag.ownerId,
        sealStatus: bag.sealStatus,
        photoUrl: bag.photoUrl,
      });
    }
  }, [bag]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.number.trim()) {
      alert('请输入包编号');
      return;
    }
    if (!formData.ownerId) {
      alert('请选择拥有者');
      return;
    }
    onSubmit(formData);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const selectedColor = colorOptions.find(c => c.name === formData.color);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
              <Backpack className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">
              {bag ? '编辑防水包' : '新增防水包'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">容量</label>
              <select
                className="input-field"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              >
                {capacityOptions.map(cap => (
                  <option key={cap} value={cap}>{cap}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">包编号 *</label>
              <input
                type="text"
                className="input-field"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="如：001"
              />
            </div>
          </div>

          <div>
            <label className="form-label">颜色</label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.name })}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all hover:scale-105"
                  style={{ 
                    borderColor: formData.color === color.name ? color.value : 'transparent',
                    backgroundColor: formData.color === color.name ? `${color.value}20` : 'white'
                  }}
                >
                  <span
                    className="w-5 h-5 rounded-full border border-white shadow"
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-sm font-medium text-gray-700">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">拥有者 *</label>
            <select
              className="input-field"
              value={formData.ownerId}
              onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
            >
              <option value="">请选择成员</option>
              {members.map(member => (
                <option key={member.id} value={member.id}>{member.name}</option>
              ))}
            </select>
          </div>

          {bag && (
            <div>
              <label className="form-label">密封状态</label>
              <select
                className="input-field"
                value={formData.sealStatus}
                onChange={(e) => setFormData({ ...formData, sealStatus: e.target.value as Bag['sealStatus'] })}
              >
                <option value="unsealed">未密封</option>
                <option value="sealed">已密封</option>
                <option value="confirmed">已确认</option>
                <option value="damaged">已损坏</option>
              </select>
            </div>
          )}

          <div>
            <label className="form-label">照片</label>
            <div className="flex gap-4">
              {formData.photoUrl ? (
                <div className="relative">
                  <img
                    src={formData.photoUrl}
                    alt="防水包照片"
                    className="w-32 h-32 object-cover rounded-xl shadow-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, photoUrl: '' })}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-sky-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">上传照片</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" className="btn-secondary flex-1" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {bag ? '保存修改' : '添加防水包'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
