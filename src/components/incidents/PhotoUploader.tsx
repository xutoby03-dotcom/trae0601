import { useState, useRef } from 'react';
import { Camera, Upload, X, ImagePlus, Trash2, Loader2 } from 'lucide-react';
import { compressImageToBase64, isValidImageFile, formatFileSize } from '@/utils/image';
import { cn } from '@/utils/cn';

interface PhotoUploaderProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

export default function PhotoUploader({
  photos,
  onChange,
  maxPhotos = 9,
  disabled = false,
}: PhotoUploaderProps) {
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isCamera: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    for (let i = 0; i < filesToProcess.length; i++) {
      const file = filesToProcess[i];
      if (!isValidImageFile(file)) {
        alert(`文件 ${file.name} 不是有效的图片`);
        continue;
      }

      const index = photos.length + i;
      setUploadingIndex(index);

      try {
        const base64 = await compressImageToBase64(file, { quality: 0.7 });
        onChange([...photos.slice(0, index), base64, ...photos.slice(index)]);
      } catch (error) {
        console.error('图片上传失败:', error);
        alert(`图片 ${file.name} 上传失败`);
      } finally {
        setUploadingIndex(null);
      }
    }

    e.target.value = '';
  };

  const handleTakePhoto = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleRemovePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const canAddMore = photos.length < maxPhotos && !disabled;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          照片
          <span className="ml-1 text-xs text-gray-400">
            ({photos.length}/{maxPhotos})
          </span>
        </label>
        {canAddMore && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleTakePhoto}
              className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
            >
              <Camera className="h-3.5 w-3.5" />
              拍照
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600"
            >
              <Upload className="h-3.5 w-3.5" />
              上传
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
          >
            <img
              src={photo}
              alt={`照片 ${index + 1}`}
              className="h-full w-full object-cover"
            />
            {uploadingIndex === index && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Loader2 className="h-6 w-6 animate-spin text-white" />
              </div>
            )}
            {!disabled && (
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}

        {canAddMore && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 transition-colors hover:border-primary-400 hover:bg-primary-50 hover:text-primary-500"
          >
            <ImagePlus className="h-6 w-6" />
            <span className="text-xs">添加照片</span>
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, false)}
        disabled={disabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelect(e, true)}
        disabled={disabled}
      />
    </div>
  );
}
