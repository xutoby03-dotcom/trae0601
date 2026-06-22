import type { WaxModel, WaxStatus } from '@/types';
import { STATUS_META } from '@/utils/constants';
import { cn } from '@/utils/helpers';
import WaxCard from './WaxCard';
import { Package } from 'lucide-react';

interface StatusColumnProps {
  status: WaxStatus;
  items: WaxModel[];
}

export default function StatusColumn({ status, items }: StatusColumnProps) {
  const meta = STATUS_META[status];
  const defectCount = items.filter((i) => i.defects.length > 0).length;

  return (
    <section className="flex flex-col min-w-[300px] flex-1">
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center border bg-gradient-to-br',
              meta.accent,
              meta.color.replace('text-', 'border-') + '/40',
            )}
          >
            <StatusIcon status={status} />
          </div>
          <div>
            <h3
              className={cn(
                'font-serif text-base font-bold tracking-wide',
                meta.color,
              )}
            >
              {meta.label}
            </h3>
            <p className="text-[10px] font-mono text-ink-500 mt-0.5">
              {statusDescription(status)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {defectCount > 0 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-serif bg-ruby-600/20 border border-ruby-600/40 text-ruby-400">
              问题 {defectCount}
            </span>
          )}
          <span
            className={cn(
              'px-2.5 py-1 rounded-md font-mono text-xs font-bold',
              items.length > 0
                ? `bg-gradient-to-br ${meta.accent} ${meta.color}`
                : 'bg-ink-800/50 text-ink-500 border border-ink-700',
            )}
          >
            {items.length}
          </span>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gold-600/25 to-transparent mb-4" />

      <div className="flex-1 overflow-y-auto scrollbar-thin pr-1 -mr-1 space-y-3 pb-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-xl border border-dashed border-ink-700/70 bg-ink-900/30">
            <Package className="w-8 h-8 text-ink-700 mb-3" />
            <p className="text-xs font-serif text-ink-600">暂无蜡模</p>
            <p className="text-[10px] font-mono text-ink-700 mt-1">
              {meta.label}队列已清空
            </p>
          </div>
        ) : (
          items.map((it, idx) => <WaxCard key={it.id} model={it} index={idx} />)
        )}
      </div>
    </section>
  );
}

function statusDescription(s: WaxStatus): string {
  switch (s) {
    case 'waxing':
      return '工匠进行蜡模修整';
    case 'inspecting':
      return '质量检验与缺陷标记';
    case 'treeing':
      return '蜡树组装与焊接';
    case 'casting':
      return '等待石膏浇铸';
    default:
      return '';
  }
}

function StatusIcon({ status }: { status: WaxStatus }) {
  const common = 'w-5 h-5';
  switch (status) {
    case 'waxing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M14.7 6.3l3 3-8.5 8.5H6.2v-3l8.5-8.5z" />
          <path d="M13 8l3 3" />
          <path d="M4 20l6-1" />
        </svg>
      );
    case 'inspecting':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
          <path d="M8 11l2 2 4-4" />
        </svg>
      );
    case 'treeing':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M12 2v20" />
          <circle cx="12" cy="5" r="2" />
          <circle cx="6" cy="11" r="2" />
          <circle cx="18" cy="11" r="2" />
          <circle cx="8" cy="18" r="2" />
          <circle cx="16" cy="18" r="2" />
        </svg>
      );
    case 'casting':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={common}>
          <path d="M7 3v5h10V3" />
          <path d="M6 8h12l-1.5 11a2 2 0 0 1-2 1.9h-5a2 2 0 0 1-2-1.9L6 8z" />
          <path d="M9 13h6" />
        </svg>
      );
    default:
      return null;
  }
}
