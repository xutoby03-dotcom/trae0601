import { memo, useCallback } from 'react';
import { Mic, Ampersand, Ruler, Volume2, MapPin, Shield, ShieldOff, GitCompare, FileText } from 'lucide-react';
import type { AudioTake } from '../types';
import { StarButton } from './StarButton';
import { AudioPlayer } from './AudioPlayer';
import { useStore } from '../store/useStore';
import { calculateOverallScore, formatDate } from '../utils/audio';

interface TakeCardProps {
  take: AudioTake;
  index: number;
}

export const TakeCard = memo(function TakeCard({ take, index }: TakeCardProps) {
  const toggleStar = useStore((s) => s.toggleStar);
  const setSelectedTake = useStore((s) => s.setSelectedTake);
  const setComparisonSlot = useStore((s) => s.setComparisonSlot);
  const selectedTakeId = useStore((s) => s.selectedTakeId);
  const comparison = useStore((s) => s.comparison);
  const currentPlayingId = useStore((s) => s.currentPlayingId);

  const isSelected = selectedTakeId === take.id;
  const isPlaying = currentPlayingId === take.id;
  const isInComparison = comparison.a?.id === take.id || comparison.b?.id === take.id;
  const overallScore = calculateOverallScore(take.annotations);

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      e.dataTransfer.setData('text/plain', take.id);
      e.dataTransfer.effectAllowed = 'copy';
    },
    [take.id]
  );

  const handleAddToA = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setComparisonSlot('a', take);
    },
    [take, setComparisonSlot]
  );

  const handleAddToB = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setComparisonSlot('b', take);
    },
    [take, setComparisonSlot]
  );

  const handleClick = useCallback(() => {
    setSelectedTake(isSelected ? null : take.id);
  }, [take.id, isSelected, setSelectedTake]);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`card-studio card-studio-hover p-4 cursor-grab active:cursor-grabbing animate-fade-in-up flex flex-col gap-3 transition-all duration-300 ${
        isSelected
          ? 'border-accent-amber shadow-studio-glow-lg'
          : isPlaying
            ? 'border-accent-amber/50 animate-pulse-glow'
            : isInComparison
              ? 'border-accent-purple/50'
              : ''
      }`}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-studio-text truncate">{take.name}</h3>
          <p className="text-xs text-studio-textDim mt-0.5">{formatDate(take.createdAt)}</p>
        </div>
        <div className="flex items-center gap-1">
          <div
            className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
              overallScore >= 8
                ? 'bg-emerald-500/20 text-emerald-400'
                : overallScore >= 6
                  ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400'
            }`}
          >
            {overallScore}
          </div>
          <StarButton starred={take.starred} onToggle={() => toggleStar(take.id)} size="sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 text-studio-textDim">
          <Mic className="w-3.5 h-3.5 text-accent-amber" />
          <span className="truncate text-mono" title={take.microphone}>
            {take.microphone}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-studio-textDim">
          <Ampersand className="w-3.5 h-3.5 text-accent-purple" />
          <span className="truncate text-mono" title={take.preamp}>
            {take.preamp.split(' ')[0]}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-studio-textDim">
          <Ruler className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-mono">{take.distance}cm</span>
        </div>
        <div className="flex items-center gap-1.5 text-studio-textDim">
          <Volume2 className="w-3.5 h-3.5 text-green-400" />
          <span className="text-mono">{take.gain > 0 ? '+' : ''}{take.gain}dB</span>
        </div>
        <div className="flex items-center gap-1.5 text-studio-textDim col-span-1">
          <MapPin className="w-3.5 h-3.5 text-rose-400" />
          <span className="truncate text-mono" title={take.roomPosition}>
            {take.roomPosition.split(' ')[0]}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-studio-textDim">
          {take.popFilter ? (
            <>
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-mono text-emerald-400">防喷 ON</span>
            </>
          ) : (
            <>
              <ShieldOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-mono text-red-400">防喷 OFF</span>
            </>
          )}
        </div>
      </div>

      {take.notes && (
        <div className="flex items-start gap-1.5 text-xs text-studio-textDim bg-studio-panel/50 p-2 rounded">
          <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-2">{take.notes}</p>
        </div>
      )}

      <div className="pt-2 border-t border-studio-border">
        <AudioPlayer audioUrl={take.audioUrl} takeId={take.id} compact />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          onClick={handleAddToA}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
            comparison.a?.id === take.id
              ? 'bg-accent-amber text-studio-bg'
              : 'bg-studio-panel text-studio-text hover:bg-studio-hover border border-studio-border'
          }`}
          title="添加到对比槽 A"
        >
          <GitCompare className="w-3.5 h-3.5" />
          A 槽
        </button>
        <button
          onClick={handleAddToB}
          className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1 ${
            comparison.b?.id === take.id
              ? 'bg-accent-purple text-white'
              : 'bg-studio-panel text-studio-text hover:bg-studio-hover border border-studio-border'
          }`}
          title="添加到对比槽 B"
        >
          <GitCompare className="w-3.5 h-3.5" />
          B 槽
        </button>
      </div>
    </div>
  );
});
