import type { Locker } from 'shared/types.js';

interface Props {
  lockers: Locker[];
  selectedId?: string;
  onSelect?: (locker: Locker) => void;
  showOnlyAvailable?: boolean;
}

export default function LockerGrid({ lockers, selectedId, onSelect, showOnlyAvailable }: Props) {
  const zones: Record<string, Locker[]> = {};
  for (const l of lockers) {
    if (showOnlyAvailable && l.status !== 'free') continue;
    if (!zones[l.zone]) zones[l.zone] = [];
    zones[l.zone].push(l);
  }
  const zoneKeys = Object.keys(zones).sort();

  const statusColors: Record<string, string> = {
    free: 'bg-accent-emerald/10 border-accent-emerald text-accent-emerald hover:bg-accent-emerald hover:text-white',
    occupied: 'bg-accent-rose/10 border-accent-rose/50 text-accent-rose cursor-not-allowed',
    disabled: 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed',
  };

  return (
    <div className="space-y-5">
      {zoneKeys.map(zone => (
        <div key={zone}>
          <h4 className="text-sm font-semibold text-slate-500 mb-2">
            {zone} 区
          </h4>
          <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
            {zones[zone].map(locker => {
              const isSelected = selectedId === locker.id;
              const isClickable = onSelect && locker.status === 'free';
              return (
                <button
                  key={locker.id}
                  onClick={() => isClickable && onSelect(locker)}
                  disabled={!isClickable}
                  className={`
                    aspect-square rounded-lg border-2 text-xs font-semibold
                    flex flex-col items-center justify-center gap-0.5
                    transition-all duration-200
                    ${statusColors[locker.status]}
                    ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2 scale-105' : ''}
                    ${isClickable ? 'hover:scale-105 cursor-pointer' : ''}
                  `}
                  title={`${locker.code} - ${locker.status === 'free' ? '空闲' : locker.status === 'occupied' ? '占用' : '禁用'} (${locker.size})`}
                >
                  <span>{locker.code}</span>
                  <span className="text-[10px] opacity-75">{locker.size}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-accent-emerald/30 border border-accent-emerald"></span>
          <span>空闲</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-accent-rose/20 border border-accent-rose/50"></span>
          <span>占用</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300"></span>
          <span>禁用</span>
        </div>
      </div>
    </div>
  );
}
