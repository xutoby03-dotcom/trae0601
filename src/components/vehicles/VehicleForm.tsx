import { useState, useEffect, FormEvent } from 'react';
import { Vehicle } from '../../types';
import { cn } from '../../utils/helpers';
import { Save, X, User, Car, Hash, Users, Package, Fuel, Radio, Image } from 'lucide-react';

interface VehicleFormProps {
  vehicle?: Vehicle;
  onSubmit: (data: Omit<Vehicle, 'id'>) => void;
  onCancel: () => void;
}

interface FormData {
  driverName: string;
  carModel: string;
  plateNumber: string;
  totalSeats: number;
  trunkSpace: number;
  fuelConsumption: number;
  radioChannel: string;
  photoUrl: string;
}

interface FormErrors {
  driverName?: string;
  carModel?: string;
  plateNumber?: string;
  totalSeats?: string;
  trunkSpace?: string;
  fuelConsumption?: string;
  radioChannel?: string;
  photoUrl?: string;
}

const initialFormData: FormData = {
  driverName: '',
  carModel: '',
  plateNumber: '',
  totalSeats: 5,
  trunkSpace: 400,
  fuelConsumption: 10,
  radioChannel: '',
  photoUrl: '',
};

export function VehicleForm({ vehicle, onSubmit, onCancel }: VehicleFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        driverName: vehicle.driverName,
        carModel: vehicle.carModel,
        plateNumber: vehicle.plateNumber,
        totalSeats: vehicle.totalSeats,
        trunkSpace: vehicle.trunkSpace,
        fuelConsumption: vehicle.fuelConsumption,
        radioChannel: vehicle.radioChannel,
        photoUrl: vehicle.photoUrl,
      });
    }
  }, [vehicle]);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.driverName.trim()) {
      newErrors.driverName = '请输入司机姓名';
    }
    if (!formData.carModel.trim()) {
      newErrors.carModel = '请输入车型';
    }
    if (!formData.plateNumber.trim()) {
      newErrors.plateNumber = '请输入车牌号';
    }
    if (!formData.radioChannel.trim()) {
      newErrors.radioChannel = '请输入对讲频道';
    }
    if (formData.totalSeats <= 0) {
      newErrors.totalSeats = '座位数必须大于0';
    }
    if (formData.trunkSpace < 0) {
      newErrors.trunkSpace = '后备箱空间不能为负数';
    }
    if (formData.fuelConsumption <= 0) {
      newErrors.fuelConsumption = '油耗必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const inputClass = (hasError?: string) =>
    cn(
      'w-full px-3 py-2.5 rounded-xl border bg-white text-gray-800 placeholder-gray-400',
      'focus:outline-none focus:ring-2 focus:ring-forest-500/30 transition-all',
      hasError ? 'border-red-300 focus:border-red-400' : 'border-cream-200 focus:border-forest-400'
    );

  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>
            <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            司机姓名 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.driverName}
            onChange={(e) => updateField('driverName', e.target.value)}
            placeholder="请输入司机姓名"
            className={inputClass(errors.driverName)}
          />
          {errors.driverName && (
            <p className="text-xs text-red-500 mt-1">{errors.driverName}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Car className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            车型 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.carModel}
            onChange={(e) => updateField('carModel', e.target.value)}
            placeholder="例如：丰田普拉多"
            className={inputClass(errors.carModel)}
          />
          {errors.carModel && (
            <p className="text-xs text-red-500 mt-1">{errors.carModel}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Hash className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            车牌号 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.plateNumber}
            onChange={(e) => updateField('plateNumber', e.target.value)}
            placeholder="例如：京A·88888"
            className={inputClass(errors.plateNumber)}
          />
          {errors.plateNumber && (
            <p className="text-xs text-red-500 mt-1">{errors.plateNumber}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Radio className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            对讲频道 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.radioChannel}
            onChange={(e) => updateField('radioChannel', e.target.value)}
            placeholder="例如：CH-01"
            className={inputClass(errors.radioChannel)}
          />
          {errors.radioChannel && (
            <p className="text-xs text-red-500 mt-1">{errors.radioChannel}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            总座位数
          </label>
          <input
            type="number"
            min={1}
            value={formData.totalSeats}
            onChange={(e) => updateField('totalSeats', Number(e.target.value))}
            className={inputClass(errors.totalSeats)}
          />
          {errors.totalSeats && (
            <p className="text-xs text-red-500 mt-1">{errors.totalSeats}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>
            <Package className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            后备箱空间 (L)
          </label>
          <input
            type="number"
            min={0}
            value={formData.trunkSpace}
            onChange={(e) => updateField('trunkSpace', Number(e.target.value))}
            className={inputClass(errors.trunkSpace)}
          />
          {errors.trunkSpace && (
            <p className="text-xs text-red-500 mt-1">{errors.trunkSpace}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>
            <Fuel className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            百公里油耗 (L/100km)
          </label>
          <input
            type="number"
            min={0.1}
            step={0.1}
            value={formData.fuelConsumption}
            onChange={(e) => updateField('fuelConsumption', Number(e.target.value))}
            className={inputClass(errors.fuelConsumption)}
          />
          {errors.fuelConsumption && (
            <p className="text-xs text-red-500 mt-1">{errors.fuelConsumption}</p>
          )}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>
            <Image className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            照片URL
          </label>
          <input
            type="text"
            value={formData.photoUrl}
            onChange={(e) => updateField('photoUrl', e.target.value)}
            placeholder="请输入车辆照片链接"
            className={inputClass(errors.photoUrl)}
          />
          {formData.photoUrl && (
            <div className="mt-2 rounded-xl overflow-hidden border border-cream-200">
              <img
                src={formData.photoUrl}
                alt="预览"
                className="w-full h-40 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 rounded-xl border border-cream-200 text-gray-600 hover:bg-cream-50 transition-colors flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          取消
        </button>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-forest-600 text-white hover:bg-forest-700 transition-colors flex items-center gap-2 shadow"
        >
          <Save className="w-4 h-4" />
          {vehicle ? '保存修改' : '添加车辆'}
        </button>
      </div>
    </form>
  );
}
