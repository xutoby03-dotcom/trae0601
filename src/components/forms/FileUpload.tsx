import { FileImage, X, UploadCloud } from 'lucide-react';
import { useRef, useState, useCallback } from 'react';

interface FileUploadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
  onRemove?: () => void;
  label?: string;
  hint?: string;
}

export const FileUpload = ({ value, onChange, onRemove, label = '上传封面', hint = '支持 JPG/PNG，建议 300×400' }: FileUploadProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onChange(result);
      };
      reader.readAsDataURL(file);
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (value) {
    return (
      <div className="relative w-40 h-56 rounded-lg overflow-hidden shadow-book group border-2 border-wood-200">
        <img src={value} alt="封面预览" className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => {
            onRemove?.();
            if (inputRef.current) inputRef.current.value = '';
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-accent-brick transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 left-0 right-0 py-2 bg-black/70 text-white text-xs flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <UploadCloud className="w-3.5 h-3.5" /> 更换图片
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`w-40 h-56 rounded-lg border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all duration-200
        ${dragging
          ? 'border-accent-orange bg-accent-orange/8 scale-105'
          : 'border-wood-300 bg-paper-100 hover:border-wood-500 hover:bg-paper-200'
        }`}
    >
      <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${dragging ? 'bg-accent-orange/20' : 'bg-wood-100 group-hover:bg-wood-200'}`}>
        <FileImage className={`w-7 h-7 ${dragging ? 'text-accent-orange' : 'text-wood-500'}`} />
      </div>
      <div className="text-center px-3">
        <p className={`text-sm font-medium ${dragging ? 'text-accent-orange' : 'text-wood-700'}`}>{label}</p>
        <p className="text-[11px] text-wood-500 mt-1">{hint}</p>
        <p className="text-[10px] text-wood-400 mt-1">点击或拖拽上传</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </button>
  );
};

export default FileUpload;
