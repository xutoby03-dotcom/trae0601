import { Clock, Users, Store, DollarSign, Edit, Trash2 } from 'lucide-react';
import type { Script } from '@/types';
import { cn } from '@/lib/utils';

interface ScriptCardProps {
  script: Script;
  onEdit?: () => void;
  onDelete?: () => void;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function ScriptCard({
  script,
  onEdit,
  onDelete,
  selected,
  onClick,
  className
}: ScriptCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}min` : `${hours}h`;
  };

  const genreColors: Record<string, string> = {
    '推理': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    '情感': 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    '恐怖': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    '欢乐': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    '机制': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    '古风': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border overflow-hidden transition-all duration-300',
        'bg-slate-800/40 backdrop-blur-sm',
        selected
          ? 'border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20'
          : 'border-slate-700/50 hover:border-slate-600/50 hover:bg-slate-800/60',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {selected && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-purple-400 animate-pulse z-10" />
      )}

      <div className="h-28 bg-gradient-to-br from-slate-700/50 to-slate-800/50 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center text-5xl">
          {script.cover || '📖'}
        </div>
        <div className="absolute top-3 left-3">
          <span className={cn(
            'px-2.5 py-1 rounded-lg text-xs font-medium border',
            genreColors[script.genre] || 'bg-slate-600/50 text-slate-300 border-slate-500/30'
          )}>
            {script.genre}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-white mb-3 truncate">{script.title}</h4>
        
        <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users size={14} className="text-slate-500" />
            <span>{script.playerCount}人</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={14} className="text-slate-500" />
            <span>{formatDuration(script.duration)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Store size={14} className="text-slate-500" />
            <span className="truncate">{script.store}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <DollarSign size={14} className="text-slate-500" />
            <span>¥{script.price}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-700/30">
          <p className="text-xs text-slate-500 mb-2">角色列表</p>
          <div className="flex flex-wrap gap-1">
            {script.characters.slice(0, 4).map(char => (
              <span
                key={char.id}
                className="px-2 py-0.5 text-xs rounded-md bg-slate-700/50 text-slate-300 truncate max-w-[80px"
              >
                {char.name}
              </span>
            ))}
            {script.characters.length > 4 && (
              <span className="px-2 py-0.5 text-xs rounded-md bg-slate-700/50 text-slate-400">
                +{script.characters.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {(onEdit || onDelete) && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(); }}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700/80 transition-colors"
            >
              <Edit size={14} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="p-1.5 rounded-lg bg-slate-800/80 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
