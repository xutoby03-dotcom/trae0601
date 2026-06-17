import { useState } from 'react';
import { X, ZoomIn } from 'lucide-react';
import type { ArchivePhoto } from '../../types';

interface PhotoGalleryProps {
  photos: ArchivePhoto[];
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selected, setSelected] = useState<ArchivePhoto | null>(null);

  if (photos.length === 0) {
    return (
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-[4/3] rounded-lg bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xs">
            暂无照片
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelected(photo)}
            className="relative aspect-[4/3] rounded-lg overflow-hidden group cursor-pointer border border-gray-100"
          >
            <img
              src={photo.photoUrl}
              alt={photo.photoType}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/30 transition-colors flex items-center justify-center">
              <ZoomIn size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy-900/70 to-transparent p-2">
              <span className="text-white text-xs font-medium">{photo.photoType}</span>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2">
            <button
              onClick={(e) => { e.stopPropagation(); setSelected(null); }}
              className="absolute -top-10 right-0 p-2 text-white hover:text-gold-400"
            >
              <X size={24} />
            </button>
            <img
              src={selected.photoUrl}
              alt={selected.photoType}
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl"
            />
            <p className="text-center text-white/80 text-sm mt-3">{selected.photoType}照片</p>
          </div>
        </div>
      )}
    </>
  );
}
