import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { LitterBox } from '@/types';

interface LitterBoxFormProps {
  box?: LitterBox | null;
  onSubmit: (data: Omit<LitterBox, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const litterTypes = [
  '豆腐猫砂',
  '膨润土猫砂',
  '混合猫砂',
  '水晶猫砂',
  '松木猫砂',
  '纸砂',
];

const sizes = [
  '小号(40x30x15cm)',
  '中号(50x35x18cm)',
  '大号(60x40x20cm)',
  '超大号(70x50x25cm)',
];

const deodorizers = [
  '小苏打',
  '除臭珠',
  '除臭喷雾',
  '活性炭',
  '小苏打 + 除臭珠',
  '无需除臭',
];

export default function LitterBoxForm({ box, onSubmit, onCancel }: LitterBoxFormProps) {
  const [formData, setFormData] = useState({
    location: '',
    size: '大号(60x40x20cm)',
    litterType: '豆腐猫砂',
    cleaningFrequency: 2,
    deodorizer: '小苏打 + 除臭珠',
    deodorizerTotal: 100,
    deodorizerRemaining: 100,
    fullChangeInterval: 14,
    lastFullChangeDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (box) {
      setFormData({
        location: box.location,
        size: box.size,
        litterType: box.litterType,
        cleaningFrequency: box.cleaningFrequency,
        deodorizer: box.deodorizer,
        deodorizerTotal: box.deodorizerTotal ?? 100,
        deodorizerRemaining: box.deodorizerRemaining ?? 100,
        fullChangeInterval: box.fullChangeInterval,
        lastFullChangeDate: box.lastFullChangeDate,
      });
    }
  }, [box]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-warm-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-display">
            {box ? '编辑猫砂盆' : '添加猫砂盆'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-cream-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              位置 *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input-field"
              placeholder="例如：客厅角落"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              尺寸
            </label>
            <select
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="input-field"
            >
              {sizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              猫砂类型
            </label>
            <select
              value={formData.litterType}
              onChange={(e) => setFormData({ ...formData, litterType: e.target.value })}
              className="input-field"
            >
              {litterTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                每日清理次数
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.cleaningFrequency}
                onChange={(e) => setFormData({ ...formData, cleaningFrequency: parseInt(e.target.value) || 1 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                整盆换砂周期（天）
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={formData.fullChangeInterval}
                onChange={(e) => setFormData({ ...formData, fullChangeInterval: parseInt(e.target.value) || 14 })}
                className="input-field"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              除臭用品
            </label>
            <select
              value={formData.deodorizer}
              onChange={(e) => setFormData({ ...formData, deodorizer: e.target.value })}
              className="input-field"
            >
              {deodorizers.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                除臭珠总量（颗）
              </label>
              <input
                type="number"
                min="0"
                value={formData.deodorizerTotal}
                onChange={(e) => setFormData({ ...formData, deodorizerTotal: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                剩余量（颗）
              </label>
              <input
                type="number"
                min="0"
                value={formData.deodorizerRemaining}
                onChange={(e) => setFormData({ ...formData, deodorizerRemaining: parseInt(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              上次整盆换砂日期
            </label>
            <input
              type="date"
              value={formData.lastFullChangeDate}
              onChange={(e) => setFormData({ ...formData, lastFullChangeDate: e.target.value })}
              className="input-field"
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary flex-1"
            >
              取消
            </button>
            <button type="submit" className="btn-primary flex-1">
              {box ? '保存修改' : '添加猫砂盆'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
