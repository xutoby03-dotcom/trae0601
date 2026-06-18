import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Thermometer, Droplets, DoorOpen, Snowflake, Volume2, ChevronLeft, AlertTriangle, CheckCircle } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { formatDateTime } from '@/utils/dateUtils';
import { isTempNormal } from '@/utils/tempUtils';
import { useState } from 'react';
import type { Inspection } from '@/types';

interface InspectionFormData {
  equipmentId: string;
  time: string;
  actualTemp: number;
  humidity: number;
  doorFrequentOpen: boolean;
  frosting: boolean;
  abnormalSound: boolean;
  remark: string;
}

export default function InspectionForm() {
  const navigate = useNavigate();
  const equipments = useStore((state) => state.equipments);
  const addInspection = useStore((state) => state.addInspection);

  const [showSuccess, setShowSuccess] = useState(false);

  const defaultTime = new Date().toISOString().slice(0, 16);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InspectionFormData>({
    defaultValues: {
      equipmentId: '',
      time: defaultTime,
      actualTemp: 4,
      humidity: 60,
      doorFrequentOpen: false,
      frosting: false,
      abnormalSound: false,
      remark: '',
    },
  });

  const watchedTemp = watch('actualTemp');
  const isTempAbnormal = !isTempNormal(watchedTemp);

  const onSubmit = async (data: InspectionFormData) => {
    const inspectionData: Omit<Inspection, 'id'> = {
      equipmentId: data.equipmentId,
      time: new Date(data.time).toISOString(),
      actualTemp: data.actualTemp,
      humidity: data.humidity,
      doorFrequentOpen: data.doorFrequentOpen,
      frosting: data.frosting,
      abnormalSound: data.abnormalSound,
      remark: data.remark || undefined,
    };

    addInspection(inspectionData);
    setShowSuccess(true);

    await new Promise((resolve) => setTimeout(resolve, 1500));
    navigate('/inspections');
  };

  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto animate-fadeInUp">
        <div className="card flex flex-col items-center justify-center py-16">
          <div className="relative">
            <CheckCircle className="w-20 h-20 text-status-normal animate-successBounce" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl font-bold text-gray-900 mt-6">提交成功</h2>
          <p className="text-sm text-gray-500 mt-2">巡检记录已保存</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fadeInUp">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/inspections')}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">巡检登记</h1>
          <p className="text-sm text-gray-500">填写巡检记录信息</p>
        </div>
      </div>

      {isTempAbnormal && (
        <div className="mb-6 p-4 bg-status-danger/10 border border-status-danger/20 rounded-lg flex items-start gap-3 animate-fadeInUp">
          <AlertTriangle className="w-5 h-5 text-status-danger shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-status-danger">温度异常</p>
            <p className="text-sm text-status-danger/80 mt-1">
              当前温度 {watchedTemp}°C 不在正常范围 (2-6°C) 内，请确认！
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card animate-fadeInUp" style={{ animationDelay: '50ms' }}>
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">基本信息</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-gray-400" />
                设备选择 <span className="text-status-danger">*</span>
              </label>
              <select
                {...register('equipmentId', { required: '请选择设备' })}
                className="input-field"
              >
                <option value="">请选择设备</option>
                {equipments.map((eq) => (
                  <option key={eq.id} value={eq.id}>
                    {eq.code} (容量: {eq.capacity}kg)
                  </option>
                ))}
              </select>
              {errors.equipmentId && (
                <p className="mt-1 text-sm text-status-danger">{errors.equipmentId.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-gray-400" />
                巡检时间
              </label>
              <input
                type="datetime-local"
                {...register('time')}
                className="input-field"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Thermometer className="w-4 h-4 text-gray-400" />
                实际温度 (°C) <span className="text-status-danger">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                {...register('actualTemp', {
                  required: '请输入实际温度',
                  valueAsNumber: true,
                })}
                className={`input-field ${isTempAbnormal ? 'border-status-danger focus:ring-status-danger/20' : ''}`}
              />
              {errors.actualTemp && (
                <p className="mt-1 text-sm text-status-danger">{errors.actualTemp.message}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Droplets className="w-4 h-4 text-gray-400" />
                湿度 (%) <span className="text-status-danger">*</span>
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="1"
                {...register('humidity', {
                  required: '请输入湿度',
                  min: { value: 0, message: '湿度不能小于0' },
                  max: { value: 100, message: '湿度不能大于100' },
                  valueAsNumber: true,
                })}
                className="input-field"
              />
              {errors.humidity && (
                <p className="mt-1 text-sm text-status-danger">{errors.humidity.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="card animate-fadeInUp" style={{ animationDelay: '100ms' }}>
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">巡检项目</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <DoorOpen className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">门是否频繁打开</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('doorFrequentOpen')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Snowflake className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">是否结霜</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('frosting')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">是否有异常声音</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('abnormalSound')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="card animate-fadeInUp" style={{ animationDelay: '150ms' }}>
          <h2 className="font-display text-lg font-semibold text-gray-900 mb-4">备注</h2>
          <textarea
            rows={3}
            placeholder="请输入备注信息（可选）"
            {...register('remark')}
            className="input-field resize-none"
          />
        </div>

        {watch('time') && (
          <div className="p-3 bg-primary-50 rounded-lg">
            <p className="text-sm text-primary-700">
              <span className="font-medium">巡检时间：</span>
              {formatDateTime(new Date(watch('time')))}
            </p>
          </div>
        )}

        <div className="flex gap-3 animate-fadeInUp" style={{ animationDelay: '200ms' }}>
          <button
            type="button"
            onClick={() => navigate('/inspections')}
            className="btn-secondary flex-1"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex-1"
          >
            {isSubmitting ? '提交中...' : '确认提交'}
          </button>
        </div>
      </form>
    </div>
  );
}
