import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import type { Cable, InterfaceType, CableStatus } from '@/types';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { INTERFACE_TYPE_LABELS, CABLE_STATUS_LABELS } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { getPlaceholderImage } from '@/utils/imageUtils';

interface CableFormProps {
  initialData?: Cable;
}

interface FormData {
  code: string;
  interfaceType: InterfaceType;
  length: number;
  power: number;
  defaultLocation: string;
  photoUrl: string;
  status: CableStatus;
}

const floors = ['1楼', '2楼', '3楼', '4楼', '5楼'];
const locations = ['前台接待区', '会议室A', '会议室B', '开放办公区', '休息区', '茶水间', '机房'];

export const CableForm = ({ initialData }: CableFormProps) => {
  const navigate = useNavigate();
  const { addCable, updateCable } = useAppStore();
  const isEditing = !!initialData;

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    defaultValues: initialData ? {
      code: initialData.code,
      interfaceType: initialData.interfaceType,
      length: initialData.length,
      power: initialData.power,
      defaultLocation: initialData.defaultLocation,
      photoUrl: initialData.photoUrl,
      status: initialData.status,
    } : {
      code: '',
      interfaceType: 'USB-C',
      length: 1.5,
      power: 65,
      defaultLocation: '',
      photoUrl: '',
      status: 'available',
    },
  });

  const photoUrl = watch('photoUrl');

  const onSubmit = async (data: FormData) => {
    try {
      const photoToUse = data.photoUrl || getPlaceholderImage(data.code || 'new-cable');
      
      if (isEditing && initialData) {
        updateCable(initialData.id, { ...data, photoUrl: photoToUse });
      } else {
        addCable({ ...data, photoUrl: photoToUse });
      }
      navigate('/cables');
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/cables')}
          className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? '编辑线材' : '新增线材'}
          </h1>
          <p className="text-sm text-gray-500">填写线材的详细信息</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                线材编号 <span className="text-red-500">*</span>
              </label>
              <input
                {...register('code', { required: '请输入线材编号' })}
                placeholder="如: CBL-0001"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.code && (
                <p className="text-red-500 text-xs mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                接口类型 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('interfaceType', { required: '请选择接口类型' })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {(Object.keys(INTERFACE_TYPE_LABELS) as InterfaceType[]).map(type => (
                  <option key={type} value={type}>{INTERFACE_TYPE_LABELS[type]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                长度 (米) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                {...register('length', { 
                  required: '请输入长度',
                  min: { value: 0.5, message: '长度至少0.5米' },
                })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.length && (
                <p className="text-red-500 text-xs mt-1">{errors.length.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                快充功率 (W) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="5"
                max="240"
                {...register('power', { 
                  required: '请输入功率',
                  min: { value: 5, message: '功率至少5W' },
                })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {errors.power && (
                <p className="text-red-500 text-xs mt-1">{errors.power.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                默认位置 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <select
                  {...register('defaultLocation', { required: '请选择位置' })}
                  className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">选择位置</option>
                  {floors.flatMap(floor => 
                    locations.map(loc => (
                      <option key={`${floor}${loc}`} value={`${floor}${loc}`}>
                        {floor}{loc}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {errors.defaultLocation && (
                <p className="text-red-500 text-xs mt-1">{errors.defaultLocation.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                状态 <span className="text-red-500">*</span>
              </label>
              <select
                {...register('status', { required: '请选择状态' })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              >
                {(Object.keys(CABLE_STATUS_LABELS) as CableStatus[]).map(status => (
                  <option key={status} value={status}>
                    {CABLE_STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                线材照片
              </label>
              <PhotoUpload
                value={photoUrl}
                onChange={(value) => setValue('photoUrl', value)}
              />
              <p className="text-xs text-gray-500 mt-2">
                上传清晰的线材照片，便于识别和管理
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/cables')}
            className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '添加线材'}
          </button>
        </div>
      </form>
    </div>
  );
};
