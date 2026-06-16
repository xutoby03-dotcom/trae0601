import { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { compressImage } from '@/utils/imageUtils';

interface PhotoUploadProps {
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export const PhotoUpload = ({ value, onChange, className }: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      onChange?.(compressed);
    } catch (error) {
      console.error('图片上传失败:', error);
    } finally {
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
  };

  return (
    <div className={cn('relative', className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div
          onClick={handleClick}
          className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer group"
        >
          <img
            src={value}
            alt="线材照片"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
              点击更换
            </span>
          </div>
          <button
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={handleClick}
          className="w-full aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50 hover:bg-blue-50 group"
        >
          {isUploading ? (
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Upload className="w-7 h-7 text-blue-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">点击上传照片</p>
                <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式</p>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
