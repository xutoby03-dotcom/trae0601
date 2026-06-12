import { useRef } from 'react';
import { Camera, X } from 'lucide-react';

interface PhotoUploadProps {
  value?: string;
  onChange: (dataUrl?: string) => void;
  label?: React.ReactNode;
  aspect?: string;
  placeholder?: string;
}

export function PhotoUpload({
  value,
  onChange,
  label,
  aspect = 'aspect-square',
  placeholder = '上传照片',
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <div
        onClick={() => inputRef.current?.click()}
        className={`group relative cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-emerald-400 hover:bg-emerald-50/40 ${aspect}`}
      >
        {value ? (
          <>
            <img
              src={value}
              alt="preview"
              className="h-full w-full object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(undefined);
              }}
              className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white opacity-0 transition hover:bg-black/70 group-hover:opacity-100"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-slate-400 transition group-hover:text-emerald-600">
            <Camera className="h-8 w-8" />
            <span className="text-sm font-medium">{placeholder}</span>
            <span className="text-xs">点击上传 · 支持 JPG / PNG</span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
