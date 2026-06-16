import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input, Select, Checkbox, Textarea, Button } from '@/components/ui';
import { useFurnitureStore } from '@/stores/useFurnitureStore';
import type { Furniture, FurnitureArea, FurnitureType, FurnitureMaterial } from '@/types';
import { Camera, Upload, X, ImageOff } from 'lucide-react';
import { compressImageToBase64, isValidImageFile } from '@/utils/image';
import { cn } from '@/utils/cn';

interface FurnitureFormProps {
  furniture?: Furniture | null;
  onSubmit: () => void;
  onCancel?: () => void;
}

interface FormData {
  code: string;
  name: string;
  area: FurnitureArea;
  type: FurnitureType;
  material: FurnitureMaterial;
  hasUmbrella: boolean;
  storagePoint: string;
  status: 'normal' | 'repairing' | 'lost';
  notes: string;
}

const areaOptions = [
  { value: 'outdoor-east', label: '东区' },
  { value: 'outdoor-west', label: '西区' },
  { value: 'outdoor-south', label: '南区' },
  { value: 'outdoor-north', label: '北区' },
];

const typeOptions = [
  { value: 'chair', label: '椅子' },
  { value: 'table', label: '桌子' },
  { value: 'umbrella', label: '遮阳伞' },
];

const materialOptions = [
  { value: 'wood', label: '木质' },
  { value: 'metal', label: '金属' },
  { value: 'plastic', label: '塑料' },
  { value: 'rattan', label: '藤编' },
];

const statusOptions = [
  { value: 'normal', label: '正常' },
  { value: 'repairing', label: '维修中' },
  { value: 'lost', label: '已丢失' },
];

export default function FurnitureForm({ furniture, onSubmit, onCancel }: FurnitureFormProps) {
  const [photo, setPhoto] = useState<string | undefined>(furniture?.photo);
  const [uploading, setUploading] = useState(false);
  const { addFurniture, updateFurniture, loading } = useFurnitureStore();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: furniture ? {
      code: furniture.code,
      name: furniture.name || '',
      area: furniture.area,
      type: furniture.type,
      material: furniture.material,
      hasUmbrella: furniture.hasUmbrella,
      storagePoint: furniture.storagePoint,
      status: furniture.status,
      notes: furniture.notes || '',
    } : {
      code: '',
      name: '',
      area: 'outdoor-east',
      type: 'chair',
      material: 'wood',
      hasUmbrella: false,
      storagePoint: '',
      status: 'normal',
      notes: '',
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isValidImageFile(file)) {
      alert('请选择有效的图片文件');
      return;
    }
    setUploading(true);
    try {
      const base64 = await compressImageToBase64(file, { quality: 0.7 });
      setPhoto(base64);
    } catch {
      alert('图片上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleTakePhoto = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0);
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.7);
      });
      const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      const base64 = await compressImageToBase64(file, { quality: 0.7 });
      setPhoto(base64);
      stream.getTracks().forEach(track => track.stop());
    } catch {
      alert('无法访问摄像头');
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    try {
      if (furniture) {
        await updateFurniture(furniture.id, { ...data, photo });
      } else {
        await addFurniture({ ...data, photo });
      }
      onSubmit();
    } catch (error) {
      console.error('保存失败:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">照片</label>
        <div className="flex items-start gap-4">
          <div className={cn(
            'relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50',
            photo && 'border-solid border-gray-200'
          )}>
            {photo ? (
              <>
                <img src={photo} alt="预览" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto(undefined)}
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center text-gray-400">
                <ImageOff className="h-8 w-8" />
                <span className="mt-1 text-xs">暂无照片</span>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-center text-sm text-gray-600 hover:bg-gray-50">
              <Upload className="mr-2 inline h-4 w-4" />
              上传照片
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
                disabled={uploading}
              />
            </label>
            <button
              type="button"
              onClick={handleTakePhoto}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            >
              <Camera className="mr-2 inline h-4 w-4" />
              拍照
            </button>
            {uploading && <span className="text-xs text-gray-500">处理中...</span>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input
          label="编号"
          placeholder="请输入编号"
          {...register('code', { required: '请输入编号' })}
          error={errors.code?.message}
        />
        <Input
          label="名称（可选）"
          placeholder="请输入名称"
          {...register('name')}
        />
        <Select
          label="区域"
          options={areaOptions}
          {...register('area', { required: '请选择区域' })}
          error={errors.area?.message}
        />
        <Select
          label="类型"
          options={typeOptions}
          {...register('type', { required: '请选择类型' })}
          error={errors.type?.message}
        />
        <Select
          label="材质"
          options={materialOptions}
          {...register('material', { required: '请选择材质' })}
          error={errors.material?.message}
        />
        <Select
          label="状态"
          options={statusOptions}
          {...register('status', { required: '请选择状态' })}
          error={errors.status?.message}
        />
        <Input
          label="收纳点"
          placeholder="请输入收纳点"
          {...register('storagePoint', { required: '请输入收纳点' })}
          error={errors.storagePoint?.message}
        />
        <div className="flex items-center">
          <Checkbox
            label="带遮阳伞"
            {...register('hasUmbrella')}
          />
        </div>
      </div>

      <Textarea
        label="备注（可选）"
        placeholder="请输入备注"
        rows={3}
        {...register('notes')}
      />

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            取消
          </Button>
        )}
        <Button type="submit" loading={loading}>
          {furniture ? '保存修改' : '添加桌椅'}
        </Button>
      </div>
    </form>
  );
}
