import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, ChevronLeft, Upload, Edit3, ArrowLeft } from 'lucide-react';
import { useSeasoningStore } from '@/store/useSeasoningStore';
import { CATEGORIES, UNITS, LOCATIONS } from '@/types';
import { compressImage } from '@/utils/seasoningUtils';
import { cn } from '@/lib/utils';

export default function SeasoningDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getSeasoningById, updateSeasoning } = useSeasoningStore();

  const seasoning = id ? getSeasoningById(id) : undefined;
  const notFound = id && !seasoning;

  const [form, setForm] = useState({
    name: '',
    brand: '',
    category: '酱油/调味汁' as string,
    openDate: '',
    shelfLifeDays: 30,
    location: '厨房柜子' as string,
    currentAmount: 0,
    unit: 'g' as string,
    photoUrl: undefined as string | undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (seasoning) {
      setForm({
        name: seasoning.name,
        brand: seasoning.brand,
        category: seasoning.category,
        openDate: seasoning.openDate,
        shelfLifeDays: seasoning.shelfLifeDays,
        location: seasoning.location,
        currentAmount: seasoning.currentAmount,
        unit: seasoning.unit,
        photoUrl: seasoning.photoUrl,
      });
    }
  }, [seasoning]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      setForm((prev) => ({ ...prev, photoUrl: compressed }));
    } catch (err) {
      console.error('Photo upload failed:', err);
      alert('照片上传失败，请重试');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !seasoning) return;
    if (!form.name.trim()) {
      alert('请输入调料名称');
      return;
    }
    if (!form.brand.trim()) {
      alert('请输入品牌');
      return;
    }
    const amount = Number(form.currentAmount);
    if (isNaN(amount) || amount < 0) {
      alert('剩余量不能为负数');
      return;
    }
    if (amount > seasoning.initialAmount) {
      alert('剩余量不能超过初始容量');
      return;
    }

    setIsSubmitting(true);

    updateSeasoning(id, {
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      openDate: form.openDate,
      shelfLifeDays: Number(form.shelfLifeDays),
      location: form.location,
      currentAmount: amount,
      unit: form.unit,
      photoUrl: form.photoUrl,
    });

    setTimeout(() => {
      navigate('/');
    }, 300);
  };

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
          <div className="container max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h1 className="text-lg font-bold text-gray-800">编辑调料</h1>
          </div>
        </header>
        <div className="container max-w-lg mx-auto px-4 py-20">
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm border border-gray-100">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-lg font-bold text-gray-800 mb-2">找不到这个调料</h2>
            <p className="text-sm text-gray-500 mb-6">可能已被删除或链接不正确</p>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              <ArrowLeft size={18} />
              返回看板
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!seasoning) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="container max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-2">
            <Edit3 className="text-primary-500" size={20} />
            <h1 className="text-lg font-bold text-gray-800">编辑调料</h1>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="container max-w-lg mx-auto px-4 py-6 space-y-6">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Camera size={20} className="text-primary-500" />
            瓶身照片
          </h2>
          <label className="block cursor-pointer">
            {form.photoUrl ? (
              <div className="relative aspect-video rounded-xl overflow-hidden bg-gray-100">
                <img src={form.photoUrl} alt="调料照片" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">点击更换</span>
                </div>
              </div>
            ) : (
              <div className="aspect-video rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-2 hover:border-primary-300 hover:bg-primary-50/50 transition-colors">
                <Upload size={32} className="text-gray-400" />
                <span className="text-sm text-gray-500">点击上传瓶身照片</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-800 mb-2">📝 基本信息</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">调料名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">品牌</label>
            <input
              type="text"
              value={form.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">类别</label>
            <select
              value={form.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-800 mb-2">📅 保质期信息</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">开封日期</label>
            <input
              type="date"
              value={form.openDate}
              onChange={(e) => handleChange('openDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              建议用完天数：<span className="text-primary-500 font-bold">{form.shelfLifeDays}</span> 天
            </label>
            <input
              type="range"
              min="1"
              max="365"
              value={form.shelfLifeDays}
              onChange={(e) => handleChange('shelfLifeDays', e.target.value)}
              className="w-full accent-primary-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1天</span>
              <span>30天</span>
              <span>180天</span>
              <span>365天</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
          <h2 className="font-bold text-gray-800 mb-2">📦 容量与存放</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                当前剩余
                <span className="text-xs text-gray-400 font-normal ml-1">
                  (初始 {seasoning.initialAmount}{seasoning.unit})
                </span>
              </label>
              <input
                type="number"
                min="0"
                value={form.currentAmount}
                onChange={(e) => handleChange('currentAmount', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">单位</label>
              <select
                value={form.unit}
                onChange={(e) => handleChange('unit', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">存放位置</label>
            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => handleChange('location', loc)}
                  className={cn(
                    'px-4 py-2 rounded-full text-sm transition-all',
                    form.location === loc
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-6 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              'w-full py-4 bg-primary-500 text-white rounded-2xl font-bold text-base shadow-lg shadow-primary-500/30',
              'hover:bg-primary-600 active:scale-98 transition-all',
              isSubmitting && 'opacity-70 cursor-not-allowed'
            )}
          >
            {isSubmitting ? '保存中...' : '✓ 保存修改'}
          </button>
        </div>
      </form>
    </div>
  );
}
