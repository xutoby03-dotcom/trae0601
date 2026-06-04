import { useTimelineStore } from '@/store/useTimelineStore';
import { MediaUploader } from './MediaUploader';
import { MediaItem } from './MediaItem';
import type { MediaItem as MediaItemType } from '@/types/media';

export function MediaLibraryPanel() {
  const { mediaItems, removeMediaItem } = useTimelineStore();

  const handleDragStart = (e: React.DragEvent, media: MediaItemType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'media',
      mediaId: media.id,
      mediaType: media.type,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-700">
      <div className="p-4 border-b border-zinc-700">
        <h2 className="text-lg font-semibold text-white mb-4">素材库</h2>
        <MediaUploader />
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {mediaItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {mediaItems.map((media) => (
              <MediaItem
                key={media.id}
                media={media}
                onDragStart={handleDragStart}
                onDelete={removeMediaItem}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-zinc-500 text-sm">暂无素材</p>
            <p className="text-zinc-600 text-xs mt-1">上传视频、图片或音频开始编辑</p>
          </div>
        )}
      </div>
    </div>
  );
}
