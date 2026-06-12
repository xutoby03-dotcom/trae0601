import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, X } from 'lucide-react';
import type { GroupBatch } from '../types';
import { useAppStore } from '../store/useAppStore';
import { cn } from '@/lib/utils';

interface BatchFormProps {
  mode: 'create' | 'edit';
}

export function BatchForm({ mode }: BatchFormProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { batches, addBatch, updateBatch, getBatchById } = useAppStore();

  const [formData, setFormData] = useState({
    productName: '',
    arrivalTime: '',
    totalQuantity: 1,
    needRefrigeration: false,
    productImage: '',
    status: 'pending' as GroupBatch['status'],
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (mode === 'edit' && id) {
      const batch = getBatchById(id);
      if (batch) {
        setFormData({
          productName: batch.productName,
          arrivalTime: batch.arrivalTime,
          totalQuantity: batch.totalQuantity,
          needRefrigeration: batch.needRefrigeration,
          productImage: batch.productImage || '',
          status: batch.status,
        });
        setImagePreview(batch.productImage || '');
      }
    }
  }, [mode, id, getBatchById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') {
      addBatch(formData);
    } else if (id) {
      updateBatch(id, formData);
    }
    navigate('/batches');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setFormData((prev) => ({ ...prev, productImage: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setFormData((prev) => ({ ...prev, productImage: '' }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate('/batches')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回批次列表
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">
          {mode === 'create' ? '新建团购批次' : '编辑团购批次'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              商品名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.productName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, productName: e.target.value }))
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              placeholder="请输入商品名称"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                到货时间 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.arrivalTime}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, arrivalTime: e.target.value }))
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                总份数 <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.totalQuantity}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    totalQuantity: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              批次状态
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  status: e.target.value as GroupBatch['status'],
                }))
              }
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
            >
              <option value="pending">待到货</option>
              <option value="arrived">已到货</option>
              <option value="completed">已完成</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="needRefrigeration"
              checked={formData.needRefrigeration}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  needRefrigeration: e.target.checked,
                }))
              }
              className="w-5 h-5 text-cyan-600 rounded focus:ring-cyan-500"
            />
            <label htmlFor="needRefrigeration" className="text-sm font-medium text-slate-700">
              需要冷藏（取货时优先叫号）
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              商品照片
            </label>
            {imagePreview ? (
              <div className="relative inline-block">
                <img
                  src={imagePreview}
                  alt="预览"
                  className="w-32 h-32 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-all">
                <Upload className="w-8 h-8 text-slate-400 mb-2" />
                <span className="text-sm text-slate-500">点击上传商品照片</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/batches')}
              className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              className={cn(
                'flex-1 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors',
                mode === 'create'
                  ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              )}
            >
              <Save className="w-4 h-4" />
              {mode === 'create' ? '创建批次' : '保存修改'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
