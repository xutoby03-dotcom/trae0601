import { useEffect, useState } from 'react';
import { Trophy, Flame } from 'lucide-react';
import type { LocationStats } from '@/types';
import { FIRE_EXIT_LOCATIONS } from '@/utils/constants';
import { cn } from '@/utils/helpers';

interface Props {
  data: LocationStats[];
}

export default function StatsChart({ data }: Props) {
  const [animated, setAnimated] = useState(false);
  const max = data[0]?.blockingCount ?? 1;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400">
        <Flame className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">暂无占道记录数据</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((item, idx) => {
        const pct = Math.max(5, (item.blockingCount / max) * 100);
        const isFireExit = FIRE_EXIT_LOCATIONS.includes(item.location);
        const medalColors = ['bg-amber-400 text-amber-900', 'bg-slate-300 text-slate-700', 'bg-orange-300 text-orange-800'];

        return (
          <div
            key={item.location}
            className="animate-fade-in-up"
            style={{ animationDelay: `${idx * 70}ms` }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                {idx < 3 && (
                  <span
                    className={cn(
                      'w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm',
                      medalColors[idx]
                    )}
                  >
                    <Trophy className="w-3 h-3" />
                  </span>
                )}
                <span
                  className={cn(
                    'text-sm font-medium truncate',
                    isFireExit ? 'text-red-600' : 'text-slate-700'
                  )}
                >
                  {item.location}
                  {isFireExit && <span className="ml-1 text-[10px] text-red-500">（消防通道）</span>}
                </span>
              </div>
              <span
                className={cn(
                  'text-sm font-bold shrink-0 ml-3',
                  isFireExit ? 'text-red-600' : 'text-slate-800'
                )}
              >
                {item.blockingCount} <span className="text-xs font-normal text-slate-400">次</span>
              </span>
            </div>
            <div className="relative h-8 bg-slate-100 rounded-xl overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-xl flex items-center justify-end pr-3 transition-all duration-700 ease-out',
                  isFireExit
                    ? 'bg-gradient-to-r from-red-500 to-orange-500'
                    : idx < 3
                    ? 'bg-gradient-to-r from-brand-400 to-brand-600'
                    : 'bg-gradient-to-r from-slate-300 to-slate-400'
                )}
                style={{
                  width: animated ? `${pct}%` : '0%',
                  animation: animated ? undefined : 'grow-bar 0.8s ease-out both',
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                {pct > 20 && (
                  <span className="text-xs font-medium text-white/90">
                    {item.blockingCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
