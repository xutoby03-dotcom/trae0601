import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Shuffle, Repeat, Music, Heart } from 'lucide-react';

interface Track {
  id: number;
  title: string;
  artist: string;
  duration: number;
  cover: string;
}

const mockTracks: Track[] = [
  { id: 1, title: '夏日回忆', artist: '未知艺术家', duration: 234, cover: 'https://picsum.photos/seed/music1/200/200' },
  { id: 2, title: '星空漫步', artist: '未知艺术家', duration: 198, cover: 'https://picsum.photos/seed/music2/200/200' },
  { id: 3, title: '晨间咖啡', artist: '未知艺术家', duration: 267, cover: 'https://picsum.photos/seed/music3/200/200' },
  { id: 4, title: '雨后彩虹', artist: '未知艺术家', duration: 212, cover: 'https://picsum.photos/seed/music4/200/200' },
  { id: 5, title: '城市夜景', artist: '未知艺术家', duration: 245, cover: 'https://picsum.photos/seed/music5/200/200' },
  { id: 6, title: '海浪声声', artist: '未知艺术家', duration: 312, cover: 'https://picsum.photos/seed/music6/200/200' },
];

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const MusicPlayer: React.FC = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isMuted, setIsMuted] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [likedTracks, setLikedTracks] = useState<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  const currentTrack = mockTracks[currentTrackIndex];

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= currentTrack.duration) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    if (currentTime > 3) {
      setCurrentTime(0);
    } else {
      const newIndex = currentTrackIndex === 0 ? mockTracks.length - 1 : currentTrackIndex - 1;
      setCurrentTrackIndex(newIndex);
      setCurrentTime(0);
    }
  };

  const handleNext = () => {
    if (isShuffle) {
      let newIndex = Math.floor(Math.random() * mockTracks.length);
      while (newIndex === currentTrackIndex && mockTracks.length > 1) {
        newIndex = Math.floor(Math.random() * mockTracks.length);
      }
      setCurrentTrackIndex(newIndex);
    } else {
      const newIndex = (currentTrackIndex + 1) % mockTracks.length;
      setCurrentTrackIndex(newIndex);
    }
    setCurrentTime(0);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentTime(parseInt(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (newVolume > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLike = (trackId: number) => {
    setLikedTracks(prev => 
      prev.includes(trackId) 
        ? prev.filter(id => id !== trackId)
        : [...prev, trackId]
    );
  };

  const selectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setCurrentTime(0);
    setIsPlaying(true);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--color-window-background)' }}>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div 
          className={`w-48 h-48 rounded-lg shadow-xl mb-6 overflow-hidden transition-transform ${
            isPlaying ? 'animate-pulse' : ''
          }`}
        >
          <img 
            src={currentTrack.cover} 
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>

        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--color-text-primary)' }}>
          {currentTrack.title}
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
          {currentTrack.artist}
        </p>

        <div className="w-full max-w-xs mb-4">
          <input
            type="range"
            min="0"
            max={currentTrack.duration}
            value={currentTime}
            onChange={handleProgressChange}
            className="w-full h-1 rounded appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) ${(currentTime / currentTrack.duration) * 100}%, var(--color-input-border) ${(currentTime / currentTrack.duration) * 100}%)`,
            }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(currentTrack.duration)}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <button
            className={`p-2 rounded-full transition-colors ${
              isShuffle ? 'text-blue-500' : ''
            }`}
            onClick={() => setIsShuffle(!isShuffle)}
            style={{ color: isShuffle ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            <Shuffle size={18} />
          </button>
          <button
            className="p-2 rounded-full transition-colors hover:bg-white/10"
            onClick={handlePrevious}
          >
            <SkipBack size={24} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            className="p-4 rounded-full transition-transform active:scale-95"
            style={{ background: 'var(--color-accent)' }}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause size={28} className="text-white" />
            ) : (
              <Play size={28} className="text-white ml-1" />
            )}
          </button>
          <button
            className="p-2 rounded-full transition-colors hover:bg-white/10"
            onClick={handleNext}
          >
            <SkipForward size={24} style={{ color: 'var(--color-text-primary)' }} />
          </button>
          <button
            className={`p-2 rounded-full transition-colors ${
              isRepeat ? 'text-blue-500' : ''
            }`}
            onClick={() => setIsRepeat(!isRepeat)}
            style={{ color: isRepeat ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}
          >
            <Repeat size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={toggleMute}>
            {isMuted || volume === 0 ? (
              <VolumeX size={18} style={{ color: 'var(--color-text-secondary)' }} />
            ) : (
              <Volume2 size={18} style={{ color: 'var(--color-text-secondary)' }} />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-24 h-1 rounded appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, var(--color-accent) ${isMuted ? 0 : volume}%, var(--color-input-border) ${isMuted ? 0 : volume}%)`,
            }}
          />
        </div>
      </div>

      <div 
        className="border-t"
        style={{ borderColor: 'var(--color-taskbar-border)' }}
      >
        <div className="p-2">
          <h3 className="text-sm font-medium px-2 py-1" style={{ color: 'var(--color-text-secondary)' }}>
            播放列表
          </h3>
          <div className="max-h-40 overflow-y-auto">
            {mockTracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                  currentTrackIndex === index ? 'bg-blue-500/20' : 'hover:bg-white/10'
                }`}
                onClick={() => selectTrack(index)}
              >
                <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                  <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                  {currentTrackIndex === index && isPlaying && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Music size={14} className="text-white animate-pulse" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p 
                    className="text-sm font-medium truncate"
                    style={{ color: currentTrackIndex === index ? 'var(--color-accent)' : 'var(--color-text-primary)' }}
                  >
                    {track.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>
                    {track.artist}
                  </p>
                </div>
                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  {formatTime(track.duration)}
                </span>
                <button
                  className="p-1 rounded hover:bg-white/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track.id);
                  }}
                >
                  <Heart 
                    size={16} 
                    className={likedTracks.includes(track.id) ? 'fill-red-500 text-red-500' : ''}
                    style={{ color: likedTracks.includes(track.id) ? undefined : 'var(--color-text-secondary)' }}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
