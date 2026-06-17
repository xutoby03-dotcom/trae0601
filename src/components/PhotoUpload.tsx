import { useRef, useState } from 'react';
import { Camera, X, Image } from 'lucide-react';

interface PhotoUploadProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  label?: string;
}

const PhotoUpload = ({ value, onChange, label }: PhotoUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onChange(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {label && <p className="form-label">{label}</p>}
      <div className="relative">
        {preview ? (
          <div className="relative w-full h-48 rounded-xl overflow-hidden border-2 border-brown-200">
            <img
              src={preview}
              alt="预览"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            className="w-full h-48 rounded-xl border-2 border-dashed border-brown-300 flex flex-col items-center justify-center gap-2 text-brown-400 hover:border-primary-400 hover:text-primary-500 transition-colors bg-brown-50/50"
          >
            <div className="w-16 h-16 rounded-full bg-brown-100 flex items-center justify-center">
              <Camera className="w-8 h-8" />
            </div>
            <span className="text-sm font-medium">点击上传照片</span>
            <span className="text-xs">支持 JPG、PNG 格式</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default PhotoUpload;
