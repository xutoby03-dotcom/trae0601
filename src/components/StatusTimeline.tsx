import type { StatusTimeline, FaultStatus } from '@/shared/types';
import { STATUS_CONFIG } from '@/shared/constants';
import { formatDateTime } from '@/utils/time';

interface Props {
  timeline: StatusTimeline[];
}

export default function StatusTimelineView({ timeline }: Props) {
  const sorted = [...timeline].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <ol className="relative">
      {sorted.map((node, idx) => {
        const cfg = STATUS_CONFIG[node.status as FaultStatus];
        const isLast = idx === sorted.length - 1;
        return (
          <li key={`${node.status}-${node.timestamp}-${idx}`} className="relative pl-8 pb-6 last:pb-0">
            {!isLast && (
              <span
                className="absolute left-[11px] top-6 w-px h-[calc(100%-8px)]"
                style={{ backgroundColor: '#e2e8f0' }}
              />
            )}
            <span
              className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-white shadow-card ${cfg.dot}`}
            />
            <div className={`rounded-xl ${cfg.bg} ${cfg.border} border px-4 py-3`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className={`font-bold text-sm ${cfg.color}`}>{cfg.label}</span>
                <time className="text-xs text-slate-500">{formatDateTime(node.timestamp)}</time>
              </div>
              {(node.operator || node.remark) && (
                <div className="mt-1.5 text-sm text-slate-600">
                  {node.operator && <span className="mr-2">👷 {node.operator}</span>}
                  {node.remark && <div className="mt-1">{node.remark}</div>}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
