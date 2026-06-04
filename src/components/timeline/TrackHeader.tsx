import { Video, Music, Type, Volume2, VolumeX, Lock, Unlock } from 'lucide-react';
import type { Track } from '@/types/timeline';

interface TrackHeaderProps {
  track: Track;
  onToggleMute: () => void;
  onToggleLock: () => void;
}

export function TrackHeader({ track, onToggleMute, onToggleLock }: TrackHeaderProps) {
  const getIcon = () => {
    switch (track.type) {
      case 'video':
        return <Video className="w-4 h-4" />;
      case 'audio':
        return <Music className="w-4 h-4" />;
      case 'subtitle':
        return <Type className="w-4 h-4" />;
    }
  };

  const getTrackColor = () => {
    switch (track.type) {
      case 'video':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'audio':
        return 'border-green-500/30 bg-green-500/10';
      case 'subtitle':
        return 'border-purple-500/30 bg-purple-500/10';
    }
  };

  return (
    <div className={`flex items-center justify-between px-3 h-full border-l-4 ${getTrackColor()}`}>
      <div className="flex items-center gap-2">
        {getIcon()}
        <span className="text-sm font-medium text-zinc-300">{track.name}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <button
          className={`p-1.5 rounded transition-colors ${
            track.muted ? 'text-red-400 hover:bg-red-500/20' : 'text-zinc-400 hover:bg-zinc-700'
          }`}
          onClick={onToggleMute}
        >
          {track.muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        
        <button
          className={`p-1.5 rounded transition-colors ${
            track.locked ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-zinc-400 hover:bg-zinc-700'
          }`}
          onClick={onToggleLock}
        >
          {track.locked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
