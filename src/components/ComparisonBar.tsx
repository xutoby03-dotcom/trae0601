import { memo, useCallback, useRef, useEffect } from 'react';
import { ArrowLeftRight, X, Play, Pause, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import { formatTime } from '../utils/audio';
import { VUMeter } from './VUMeter';

export const ComparisonBar = memo(function ComparisonBar() {
  const comparison = useStore((s) => s.comparison);
  const setComparisonSlot = useStore((s) => s.setComparisonSlot);
  const toggleComparisonActive = useStore((s) => s.toggleComparisonActive);
  const currentPlayingId = useStore((s) => s.currentPlayingId);
  const setCurrentPlayingId = useStore((s) => s.setCurrentPlayingId);
  const takes = useStore((s) => s.takes);

  const playerA = useAudioPlayer(
    comparison.a?.audioUrl || '',
    comparison.a?.id || 'slot-a',
    { autoPlay: comparison.active === 'a' && currentPlayingId === comparison.a?.id }
  );

  const playerB = useAudioPlayer(
    comparison.b?.audioUrl || '',
    comparison.b?.id || 'slot-b',
    { autoPlay: comparison.active === 'b' && currentPlayingId === comparison.b?.id }
  );

  const switchTimeoutRef = useRef<number | null>(null);

  const handleToggle = useCallback(() => {
    if (!comparison.a || !comparison.b) return;

    const currentPlayer = comparison.active === 'a' ? playerA : playerB;
    const nextPlayer = comparison.active === 'a' ? playerB : playerA;
    const nextTake = comparison.active === 'a' ? comparison.b : comparison.a;

    const currentTime = currentPlayer.currentTime;

    if (switchTimeoutRef.current) {
      window.clearTimeout(switchTimeoutRef.current);
    }

    currentPlayer.setVolume(0);
    setTimeout(() => {
      currentPlayer.stop();
      nextPlayer.seek(currentTime);
      nextPlayer.setVolume(0);
      nextPlayer.togglePlay();
      setTimeout(() => {
        nextPlayer.setVolume(0.8);
      }, 30);
    }, 75);

    setCurrentPlayingId(nextTake?.id || null);
    toggleComparisonActive();
  }, [comparison, playerA, playerB, toggleComparisonActive, setCurrentPlayingId]);

  useEffect(() => {
    return () => {
      if (switchTimeoutRef.current) {
        window.clearTimeout(switchTimeoutRef.current);
      }
    };
  }, []);

  const handleDrop = useCallback(
    (slot: 'a' | 'b') => (e: React.DragEvent) => {
      e.preventDefault();
      const takeId = e.dataTransfer.getData('text/plain');
      const take = takes.find((t) => t.id === takeId);
      if (take) {
        setComparisonSlot(slot, take);
      }
    },
    [takes, setComparisonSlot]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const hasBoth = comparison.a && comparison.b;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-studio-panel/95 backdrop-blur-md border-t border-studio-border shadow-2xl">
      <div className="container px-4 py-3">
        <div className="flex items-center gap-4">
          <div
            onDrop={handleDrop('a')}
            onDragOver={handleDragOver}
            className={`flex-1 min-w-0 p-3 rounded-lg border-2 border-dashed transition-all ${
              comparison.a
                ? 'border-accent-amber/50 bg-studio-card'
                : 'border-studio-border bg-studio-card/50 hover:border-accent-amber/30'
            }`}
          >
            {comparison.a ? (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-accent-amber text-lg">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-studio-text truncate">{comparison.a.name}</h4>
                  <p className="text-xs text-studio-textDim truncate font-mono">
                    {comparison.a.microphone.split(' ')[0]} + {comparison.a.preamp.split(' ')[0]}
                  </p>
                </div>
                {comparison.active === 'a' && (
                  <VUMeter level={playerA.vuLevel} size="sm" />
                )}
                <div className="text-xs font-mono text-studio-textDim">
                  {formatTime(playerA.currentTime)}
                </div>
                <button
                  onClick={() => setComparisonSlot('a', null)}
                  className="p-1 hover:bg-studio-hover rounded transition-colors"
                >
                  <X className="w-4 h-4 text-studio-textDim" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-studio-textDim">
                <p className="text-sm">拖拽 Take 到 A 槽</p>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center gap-2">
            <button
              onClick={handleToggle}
              disabled={!hasBoth}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 ${
                hasBoth
                  ? 'bg-gradient-to-br from-accent-amber to-accent-purple text-white hover:scale-105 hover:shadow-lg hover:shadow-accent-amber/30 active:scale-95'
                  : 'bg-studio-card border border-studio-border text-studio-textDim cursor-not-allowed'
              }`}
              title={hasBoth ? '空格键快速切换' : '需要两个 Take 才能对比'}
            >
              <ArrowLeftRight className={`w-7 h-7 ${hasBoth ? 'animate-pulse' : ''}`} />
            </button>
            {hasBoth && (
              <div className="flex items-center gap-1">
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  comparison.active === 'a'
                    ? 'bg-accent-amber text-studio-bg'
                    : 'bg-studio-card text-studio-textDim'
                }`}>
                  A
                </span>
                <span className="text-xs text-studio-textDim">空格切换</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                  comparison.active === 'b'
                    ? 'bg-accent-purple text-white'
                    : 'bg-studio-card text-studio-textDim'
                }`}>
                  B
                </span>
              </div>
            )}
            {hasBoth && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (comparison.active === 'a') playerA.togglePlay();
                    else playerB.togglePlay();
                  }}
                  className="p-2 rounded-full bg-studio-card border border-studio-border hover:bg-studio-hover transition-colors"
                >
                  {comparison.active === 'a' ? (
                    playerA.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : playerA.isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )
                  ) : playerB.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : playerB.isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div
            onDrop={handleDrop('b')}
            onDragOver={handleDragOver}
            className={`flex-1 min-w-0 p-3 rounded-lg border-2 border-dashed transition-all ${
              comparison.b
                ? 'border-accent-purple/50 bg-studio-card'
                : 'border-studio-border bg-studio-card/50 hover:border-accent-purple/30'
            }`}
          >
            {comparison.b ? (
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-accent-purple text-lg">B</span>
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <h4 className="font-medium text-sm text-studio-text truncate">{comparison.b.name}</h4>
                  <p className="text-xs text-studio-textDim truncate font-mono">
                    {comparison.b.microphone.split(' ')[0]} + {comparison.b.preamp.split(' ')[0]}
                  </p>
                </div>
                {comparison.active === 'b' && (
                  <VUMeter level={playerB.vuLevel} size="sm" />
                )}
                <div className="text-xs font-mono text-studio-textDim">
                  {formatTime(playerB.currentTime)}
                </div>
                <button
                  onClick={() => setComparisonSlot('b', null)}
                  className="p-1 hover:bg-studio-hover rounded transition-colors"
                >
                  <X className="w-4 h-4 text-studio-textDim" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 py-2 text-studio-textDim">
                <p className="text-sm">拖拽 Take 到 B 槽</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
