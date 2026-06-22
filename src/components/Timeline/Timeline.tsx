import { useTacticsStore } from '@/store/useTacticsStore';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Gauge,
} from 'lucide-react';

const speeds = [0.5, 1, 1.5, 2];

export default function Timeline() {
  const {
    isPlaying,
    currentTime,
    playbackSpeed,
    play,
    setPlaying,
    setCurrentTime,
    setPlaybackSpeed,
  } = useTacticsStore();

  const progress = (currentTime / play.duration) * 100;

  const handlePlayPause = () => {
    if (currentTime >= play.duration) {
      setCurrentTime(0);
    }
    setPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentTime(0);
    setPlaying(false);
  };

  const handleEnd = () => {
    setCurrentTime(play.duration);
    setPlaying(false);
  };

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    setCurrentTime(ratio * play.duration);
  };

  const timeMarkers = [];
  for (let t = 0; t <= play.duration; t += 1) {
    timeMarkers.push(t);
  }

  const offenseRoutes = play.routes.filter((r) => {
    const player = play.players.find((p) => p.id === r.playerId);
    return player?.type === 'offense';
  });

  return (
    <div className="h-28 bg-[#121a16] border-t border-[#1e2d24] flex flex-col">
      <div className="flex items-center px-4 py-2 gap-4 border-b border-[#1e2d24]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="回到开始"
          >
            <SkipBack size={18} />
          </button>

          <button
            onClick={handlePlayPause}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #ff6b35, #ff8c42)'
                : 'linear-gradient(135deg, #38b000, #70e000)',
              boxShadow: isPlaying
                ? '0 0 15px rgba(255, 107, 53, 0.5)'
                : '0 0 15px rgba(56, 176, 0, 0.5)',
            }}
          >
            {isPlaying ? (
              <Pause size={18} className="text-white" />
            ) : (
              <Play size={18} className="text-white ml-0.5" />
            )}
          </button>

          <button
            onClick={handleEnd}
            className="p-2 rounded hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            title="跳到末尾"
          >
            <SkipForward size={18} />
          </button>
        </div>

        <div
          className="text-2xl font-bold text-white"
          style={{ fontFamily: "'Roboto Mono', monospace" }}
        >
          {currentTime.toFixed(2)}
          <span className="text-sm text-white/40"> / {play.duration.toFixed(1)}s</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Gauge size={16} className="text-white/50" />
          <div className="flex gap-1">
            {speeds.map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className="px-2 py-1 text-xs rounded transition-colors"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  background:
                    playbackSpeed === speed
                      ? 'rgba(56, 176, 0, 0.2)'
                      : 'transparent',
                  color:
                    playbackSpeed === speed ? '#38b000' : 'rgba(255,255,255,0.5)',
                  border:
                    playbackSpeed === speed
                      ? '1px solid #38b000'
                      : '1px solid transparent',
                }}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col justify-center">
        <div className="relative h-6 flex items-center">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#1e2d24] rounded-full" />

          {play.fakeNodes.map((node) => (
            <div
              key={node.id}
              className="absolute bottom-0 w-1 h-4 -translate-x-1/2"
              style={{
                left: `${(node.time / play.duration) * 100}%`,
                background: '#d00000',
              }}
              title={`假动作 - ${node.time.toFixed(1)}s`}
            />
          ))}

          {play.transferWindows.map((window) => (
            <div
              key={window.id}
              className="absolute bottom-0 h-1"
              style={{
                left: `${(window.startTime / play.duration) * 100}%`,
                width: `${((window.endTime - window.startTime) / play.duration) * 100}%`,
                background:
                  window.quality === 'excellent'
                    ? '#ffd60a'
                    : window.quality === 'great'
                    ? '#9ef01a'
                    : '#38b000',
                opacity: 0.7,
              }}
              title={`传盘窗口 - ${(window.endTime - window.startTime).toFixed(1)}s`}
            />
          ))}

          <div
            className="absolute bottom-0 left-0 h-1 rounded-full transition-all duration-75"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #38b000, #9ef01a)',
            }}
          />

          <div
            className="absolute bottom-0 w-3 h-3 -translate-x-1/2 rounded-full cursor-pointer hover:scale-125 transition-transform"
            style={{
              left: `${progress}%`,
              background: '#9ef01a',
              boxShadow: '0 0 10px rgba(158, 240, 26, 0.8)',
              transform: 'translateX(-50%) translateY(50%)',
            }}
          />

          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handleTimelineClick}
          />
        </div>

        <div className="flex justify-between mt-1">
          {timeMarkers.map((t) => (
            <span
              key={t}
              className="text-xs"
              style={{
                color: 'rgba(255,255,255,0.3)',
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              {t}s
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
