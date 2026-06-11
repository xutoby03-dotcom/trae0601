import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Upload, X, Tag } from 'lucide-react';
import { useShoeStore } from '@/store';
import { Surface, SURFACE_LABELS } from '@/types';

const ALL_SURFACES: Surface[] = ['asphalt', 'concrete', 'track', 'trail', 'treadmill'];

export default function ShoeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addShoe = useShoeStore((s) => s.addShoe);
  const updateShoe = useShoeStore((s) => s.updateShoe);
  const getShoeById = useShoeStore((s) => s.getShoeById);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isEditing = !!id;

  const [form, setForm] = useState({
    brand: '',
    model: '',
    purchasePrice: '',
    startDate: new Date().toISOString().split('T')[0],
    suitableSurfaces: [] as Surface[],
    maxKilometers: '600',
    photo: '' as string | undefined,
    isRaceLocked: false,
  });

  useEffect(() => {
    if (isEditing) {
      const shoe = getShoeById(id!);
      if (shoe) {
        setForm({
          brand: shoe.brand,
          model: shoe.model,
          purchasePrice: String(shoe.purchasePrice),
          startDate: shoe.startDate,
          suitableSurfaces: shoe.suitableSurfaces,
          maxKilometers: String(shoe.maxKilometers),
          photo: shoe.photo,
          isRaceLocked: shoe.isRaceLocked,
        });
      }
    }
  }, [id, isEditing, getShoeById]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('图片大小不能超过 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((f) => ({ ...f, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSurface = (surface: Surface) => {
    setForm((f) => ({
      ...f,
      suitableSurfaces: f.suitableSurfaces.includes(surface)
        ? f.suitableSurfaces.filter((s) => s !== surface)
        : [...f.suitableSurfaces, surface],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.brand.trim() || !form.model.trim()) {
      alert('请填写品牌和型号');
      return;
    }
    if (form.suitableSurfaces.length === 0) {
      alert('请至少选择一种适合路面');
      return;
    }

    const shoeData = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      purchasePrice: Number(form.purchasePrice) || 0,
      startDate: form.startDate,
      suitableSurfaces: form.suitableSurfaces,
      maxKilometers: Number(form.maxKilometers) || 600,
      photo: form.photo,
      isRaceLocked: form.isRaceLocked,
    };

    if (isEditing) {
      updateShoe(id!, shoeData);
    } else {
      addShoe(shoeData);
    }
    navigate('/');
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="btn-ghost !p-2 -ml-2">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-display font-bold text-white">
            {isEditing ? '编辑跑鞋' : '添加新跑鞋'}
          </h1>
          <p className="text-gray-400 text-sm">记录跑鞋信息，开始追踪里程</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="label flex items-center gap-2">
            <Camera className="w-4 h-4" />
            跑鞋照片
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative aspect-video max-w-md rounded-xl border-2 border-dashed border-night-500 hover:border-energy-500/50 bg-night-900 cursor-pointer transition-all group overflow-hidden"
          >
            {form.photo ? (
              <>
                <img
                  src={form.photo}
                  alt="跑鞋照片"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm((f) => ({ ...f, photo: undefined }));
                  }}
                  className="absolute top-3 right-3 p-1.5 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 group-hover:text-gray-400 transition-colors">
                <Upload className="w-10 h-10 mb-2" />
                <p className="text-sm">点击上传跑鞋照片</p>
                <p className="text-xs text-gray-600 mt-1">支持 JPG/PNG，最大 2MB</p>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">品牌</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="如：Nike、Hoka、Adidas"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">型号</label>
            <input
              type="text"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="如：Vaporfly Next% 2"
              className="input-field"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="label">买入价格（元）</label>
            <input
              type="number"
              value={form.purchasePrice}
              onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="input-field"
            />
          </div>
          <div>
            <label className="label">启用日期</label>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="label">寿命上限（公里）</label>
            <input
              type="number"
              value={form.maxKilometers}
              onChange={(e) => setForm({ ...form, maxKilometers: e.target.value })}
              placeholder="600"
              min="100"
              step="50"
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="label flex items-center gap-2">
            <Tag className="w-4 h-4" />
            适合路面
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_SURFACES.map((surface) => {
              const selected = form.suitableSurfaces.includes(surface);
              return (
                <button
                  key={surface}
                  type="button"
                  onClick={() => toggleSurface(surface)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selected
                      ? 'bg-energy-500 text-white shadow-lg shadow-energy-500/25'
                      : 'bg-night-700 text-gray-300 hover:bg-night-600 border border-night-500'
                  }`}
                >
                  {SURFACE_LABELS[surface]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-night-900 border border-night-600">
          <input
            type="checkbox"
            id="raceLocked"
            checked={form.isRaceLocked}
            onChange={(e) => setForm({ ...form, isRaceLocked: e.target.checked })}
            className="w-5 h-5 rounded bg-night-700 border-night-500 text-energy-500 focus:ring-energy-500 focus:ring-offset-0"
          />
          <div>
            <label htmlFor="raceLocked" className="text-white font-medium cursor-pointer">
              设为比赛专用鞋
            </label>
            <p className="text-xs text-gray-500">锁定后不参与日常推荐，留给重要赛事使用</p>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary flex-1">
            {isEditing ? '保存修改' : '添加跑鞋'}
          </button>
          <Link to="/" className="btn-secondary">
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
