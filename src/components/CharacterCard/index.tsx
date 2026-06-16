import { Heart, Ghost, UserX, User } from 'lucide-react';
import type { Character, Conflict } from '@/types';
import { cn } from '@/lib/utils';

interface CharacterCardProps {
  character: Character;
  conflicts?: Conflict[];
  assignedPlayerName?: string;
  assignedPlayerAvatar?: string;
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export default function CharacterCard({
  character,
  conflicts = [],
  assignedPlayerName,
  assignedPlayerAvatar,
  onClick,
  selected,
  className
}: CharacterCardProps) {
  const hasDanger = conflicts.some(c => c.severity === 'danger');
  const hasWarning = conflicts.some(c => c.severity === 'warning');

  const genderLabel = {
    male: '男',
    female: '女',
    other: '其他'
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative p-4 rounded-2xl border transition-all duration-300',
        'bg-slate-800/40 backdrop-blur-sm',
        hasDanger && 'border-red-500/50 bg-red-500/5',
        hasWarning && !hasDanger && 'border-amber-500/50 bg-amber-500/5',
        !hasDanger && !hasWarning && selected && 'border-purple-500/50 bg-purple-500/10',
        !hasDanger && !hasWarning && !selected && 'border-slate-700/50 hover:border-slate-600/50',
        onClick && 'cursor-pointer hover:shadow-lg',
        className
      )}
    >
      {(hasDanger || hasWarning) && (
        <div className={cn(
          'absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse',
          hasDanger ? 'bg-red-500' : 'bg-amber-500'
        )} />
      )}

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-xl',
            character.gender === 'male' ? 'bg-blue-500/20' :
            character.gender === 'female' ? 'bg-pink-500/20' :
            'bg-slate-500/20'
          )}>
            {character.gender === 'male' ? '👨' : character.gender === 'female' ? '👩' : '🧑'}
          </div>
          <div>
            <h4 className="font-semibold text-white">{character.name}</h4>
            <p className="text-xs text-slate-500">{genderLabel[character.gender]} · {character.genre}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {character.isRomanceLead && (
            <Heart size={14} className="text-pink-400" />
          )}
          {character.isHorrorFocus && (
            <Ghost size={14} className="text-purple-400" />
          )}
          {character.isEdge && (
            <UserX size={14} className="text-slate-500" />
          )}
        </div>
      </div>

      <p className="text-sm text-slate-400 line-clamp-2 mb-3">
        {character.description || '暂无简介'}
      </p>

      {character.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {character.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="px-2 py-0.5 text-xs rounded-md bg-slate-700/50 text-slate-400"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="pt-3 border-t border-slate-700/30">
        {assignedPlayerName ? (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-purple-500/30 flex items-center justify-center text-sm">
              {assignedPlayerAvatar || '👤'}
            </div>
            <span className="text-sm text-slate-300 font-medium">{assignedPlayerName}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-500">
            <User size={14} />
            <span className="text-xs">待分配</span>
          </div>
        )}
      </div>
    </div>
  );
}
