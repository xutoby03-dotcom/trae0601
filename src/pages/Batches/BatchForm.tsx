import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, Save } from 'lucide-react';
import { useBatchStore } from '@/store/batchStore';
import { HarvestSeason } from '@/types';
import { formatDate } from '@/utils/date';

export default function BatchForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { batches, addBatch, updateBatch, getBatch } = useBatchStore();

  const [form, setForm] = useState({
    name: '',
    origin: '',
    harvestSeason: '春茶' as HarvestSeason,
    purchaseDate: formatDate(new Date()),
    shelfLifeDays: 540,
    totalWeight: 5000,
    photoUrl: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEdit && id) {
      const batch = getBatch(id);
      if (batch) {
        setForm({
          name: batch.name,
          origin: batch.origin,
          harvestSeason: batch.harvestSeason,
          purchaseDate: batch.purchaseDate,
          shelfLifeDays: batch.shelfLifeDays,
          totalWeight: batch.totalWeight,
          photoUrl: batch.photoUrl,
        });
      }
    }
  }, [isEdit, id, getBatch, batches]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = '请输入茶品名';
    if (!form.origin.trim()) newErrors.origin = '请输入产地';
    if (form.totalWeight <= 0) newErrors.totalWeight = '总重量必须大于0';
    if (form.shelfLifeDays <= 0) newErrors.shelfLifeDays = '保质期必须大于0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalPhotoUrl =
      form.photoUrl ||
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=200&h=200&fit=crop';

    if (isEdit && id) {
      updateBatch(id, { ...form, photoUrl: finalPhotoUrl });
    } else {
      addBatch({ ...form, photoUrl: finalPhotoUrl });
    }
    navigate('/batches');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="max-w-4xl">
      <button onClick={() => navigate('/batches')} className="flex items-center gap-2 text-gray-500 hover:text-teaGreen-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回批次列表
      </button>

      <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6">
        <div className="col-span-2 card space-y-5">
          <h3 className="font-serif text-lg font-bold text-gray-800 border-b border-tea-100 pb-3">
            {isEdit ? '编辑批次信息' : '新增茶叶批次'}
          </h3>

          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="label-field">茶品名称 *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`input-field ${errors.name ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                placeholder="如：西湖龙井"
              />
              {errors.name && <p className="text-xs text-dangerRed mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="label-field">产地 *</label>
              <input
                type="text"
                value={form.origin}
                onChange={(e) => setForm({ ...form, origin: e.target.value })}
                className={`input-field ${errors.origin ? 'border-red-300 focus:border-red-400 focus:ring-red-100' : ''}`}
                placeholder="如：浙江杭州"
              />
              {errors.origin && <p className="text-xs text-dangerRed mt-1">{errors.origin}</p>}
            </div>

            <div>
              <label className="label-field">采摘季</label>
              <select
                value={form.harvestSeason}
                onChange={(e) => setForm({ ...form, harvestSeason: e.target.value as HarvestSeason })}
                className="input-field"
              >
                <option value="春茶">春茶</option>
                <option value="夏茶">夏茶</option>
                <option value="秋茶">秋茶</option>
                <option value="冬茶">冬茶</option>
              </select>
            </div>

            <div>
              <label className="label-field">进货日期</label>
              <input
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="input-field"
              />
            </div>

            <div>
              <label className="label-field">保质期（天）</label>
              <input
                type="number"
                min="1"
                value={form.shelfLifeDays}
                onChange={(e) => setForm({ ...form, shelfLifeDays: parseInt(e.target.value) || 0 })}
                className={`input-field ${errors.shelfLifeDays ? 'border-red-300' : ''}`}
              />
              {errors.shelfLifeDays && <p className="text-xs text-dangerRed mt-1">{errors.shelfLifeDays}</p>}
            </div>

            <div>
              <label className="label-field">进货总重量（克）</label>
              <input
                type="number"
                min="1"
                value={form.totalWeight}
                onChange={(e) => setForm({ ...form, totalWeight: parseInt(e.target.value) || 0 })}
                className={`input-field ${errors.totalWeight ? 'border-red-300' : ''}`}
              />
              {errors.totalWeight && <p className="text-xs text-dangerRed mt-1">{errors.totalWeight}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-tea-100">
            <button type="button" onClick={() => navigate('/batches')} className="btn-secondary">
              取消
            </button>
            <button type="submit" className="btn-primary flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isEdit ? '保存修改' : '创建批次'}
            </button>
          </div>
        </div>

        <div className="card h-fit">
          <h3 className="font-serif text-lg font-bold text-gray-800 border-b border-tea-100 pb-3 mb-5">
            茶叶照片
          </h3>
          <div className="aspect-square rounded-xl overflow-hidden bg-tea-50 border-2 border-dashed border-tea-200 flex items-center justify-center mb-4">
            {form.photoUrl ? (
              <img src={form.photoUrl} alt="预览" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-gray-400">
                <Upload className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无图片</p>
              </div>
            )}
          </div>
          <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            上传照片
            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
          </label>
          <p className="text-xs text-gray-400 mt-3 text-center">支持 JPG、PNG 格式</p>
        </div>
      </form>
    </div>
  );
}
