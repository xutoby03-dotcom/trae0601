import { Edit, Trash2, Heart, Ghost, User, History } from 'lucide-react';
import type { Player } from '@/types';
import { cn } from '@/lib/utils';

interface PlayerCardProps {
  player: Player;
  onEdit?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function PlayerCard({
  player,
  onEdit,
  onDelete,
  selected,
  onClick,
  className
}: PlayerCardProps) {
  const genderLabel = {
    male: '男',
    female: '女',
    other: '其他'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-5 rounded-2xl border transition-all duration-300',
        'bg-slate-800/40 backdrop-blur-sm',
        selected
          ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/60',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
      )}

      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 flex items-center justify-center text-2xl flex-shrink-0">
          {player.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-white truncate">{player.name}</h4>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400">
              {genderLabel[player.gender]}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1">
              <Heart size={12} className="text-pink-400" />
              <span>情感 {player.emotionTolerance}/10</span>
            </div>
            <div className="flex items-center gap-1">
              <Ghost size={12} className="text-cyan-400" />
              <span>恐怖 {player.horrorTolerance}/10</span>
            </div>
          </div>
        </div>
      </div>

      {player.preferredGenres.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-slate-500 mb-2">偏好题材</p>
          <div className="flex flex-wrap gap-1.5">
            {player.preferredGenres.slice(0, 4).map(genre => (
              <span
                key={genre}
                className="px-2 py-0.5 text-xs rounded-md bg-purple-500/15 text-purple-300 border border-purple-500/20"
              >
                {genre}
              </span>
            ))}
            {player.preferredGenres.length > 4 && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-slate-700/50 text-slate-400">
                +{player.preferredGenres.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {player.triggers.length > 0 && (
        <div className="mt-3">
          <p className="text-xs text-slate-500 mb-2">雷点</p>
          <div className="flex flex-wrap gap-1.5">
            {player.triggers.slice(0, 3).map(trigger => (
              <span
                key={trigger}
                className="px-2 py-0.5 text-xs rounded-md bg-red-500/15 text-red-300 border border-red-500/20"
              >
                {trigger}
              </span>
            ))}
            {player.triggers.length > 3 && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-slate-700/50 text-slate-400">
                +{player.triggers.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-slate-700/30 flex items-center gap-2">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <User size={12} />
          <span>{player.willingToCrossdress ? '可反串' : '不反串'}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <History size={12} />
          <span>{player.historicalOk ? '历史OK' : '历史慎选'}</span>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              <Edit size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
