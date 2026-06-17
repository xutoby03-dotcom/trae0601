import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Car, Upload } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useVehicleStore } from '@/store/useVehicleStore';

export default function VehicleForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { vehicles, addVehicle, updateVehicle, getVehicleById } = useVehicleStore();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    plateNumber: '',
    photo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && id) {
      const vehicle = getVehicleById(id);
      if (vehicle) {
        setFormData({
          brand: vehicle.brand,
          model: vehicle.model,
          plateNumber: vehicle.plateNumber,
          photo: vehicle.photo || '',
        });
      }
    }
  }, [isEditing, id, getVehicleById]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.brand.trim()) newErrors.brand = '请输入品牌';
    if (!formData.model.trim()) newErrors.model = '请输入型号';
    if (!formData.plateNumber.trim()) newErrors.plateNumber = '请输入车牌号';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isEditing && id) {
      updateVehicle(id, formData);
    } else {
      addVehicle(formData);
    }
    navigate('/vehicles');
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
        <Link to="/vehicles" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-secondary-500">
            {isEditing ? '编辑车辆' : '新增车辆'}
          </h1>
          <p className="text-gray-500 mt-1">
            填写车辆基本信息
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-32 h-24 bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
              {formData.photo ? (
                <img src={formData.photo} alt="车辆照片" className="w-full h-full object-cover" />
              ) : (
                <Car className="w-12 h-12 text-gray-400" />
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
              placeholder="例如：大众、宝马、特斯拉"
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
              placeholder="例如：迈腾、Model Y"
              className={`input ${errors.model ? 'border-red-500' : ''}`}
            />
            {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model}</p>}
          </div>
        </div>

        <div>
          <label className="label">车牌号 *</label>
          <input
            type="text"
            value={formData.plateNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, plateNumber: e.target.value }))}
            placeholder="例如：京A·12345"
            className={`input ${errors.plateNumber ? 'border-red-500' : ''}`}
          />
          {errors.plateNumber && <p className="text-red-500 text-xs mt-1">{errors.plateNumber}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <Link to="/vehicles" className="btn-outline flex-1">
            取消
          </Link>
          <button type="submit" className="btn-primary flex-1">
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? '保存修改' : '创建车辆'}
          </button>
        </div>
      </form>
    </div>
  );
}
