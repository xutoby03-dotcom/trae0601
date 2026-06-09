import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';
import { MaterialType, MATERIAL_TYPE_LABELS } from '@/types';

const TYPE_OPTIONS: { value: MaterialType; label: string }[] = [
  { value: 'sticker', label: '贴纸' },
  { value: 'tape', label: '胶带' },
  { value: 'memo', label: '便签' },
  { value: 'stamp', label: '印章' },
];

interface FormData {
  type: MaterialType;
  name: string;
  brand: string;
  theme: string;
  color: string;
  quantity: number;
  price: number;
  storageLocation: string;
  photo: string;
}

export default function AddMaterial() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { materials, addMaterial, updateMaterial } = useJournalStore();

  const editId = searchParams.get('edit') || '';
  const existingMaterial = editId
    ? materials.find((m) => m.id === editId)
    : null;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    type: 'sticker',
    name: '',
    brand: '',
    theme: '',
    color: '#E8B4B8',
    quantity: 1,
    price: 0,
    storageLocation: '',
    photo: '',
  });

  useEffect(() => {
    if (existingMaterial) {
      setForm({
        type: existingMaterial.type,
        name: existingMaterial.name,
        brand: existingMaterial.brand,
        theme: existingMaterial.theme,
        color: existingMaterial.color || '#E8B4B8',
        quantity: existingMaterial.quantity,
        price: existingMaterial.price,
        storageLocation: existingMaterial.storageLocation,
        photo: existingMaterial.photo,
      });
    }
  }, [existingMaterial]);

  const handleChange = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setForm((prev) => ({ ...prev, photo: result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const data = {
      type: form.type,
      name: form.name.trim(),
      brand: form.brand.trim(),
      theme: form.theme.trim(),
      color: form.color,
      quantity: form.quantity,
      price: form.price,
      storageLocation: form.storageLocation.trim(),
      photo: form.photo,
    };

    if (editId && existingMaterial) {
      updateMaterial(editId, data);
    } else {
      addMaterial(data);
    }
    navigate('/materials');
  };

  return (
    <div className="page-container">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="text-brown-muted hover:text-brown-dark transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title mb-0">{editId ? '编辑素材' : '添加素材'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="card-paper rounded-xl p-6 max-w-lg mx-auto">
        <div className="mb-5">
          <label className="section-title block">类型</label>
          <div className="flex flex-wrap gap-3 mt-2">
            {TYPE_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`cursor-pointer px-4 py-2 rounded-lg border transition-all ${
                  form.type === opt.value
                    ? 'border-brown bg-brown/10 text-brown-dark font-medium'
                    : 'border-brown-muted/30 text-brown-muted hover:border-brown-muted/60'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={opt.value}
                  checked={form.type === opt.value}
                  onChange={() => handleChange('type', opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="section-title block">名称</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="输入素材名称"
            className="input-field mt-1"
            required
          />
        </div>

        <div className="mb-5">
          <label className="section-title block">品牌</label>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="输入品牌名称"
            className="input-field mt-1"
          />
        </div>

        <div className="mb-5">
          <label className="section-title block">主题</label>
          <input
            type="text"
            value={form.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
            placeholder="如：秋日、复古、森林"
            className="input-field mt-1"
          />
        </div>

        <div className="mb-5">
          <label className="section-title block">颜色</label>
          <div className="flex items-center gap-3 mt-1">
            <input
              type="color"
              value={form.color}
              onChange={(e) => handleChange('color', e.target.value)}
              className="w-10 h-10 rounded-lg border border-brown-muted/30 cursor-pointer p-0.5"
            />
            <span className="text-sm text-brown-muted font-mono">{form.color}</span>
          </div>
        </div>

        <div className="mb-5">
          <label className="section-title block">数量</label>
          <input
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 0)}
            className="input-field mt-1"
          />
        </div>

        <div className="mb-5">
          <label className="section-title block">购买价</label>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-brown-muted">¥</span>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.price}
              onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
              className="input-field pl-7"
            />
          </div>
        </div>

        <div className="mb-5">
          <label className="section-title block">收纳位置</label>
          <input
            type="text"
            value={form.storageLocation}
            onChange={(e) => handleChange('storageLocation', e.target.value)}
            placeholder="如：抽屉A-3、收纳盒2"
            className="input-field mt-1"
          />
        </div>

        <div className="mb-6">
          <label className="section-title block">照片</label>
          <div className="mt-1">
            {form.photo ? (
              <div className="relative inline-block">
                <img
                  src={form.photo}
                  alt="预览"
                  className="w-32 h-32 object-cover rounded-lg border border-brown-muted/30"
                />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, photo: '' }))}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-coral text-white rounded-full text-xs flex items-center justify-center hover:bg-coral-deep transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-32 h-32 border-2 border-dashed border-brown-muted/30 rounded-lg flex flex-col items-center justify-center text-brown-muted/60 hover:border-brown-muted/50 hover:text-brown-muted transition-colors"
              >
                <Camera size={24} />
                <span className="text-xs mt-1">选择照片</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        <div className="stitch-line mb-6" />

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            取消
          </button>
          <button type="submit" className="btn-primary flex-1">
            {editId ? '保存修改' : '添加素材'}
          </button>
        </div>
      </form>
    </div>
  );
}
