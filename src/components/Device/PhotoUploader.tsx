import { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface PhotoUploaderProps {
  value?: string;
  onChange: (base64: string | undefined) => void;
}

export default function PhotoUploader({ value, onChange }: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
          value
            ? 'border-gray-200 p-0 overflow-hidden'
            : 'border-gray-300 hover:border-brand-400 hover:bg-brand-50/30 p-8 min-h-[200px]'
        }`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="设备照片"
              className="w-full h-auto max-h-[320px] object-contain bg-gray-50"
            />
            <button
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full shadow-md hover:bg-danger-50 hover:text-danger-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-3">
              <Upload className="w-7 h-7 text-brand-500" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">点击上传设备照片</p>
            <p className="text-xs text-gray-400">支持 JPG / PNG，最大 5MB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
