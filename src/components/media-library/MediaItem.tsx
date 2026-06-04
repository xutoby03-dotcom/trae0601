import { Video, Image, Music, Trash2 } from 'lucide-react';
import type { MediaItem as MediaItemType } from '@/types/media';
import { formatTime } from '@/utils/timecode';
import { formatFileSize } from '@/utils/fileUtils';

interface MediaItemProps {
  media: MediaItemType;
  onDragStart: (e: React.DragEvent, media: MediaItemType) => void;
  onDelete: (id: string) => void;
}

export function MediaItem({ media, onDragStart, onDelete }: MediaItemProps) {
  const getIcon = () => {
    switch (media.type) {
      case 'video':
        return <Video className="w-6 h-6" />;
      case 'image':
        return <Image className="w-6 h-6" />;
      case 'audio':
        return <Music className="w-6 h-6" />;
    }
  };

  return (
    <div
      className="group relative bg-zinc-800 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-cyan-500 transition-all"
      draggable
      onDragStart={(e) => onDragStart(e, media)}
    >
      <div className="aspect-video bg-zinc-900 flex items-center justify-center relative">
        {media.thumbnail ? (
          <img
            src={media.thumbnail}
            alt={media.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-zinc-600">{getIcon()}</div>
        )}
        {media.duration > 0 && (
          <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 rounded text-xs">
            {formatTime(media.duration)}
          </div>
        )}
      </div>
      
      <div className="p-2">
        <p className="text-sm text-white truncate font-medium">{media.name}</p>
        <p className="text-xs text-zinc-400">{formatFileSize(media.size)}</p>
      </div>
      
      <button
        className="absolute top-1 right-1 p-1.5 bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded hover:bg-red-500"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onDelete(media.id);
        }}
      >
        <Trash2 className="w-3 h-3 text-white" />
      </button>
    </div>
  );
}
