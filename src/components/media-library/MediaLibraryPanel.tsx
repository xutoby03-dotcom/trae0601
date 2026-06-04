import { useRef } from 'react';
import { FileText } from 'lucide-react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { MediaUploader } from './MediaUploader';
import { MediaItem } from './MediaItem';
import type { MediaItem as MediaItemType } from '@/types/media';

export function MediaLibraryPanel() {
  const srtInputRef = useRef<HTMLInputElement>(null);
  const { mediaItems, removeMediaItem, tracks, importSRT } = useTimelineStore();
  const { pushHistory } = useHistoryStore();

  const handleDragStart = (e: React.DragEvent, media: MediaItemType) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'media',
      mediaId: media.id,
      mediaType: media.type,
    }));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleSRTImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const subtitleTrack = tracks.find((t) => t.type === 'subtitle');
      if (subtitleTrack) {
        pushHistory({ tracks: [...tracks], clips: [...useTimelineStore.getState().clips] });
        importSRT(subtitleTrack.id, content);
      }
    } catch (error) {
      console.error('SRT import error:', error);
    }

    if (srtInputRef.current) {
      srtInputRef.current.value = '';
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900 border-r border-zinc-700">
      <div className="p-4 border-b border-zinc-700">
        <h2 className="text-lg font-semibold text-white mb-4">素材库</h2>
        <MediaUploader />
        <div className="mt-3">
          <input
            ref={srtInputRef}
            type="file"
            accept=".srt"
            onChange={handleSRTImport}
            className="hidden"
          />
          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-600 hover:bg-purple-500 rounded transition-colors"
            onClick={() => srtInputRef.current?.click()}
          >
            <FileText className="w-4 h-4" />
            导入 SRT 字幕
          </button>
        </div>
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
