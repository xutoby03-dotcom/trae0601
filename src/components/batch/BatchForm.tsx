import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Package, Scale, Thermometer, Clock, MapPin, ChevronLeft } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { addHours, formatDateTime } from '@/utils/dateUtils';
import { useState } from 'react';
import LayerSelector from '@/components/common/LayerSelector';
import type { Batch, Equipment } from '@/types';

interface BatchFormData {
  equipmentId: string;
  recipe: string;
  weight: number;
  targetTemp: number;
  inTime: string;
  fermentHours: number;
  layer: number;
}

export default function BatchForm() {
  const navigate = useNavigate();
  const equipments = useStore((state) => state.equipments);
  const addBatch = useStore((state) => state.addBatch);

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const defaultInTime = new Date().toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BatchFormData>({
    defaultValues: {
      equipmentId: '',
      recipe: '',
      weight: 10,
      targetTemp: 4,
      inTime: defaultInTime,
      fermentHours: 18,
      layer: 1,
    },
  });

  const watchedLayer = watch('layer');

  const handleEquipmentChange = (equipmentId: string) => {
    const equipment = equipments.find((eq) => eq.id === equipmentId);
    setSelectedEquipment(equipment || null);
    setValue('equipmentId', equipmentId);
    if (equipment) {
      setValue('layer', 1);
    }
  };

  const handleLayerChange = (layer: number) => {
    setValue('layer', layer);
  };

  const onSubmit = (data: BatchFormData) => {
    const inTimeDate = new Date(data.inTime);
    const expectOutTime = addHours(inTimeDate, data.fermentHours);

    const batchData: Omit<Batch, 'id'> = {
      equipmentId: data.equipmentId,
      recipe: data.recipe,
      weight: data.weight,
      targetTemp: data.targetTemp,
      inTime: inTimeDate.toISOString(),
      expectOutTime: expectOutTime.toISOString(),
      layer: data.layer,
      status: 'fermenting',
    };

    addBatch(batchData);
    navigate('/batches');
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeInUp">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/batches')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">入箱登记</h1>
          <p className="text-sm text-gray-500">填写新批次的入箱信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 text-gray-400" />
                设备选择 <span className="text-status-danger">*</span>
              </label>
              <select
                {...register('equipmentId', { required: '请选择设备' })}
                onChange={(e) => handleEquipmentChange(e.target.value)}
                className="input-field"
              >
                <option value="">请选择设备</option>
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.code} (容量: {eq.capacity}kg, {eq.layers}层)
                  </option>
                ))}
              </select>
              {errors.equipmentId && (
                <p className="mt-1 text-sm text-status-danger">{errors.equipmentId.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 text-gray-400" />
                配方名称 <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="如：法式乡村面包"
                {...register('recipe', { required: '请输入配方名称' })}
                className="input-field"
              />
              {errors.recipe && (
                <p className="mt-1 text-sm text-status-danger">{errors.recipe.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Scale className="w-4 h-4 text-gray-400" />
                重量 (kg) <span className="text-status-danger">*</span>
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="请输入重量"
                {...register('weight', {
                  required: '请输入重量',
                  min: { value: 0.1, message: '重量必须大于0' },
                })}
                className="input-field"
              />
              {errors.weight && (
                <p className="mt-1 text-sm text-status-danger">{errors.weight.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-gray-400" />
                目标温度 (°C)
              </label>
              <input
                type="number"
                min="-10"
                max="30"
                step="0.1"
                {...register('targetTemp')}
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div className="card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">时间设置</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                入箱时间
              </label>
              <input
                type="datetime-local"
                {...register('inTime')}
                className="input-field"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 text-gray-400" />
                预计发酵时长 (小时)
              </label>
              <input
                type="number"
                min="1"
                max="72"
                {...register('fermentHours')}
                className="input-field"
              />
            </div>
          </div>

          {watch('inTime') && watch('fermentHours') && (
            <div className="mt-4 p-3 bg-primary-50 rounded-lg">
              <p className="text-sm text-primary-700">
                <span className="font-medium">预计出箱时间：</span>
                {formatDateTime(addHours(new Date(watch('inTime')), watch('fermentHours')))}
              </p>
            </div>
          )}
        </div>

        <div className="card animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">
            <MapPin className="w-4 h-4 inline mr-2 text-gray-400" />
            所在层
          </h2>
          {selectedEquipment ? (
            <div>
              <p className="text-sm text-gray-500 mb-3">
                设备 <span className="font-medium text-gray-700">{selectedEquipment.code}</span> 共 {selectedEquipment.layers} 层
              </p>
              <input type="hidden" {...register('layer')} value={watchedLayer} />
              <LayerSelector
                layers={selectedEquipment.layers}
                value={watchedLayer}
                onChange={handleLayerChange}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2" />
              <p>请先选择设备</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <button
            type="button"
            onClick={() => navigate('/batches')}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? '提交中...' : '确认入箱'}
          </button>
        </div>
      </form>
    </div>
  );
}
