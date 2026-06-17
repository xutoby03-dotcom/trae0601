import React, { useRef, useState } from 'react';
import { Upload, X, Camera, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '@/utils/imageUtils';

interface PhotoUploaderProps {
  label: string;
  value: string;
  onChange: (base64: string) => void;
  placeholderIcon?: React.ReactNode;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  label,
  value,
  onChange,
  placeholderIcon,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setIsUploading(true);
    try {
      const compressed = await compressImage(file, 600, 0.7);
      onChange(compressed);
    } catch (error) {
      console.error('图片处理失败:', error);
      alert('图片处理失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
      </label>
      <div
        onClick={handleClick}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-4 cursor-pointer
          transition-all duration-200 overflow-hidden
          ${isDragging
            ? 'border-[#4A90D9] bg-[#4A90D9]/5'
            : 'border-gray-300 hover:border-[#4A90D9] hover:bg-gray-50'
          }
          ${value ? 'p-2' : 'min-h-[180px] flex flex-col items-center justify-center'}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <div className="animate-spin w-8 h-8 border-4 border-[#4A90D9] border-t-transparent rounded-full" />
          </div>
        )}

        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt={label}
              className="w-full h-48 object-cover rounded-lg"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-3 text-gray-400">
              {placeholderIcon || <Camera className="w-12 h-12 mx-auto" />}
            </div>
            <p className="text-gray-600 font-medium mb-1">点击或拖拽上传照片</p>
            <p className="text-gray-400 text-sm flex items-center justify-center gap-1">
              <Upload className="w-4 h-4" />
              支持 JPG、PNG 格式
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
