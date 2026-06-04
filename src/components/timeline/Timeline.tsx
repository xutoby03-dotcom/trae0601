import { useRef, useState, useEffect, useCallback, Fragment } from 'react';
import { ZoomIn, ZoomOut, Plus } from 'lucide-react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { Ruler } from './Ruler';
import { TrackHeader } from './TrackHeader';
import { Clip } from './Clip';
import { ClipContextMenu } from './ClipContextMenu';
import { generateId } from '@/utils/timecode';
import type { MediaType } from '@/types/media';

const TRACK_HEIGHT = 60;
const TRACK_HEADER_WIDTH = 180;

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingClip, setDraggingClip] = useState<string | null>(null);
  const [isAltDragging, setIsAltDragging] = useState(false);
  const [altDuplicateCreated, setAltDuplicateCreated] = useState(false);
  const [trimmingClip, setTrimmingClip] = useState<string | null>(null);
  const [trimMode, setTrimMode] = useState<'start' | 'end' | null>(null);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [dragStartTrack, setDragStartTrack] = useState<string | null>(null);
  const [originalClipId, setOriginalClipId] = useState<string | null>(null);
  const [contextMenuClipId, setContextMenuClipId] = useState<string | null>(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  
  const {
    tracks,
    clips,
    mediaItems,
    selectedClipId,
    zoom,
    scrollLeft,
    setZoom,
    setScrollLeft,
    selectClip,
    moveClip,
    trimClip,
    createClipFromMedia,
    createDefaultTracks,
    setTracks,
    setClips,
    removeClip,
  } = useTimelineStore();
  
  const { currentTime, duration, setCurrentTime } = usePlaybackStore();
  const { pushHistory } = useHistoryStore();
  
  const pixelsPerSecond = zoom;

  useEffect(() => {
    if (tracks.length === 0) {
      createDefaultTracks('temp');
    }
  }, [tracks.length, createDefaultTracks]);

  const handleClipContextMenu = (clipId: string, e: React.MouseEvent) => {
    setContextMenuClipId(clipId);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
  };

  const handleCloseContextMenu = () => {
    setContextMenuClipId(null);
  };

  const isEditableElement = (target: EventTarget | null): boolean => {
    if (!target || !(target instanceof HTMLElement)) return false;
    const tagName = target.tagName.toLowerCase();
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable ||
      target.closest('[contenteditable="true"]') !== null
    );
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltDragging(true);
        if (draggingClip && !altDuplicateCreated) {
          const originalClip = clips.find((c) => c.id === draggingClip);
          if (originalClip) {
            pushHistory({ tracks: [...tracks], clips: [...clips] });
            const newClip = {
              ...originalClip,
              id: generateId(),
            };
            setClips([...clips, newClip]);
            setOriginalClipId(draggingClip);
            setDraggingClip(newClip.id);
            setAltDuplicateCreated(true);
          }
        }
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedClipId) {
        if (isEditableElement(e.target)) return;
        
        e.preventDefault();
        pushHistory({ tracks: [...tracks], clips: [...clips] });
        removeClip(selectedClipId);
        selectClip(null);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') {
        setIsAltDragging(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [draggingClip, altDuplicateCreated, clips, tracks, pushHistory, setClips, selectedClipId, removeClip, selectClip]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? -10 : 10;
      setZoom(Math.max(10, Math.min(200, zoom + delta)));
    } else {
      setScrollLeft(Math.max(0, scrollLeft + e.deltaY));
    }
  }, [zoom, scrollLeft, setZoom, setScrollLeft]);

  const handleTrackDrop = (e: React.DragEvent, trackId: string, trackType: string) => {
    e.preventDefault();
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.type === 'media') {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollLeft;
        const startTime = x / pixelsPerSecond;
        
        const mediaItem = mediaItems.find((m) => m.id === data.mediaId);
        if (!mediaItem) return;
        
        const compatible = 
          (trackType === 'video' && mediaItem.type === 'video') ||
          (trackType === 'video' && mediaItem.type === 'image') ||
          (trackType === 'audio' && mediaItem.type === 'audio') ||
          (trackType === 'subtitle' && mediaItem.type === 'video');
        
        if (compatible || trackType === 'video') {
          pushHistory({ tracks: [...tracks], clips: [...clips] });
          createClipFromMedia(data.mediaId, trackId, startTime);
        }
      }
    } catch (error) {
      console.error('Drop error:', error);
    }
  };

  const handleClipDragStart = (clipId: string, e: React.MouseEvent) => {
    if (e.altKey) {
      setIsAltDragging(true);
      const originalClip = clips.find((c) => c.id === clipId);
      if (originalClip) {
        pushHistory({ tracks: [...tracks], clips: [...clips] });
        const newClip = {
          ...originalClip,
          id: generateId(),
        };
        setClips([...clips, newClip]);
        setOriginalClipId(clipId);
        setDraggingClip(newClip.id);
        setAltDuplicateCreated(true);
        setDragStartX(e.clientX);
        setDragStartTime(newClip.start);
        setDragStartTrack(newClip.trackId);
        return;
      }
    }
    
    setIsAltDragging(false);
    setAltDuplicateCreated(false);
    setOriginalClipId(null);
    setDraggingClip(clipId);
    setDragStartX(e.clientX);
    const clip = clips.find((c) => c.id === clipId);
    if (clip) {
      setDragStartTime(clip.start);
      setDragStartTrack(clip.trackId);
    }
  };

  const handleTrimStart = (clipId: string, e: React.MouseEvent) => {
    setTrimmingClip(clipId);
    setTrimMode('start');
    setDragStartX(e.clientX);
    const clip = clips.find((c) => c.id === clipId);
    if (clip) {
      setDragStartTime(clip.start);
    }
  };

  const handleTrimEnd = (clipId: string, e: React.MouseEvent) => {
    setTrimmingClip(clipId);
    setTrimMode('end');
    setDragStartX(e.clientX);
    const clip = clips.find((c) => c.id === clipId);
    if (clip) {
      setDragStartTime(clip.end);
    }
  };

  useEffect(() => {
    if (!draggingClip && !trimmingClip) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX;
      const deltaTime = deltaX / pixelsPerSecond;

      if (draggingClip) {
        moveClip(draggingClip, dragStartTime + deltaTime);
      } else if (trimmingClip && trimMode) {
        const clip = clips.find((c) => c.id === trimmingClip);
        if (!clip) return;
        
        if (trimMode === 'start') {
          const delta = deltaTime;
          trimClip(trimmingClip, delta, 0);
        } else if (trimMode === 'end') {
          trimClip(trimmingClip, 0, deltaTime);
        }
      }
    };

    const handleMouseUp = () => {
      if (draggingClip || trimmingClip) {
        pushHistory({ tracks: [...tracks], clips: [...clips] });
      }
      setDraggingClip(null);
      setTrimmingClip(null);
      setTrimMode(null);
      setIsAltDragging(false);
      setAltDuplicateCreated(false);
      setOriginalClipId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingClip, trimmingClip, trimMode, dragStartX, dragStartTime, pixelsPerSecond, moveClip, trimClip, pushHistory, tracks, clips]);

  const handleAddSubtitle = () => {
    const subtitleTrack = tracks.find((t) => t.type === 'subtitle');
    if (subtitleTrack) {
      pushHistory({ tracks: [...tracks], clips: [...clips] });
      useTimelineStore.getState().addSubtitleClip(
        subtitleTrack.id,
        currentTime,
        currentTime + 3,
        '新字幕'
      );
    }
  };

  return (
    <Fragment>
      <div className="flex flex-col h-full bg-zinc-900 border-t border-zinc-700">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-700 bg-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-300">时间轴</span>
          <button
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            onClick={() => setZoom(Math.max(10, zoom - 10))}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-zinc-500 w-12 text-center">{zoom}%</span>
          <button
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors"
            onClick={() => setZoom(Math.min(200, zoom + 10))}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded transition-colors"
            onClick={handleAddSubtitle}
          >
            <Plus className="w-4 h-4" />
            添加字幕
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[180px] flex-shrink-0 border-r border-zinc-700 bg-zinc-800">
          <div className="h-8 border-b border-zinc-700" />
          {tracks.map((track) => (
            <div key={track.id} style={{ height: TRACK_HEIGHT }}>
              <TrackHeader
                track={track}
                onToggleMute={() => {
                  setTracks(tracks.map((t) =>
                    t.id === track.id ? { ...t, muted: !t.muted } : t
                  ));
                }}
                onToggleLock={() => {
                  setTracks(tracks.map((t) =>
                    t.id === track.id ? { ...t, locked: !t.locked } : t
                  ));
                }}
              />
            </div>
          ))}
        </div>
        
        <div
          ref={containerRef}
          className="flex-1 overflow-hidden relative"
          onWheel={handleWheel}
        >
          <Ruler
            duration={duration}
            zoom={zoom}
            scrollLeft={scrollLeft}
            currentTime={currentTime}
            onSeek={setCurrentTime}
          />
          
          <div
            className="overflow-y-auto"
            style={{ height: `calc(100% - 32px)` }}
          >
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`relative border-b border-zinc-700/50 ${
                  track.type === 'video' ? 'bg-blue-950/20' :
                  track.type === 'audio' ? 'bg-green-950/20' :
                  'bg-purple-950/20'
                }`}
                style={{ height: TRACK_HEIGHT }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleTrackDrop(e, track.id, track.type)}
                onClick={() => selectClip(null)}
              >
                {clips
                  .filter((c) => c.trackId === track.id)
                  .map((clip) => (
                    <Clip
                      key={clip.id}
                      clip={clip}
                      mediaItem={mediaItems.find((m) => m.id === (clip as any).mediaItemId)}
                      zoom={zoom}
                      scrollLeft={scrollLeft}
                      isSelected={selectedClipId === clip.id}
                      trackHeight={TRACK_HEIGHT}
                      onSelect={() => selectClip(clip.id)}
                      onDragStart={(e) => handleClipDragStart(clip.id, e)}
                      onTrimStart={(e) => handleTrimStart(clip.id, e)}
                      onTrimEnd={(e) => handleTrimEnd(clip.id, e)}
                      onContextMenu={(e) => handleClipContextMenu(clip.id, e)}
                    />
                  ))}
              </div>
            ))}
          </div>
          
          <div
            className="absolute top-8 bottom-0 w-0.5 bg-cyan-500 pointer-events-none z-20"
            style={{ left: currentTime * pixelsPerSecond - scrollLeft }}
          />
        </div>
      </div>
    </div>

      {contextMenuClipId && (
        <ClipContextMenu
          clipId={contextMenuClipId}
          position={contextMenuPosition}
          onClose={handleCloseContextMenu}
        />
      )}
    </Fragment>
  );
}
