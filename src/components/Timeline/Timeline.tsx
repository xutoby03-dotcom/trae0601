import { useState } from 'react';
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
    setHighlightedEvent,
    highlightedEventId,
    highlightedEventType,
  } = useTacticsStore();

  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    text: string;
  }>({ visible: false, x: 0, y: 0, text: '' });

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
    setHighlightedEvent(null, null);
  };

  const handleEventClick = (
    e: React.MouseEvent,
    id: string,
    type: 'transfer' | 'gap' | 'collision' | 'fake',
    time: number,
  ) => {
    e.stopPropagation();
    const isSame = highlightedEventId === id && highlightedEventType === type;
    if (isSame) {
      setHighlightedEvent(null, null);
    } else {
      setHighlightedEvent(id, type, time);
    }
  };

  const handleEventHover = (
    e: React.MouseEvent,
    visible: boolean,
    text: string = '',
  ) => {
    if (visible) {
      const rect = e.currentTarget.getBoundingClientRect();
      const parentRect = e.currentTarget.parentElement!.parentElement!.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: rect.left + rect.width / 2 - parentRect.left,
        y: rect.top - parentRect.top - 8,
        text,
      });
    } else {
      setTooltip((prev) => ({ ...prev, visible: false }));
    }
  };

  const timeMarkers = [];
  for (let t = 0; t <= play.duration; t += 1) {
    timeMarkers.push(t);
  }

  return (
    <div className="h-32 bg-[#121a16] border-t border-[#1e2d24] flex flex-col relative">
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

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ffd60a]" />
            <span className="text-xs text-white/50" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              传盘窗口
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#38b000]" />
            <span className="text-xs text-white/50" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              空档
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#ff6b35]" />
            <span className="text-xs text-white/50" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              撞线风险
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#d00000]" />
            <span className="text-xs text-white/50" style={{ fontFamily: "'Roboto Mono', monospace" }}>
              假动作
            </span>
          </div>
        </div>

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
        <div className="relative h-8 flex items-center">
          {tooltip.visible && (
            <div
              className="absolute -translate-x-1/2 -translate-y-full pointer-events-none z-20 px-2 py-1 rounded bg-[#0a0f0d] border border-[#1e2d24] text-xs text-white whitespace-nowrap"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                fontFamily: "'Roboto Mono', monospace",
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              }}
            >
              {tooltip.text}
              <div
                className="absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0f0d] border-r border-b border-[#1e2d24] rotate-45"
                style={{ bottom: '-4px' }}
              />
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#1e2d24] rounded-full" />

          {play.transferWindows.map((window) => {
            const fromPlayer = play.players.find((p) => p.id === window.fromId);
            const toPlayer = play.players.find((p) => p.id === window.toId);
            const isHighlighted =
              highlightedEventId === window.id &&
              highlightedEventType === 'transfer';
            return (
              <div
                key={window.id}
                className={`absolute bottom-0 h-1.5 cursor-pointer transition-all rounded-full ${
                  isHighlighted ? 'ring-2 ring-white/50' : ''
                }`}
                style={{
                  left: `${(window.startTime / play.duration) * 100}%`,
                  width: `${
                    ((window.endTime - window.startTime) / play.duration) * 100
                  }%`,
                  background:
                    window.quality === 'excellent'
                      ? 'linear-gradient(90deg, #ffd60a, #ffea00)'
                      : window.quality === 'great'
                      ? 'linear-gradient(90deg, #9ef01a, #d8ff00)'
                      : 'linear-gradient(90deg, #38b000, #70e000)',
                  opacity: isHighlighted ? 1 : 0.75,
                }}
                onClick={(e) =>
                  handleEventClick(e, window.id, 'transfer', window.startTime)
                }
                onMouseEnter={(e) =>
                  handleEventHover(e, true, [
                    `传盘窗口: ${fromPlayer?.label || '?'} → ${toPlayer?.label || '?'}`,
                    `质量: ${window.quality === 'excellent' ? '极佳' : window.quality === 'great' ? '良好' : '较好'}`,
                    `时长: ${(window.endTime - window.startTime).toFixed(1)}s`,
                    `开始: ${window.startTime.toFixed(1)}s`,
                  ].join(' | '))
                }
                onMouseLeave={(e) => handleEventHover(e, false)}
              />
            );
          })}

          {play.gaps.map((gap) => {
            const player = play.players.find((p) => p.id === gap.playerId);
            const isHighlighted =
              highlightedEventId === gap.id && highlightedEventType === 'gap';
            return (
              <div
                key={`gap-start-${gap.id}`}
                className={`absolute bottom-0 w-1.5 h-4 -translate-x-1/2 cursor-pointer transition-all rounded-t ${
                  isHighlighted ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-[#121a16]' : ''
                }`}
                style={{
                  left: `${(gap.startTime / play.duration) * 100}%`,
                  background: '#38b000',
                  height: isHighlighted ? '20px' : '16px',
                }}
                onClick={(e) =>
                  handleEventClick(e, gap.id, 'gap', gap.startTime)
                }
                onMouseEnter={(e) =>
                  handleEventHover(e, true, [
                    `空档开始: ${player?.label || '?'}`,
                    `最大距离: ${gap.maxDistance.toFixed(1)} yd`,
                    `持续: ${(gap.endTime - gap.startTime).toFixed(1)}s`,
                    `开始: ${gap.startTime.toFixed(1)}s`,
                  ].join(' | '))
                }
                onMouseLeave={(e) => handleEventHover(e, false)}
              />
            );
          })}

          {play.collisionRisks.map((risk) => {
            const p1 = play.players.find((p) => p.id === risk.playerIds[0]);
            const p2 = play.players.find((p) => p.id === risk.playerIds[1]);
            const isHighlighted =
              highlightedEventId === risk.id &&
              highlightedEventType === 'collision';
            const color =
              risk.severity === 'high'
                ? '#d00000'
                : risk.severity === 'medium'
                ? '#ff6b35'
                : '#ffd60a';
            return (
              <div
                key={risk.id}
                className={`absolute bottom-0 -translate-x-1/2 cursor-pointer transition-all ${
                  isHighlighted ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-[#121a16]' : ''
                }`}
                style={{
                  left: `${(risk.time / play.duration) * 100}%`,
                }}
                onClick={(e) =>
                  handleEventClick(e, risk.id, 'collision', risk.time)
                }
                onMouseEnter={(e) =>
                  handleEventHover(e, true, [
                    `撞线风险: ${p1?.label || '?'} × ${p2?.label || '?'}`,
                    `等级: ${risk.severity === 'high' ? '高' : risk.severity === 'medium' ? '中' : '低'}`,
                    `时间: ${risk.time.toFixed(1)}s`,
                  ].join(' | '))
                }
                onMouseLeave={(e) => handleEventHover(e, false)}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: isHighlighted ? '14px' : '10px',
                    height: isHighlighted ? '14px' : '10px',
                    background: color,
                    boxShadow: isHighlighted
                      ? `0 0 8px ${color}`
                      : 'none',
                    transform: 'translateY(50%)',
                  }}
                />
              </div>
            );
          })}

          {play.fakeNodes.map((node) => {
            const player = play.players.find((p) => p.id === node.playerId);
            const isHighlighted =
              highlightedEventId === node.id &&
              highlightedEventType === 'fake';
            return (
              <div
                key={node.id}
                className={`absolute bottom-0 w-1 h-5 -translate-x-1/2 cursor-pointer transition-all ${
                  isHighlighted ? 'ring-2 ring-white/60 ring-offset-1 ring-offset-[#121a16]' : ''
                }`}
                style={{
                  left: `${(node.time / play.duration) * 100}%`,
                  background: '#d00000',
                  height: isHighlighted ? '22px' : '20px',
                }}
                onClick={(e) =>
                  handleEventClick(e, node.id, 'fake', node.time)
                }
                onMouseEnter={(e) =>
                  handleEventHover(e, true, [
                    `假动作: ${player?.label || '?'}`,
                    `方向: ${node.direction === 'in' ? '内切' : node.direction === 'out' ? '外切' : node.direction}`,
                    `时间: ${node.time.toFixed(1)}s`,
                  ].join(' | '))
                }
                onMouseLeave={(e) => handleEventHover(e, false)}
              />
            );
          })}

          <div
            className="absolute bottom-0 left-0 h-1.5 rounded-full transition-all duration-75 pointer-events-none"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #38b000, #9ef01a)',
            }}
          />

          <div
            className="absolute bottom-0 w-4 h-4 -translate-x-1/2 rounded-full cursor-pointer hover:scale-125 transition-transform pointer-events-auto"
            style={{
              left: `${progress}%`,
              background: '#9ef01a',
              boxShadow: '0 0 12px rgba(158, 240, 26, 0.9)',
              transform: 'translateX(-50%) translateY(50%)',
            }}
          />

          <div
            className="absolute inset-0 cursor-pointer"
            onClick={handleTimelineClick}
          />
        </div>

        <div className="flex justify-between mt-2">
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
