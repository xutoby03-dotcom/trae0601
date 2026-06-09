import { useState, useEffect, useRef, useMemo, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Camera, AlertTriangle } from 'lucide-react';
import { useJournalStore } from '@/store/useJournalStore';
import { MaterialType, MATERIAL_TYPE_LABELS, OVERSTOCK_THRESHOLD } from '@/types';

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

  const duplicateMaterials = useMemo(() => {
    const trimmedBrand = form.brand.trim().toLowerCase();
    const trimmedTheme = form.theme.trim().toLowerCase();
    if (!trimmedBrand && !trimmedTheme) return [];
    return materials.filter((m) => {
      if (editId && m.id === editId) return false;
      const brandMatch = trimmedBrand && m.brand.toLowerCase() === trimmedBrand;
      const themeMatch = trimmedTheme && m.theme.toLowerCase() === trimmedTheme;
      return brandMatch || themeMatch;
    });
  }, [materials, form.brand, form.theme, editId]);

  const overstockInDupes = duplicateMaterials.filter((m) => m.quantity >= OVERSTOCK_THRESHOLD);
  const wouldOverstock = form.quantity >= OVERSTOCK_THRESHOLD;

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
    const themeParam = data.theme ? `?dupTheme=${encodeURIComponent(data.theme)}` : '';
    navigate(`/materials${themeParam}`);
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
          {duplicateMaterials.length > 0 && (
            <div className="mt-3 rounded-lg border border-coral/30 bg-coral/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={14} className="text-coral" />
                <span className="text-coral text-xs font-semibold">发现同类素材，别重复囤啦！</span>
              </div>
              <div className="space-y-2">
                {duplicateMaterials.map((m) => {
                  const isOver = m.quantity >= OVERSTOCK_THRESHOLD;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs ${isOver ? 'bg-coral/10 border border-coral/25' : 'bg-cream-dark/40'}`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`font-medium truncate ${isOver ? 'text-coral-deep' : 'text-brown-dark'}`}>{m.name}</span>
                        <span className={`badge-${m.type}`}>{MATERIAL_TYPE_LABELS[m.type]}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-2">
                        <span className="text-brown-muted">库存 {m.quantity}</span>
                        {isOver && <span className="text-coral font-semibold">囤太多！</span>}
                        {m.storageLocation && <span className="text-brown-muted/60">{m.storageLocation}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
              {overstockInDupes.length > 0 && (
                <p className="text-coral text-xs mt-2 flex items-center gap-1">
                  <AlertTriangle size={11} />
                  已有 {overstockInDupes.length} 件同类素材库存 ≥ {OVERSTOCK_THRESHOLD}，真的还要买吗？
                </p>
              )}
            </div>
          )}
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
            className={`input-field mt-1 ${wouldOverstock ? 'border-coral ring-1 ring-coral/30' : ''}`}
          />
          {wouldOverstock && (
            <p className="text-coral text-xs mt-1.5 flex items-center gap-1">
              <AlertTriangle size={12} />
              数量 ≥ {OVERSTOCK_THRESHOLD} 已达囤货线，确认是否真的需要这么多
            </p>
          )}
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
