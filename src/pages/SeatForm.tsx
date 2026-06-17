import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Armchair, Upload, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSeatStore } from '@/store/useSeatStore';
import { calculateExpiryDate } from '@/utils/date';
import { INSTALLATION_TYPE_LABELS } from '@/types';

export default function SeatForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { seats, addSeat, updateSeat, getSeatById } = useSeatStore();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    weightRange: '',
    installationType: 'seatbelt' as 'seatbelt' | 'isofix' | 'both',
    manufactureDate: '',
    expiryDate: '',
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      const seat = getSeatById(id);
      if (seat) {
        setFormData({
          brand: seat.brand,
          model: seat.model,
          weightRange: seat.weightRange,
          installationType: seat.installationType,
          manufactureDate: seat.manufactureDate,
          expiryDate: seat.expiryDate,
          photo: seat.photo || '',
        });
      }
    }
  }, [isEditing, id, getSeatById]);

  useEffect(() => {
    if (formData.manufactureDate && !formData.expiryDate) {
      const expiry = calculateExpiryDate(formData.manufactureDate, 6);
      setFormData(prev => ({ ...prev, expiryDate: expiry }));
    }
  }, [formData.manufactureDate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.brand.trim()) newErrors.brand = '请输入品牌';
    if (!formData.model.trim()) newErrors.model = '请输入型号';
    if (!formData.weightRange.trim()) newErrors.weightRange = '请输入适用体重';
    if (!formData.manufactureDate) newErrors.manufactureDate = '请选择生产日期';
    if (!formData.expiryDate) newErrors.expiryDate = '请选择过期日期';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing && id) {
      updateSeat(id, formData);
    } else {
      addSeat(formData);
    }
    navigate('/seats');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, photo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/seats" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">
            {isEditing ? '编辑座椅' : '新增座椅'}
          </h1>
          <p className="text-gray-500 mt-1">
            填写安全座椅详细信息
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              {formData.photo ? (
                <img src={formData.photo} alt="座椅照片" className="w-full h-full object-cover" />
              ) : (
                <Armchair className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-white cursor-pointer hover:bg-primary-600 transition-colors">
              <Upload className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">品牌 *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
              placeholder="例如：宝得适、Cybex"
              className={`input ${errors.brand ? 'border-red-500' : ''}`}
            />
            {errors.brand && <p className="text-red-500 text-xs mt-1">{errors.brand}</p>}
          </div>

          <div>
            <label className="label">型号 *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              placeholder="例如：百变骑士 IV"
              className={`input ${errors.model ? 'border-red-500' : ''}`}
            />
            {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
          </div>
        </div>

        <div>
          <label className="label">适用体重范围 *</label>
          <input
            type="text"
            value={formData.weightRange}
            onChange={(e) => setFormData(prev => ({ ...prev, weightRange: e.target.value }))}
            placeholder="例如：9-36kg、15-50kg"
            className={`input ${errors.weightRange ? 'border-red-500' : ''}`}
          />
          {errors.weightRange && <p className="text-red-500 text-xs mt-1">{errors.weightRange}</p>}
        </div>

        <div>
          <label className="label">安装方式 *</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(INSTALLATION_TYPE_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, installationType: value as any }))}
                className={`px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
                  formData.installationType === value
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">生产日期 *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.manufactureDate}
                onChange={(e) => setFormData(prev => ({ ...prev, manufactureDate: e.target.value }))}
                className={`input pl-10 ${errors.manufactureDate ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.manufactureDate && <p className="text-red-500 text-xs mt-1">{errors.manufactureDate}</p>}
          </div>

          <div>
            <label className="label">过期日期 *</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                className={`input pl-10 ${errors.expiryDate ? 'border-red-500' : ''}`}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              安全座椅一般使用期限为 6 年
            </p>
            {errors.expiryDate && <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Link to="/seats" className="btn-outline flex-1">
            取消
          </Link>
          <button type="submit" className="btn-primary flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? '保存修改' : '创建座椅'}
          </button>
        </div>
      </form>
    </div>
  );
}
