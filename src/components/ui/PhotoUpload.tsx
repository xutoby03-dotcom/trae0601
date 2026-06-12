import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { fileToBase64 } from '@/utils/storage';

interface PhotoUploadProps {
  value: string;
  onChange: (base64: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export default function PhotoUpload({
  value,
  onChange,
  label = '上传照片',
  placeholder = '点击上传',
  className = '',
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleFile = async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      onChange(base64);
    } catch (e) {
      console.error('file upload error', e);
    }
  };

  return (
    <div className={className}>
      <div className="label">{label}</div>
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-dashed border-primary-200 bg-primary-50/30">
          <img
            src={value}
            alt="preview"
            className="w-full h-48 object-cover cursor-pointer"
            onClick={() => setPreviewOpen(true)}
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => inputRef.current?.click()}
              className="btn-secondary btn-sm"
              type="button"
            >
              <Upload className="w-4 h-4" />
              更换
            </button>
            <button
              onClick={() => onChange('')}
              className="btn-danger btn-sm"
              type="button"
            >
              <X className="w-4 h-4" />
              删除
            </button>
          </div>
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
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-48 rounded-2xl border-2 border-dashed border-slate-300 hover:border-primary-400 bg-slate-50 hover:bg-primary-50/30 flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-primary-500 transition-all group"
        >
          <ImageIcon className="w-10 h-10 group-hover:scale-110 transition-transform" />
          <span className="text-sm">{placeholder}</span>
          <span className="text-xs text-slate-400">支持 JPG / PNG</span>
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
        </button>
      )}

      {previewOpen && value && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm"
          onClick={() => setPreviewOpen(false)}
        >
          <img
            src={value}
            alt="preview"
            className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
