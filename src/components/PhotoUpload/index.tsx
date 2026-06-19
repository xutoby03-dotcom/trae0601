import { useRef } from 'react';
import { Camera, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ photos, onChange, maxPhotos = 9 }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddPhoto = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newPhotos: string[] = [];
    const remaining = maxPhotos - photos.length;

    Array.from(files)
      .slice(0, remaining)
      .forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPhotos.push(event.target.result as string);
            if (newPhotos.length === Math.min(files.length, remaining)) {
              onChange([...photos, ...newPhotos]);
            }
          }
        };
        reader.readAsDataURL(file);
      });

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    onChange(photos.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {photos.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group shadow-sm"
          >
            <img src={photo} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemovePhoto(index)}
              className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={handleAddPhoto}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 hover:bg-primary-50 flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-primary-500 transition-all"
          >
            <Camera className="w-6 h-6" />
            <span className="text-xs">添加照片</span>
          </button>
        )}
      </div>

      {photos.length === 0 && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
          <ImageIcon className="w-4 h-4" />
          <span>最多上传 {maxPhotos} 张照片</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
