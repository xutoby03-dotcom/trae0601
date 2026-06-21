import { useState, useRef, useCallback } from 'react';
import { Upload, PencilLine, Check } from 'lucide-react';
import { Photo, PhotoState, photoStateLabels } from '@/types';
import { cn } from '@/lib/utils';

interface PhotoUploaderProps {
  trialId: string;
  state: PhotoState;
  photo: Photo | undefined;
  onUpload: (photo: Photo) => void;
  onNoteChange: (photo: Photo) => void;
}

export default function PhotoUploader({ trialId, state, photo, onUpload, onNoteChange }: PhotoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState(photo?.note || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
        note: photo?.note || '',
      };
      onUpload(newPhoto);
      setNoteDraft(photo?.note || '');
    };
    reader.readAsDataURL(file);
  }, [trialId, state, onUpload, photo?.note]);

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

  const handleStartEditNote = () => {
    setNoteDraft(photo?.note || '');
    setIsEditingNote(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
  };

  const handleSaveNote = () => {
    if (photo) {
      onNoteChange({ ...photo, note: noteDraft });
    }
    setIsEditingNote(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSaveNote();
    }
    if (e.key === 'Escape') {
      setNoteDraft(photo?.note || '');
      setIsEditingNote(false);
    }
  };

  const hasNote = photo?.note && photo.note.trim().length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink-800">
            {photoStateLabels[state]}
          </span>
          {!hasNote && (
            <span className="px-2 py-0.5 text-xs bg-ochre-500/10 text-ochre-600 rounded-full font-hei">
              待记录
            </span>
          )}
        </div>
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
        {photo && photo.dataUrl ? (
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

      {/* 观察小记 */}
      <div className="space-y-1">
        {isEditingNote ? (
          <div className="space-y-2">
            <textarea
              ref={textareaRef}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="记录此状态下的颜色变化或纸面反应..."
              className={cn(
                'w-full px-3 py-2 text-sm rounded-lg resize-none',
                'bg-parchment-50 border border-ochre-400',
                'text-ink-800 placeholder-ink-700/40',
                'focus:outline-none focus:ring-2 focus:ring-ochre-500/30',
                'transition-all duration-200'
              )}
              rows={2}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setNoteDraft(photo?.note || '');
                  setIsEditingNote(false);
                }}
                className="px-3 py-1 text-xs text-ink-700 hover:bg-parchment-200 rounded transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-3 py-1 text-xs bg-ochre-500 text-white rounded hover:bg-ochre-600 transition-colors flex items-center gap-1"
              >
                <Check className="w-3 h-3" />
                保存
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleStartEditNote}
            className={cn(
              'w-full px-3 py-2 rounded-lg cursor-pointer transition-all duration-200',
              'border group',
              hasNote
                ? 'bg-parchment-200/50 border-parchment-300 hover:bg-parchment-200 hover:border-ochre-400'
                : 'bg-parchment-50 border-dashed border-parchment-300 hover:border-ochre-400 hover:bg-parchment-100'
            )}
          >
            <div className="flex items-start gap-2">
              <PencilLine className={cn(
                'w-3.5 h-3.5 mt-0.5 flex-shrink-0 transition-colors',
                hasNote ? 'text-ochre-500' : 'text-parchment-400 group-hover:text-ochre-500'
              )} />
              <div className="flex-1 min-w-0">
                {hasNote ? (
                  <p className="text-sm text-ink-800 leading-relaxed">{photo?.note}</p>
                ) : (
                  <p className="text-sm text-parchment-400 group-hover:text-ochre-500 transition-colors">
                    点击记录观察小记...
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
