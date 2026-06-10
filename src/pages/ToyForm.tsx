import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Camera, X, Check } from 'lucide-react';
import { useToyStore } from '@/store/useToyStore';
import { TOY_CATEGORIES, AGE_RANGES, TAG_LABELS } from '@/types';
import type { ToyTag, ToyStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function ToyForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getToyById, addToy, updateToy } = useToyStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const existingToy = id ? getToyById(id) : undefined;
  const isEdit = !!existingToy;

  const [name, setName] = useState(existingToy?.name || '');
  const [ageRange, setAgeRange] = useState(existingToy?.ageRange || '');
  const [category, setCategory] = useState(existingToy?.category || '');
  const [hasSmallParts, setHasSmallParts] = useState(existingToy?.hasSmallParts || false);
  const [purchaseDate, setPurchaseDate] = useState(existingToy?.purchaseDate || '');
  const [storageBox, setStorageBox] = useState(existingToy?.storageBox || '');
  const [photo, setPhoto] = useState(existingToy?.photo || '');
  const [status, setStatus] = useState<ToyStatus>(existingToy?.status || 'stored');
  const [tags, setTags] = useState<ToyTag[]>(existingToy?.tags || []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhoto('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const toggleTag = (tag: ToyTag) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('请输入玩具名称');
      return;
    }

    if (isEdit && id) {
      updateToy(id, {
        name,
        ageRange,
        category,
        hasSmallParts,
        purchaseDate,
        storageBox,
        photo,
        status,
        tags,
      });
    } else {
      addToy({
        name,
        ageRange,
        category,
        hasSmallParts,
        purchaseDate,
        storageBox,
        photo,
        status,
        tags,
        isMissingParts: false,
      });
    }

    navigate(-1);
  };

  const statusOptions: { value: ToyStatus; label: string }[] = [
    { value: 'stored', label: '收纳中' },
    { value: 'playing', label: '正在玩' },
    { value: 'cleaning', label: '该清洗' },
    { value: 'giving', label: '准备送人' },
  ];

  const tagOptions: { value: ToyTag; label: string; emoji: string }[] = [
    { value: 'rainy', label: '雨天玩', emoji: '🌧️' },
    { value: 'parent-child', label: '亲子互动', emoji: '👨‍👩‍👧' },
    { value: 'quiet', label: '安静游戏', emoji: '🤫' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-mint-50">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="font-bold text-gray-800">
            {isEdit ? '编辑玩具' : '添加玩具'}
          </h1>
          <div className="w-10" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* 照片上传 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            玩具照片
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'relative aspect-square w-full max-w-xs mx-auto rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors overflow-hidden',
              photo
                ? 'border-transparent bg-gray-100'
                : 'border-gray-300 hover:border-primary-400 bg-gray-50'
            )}
          >
            {photo ? (
              <>
                <img src={photo} alt="玩具照片" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removePhoto();
                  }}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <div className="text-center">
                <Camera size={40} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">点击上传照片</p>
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

        {/* 玩具名称 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            玩具名称 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入玩具名称"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* 适合年龄 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            适合年龄
          </label>
          <select
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">请选择年龄段</option>
            {AGE_RANGES.map((age) => (
              <option key={age} value={age}>
                {age}
              </option>
            ))}
          </select>
        </div>

        {/* 玩具类型 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            玩具类型
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all bg-white"
          >
            <option value="">请选择类型</option>
            {TOY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* 是否有小零件 */}
        <div className="mb-4">
          <label className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors">
            <div>
              <p className="font-medium text-gray-700">含有小零件</p>
              <p className="text-xs text-gray-500">小零件可能对婴幼儿有窒息风险</p>
            </div>
            <div
              className={cn(
                'w-12 h-7 rounded-full transition-colors relative',
                hasSmallParts ? 'bg-primary-500' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  'absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform',
                  hasSmallParts ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </div>
            <input
              type="checkbox"
              checked={hasSmallParts}
              onChange={(e) => setHasSmallParts(e.target.checked)}
              className="sr-only"
            />
          </label>
        </div>

        {/* 购买日期 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            购买日期
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* 存放位置 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            存放箱子/位置
          </label>
          <input
            type="text"
            value={storageBox}
            onChange={(e) => setStorageBox(e.target.value)}
            placeholder="如：蓝色大箱、粉色收纳箱等"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* 当前状态 */}
        {isEdit && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前状态
            </label>
            <div className="grid grid-cols-4 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatus(opt.value)}
                  className={cn(
                    'py-2 px-3 rounded-xl text-sm font-medium transition-all',
                    status === opt.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 场景标签 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            场景标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tagOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleTag(opt.value)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                  tags.includes(opt.value)
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {tags.includes(opt.value) && <Check size={14} />}
                <span>{opt.emoji}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* 保存按钮 */}
        <button
          type="submit"
          className="w-full py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-lg shadow-lg hover:shadow-xl transition-all active:scale-98"
        >
          {isEdit ? '保存修改' : '添加玩具'}
        </button>
      </form>
    </div>
  );
}
