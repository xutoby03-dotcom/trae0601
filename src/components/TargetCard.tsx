import { Plus, Check, Star, Info, Gauge } from 'lucide-react';
import type { DeepSkyTarget, Difficulty } from '@/types';
import { useAstroStore } from '@/store/useAstroStore';
import { useMemo } from 'react';

const TARGET_COLORS: Record<string, string> = {
  nebula: 'from-nebula-pink/20 to-nebula-purple/20 border-nebula-pink/30',
  galaxy: 'from-nebula-blue/20 to-nebula-purple/20 border-nebula-blue/30',
  cluster: 'from-moonlight/15 to-nebula-purple/20 border-moonlight/30',
};

const TYPE_ICONS: Record<string, string> = {
  nebula: '🌌',
  galaxy: '🌀',
  cluster: '✨',
  planet: '🪐',
  star: '⭐',
};

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  const map = {
    easy: { label: '入门', cls: 'chip-easy', stars: 1 },
    medium: { label: '进阶', cls: 'chip-medium', stars: 2 },
    hard: { label: '挑战', cls: 'chip-hard', stars: 3 },
  };
  const { label, cls, stars } = map[difficulty];
  return (
    <span className={`chip ${cls} gap-1`}>
      <span className="flex">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="w-3 h-3 fill-current" />
        ))}
      </span>
      {label}
    </span>
  );
}

interface Props {
  target: DeepSkyTarget;
  onInfo?: () => void;
  compact?: boolean;
}

export default function TargetCard({ target, onInfo, compact }: Props) {
  const selectedDate = useAstroStore(s => s.selectedDate);
  const addTarget = useAstroStore(s => s.addTarget);
  const checklistTargets = useAstroStore(s => s.checklistTargets);

  const added = useMemo(
    () => checklistTargets.some(t => t.targetId === target.id),
    [checklistTargets, target.id]
  );

  const handleAdd = () => {
    if (!added) addTarget(selectedDate, target);
  };

  const gradient = TARGET_COLORS[target.type] ?? TARGET_COLORS.nebula;

  if (compact) {
    return (
      <div className={`glass-card p-3 bg-gradient-to-br ${gradient}`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl flex-shrink-0">{TYPE_ICONS[target.type]}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-semibold text-white truncate">{target.name}</p>
              <DifficultyBadge difficulty={target.difficulty} />
            </div>
            {target.commonName && (
              <p className="text-xs text-white/50 truncate">{target.commonName}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
              ${added
                ? 'bg-aurora-green/20 text-aurora-green border border-aurora-green/30'
                : 'bg-nebula-purple/20 text-white/80 hover:bg-nebula-purple/40 hover:text-white border border-nebula-purple/30'}`}
            title={added ? '已加入清单' : '加入观测清单'}
          >
            {added ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`glass-card-hover p-5 bg-gradient-to-br ${gradient}`}>
      <div className="flex gap-4">
        <div className="w-20 h-20 flex-shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl">
          {TYPE_ICONS[target.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-display text-lg font-bold text-white truncate">
                  {target.name}
                </h3>
                <DifficultyBadge difficulty={target.difficulty} />
              </div>
              {target.commonName && (
                <p className="text-sm text-white/60 truncate">{target.commonName}</p>
              )}
            </div>
            {onInfo && (
              <button
                onClick={onInfo}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Info className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2 mb-2">
            <span className="chip bg-white/5 border border-white/10 text-white/70">
              {target.typeLabel}
            </span>
            <span className="chip bg-white/5 border border-white/10 text-white/70">
              <Star className="w-3 h-3 fill-current text-moonlight text-opacity-70" />
              星等 {target.magnitude}
            </span>
            <span className="chip bg-white/5 border border-white/10 text-white/70">
              📍 {target.constellation}
            </span>
          </div>

          <p className="text-xs text-white/60 leading-relaxed line-clamp-2 mb-3">
            {target.description}
          </p>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Gauge className="w-3.5 h-3.5" />
              <span>{target.bestTime}</span>
            </div>
            <button
              onClick={handleAdd}
              disabled={added}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all
                ${added
                  ? 'bg-aurora-green/20 text-aurora-green border border-aurora-green/30 cursor-default'
                  : 'btn-primary !py-2 !px-4 !text-xs'}`}
            >
              {added ? (
                <><Check className="w-3.5 h-3.5" /> 已加入</>
              ) : (
                <><Plus className="w-3.5 h-3.5" /> 加入清单</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
