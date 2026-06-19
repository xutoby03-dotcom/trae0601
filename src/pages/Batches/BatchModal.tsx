import { useState } from 'react';
import { X } from 'lucide-react';
import { useTeaStore } from '@/store/useTeaStore';
import { format } from 'date-fns';

interface Props {
  onClose: () => void;
}

export default function BatchModal({ onClose }: Props) {
  const { addBatch, teapots } = useTeaStore();
  const [formData, setFormData] = useState({
    teapotId: teapots[0]?.id || '',
    brewTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    teaAmount: 200,
    outputAmount: 4500,
    targetTimeSlot: '上午 10:00-12:00',
    discardTime: format(new Date(Date.now() + 4 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
    status: 'active' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addBatch({
      ...formData,
      brewTime: new Date(formData.brewTime).toISOString(),
      discardTime: new Date(formData.discardTime).toISOString(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-tea-100 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-display font-bold text-tea-800">
            新增茶汤批次
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-tea-50 text-tea-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-tea-700 mb-1.5">
              选择茶桶
            </label>
            <select
              value={formData.teapotId}
              onChange={(e) => setFormData({ ...formData, teapotId: e.target.value })}
              className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all bg-white"
            >
              {teapots.map((teapot) => (
                <option key={teapot.id} value={teapot.id}>
                  {teapot.code} - {teapot.teaType}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                煮制时间
              </label>
              <input
                type="datetime-local"
                value={formData.brewTime}
                onChange={(e) => setFormData({ ...formData, brewTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                废弃时间
              </label>
              <input
                type="datetime-local"
                value={formData.discardTime}
                onChange={(e) => setFormData({ ...formData, discardTime: e.target.value })}
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                投茶量 (g)
              </label>
              <input
                type="number"
                value={formData.teaAmount}
                onChange={(e) => setFormData({ ...formData, teaAmount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-tea-700 mb-1.5">
                出汤量 (ml)
              </label>
              <input
                type="number"
                value={formData.outputAmount}
                onChange={(e) => setFormData({ ...formData, outputAmount: Number(e.target.value) })}
                className="w-full px-4 py-2.5 border border-tea-200 rounded-xl focus:ring-2 focus:ring-tea-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-tea-700 mb-1.5">
              目标售卖时段
            </label>
            <input
              type="text"
              value={formData.targetTimeSlot}
              onChange={(e) => setFormData({ ...formData, targetTimeSlot: e.target.value })}
              placeholder="如：上午 10:00-12:00"
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
              创建批次
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
