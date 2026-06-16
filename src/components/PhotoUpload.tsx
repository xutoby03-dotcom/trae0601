import { useRef, useState } from 'react';
import { Camera, Upload, X } from 'lucide-react';

interface PhotoUploadProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export const PhotoUpload = ({ value, onChange }: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
        }}
      />

      {value ? (
        <div className="relative rounded-2xl overflow-hidden group">
          <img
            src={value}
            alt="检查照片"
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
          <button
            onClick={handleClear}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-red-50"
          >
            <X size={20} />
          </button>
          <button
            onClick={handleCameraClick}
            className="absolute bottom-3 right-3 px-4 py-2 rounded-full bg-white/90 text-gray-700 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white"
          >
            <Camera size={16} />
            <span className="text-sm font-medium">重新拍摄</span>
          </button>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-300 cursor-pointer ${isDragging ? 'border-orange-400 bg-orange-50' : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'}`}
          onClick={handleCameraClick}
        >
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
            <Camera size={32} className="text-orange-500" />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium">点击拍照或上传照片</p>
            <p className="text-gray-500 text-sm mt-1">支持拖拽上传，或点击调用摄像头</p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
            >
              <Camera size={18} />
              拍照
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg flex items-center gap-2 hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              <Upload size={18} />
              上传
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
