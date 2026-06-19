import { useState, useEffect } from 'react';
import { X, Camera } from 'lucide-react';
import type { Cat } from '@/types';

interface CatFormProps {
  cat?: Cat | null;
  onSubmit: (data: Omit<Cat, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export default function CatForm({ cat, onSubmit, onCancel }: CatFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    age: 1,
    weight: 3,
    diet: '',
    healthNotes: '',
    photoUrl: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20cat%20portrait%20photo%20realistic&image_size=square',
  });

  useEffect(() => {
    if (cat) {
      setFormData({
        name: cat.name,
        age: cat.age,
        weight: cat.weight,
        diet: cat.diet,
        healthNotes: cat.healthNotes,
        photoUrl: cat.photoUrl,
      });
    }
  }, [cat]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-warm-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-display">
            {cat ? '编辑猫咪档案' : '添加猫咪'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-xl hover:bg-cream-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-cream-200">
                <img
                  src={formData.photoUrl}
                  alt="预览"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-sand-200 text-white rounded-full shadow-lg"
              >
                <Camera size={16} />
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              名字 *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="例如：小橘"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                年龄（岁）*
              </label>
              <input
                type="number"
                required
                min="0"
                max="30"
                step="0.1"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-warm-400 mb-1">
                体重（kg）*
              </label>
              <input
                type="number"
                required
                min="0"
                max="20"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                className="input-field"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              饮食偏好
            </label>
            <input
              type="text"
              value={formData.diet}
              onChange={(e) => setFormData({ ...formData, diet: e.target.value })}
              className="input-field"
              placeholder="例如：皇家猫粮 + 每日湿粮一包"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              健康备注
            </label>
            <textarea
              value={formData.healthNotes}
              onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
              className="input-field min-h-[80px]"
              placeholder="例如：肠胃敏感，偶尔软便"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-warm-400 mb-1">
              照片URL
            </label>
            <input
              type="text"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              className="input-field"
              placeholder="输入图片链接"
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
              {cat ? '保存修改' : '添加猫咪'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
