import { cn } from '@/lib/utils';
import { STATUS_LIST, STATUS_COLOR } from '@/types';
import type { ItemStatus } from '@/types';

interface StatusTabsProps {
  activeStatus: string;
  onStatusChange: (status: string) => void;
  counts: Record<string, number>;
}

export default function StatusTabs({ activeStatus, onStatusChange, counts }: StatusTabsProps) {
  return (
    <div className="flex gap-1 px-4 py-2">
      {STATUS_LIST.map((status: ItemStatus) => {
        const isActive = activeStatus === status;
        const color = STATUS_COLOR[status];

        return (
          <button
            key={status}
            onClick={() => onStatusChange(status)}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
              isActive ? 'text-[#2D2A26]' : 'text-[#2D2A26]/50 hover:text-[#2D2A26]/70'
            )}
          >
            <span>{status}</span>
            <span
              className={cn(
                'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold',
                isActive ? 'text-white' : 'text-white/80'
              )}
              style={{ backgroundColor: isActive ? color : `${color}66` }}
            >
              {counts[status] ?? 0}
            </span>
            {isActive && (
              <span
                className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
