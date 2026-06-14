import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X } from 'lucide-react';
import { BRANDS, FILTER_TYPES } from '@/types';
import type { ACFormData } from '@/types';

interface ACFormProps {
  initialData?: ACFormData;
  onSubmit: (data: ACFormData) => void;
  isEditing?: boolean;
}

const defaultFormData: ACFormData = {
  room: '',
  brand: '',
  model: '',
  horsepower: 1.5,
  filterType: '普通滤网',
  cleaningCycle: 30,
  photo: '',
};

export function ACForm({ initialData, onSubmit, isEditing = false }: ACFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ACFormData>(initialData || defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof ACFormData, string>>>({});

  const handleChange = (field: keyof ACFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ACFormData, string>> = {};
    if (!formData.room.trim()) newErrors.room = '请输入房间名称';
    if (!formData.brand) newErrors.brand = '请选择品牌';
    if (!formData.model.trim()) newErrors.model = '请输入型号';
    if (!formData.photo.trim()) newErrors.photo = '请上传或输入照片链接';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const generatePhotoUrl = () => {
    const roomEncoded = encodeURIComponent(`${formData.room} air conditioner`);
    const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${roomEncoded}&image_size=square_hd`;
    handleChange('photo', url);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => navigate('/air-conditioners')}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? '编辑空调档案' : '新增空调档案'}
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              房间名称 *
            </label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => handleChange('room', e.target.value)}
              placeholder="如：客厅、主卧室"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                errors.room ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-primary-500'
              }`}
            />
            {errors.room && <p className="text-red-500 text-sm mt-1">{errors.room}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              品牌 *
            </label>
            <select
              value={formData.brand}
              onChange={(e) => handleChange('brand', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                errors.brand ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">请选择品牌</option>
              {BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            {errors.brand && <p className="text-red-500 text-sm mt-1">{errors.brand}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              型号 *
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleChange('model', e.target.value)}
              placeholder="如：KFR-35GW"
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                errors.model ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.model && <p className="text-red-500 text-sm mt-1">{errors.model}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              匹数
            </label>
            <select
              value={formData.horsepower}
              onChange={(e) => handleChange('horsepower', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              <option value={1}>1匹</option>
              <option value={1.5}>1.5匹</option>
              <option value={2}>2匹</option>
              <option value={2.5}>2.5匹</option>
              <option value={3}>3匹</option>
              <option value={5}>5匹</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              清洗周期（天）
            </label>
            <input
              type="number"
              min="1"
              max="365"
              value={formData.cleaningCycle}
              onChange={(e) => handleChange('cleaningCycle', parseInt(e.target.value) || 30)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              滤网类型
            </label>
            <select
              value={formData.filterType}
              onChange={(e) => handleChange('filterType', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            >
              {FILTER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              照片 *
            </label>
            <div className="flex gap-3">
              <input
                type="url"
                value={formData.photo}
                onChange={(e) => handleChange('photo', e.target.value)}
                placeholder="输入图片链接"
                className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.photo ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={generatePhotoUrl}
                className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                生成图片
              </button>
            </div>
            {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}

            {formData.photo && (
              <div className="mt-4 relative inline-block">
                <img
                  src={formData.photo}
                  alt="预览"
                  className="w-40 h-40 object-cover rounded-xl border-2 border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 24 24" fill="none" stroke="%239ca3af" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2" ry="2"%3E%3C/rect%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"%3E%3C/circle%3E%3Cpolyline points="21 15 16 10 5 21"%3E%3C/polyline%3E%3C/svg%3E';
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleChange('photo', '')}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={() => navigate('/air-conditioners')}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '创建档案'}
          </button>
        </div>
      </div>
    </form>
  );
}
