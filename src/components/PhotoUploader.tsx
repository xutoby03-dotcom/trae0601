import { useRef } from 'react';
import { Plus, X, Image as ImageIcon } from 'lucide-react';

interface PhotoUploaderProps {
  value: string[];
  onChange: (photos: string[]) => void;
  label?: string;
  max?: number;
}

export default function PhotoUploader({
  value,
  onChange,
  label = '上传照片',
  max = 9,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const remaining = max - value.length;
    if (remaining <= 0) return;

    const validFiles = Array.from(files).slice(0, remaining);
    const readers: Promise<string>[] = [];

    validFiles.forEach((file) => {
      readers.push(
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
      );
    });

    Promise.all(readers).then((base64List) => {
      onChange([...value, ...base64List]);
      if (inputRef.current) inputRef.current.value = '';
    });
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const reachMax = value.length >= max;

  return (
    <div>
      {label && (
        <label className="label-field">
          {label} <span className="text-gray-400 font-normal">（{value.length}/{max}）</span>
        </label>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
        {value.map((photo, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group"
          >
            <img
              src={photo}
              alt={`photo-${index}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}

        {!reachMax && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-primary-400 bg-gray-50 hover:bg-primary-50 flex flex-col items-center justify-center text-gray-400 hover:text-primary-500 transition-all cursor-pointer"
          >
            <Plus className="w-7 h-7 mb-1" />
            <span className="text-xs font-medium">添加</span>
          </button>
        )}
      </div>

      {value.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          选择本地图片
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
