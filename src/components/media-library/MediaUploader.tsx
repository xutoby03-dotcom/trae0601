import { useRef } from 'react';
import { Upload } from 'lucide-react';
import { useMediaUpload } from '@/hooks/useMediaUpload';

export function MediaUploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { handleFiles } = useMediaUpload();

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div
      className="border-2 border-dashed border-zinc-600 rounded-lg p-4 text-center cursor-pointer hover:border-cyan-500 hover:bg-zinc-800/50 transition-all"
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="video/*,audio/*,image/*,.mp4,.webm,.mov,.srt"
        className="hidden"
        onChange={handleChange}
      />
      <Upload className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
      <p className="text-sm text-zinc-400">点击或拖拽上传</p>
      <p className="text-xs text-zinc-500 mt-1">MP4, WebM, MOV, 图片, 音频</p>
    </div>
  );
}
