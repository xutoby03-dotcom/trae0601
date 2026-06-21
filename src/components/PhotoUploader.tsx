import { useState, useRef, useCallback } from 'react';
import { Upload } from 'lucide-react';
import { Photo, PhotoState, photoStateLabels } from '@/types';

interface PhotoUploaderProps {
  trialId: string;
  state: PhotoState;
  photo: Photo | undefined;
  onUpload: (photo: Photo) => void;
}

export default function PhotoUploader({ trialId, state, photo, onUpload }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const newPhoto: Photo = {
        id: `${trialId}-${state}-${Date.now()}`,
        trialId,
        state,
        dataUrl,
        fileName: file.name,
        size: file.size,
      };
      onUpload(newPhoto);
    };
    reader.readAsDataURL(file);
  }, [trialId, state, onUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-ink-800">
        {photoStateLabels[state]}
      </div>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative aspect-square rounded-lg border-2 border-dashed 
          transition-all duration-300 ease-in-out cursor-pointer overflow-hidden
          ${isDragging 
            ? 'border-ochre-500 bg-ochre-500/10 scale-[1.02]' 
            : 'border-parchment-400 hover:border-ochre-500 hover:bg-parchment-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
        />
        {photo ? (
          <div className="relative w-full h-full group">
            <img
              src={photo.dataUrl}
              alt={photo.fileName}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 bg-white/90 px-4 py-2 rounded-lg flex items-center gap-2">
                <Upload className="w-4 h-4 text-ochre-600" />
                <span className="text-sm font-medium text-ink-800">重新上传</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <Upload className={`w-10 h-10 transition-colors duration-300 ${isDragging ? 'text-ochre-500' : 'text-parchment-400'}`} />
            <span className="text-sm text-parchment-400">
              点击或拖拽上传
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
