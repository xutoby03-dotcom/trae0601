import { cn } from '@/lib/utils';

interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  status: 'completed' | 'current' | 'pending';
  type?: 'inspection' | 'repair' | 'system';
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const statusColors = {
  completed: 'bg-emerald-500 border-emerald-500',
  current: 'bg-teal-500 border-teal-500 ring-4 ring-teal-100',
  pending: 'bg-white border-slate-300',
};

const typeIcons: Record<string, string> = {
  inspection: '🔍',
  repair: '🔧',
  system: '⚡',
};

export default function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Line */}
          {index < items.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-slate-200"></div>
          )}
          
          {/* Dot */}
          <div className="relative z-10 flex-shrink-0">
            <div
              className={cn(
                'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                statusColors[item.status]
              )}
            >
              {item.status === 'completed' && (
                <svg
                  className="w-3.5 h-3.5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pt-0.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {item.type && (
                  <span className="text-base">{typeIcons[item.type] || '📌'}</span>
                )}
                <h4 className="font-medium text-slate-800 text-sm">{item.title}</h4>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">{item.time}</span>
            </div>
            {item.description && (
              <p className="mt-1 text-sm text-slate-500 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
