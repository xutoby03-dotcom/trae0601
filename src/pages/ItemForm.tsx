import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Camera } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Link } from 'react-router-dom';

export default function ItemForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const items = useStore((s) => s.items);
  const addItem = useStore((s) => s.addItem);
  const updateItem = useStore((s) => s.updateItem);

  const editingItem = id ? items.find((i) => i.id === id) : null;

  const [form, setForm] = useState({
    name: editingItem?.name || '',
    specification: editingItem?.specification || '',
    currentStock: editingItem?.currentStock?.toString() || '0',
    minStock: editingItem?.minStock?.toString() || '0',
    location: editingItem?.location || '',
    supplier: editingItem?.supplier || '',
    unitPrice: editingItem?.unitPrice?.toString() || '0',
    photoUrl: editingItem?.photoUrl || '',
    category: editingItem?.category || '饮品原料',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '请输入物品名称';
    if (!form.specification.trim()) newErrors.specification = '请输入规格';
    if (!form.location.trim()) newErrors.location = '请输入存放位置';
    if (!form.supplier.trim()) newErrors.supplier = '请输入供应商';
    if (parseFloat(form.currentStock) < 0) newErrors.currentStock = '库存不能为负数';
    if (parseFloat(form.minStock) < 0) newErrors.minStock = '下限不能为负数';
    if (parseFloat(form.unitPrice) < 0) newErrors.unitPrice = '单价不能为负数';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: form.name.trim(),
      specification: form.specification.trim(),
      currentStock: parseFloat(form.currentStock) || 0,
      minStock: parseFloat(form.minStock) || 0,
      location: form.location.trim(),
      supplier: form.supplier.trim(),
      unitPrice: parseFloat(form.unitPrice) || 0,
      photoUrl: form.photoUrl,
      category: form.category,
    };

    if (editingItem) {
      updateItem(editingItem.id, data);
    } else {
      addItem(data);
    }
    navigate('/items');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="animate-slide-up">
      <Link
        to="/items"
        className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回物品列表
      </Link>

      <div className="card p-6 max-w-3xl">
        <h2 className="title-display !text-2xl mb-6">
          {editingItem ? '编辑物品' : '新增物品档案'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-start gap-6">
            <div>
              <div className="w-32 h-32 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden relative group">
                {form.photoUrl ? (
                  <>
                    <img src={form.photoUrl} alt="" className="w-full h-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="w-6 h-6 text-white" />
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-brand-500 transition-colors">
                    <Upload className="w-8 h-8 mb-1" />
                    <span className="text-xs">上传照片</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">物品名称 *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={`input ${errors.name ? 'border-danger-300' : ''}`}
                  placeholder="如：咖啡豆"
                />
                {errors.name && <p className="text-xs text-danger-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="label">分类</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="input"
                >
                  <option value="饮品原料">饮品原料</option>
                  <option value="耗材">耗材</option>
                  <option value="清洁用品">清洁用品</option>
                  <option value="零食">零食</option>
                  <option value="其他">其他</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">规格 *</label>
              <input
                type="text"
                value={form.specification}
                onChange={(e) => setForm({ ...form, specification: e.target.value })}
                className={`input ${errors.specification ? 'border-danger-300' : ''}`}
                placeholder="如：500g/包 中度烘焙"
              />
              {errors.specification && <p className="text-xs text-danger-500 mt-1">{errors.specification}</p>}
            </div>
            <div>
              <label className="label">存放柜位 *</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className={`input ${errors.location ? 'border-danger-300' : ''}`}
                placeholder="如：A柜 第2层"
              />
              {errors.location && <p className="text-xs text-danger-500 mt-1">{errors.location}</p>}
            </div>
            <div>
              <label className="label">当前库存</label>
              <input
                type="number"
                min="0"
                value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
                className={`input ${errors.currentStock ? 'border-danger-300' : ''}`}
              />
              {errors.currentStock && <p className="text-xs text-danger-500 mt-1">{errors.currentStock}</p>}
            </div>
            <div>
              <label className="label">库存下限</label>
              <input
                type="number"
                min="0"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
                className={`input ${errors.minStock ? 'border-danger-300' : ''}`}
              />
              {errors.minStock && <p className="text-xs text-danger-500 mt-1">{errors.minStock}</p>}
            </div>
            <div>
              <label className="label">供应商 *</label>
              <input
                type="text"
                value={form.supplier}
                onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className={`input ${errors.supplier ? 'border-danger-300' : ''}`}
                placeholder="如：星巴克咖啡供应商"
              />
              {errors.supplier && <p className="text-xs text-danger-500 mt-1">{errors.supplier}</p>}
            </div>
            <div>
              <label className="label">单价 (元)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unitPrice}
                onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
                className={`input ${errors.unitPrice ? 'border-danger-300' : ''}`}
              />
              {errors.unitPrice && <p className="text-xs text-danger-500 mt-1">{errors.unitPrice}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <button type="submit" className="btn-primary">
              <Save className="w-4 h-4" />
              {editingItem ? '保存修改' : '创建物品'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/items')}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
