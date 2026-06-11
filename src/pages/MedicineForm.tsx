import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Camera,
  Star,
  AlertTriangle,
  Upload,
  X,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import {
  CATEGORY_LIST,
  APPLICABLE_TO_LIST,
  CATEGORY_EMOJI,
} from '@/types';
import type { Category, ApplicableTo } from '@/types';
import { addDaysStr, todayStr } from '@/utils/dateUtils';

export default function MedicineForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;
  const medicines = useStore((s) => s.medicines);
  const addMedicine = useStore((s) => s.addMedicine);
  const updateMedicine = useStore((s) => s.updateMedicine);
  const existing = medicines.find((m) => m.id === id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('其他');
  const [emoji, setEmoji] = useState('💊');
  const [applicableTo, setApplicableTo] = useState<ApplicableTo>('全部人群');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('盒');
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(1);
  const [expiryDate, setExpiryDate] = useState(addDaysStr(180));
  const [openDate, setOpenDate] = useState<string>('');
  const [storageLocation, setStorageLocation] = useState('');
  const [image, setImage] = useState<string>('');
  const [isCommon, setIsCommon] = useState(false);
  const [childWarning, setChildWarning] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setCategory(existing.category);
      setEmoji(existing.emoji);
      setApplicableTo(existing.applicableTo);
      setQuantity(existing.quantity);
      setUnit(existing.unit);
      setLowStockThreshold(existing.lowStockThreshold);
      setExpiryDate(existing.expiryDate);
      setOpenDate(existing.openDate || '');
      setStorageLocation(existing.storageLocation);
      setImage(existing.image || '');
      setIsCommon(existing.isCommon);
      setChildWarning(existing.childWarning);
      setNotes(existing.notes || '');
    }
  }, [existing]);

  useEffect(() => {
    if (!isEdit) {
      setEmoji(CATEGORY_EMOJI[category]);
    }
  }, [category, isEdit]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !storageLocation.trim()) {
      alert('请填写药品名称和存放位置');
      return;
    }
    const data = {
      name: name.trim(),
      category,
      emoji,
      applicableTo,
      quantity: Math.max(0, quantity),
      unit: unit.trim() || '个',
      lowStockThreshold: Math.max(0, lowStockThreshold),
      expiryDate,
      openDate: openDate || undefined,
      storageLocation: storageLocation.trim(),
      image: image || undefined,
      isCommon,
      childWarning,
      notes: notes.trim() || undefined,
    };
    if (isEdit && existing) {
      updateMedicine(existing.id, data);
    } else {
      addMedicine(data);
    }
    navigate(isEdit && existing ? `/medicines/${existing.id}` : '/medicines');
  };

  return (
    <div className="pb-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-white shadow-card flex items-center justify-center hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-display text-2xl text-gray-800">
          {isEdit ? '编辑药品' : '添加新药品'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card p-6">
          <div className="flex items-center gap-5">
            <div className="flex-shrink-0">
              {image ? (
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage('')}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center text-4xl hover:opacity-80 transition-opacity"
                >
                  {emoji}
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full text-xs text-primary-600 flex items-center justify-center gap-1"
              >
                <Upload className="w-3 h-3" />
                {image ? '更换图片' : '上传图片'}
              </button>
            </div>
            <div className="flex-1 space-y-1">
              <div>
                <label className="label">药品名称 *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="如：布洛芬缓释胶囊"
                  className="input"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">品类</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="input"
                  >
                    {CATEGORY_LIST.map((c) => (
                      <option key={c} value={c}>
                        {CATEGORY_EMOJI[c]} {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">图标 emoji</label>
                  <input
                    type="text"
                    value={emoji}
                    onChange={(e) => setEmoji(e.target.value)}
                    maxLength={4}
                    placeholder="如：💊"
                    className="input text-center text-2xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-lg text-gray-800 mb-4 flex items-center gap-2">
            <Camera className="w-4 h-4 text-primary-500" /> 库存信息
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="label">当前数量</label>
              <input
                type="number"
                min="0"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="label">单位</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="片/盒/瓶"
                className="input"
              />
            </div>
            <div>
              <label className="label">低库存阈值</label>
              <input
                type="number"
                min="0"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(parseInt(e.target.value) || 0)}
                className="input"
              />
            </div>
            <div>
              <label className="label">适用人群</label>
              <select
                value={applicableTo}
                onChange={(e) => setApplicableTo(e.target.value as ApplicableTo)}
                className="input"
              >
                {APPLICABLE_TO_LIST.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-lg text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning-500" /> 日期与位置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="label">有效期至 *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="label">开封日期</label>
              <input
                type="date"
                value={openDate}
                max={todayStr()}
                onChange={(e) => setOpenDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">存放位置 *</label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="如：客厅药箱上层"
                className="input"
                required
              />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display text-lg text-gray-800 mb-4">其他设置</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isCommon}
                onChange={(e) => setIsCommon(e.target.checked)}
                className="w-5 h-5 rounded text-accent-500 focus:ring-accent-400"
              />
              <Star className="w-4 h-4 text-accent-500" />
              <span className="text-sm text-gray-700">标记为常用药（在首页常用区展示）</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={childWarning}
                onChange={(e) => setChildWarning(e.target.checked)}
                className="w-5 h-5 rounded text-danger-500 focus:ring-danger-400"
              />
              <AlertTriangle className="w-4 h-4 text-danger-500" />
              <span className="text-sm text-gray-700">儿童慎用/禁用（在首页儿童慎用区警示）</span>
            </label>
            <div>
              <label className="label">备注</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="用法、用量、注意事项等..."
                className="input resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to={isEdit && existing ? `/medicines/${existing.id}` : '/medicines'} className="flex-1 btn-ghost justify-center">
            取消
          </Link>
          <button type="submit" className="flex-1 btn-primary justify-center">
            <Save className="w-4 h-4" />
            {isEdit ? '保存修改' : '添加药品'}
          </button>
        </div>
      </form>
    </div>
  );
}
