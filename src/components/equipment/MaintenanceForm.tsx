import { useForm } from 'react-hook-form';
import { Calendar, Plus, Image } from 'lucide-react';

interface MaintenanceFormProps {
  equipmentId: string;
  onSubmit: (data: { equipmentId: string; date: string; content: string; photo?: string }) => void;
}

interface FormData {
  date: string;
  content: string;
  photo?: string;
}

export default function MaintenanceForm({ equipmentId, onSubmit }: MaintenanceFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      content: '',
      photo: '',
    },
  });

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      equipmentId,
      date: data.date,
      content: data.content,
      photo: data.photo || undefined,
    });
    reset();
  };

  return (
    <div className="card">
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary-600" />
        添加保养记录
      </h3>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            保养日期 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="date"
              {...register('date', {
                required: '请选择保养日期',
              })}
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.date && (
            <p className="mt-1 text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            保养内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('content', {
              required: '请填写保养内容',
              minLength: { value: 2, message: '保养内容至少2个字符' },
            })}
            rows={3}
            placeholder="请描述本次保养的具体内容..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm resize-none"
          />
          {errors.content && (
            <p className="mt-1 text-xs text-red-500">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            照片链接
            <span className="text-gray-400 font-normal ml-1">(可选)</span>
          </label>
          <div className="relative">
            <input
              type="url"
              {...register('photo', {
                pattern: {
                  value: /^https?:\/\/.+/i,
                  message: '请输入有效的URL地址',
                },
              })}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors text-sm"
            />
            <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
          {errors.photo && (
            <p className="mt-1 text-xs text-red-500">{errors.photo.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 active:bg-primary-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
        >
          <Plus className="w-4 h-4" />
          {isSubmitting ? '提交中...' : '添加保养记录'}
        </button>
      </form>
    </div>
  );
}
