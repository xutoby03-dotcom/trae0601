import { Film, ChevronRight } from 'lucide-react';
import type { Play } from '@/types';

interface PlayCardProps {
  play: Play;
  isSelected: boolean;
  onClick: () => void;
}

export default function PlayCard({ play, isSelected, onClick }: PlayCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-2xl border-2 text-left transition-all duration-300 hover:scale-[1.02] ${
        isSelected
          ? 'border-neon-green bg-neon-green/10 shadow-lg shadow-neon-green/20'
          : 'border-stage-border bg-stage-bg-card hover:border-neon-green/50 hover:bg-stage-bg-hover'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center ${
              isSelected
                ? 'bg-neon-green/20 text-neon-green'
                : 'bg-stage-bg-hover text-stage-text-secondary'
            }`}
          >
            <Film className="w-7 h-7" />
          </div>
          <div>
            <h3
              className={`text-2xl font-bold tracking-wide ${
                isSelected ? 'text-neon-green' : 'text-stage-text'
              }`}
            >
              {play.name}
            </h3>
            <p className="text-base text-stage-text-secondary mt-1">
              {play.description}
            </p>
          </div>
        </div>
        <ChevronRight
          className={`w-6 h-6 mt-2 transition-transform ${
            isSelected ? 'text-neon-green translate-x-1' : 'text-stage-text-muted'
          }`}
        />
      </div>
      <div className="mt-5 flex items-center gap-6 text-sm">
        <div
          className={`px-3 py-1.5 rounded-lg ${
            isSelected
              ? 'bg-neon-green/20 text-neon-green'
              : 'bg-stage-bg-hover text-stage-text-secondary'
          }`}
        >
          共 {play.totalScenes} 幕
        </div>
      </div>
    </button>
  );
}
