import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Shirt, User, Calendar, Tag, Package, 
  ImageIcon, Check, X, Archive, AlignLeft
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import Badge from '@/components/ui/Badge';
import { useStore } from '@/store/useStore';
import { OWNERS, SEASONS, CATEGORIES, LABEL_COLORS, type Season, type ClothingCategory } from '@/types';

export default function ClothingForm() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clothes = useStore((state) => state.clothes);
  const addClothing = useStore((state) => state.addClothing);
  const updateClothing = useStore((state) => state.updateClothing);
  const boxes = useStore((state) => state.boxes);
  const isEdit = Boolean(id);

  const clothing = useMemo(() => clothes.find(c => c.id === id), [clothes, id]);
  const preselectedBoxId = searchParams.get('boxId');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    owner: '孩子' as string,
    size: '',
    season: 'spring' as Season,
    category: 'top' as ClothingCategory,
    isWashed: true,
    isVacuumPacked: false,
    boxId: preselectedBoxId || '',
    photo: '',
    notes: '',
    lastWornDate: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (clothing) {
      setFormData({
        name: clothing.name,
        owner: clothing.owner,
        size: clothing.size,
        season: clothing.season,
        category: clothing.category,
        isWashed: clothing.isWashed,
        isVacuumPacked: clothing.isVacuumPacked,
        boxId: clothing.boxId || '',
        photo: clothing.photo || '',
        notes: clothing.notes || '',
        lastWornDate: clothing.lastWornDate || '',
      });
    }
  }, [clothing]);

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '请输入衣物名称';
    if (!formData.size.trim()) newErrors.size = '请输入尺码';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = () => {
    const status = formData.isWashed ? 'in_box' : 'pending';
    
    const clothingData = {
      ...formData,
      boxId: formData.isWashed && formData.boxId ? formData.boxId : undefined,
      status: status as 'in_box' | 'pending',
    };

    if (isEdit && id) {
      updateClothing(id, clothingData);
    } else {
      addClothing(clothingData);
    }
    navigate(-1);
  };

  return (
    <Layout title={isEdit ? '编辑衣物' : '添加衣物'} showBack>
      <div className="space-y-5">
        {!isEdit && (
          <div className="flex items-center justify-center gap-3 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? 'bg-sage-500 text-white'
                      : 'bg-warm-100 text-warm-400'
                  }`}
                >
                  {step > s ? <Check size={16} /> : s}
                </div>
                {s < 2 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded-full transition-colors ${
                      step > s ? 'bg-sage-400' : 'bg-warm-100'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="card p-4 space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <Shirt size={16} className="text-sage-500" />
                衣物名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如 蓝色羽绒服"
                className={`input-field ${errors.name ? 'border-coral-400' : ''}`}
              />
              {errors.name && <p className="text-coral-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <User size={16} className="text-sage-500" />
                归属人
              </label>
              <div className="flex flex-wrap gap-2">
                {OWNERS.map((owner) => (
                  <button
                    key={owner}
                    type="button"
                    onClick={() => setFormData({ ...formData, owner })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      formData.owner === owner
                        ? 'bg-sage-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >
                    {owner}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <Tag size={16} className="text-sage-500" />
                尺码
              </label>
              <input
                type="text"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                placeholder="如 M、120cm、XL"
                className={`input-field ${errors.size ? 'border-coral-400' : ''}`}
              />
              {errors.size && <p className="text-coral-500 text-xs mt-1">{errors.size}</p>}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <Calendar size={16} className="text-sky-500" />
                适用季节
              </label>
              <div className="flex flex-wrap gap-2">
                {SEASONS.map((season) => (
                  <button
                    key={season.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, season: season.value })}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      formData.season === season.value
                        ? 'bg-sky-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >
                    {season.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <Tag size={16} className="text-coral-500" />
                类别
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      formData.category === cat.value
                        ? 'bg-coral-500 text-white'
                        : 'bg-warm-100 text-warm-600 hover:bg-warm-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <ImageIcon size={16} className="text-sage-500" />
                衣物照片
              </label>
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                placeholder="输入图片 URL（可选）"
                className="input-field"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Check size={18} className="text-sage-500" />
                  <span className="font-medium text-warm-700">已洗干晒透</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isWashed: !formData.isWashed })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    formData.isWashed ? 'bg-sage-500' : 'bg-warm-200'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      formData.isWashed ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {!formData.isWashed && (
                <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-700">
                  <div className="flex items-start gap-2">
                    <X size={16} className="flex-shrink-0 mt-0.5" />
                    <p>未清洗的衣物将进入「待处理区」，清洗后再入箱。</p>
                  </div>
                </div>
              )}
            </div>

            {formData.isWashed && (
              <div className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Archive size={18} className="text-sky-500" />
                    <span className="font-medium text-warm-700">真空压缩</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isVacuumPacked: !formData.isVacuumPacked })}
                    className={`relative w-12 h-7 rounded-full transition-colors ${
                      formData.isVacuumPacked ? 'bg-sky-500' : 'bg-warm-200'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        formData.isVacuumPacked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            {formData.isWashed && (
              <div className="card p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-3">
                  <Package size={16} className="text-sage-500" />
                  放入箱子
                </label>
                {boxes.length > 0 ? (
                  <div className="space-y-2">
                    {boxes.map((box) => {
                      const boxClothes = boxes.filter(c => c.id === box.id).length;
                      return (
                        <button
                          key={box.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, boxId: box.id })}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                            formData.boxId === box.id
                              ? 'bg-sage-50 ring-2 ring-sage-400'
                              : 'bg-warm-50 hover:bg-warm-100'
                          }`}
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: box.labelColor + '30' }}
                          >
                            <span className="text-xs font-bold" style={{ color: box.labelColor }}>
                              {box.code}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-warm-800 text-sm">{box.location}</p>
                            <p className="text-xs text-warm-400">{box.capacity} 件容量</p>
                          </div>
                          {formData.boxId === box.id && (
                            <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-warm-400">还没有箱子，先去创建一个吧</p>
                )}
              </div>
            )}

            <div className="card p-4">
              <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
                <AlignLeft size={16} className="text-warm-400" />
                备注
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="添加备注信息（可选）"
                rows={3}
                className="input-field resize-none"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {step === 2 && !isEdit && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 btn-secondary"
            >
              上一步
            </button>
          )}
          {step === 1 && !isEdit ? (
            <button onClick={handleNext} className="flex-1 btn-primary">
              下一步
            </button>
          ) : (
            <button onClick={handleSubmit} className="flex-1 btn-primary">
              {isEdit ? '保存修改' : formData.isWashed ? '确认入箱' : '加入待处理'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
