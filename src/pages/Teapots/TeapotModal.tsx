import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTeaStore } from '@/store/useTeaStore';
import type { Teapot } from '@/types';

interface Props {
  teapot: Teapot | null;
  onClose: () => void;
}

export default function TeapotModal({ teapot, onClose }: Props) {
  const { addTeapot, updateTeapot } = useTeaStore();
  const [formData, setFormData] = useState({
    code: '',
    capacity: 5000,
    teaType: '',
    targetTempMin: 75,
    targetTempMax: 85,
    manager: '',
    photo: '',
  });

  useEffect(() => {
    if (teapot) {
      setFormData({
        code: teapot.code,
        capacity: teapot.capacity,
        teaType: teapot.teaType,
        targetTempMin: teapot.targetTempMin,
        targetTempMax: teapot.targetTempMax,
        manager: teapot.manager,
        photo: teapot.photo,
      });
    }
  }, [teapot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (teapot) {
      updateTeapot(teapot.id, formData);
    } else {
      if (!formData.photo) {
        formData.photo = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(formData.teaType + ' tea in teapot warm lighting')}&image_size=square`;
      }
      addTeapot(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-tea-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-tea-800">
          {teapot ? '编辑茶桶' : '新增茶桶'}
        </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-tea-50 text-tea-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                茶桶编号
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="如：CT-001"
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                容量 (ml)
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tea-700 mb-1.5">
              茶底类型
            </label>
            <input
              type="text"
              value={formData.teaType}
              onChange={(e) => setFormData({ ...formData, teaType: e.target.value })}
              placeholder="如：茉莉绿茶、锡兰红茶"
              className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                最低温度 (°C)
              </label>
              <input
                type="number"
                value={formData.targetTempMin}
                onChange={(e) => setFormData({ ...formData, targetTempMin: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                最高温度 (°C)
              </label>
              <input
                type="number"
                value={formData.targetTempMax}
                onChange={(e) => setFormData({ ...formData, targetTempMax: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tea-700 mb-1.5">
              负责人
            </label>
            <input
              type="text"
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              placeholder="如：张小明"
              className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-tea-700 mb-1.5">
              照片链接 (可选)
            </label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="留空将自动生成"
              className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-tea-200 text-tea-600 rounded-xl font-medium hover:bg-tea-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-tea-500 text-white rounded-xl font-medium hover:bg-tea-600 transition-colors"
            >
              {teapot ? '保存修改' : '创建茶桶'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
