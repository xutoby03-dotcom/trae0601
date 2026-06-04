import { useEffect, useRef } from 'react';
import { Trash2, Copy, FlipHorizontal, MoveRight } from 'lucide-react';
import { useTimelineStore } from '@/store/useTimelineStore';
import { usePlaybackStore } from '@/store/usePlaybackStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { generateId, snapToFrame } from '@/utils/timecode';
import type { Clip, SubtitleClip } from '@/types/timeline';

interface ClipContextMenuProps {
  clipId: string;
  position: { x: number; y: number };
  onClose: () => void;
}

export function ClipContextMenu({ clipId, position, onClose }: ClipContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const { tracks, clips, removeClip, updateClip, moveClip, selectClip } = useTimelineStore();
  const { currentTime } = usePlaybackStore();
  const { pushHistory } = useHistoryStore();

  const clip = clips.find((c) => c.id === clipId) as Clip | SubtitleClip;
  if (!clip) return null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleDelete = () => {
    pushHistory({ tracks: [...tracks], clips: [...clips] });
    removeClip(clipId);
    onClose();
  };

  const handleCopyToNextSlot = () => {
    pushHistory({ tracks: [...tracks], clips: [...clips] });
    
    const duration = clip.end - clip.start;
    const trackClips = clips
      .filter((c) => c.trackId === clip.trackId)
      .sort((a, b) => a.end - b.end);
    
    const lastClipEnd = trackClips.length > 0 ? Math.max(...trackClips.map((c) => c.end)) : 0;
    const newStart = snapToFrame(Math.max(lastClipEnd + 0.5, currentTime + 0.5));
    
    const newClip: Clip | SubtitleClip = {
      ...clip,
      id: generateId(),
      start: newStart,
      end: snapToFrame(newStart + duration),
    };
    
    useTimelineStore.getState().addClip(newClip);
    selectClip(newClip.id);
    onClose();
  };

  const handleToggleReverse = () => {
    pushHistory({ tracks: [...tracks], clips: [...clips] });
    updateClip(clipId, { reverse: !clip.reverse });
    onClose();
  };

  const handleAlignToPlayhead = () => {
    pushHistory({ tracks: [...tracks], clips: [...clips] });
    moveClip(clipId, snapToFrame(currentTime));
    onClose();
  };

  const menuItems = [
    {
      icon: Trash2,
      label: '删除片段',
      onClick: handleDelete,
      danger: true,
    },
    {
      icon: Copy,
      label: '复制到下一空位',
      onClick: handleCopyToNextSlot,
    },
    {
      icon: FlipHorizontal,
      label: clip.reverse ? '取消反向播放' : '反向播放',
      onClick: handleToggleReverse,
    },
    {
      icon: MoveRight,
      label: '起点对齐到播放头',
      onClick: handleAlignToPlayhead,
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl py-1 overflow-hidden"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {menuItems.map((item, index) => (
        <button
          key={index}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left transition-colors ${
            item.danger
              ? 'text-red-400 hover:bg-red-900/30'
              : 'text-zinc-200 hover:bg-zinc-700'
          }`}
          onClick={item.onClick}
        >
          <item.icon className="w-4 h-4" />
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}
