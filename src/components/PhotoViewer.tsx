import { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

interface PhotoViewerProps {
  isOpen: boolean;
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  guestName?: string;
  sessionName?: string;
}

export default function PhotoViewer({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  guestName,
  sessionName,
}: PhotoViewerProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    },
    [isOpen, onClose, onPrev, onNext]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || photos.length === 0) return null;

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 flex flex-col w-full h-full max-w-5xl max-h-[90vh] m-4">
        <div className="flex items-center justify-between px-4 py-3 text-white">
          <div className="flex items-center gap-3">
            <ImageIcon size={20} className="text-primary-400" />
            <div>
              {guestName && (
                <span className="font-medium">{guestName}</span>
              )}
              {sessionName && (
                <span className="text-white/60 text-sm ml-2">{sessionName}</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/80 text-sm">
              {currentIndex + 1} / {photos.length}
            </span>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative min-h-0">
          <button
            onClick={onPrev}
            disabled={!hasPrev}
            className={`absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all z-10 ${
              hasPrev
                ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            <img
              src={photos[currentIndex]}
              alt={`照片 ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>

          <button
            onClick={onNext}
            disabled={!hasNext}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all z-10 ${
              hasNext
                ? 'bg-white/10 hover:bg-white/20 text-white cursor-pointer'
                : 'bg-white/5 text-white/30 cursor-not-allowed'
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {photos.length > 1 && (
          <div className="flex items-center justify-center gap-2 py-4">
            {photos.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  if (index < currentIndex) onPrev();
                  if (index > currentIndex) onNext();
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary-500 w-6'
                    : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
