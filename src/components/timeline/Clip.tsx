import { useRef, useState, useEffect } from 'react';
import type { Clip as ClipType, SubtitleClip } from '@/types/timeline';
import type { MediaItem } from '@/types/media';
import { formatTime } from '@/utils/timecode';

interface ClipProps {
  clip: ClipType | SubtitleClip;
  mediaItem?: MediaItem;
  zoom: number;
  scrollLeft: number;
  isSelected: boolean;
  trackHeight: number;
  onSelect: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  onTrimStart: (e: React.MouseEvent) => void;
  onTrimEnd: (e: React.MouseEvent) => void;
}

export function Clip({
  clip,
  mediaItem,
  zoom,
  scrollLeft,
  isSelected,
  trackHeight,
  onSelect,
  onDragStart,
  onTrimStart,
  onTrimEnd,
}: ClipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const clipRef = useRef<HTMLDivElement>(null);
  
  const pixelsPerSecond = zoom;
  const left = clip.start * pixelsPerSecond;
  const width = (clip.end - clip.start) * pixelsPerSecond;

  const isSubtitle = 'text' in clip;

  const getClipColor = () => {
    if (isSubtitle) {
      return 'bg-purple-600 border-purple-400';
    }
    if (mediaItem?.type === 'audio') {
      return 'bg-green-600 border-green-400';
    }
    return 'bg-blue-600 border-blue-400';
  };

  return (
    <div
      ref={clipRef}
      className={`absolute top-1 bottom-1 rounded border-2 cursor-move overflow-hidden transition-shadow ${
        getClipColor()
      } ${isSelected ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-zinc-900 shadow-lg' : ''} ${
        isHovered ? 'brightness-110' : ''
      }`}
      style={{
        left: `${left - scrollLeft}px`,
        width: `${width}px`,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect();
        onDragStart(e);
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isHovered && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 z-10"
            onMouseDown={(e) => {
              e.stopPropagation();
              onTrimStart(e);
            }}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 z-10"
            onMouseDown={(e) => {
              e.stopPropagation();
              onTrimEnd(e);
            }}
          />
        </>
      )}
      
      <div className="p-2 h-full flex flex-col justify-center">
        {isSubtitle ? (
          <p className="text-xs text-white truncate font-medium">
            {(clip as SubtitleClip).text}
          </p>
        ) : (
          <>
            {mediaItem?.thumbnail && (
              <div className="absolute inset-0 opacity-30">
                <img
                  src={mediaItem.thumbnail}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="relative z-10">
              <p className="text-xs text-white truncate font-medium">
                {mediaItem?.name || 'Clip'}
              </p>
              <p className="text-xs text-white/70">
                {formatTime(clip.end - clip.start)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
