import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Palette, Ruler, 
  Droplets, ImageIcon, Check, X
} from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { useStore } from '@/store/useStore';
import { LABEL_COLORS } from '@/types';
import { formatDate } from '@/utils/date';

export default function BoxForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const boxes = useStore((state) => state.boxes);
  const addBox = useStore((state) => state.addBox);
  const updateBox = useStore((state) => state.updateBox);
  const isEdit = Boolean(id);

  const box = useMemo(() => boxes.find(b => b.id === id), [boxes, id]);

  const [formData, setFormData] = useState({
    code: '',
    location: '',
    labelColor: LABEL_COLORS[0].value,
    capacity: 30,
    moisturePackDate: formatDate(new Date(), 'yyyy-MM-dd'),
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (box) {
      setFormData({
        code: box.code,
        location: box.location,
        labelColor: box.labelColor,
        capacity: box.capacity,
        moisturePackDate: formatDate(box.moisturePackDate, 'yyyy-MM-dd'),
        photo: box.photo || '',
      });
    }
  }, [box]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.code.trim()) newErrors.code = '请输入箱子编号';
    if (!formData.location.trim()) newErrors.location = '请输入存放位置';
    if (formData.capacity <= 0) newErrors.capacity = '容量必须大于0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit && id) {
      updateBox(id, {
        ...formData,
        moisturePackDate: new Date(formData.moisturePackDate).toISOString(),
      });
    } else {
      addBox({
        ...formData,
        moisturePackDate: new Date(formData.moisturePackDate).toISOString(),
      });
    }
    navigate(-1);
  };

  return (
    <Layout title={isEdit ? '编辑箱子' : '新增箱子'} showBack>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="card p-4 space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <Package size={16} className="text-sage-500" />
              箱子编号
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="如 B001"
              className={`input-field ${errors.code ? 'border-coral-400' : ''}`}
            />
            {errors.code && <p className="text-coral-500 text-xs mt-1">{errors.code}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <MapPin size={16} className="text-sage-500" />
              存放位置
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="如 主卧衣柜顶层"
              className={`input-field ${errors.location ? 'border-coral-400' : ''}`}
            />
            {errors.location && <p className="text-coral-500 text-xs mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <Palette size={16} className="text-sage-500" />
              标签颜色
            </label>
            <div className="flex flex-wrap gap-3">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, labelColor: color.value })}
                  className={`w-10 h-10 rounded-full relative transition-transform hover:scale-110 ${
                    formData.labelColor === color.value ? 'ring-2 ring-offset-2 ring-sage-500 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {formData.labelColor === color.value && (
                    <Check size={18} className="absolute inset-0 m-auto text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <Ruler size={16} className="text-sage-500" />
              容量（件）
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
              min="1"
              className={`input-field ${errors.capacity ? 'border-coral-400' : ''}`}
            />
            {errors.capacity && <p className="text-coral-500 text-xs mt-1">{errors.capacity}</p>}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <Droplets size={16} className="text-sky-500" />
              防潮包放置日期
            </label>
            <input
              type="date"
              value={formData.moisturePackDate}
              onChange={(e) => setFormData({ ...formData, moisturePackDate: e.target.value })}
              className="input-field"
            />
            <p className="text-xs text-warm-400 mt-1">
              防潮包有效期约 3 个月
            </p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-warm-700 mb-2">
              <ImageIcon size={16} className="text-sage-500" />
              箱子照片
            </label>
            <input
              type="url"
              value={formData.photo}
              onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
              placeholder="输入图片 URL（可选）"
              className="input-field"
            />
            {formData.photo && (
              <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-warm-50">
                <img 
                  src={formData.photo} 
                  alt="预览" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 btn-secondary"
          >
            取消
          </button>
          <button type="submit" className="flex-1 btn-primary">
            {isEdit ? '保存修改' : '创建箱子'}
          </button>
        </div>
      </form>
    </Layout>
  );
}
