import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Flag } from 'lucide-react';
import { useAudioStore } from '@/store/audioStore';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { formatTime } from '@/utils/audioAnalyzer';

const PlayerControls = () => {
  const {
    audioBuffer,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    setCurrentTime,
    addMarker,
  } = useAudioStore();
  const { playBuffer, pause, seekTo, updateVolume } = useAudioEngine();

  const handlePlayPause = () => {
    if (!audioBuffer) return;
    
    if (isPlaying) {
      pause();
    } else {
      playBuffer(audioBuffer, currentTime);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    updateVolume(newVolume);
  };

  const handleSkipBack = () => {
    if (!audioBuffer) return;
    const newTime = Math.max(0, currentTime - 10);
    seekTo(newTime);
  };

  const handleSkipForward = () => {
    if (!audioBuffer) return;
    const newTime = Math.min(duration, currentTime + 10);
    seekTo(newTime);
  };

  const handleAddMarker = () => {
    const colors = ['#00d4ff', '#a855f7', '#f472b6', '#22c55e', '#f59e0b', '#ef4444'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    addMarker({
      time: currentTime,
      label: `标记 ${useAudioStore.getState().markers.length + 1}`,
      color: randomColor,
    });
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="p-4 bg-white/5 backdrop-blur-xl border-t border-white/10">
      <div className="max-w-4xl mx-auto">
        <div 
          className="relative h-2 bg-white/10 rounded-full cursor-pointer mb-4 group"
          onClick={handleSeek}
        >
          <div 
            className="absolute h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
          <div 
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg shadow-cyan-500/50 opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ left: `calc(${progress}% - 8px)` }}
          />
          
          {useAudioStore.getState().markers.map((marker) => (
            <div
              key={marker.id}
              className="absolute top-1/2 -translate-y-1/2 w-2 h-6 rounded-sm cursor-pointer z-10"
              style={{ 
                left: `calc(${(marker.time / duration) * 100}% - 4px)`,
                backgroundColor: marker.color,
              }}
              title={marker.label}
            />
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 w-24">
            <span className="text-xs font-mono text-gray-400">{formatTime(currentTime)}</span>
            <span className="text-xs text-gray-600">/</span>
            <span className="text-xs font-mono text-gray-500">{formatTime(duration)}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSkipBack}
              disabled={!audioBuffer}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={!audioBuffer}
              className="p-4 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-full text-white 
                         shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105 
                         transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed
                         disabled:hover:scale-100"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>

            <button
              onClick={handleSkipForward}
              disabled={!audioBuffer}
              className="p-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={handleAddMarker}
              disabled={!audioBuffer}
              className="p-2 text-gray-400 hover:text-amber-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed ml-2"
              title="添加标记"
            >
              <Flag className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 w-24 justify-end">
            <button
              onClick={() => {
                const newVol = volume > 0 ? 0 : 0.8;
                setVolume(newVol);
                updateVolume(newVol);
              }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                         [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                         [&::-webkit-slider-thumb]:bg-cyan-400 [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:shadow-cyan-400/50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
