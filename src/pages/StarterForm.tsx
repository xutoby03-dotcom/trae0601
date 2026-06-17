import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStarterStore } from '@/store/useStarterStore';
import { StorageType, StarterStatus } from '@/types';
import { ArrowLeft, Camera, Save } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, '名称至少2个字符'),
  flourType: z.string().min(2, '请输入面粉类型'),
  waterRatio: z.coerce.number().min(0.5, '水粉比不低于0.5').max(2, '水粉比不高于2'),
  container: z.string().min(2, '请输入容器类型'),
  storageType: z.enum([StorageType.ROOM_TEMP, StorageType.REFRIGERATED]),
  createdAt: z.string().min(1, '请选择建立日期'),
  feedingInterval: z.coerce.number().min(1, '喂养间隔至少1小时'),
  currentWeight: z.coerce.number().min(50, '初始重量至少50g'),
  photoUrl: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function StarterForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addStarter, updateStarter, getStarterById } = useStarterStore();
  const [isEditing, setIsEditing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      waterRatio: 1.0,
      feedingInterval: 12,
      currentWeight: 300,
      storageType: StorageType.ROOM_TEMP,
    }
  });

  useEffect(() => {
    if (id) {
      const starter = getStarterById(id);
      if (starter) {
        setIsEditing(true);
        reset({
          name: starter.name,
          flourType: starter.flourType,
          waterRatio: starter.waterRatio,
          container: starter.container,
          storageType: starter.storageType,
          createdAt: starter.createdAt.split('T')[0],
          feedingInterval: starter.feedingInterval,
          currentWeight: starter.currentWeight,
          photoUrl: starter.photoUrl || '',
          notes: starter.notes || '',
        });
        setPreviewImage(starter.photoUrl || null);
      }
    }
  }, [id, getStarterById, reset]);

  const onSubmit = async (data: FormData) => {
    const starterData = {
      name: data.name,
      flourType: data.flourType,
      waterRatio: data.waterRatio,
      container: data.container,
      storageType: data.storageType,
      createdAt: new Date(data.createdAt).toISOString(),
      feedingInterval: data.feedingInterval,
      currentWeight: data.currentWeight,
      photoUrl: previewImage || data.photoUrl,
      notes: data.notes,
    };

    if (isEditing && id) {
      updateStarter(id, starterData);
    } else {
      addStarter(starterData);
    }
    navigate('/starters');
  };

  const handleImageUrlChange = (url: string) => {
    setPreviewImage(url || null);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/starters')}
          className="p-2 hover:bg-bread-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-bread-600" />
        </button>
        <div>
          <h1 className="text-3xl font-display font-bold text-bread-800">
            {isEditing ? '编辑母种档案' : '新建母种档案'}
          </h1>
          <p className="text-bread-500 mt-1">记录酸种的基础信息和喂养参数</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card p-6">
          <h2 className="text-xl font-display font-bold text-bread-800 mb-6">基础信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">酸种名称 *</label>
              <input
                {...register('name')}
                placeholder="如：老面种A罐"
                className="input"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">面粉类型 *</label>
              <input
                {...register('flourType')}
                placeholder="如：T65高筋粉"
                className="input"
              />
              {errors.flourType && <p className="text-red-500 text-sm mt-1">{errors.flourType.message}</p>}
            </div>

            <div>
              <label className="label">水粉比 *</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.1"
                  {...register('waterRatio')}
                  className="input"
                />
                <span className="text-bread-500">: 1</span>
              </div>
              {errors.waterRatio && <p className="text-red-500 text-sm mt-1">{errors.waterRatio.message}</p>}
            </div>

            <div>
              <label className="label">容器类型 *</label>
              <input
                {...register('container')}
                placeholder="如：玻璃密封罐"
                className="input"
              />
              {errors.container && <p className="text-red-500 text-sm mt-1">{errors.container.message}</p>}
            </div>

            <div>
              <label className="label">储存方式 *</label>
              <select {...register('storageType')} className="input">
                <option value={StorageType.ROOM_TEMP}>常温</option>
                <option value={StorageType.REFRIGERATED}>冷藏</option>
              </select>
              {errors.storageType && <p className="text-red-500 text-sm mt-1">{errors.storageType.message}</p>}
            </div>

            <div>
              <label className="label">建立日期 *</label>
              <input
                type="date"
                {...register('createdAt')}
                className="input"
              />
              {errors.createdAt && <p className="text-red-500 text-sm mt-1">{errors.createdAt.message}</p>}
            </div>

            <div>
              <label className="label">喂养间隔（小时）*</label>
              <input
                type="number"
                {...register('feedingInterval')}
                placeholder="12"
                className="input"
              />
              {errors.feedingInterval && <p className="text-red-500 text-sm mt-1">{errors.feedingInterval.message}</p>}
            </div>

            <div>
              <label className="label">当前重量（g）*</label>
              <input
                type="number"
                {...register('currentWeight')}
                placeholder="300"
                className="input"
              />
              {errors.currentWeight && <p className="text-red-500 text-sm mt-1">{errors.currentWeight.message}</p>}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-display font-bold text-bread-800 mb-6">照片</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">照片URL</label>
              <input
                {...register('photoUrl')}
                placeholder="输入图片URL"
                className="input"
                onChange={(e) => {
                  register('photoUrl').onChange(e);
                  handleImageUrlChange(e.target.value);
                }}
              />
            </div>
            <div className="flex items-center justify-center">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="预览"
                  className="w-40 h-40 object-cover rounded-xl border-2 border-bread-200"
                />
              ) : (
                <div className="w-40 h-40 bg-bread-50 rounded-xl border-2 border-dashed border-bread-200 flex items-center justify-center">
                  <Camera className="w-12 h-12 text-bread-300" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-display font-bold text-bread-800 mb-6">备注</h2>
          <textarea
            {...register('notes')}
            rows={4}
            placeholder="记录酸种的特殊信息、来源、风味特点等..."
            className="input resize-none"
          />
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/starters')}
            className="btn-secondary"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEditing ? '保存修改' : '创建档案'}
          </button>
        </div>
      </form>
    </div>
  );
}
