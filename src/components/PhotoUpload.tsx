import React, { useRef, useState } from 'react';
import { Upload, X, Camera } from 'lucide-react';
import { Button } from './ui/Button';
import { api } from '@/api/client';

interface PhotoUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onChange,
  label = '上传照片',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const photoUrl = await api.upload.photo(file);
      onChange(photoUrl);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      {value ? (
        <div className="relative group">
          <img
            src={value.startsWith('http') ? value : value}
            alt="预览"
            className="w-full h-48 object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent('office supplies printer paper')}&image_size=square`;
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50/50 transition-all duration-200"
        >
          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-600 mb-1">点击上传照片</p>
          <p className="text-xs text-gray-400">支持 JPG、PNG、GIF 格式</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {uploading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mr-2" />
          <span className="text-sm text-gray-500">上传中...</span>
        </div>
      )}
    </div>
  );
};
