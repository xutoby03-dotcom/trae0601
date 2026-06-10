import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onChange, maxPhotos = 5 }: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result && photos.length < maxPhotos) {
          onChange([...photos, result]);
        }
      };
      reader.onloadend = () => {
        setUploading(false);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  const useDemoPhoto = () => {
    const demoPhotos = [
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20pet%20dog%20or%20cat%20portrait%20photography&image_size=square_hd',
      'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=adorable%20pet%20photo%20high%20quality&image_size=square_hd',
    ];
    const randomPhoto = demoPhotos[Math.floor(Math.random() * demoPhotos.length)];
    if (photos.length < maxPhotos) {
      onChange([...photos, randomPhoto]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200 group"
          >
            <img
              src={photo}
              alt={`照片 ${index + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs text-center py-1">
              {index + 1}
            </div>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <label className={cn(
            "w-24 h-24 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all",
            uploading 
              ? "border-gray-300 bg-gray-50" 
              : "border-orange-300 bg-orange-50 hover:border-orange-400 hover:bg-orange-100"
          )}>
            {uploading ? (
              <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
            ) : (
              <>
                <Plus className="w-6 h-6 text-orange-500" />
                <span className="text-xs text-orange-500 mt-1">添加照片</span>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {photos.length === 0 && (
        <button
          type="button"
          onClick={useDemoPhoto}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-500 transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          <span>没有照片？点击使用示例照片</span>
        </button>
      )}

      <p className="text-xs text-gray-400">
        最多可上传 {maxPhotos} 张照片，支持 JPG、PNG 格式
      </p>
    </div>
  );
}
