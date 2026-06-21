import { Trash2, Crown } from 'lucide-react';
import { useAnnealingStore } from '@/store/useAnnealingStore';
import { GLASS_TYPE_LABELS, GLASS_TYPE_COLORS } from '@/utils/annealing';

export default function WorkList() {
  const { currentSession, removeWork } = useAnnealingStore();
  const { works } = currentSession;

  if (works.length === 0) {
    return (
      <div className="text-center py-8 text-amber-300/40 text-sm">
        <div className="text-4xl mb-2 opacity-30">🔥</div>
        暂无作品，请录入
      </div>
    );
  }

  const maxThickness = Math.max(...works.map((w) => w.maxThickness));

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin pr-1">
      {works.map((work) => {
        const isThickest = work.maxThickness === maxThickness;
        const color = GLASS_TYPE_COLORS[work.type];
        return (
          <div
            key={work.id}
            className={`group flex items-center gap-3 p-2.5 rounded-lg border transition-all duration-200 ${
              isThickest
                ? 'bg-furnace-glow/10 border-furnace-glow/30'
                : 'bg-furnace-dark/50 border-furnace-ash/20 hover:border-furnace-ash/40'
            }`}
          >
            <div
              className="w-1 h-10 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-amber-100 truncate">
                  {work.studentName}
                </span>
                {isThickest && (
                  <Crown className="w-3.5 h-3.5 text-furnace-glow shrink-0" />
                )}
              </div>
              <div className="text-xs text-amber-300/50 flex gap-2 mt-0.5">
                <span>{GLASS_TYPE_LABELS[work.type]}</span>
                <span>·</span>
                <span>{work.maxThickness}mm</span>
                <span>·</span>
                <span>{work.height}cm</span>
              </div>
            </div>
            <div className="text-xs text-amber-300/40 shrink-0">{work.entryTime}</div>
            <button
              onClick={() => removeWork(work.id)}
              className="opacity-0 group-hover:opacity-100 p-1 text-red-400/60 hover:text-red-400 transition-all"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
