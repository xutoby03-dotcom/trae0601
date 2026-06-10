import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import type { FaultTicket } from '@/shared/types';
import { STATUS_CONFIG, PHENOMENON_OPTIONS } from '@/shared/constants';
import { relativeTime, formatDateTime } from '@/utils/time';
import { ChevronRight, Clock, X } from 'lucide-react';

interface Props {
  elevator: { building: string; unit: string; elevatorNo: string };
  trigger: React.ReactNode;
  align?: 'left' | 'right';
}

export default function ElevatorHistoryPopover({ elevator, trigger, align = 'left' }: Props) {
  const navigate = useNavigate();
  const tickets = useAppStore((s) => s.tickets);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const related = tickets
    .filter(
      (t) =>
        t.elevator.building === elevator.building &&
        t.elevator.unit === elevator.unit &&
        t.elevator.elevatorNo === elevator.elevatorNo,
    )
    .sort((a, b) => b.occurredAt - a.occurredAt);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <div
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        {trigger}
      </div>

      {open && (
        <div
          className={`absolute z-50 mt-2 w-[340px] card shadow-pop animate-slide-up overflow-hidden ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <div className="text-sm font-bold text-slate-800">
              同梯历史工单
              <span className="ml-1.5 text-xs font-normal text-slate-400">共 {related.length} 条</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
              }}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {related.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-400">暂无历史工单</div>
            ) : (
              related.map((t) => (
                <HistoryRow key={t.id} ticket={t} onNavigate={(id) => { setOpen(false); navigate(`/fault/${id}`); }} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function HistoryRow({ ticket, onNavigate }: { ticket: FaultTicket; onNavigate: (id: string) => void }) {
  const cfg = STATUS_CONFIG[ticket.status];
  const phenom = PHENOMENON_OPTIONS.find((p) => p.value === ticket.phenomenon);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onNavigate(ticket.id);
      }}
      className="w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-brand-50/50 transition-colors group"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`shrink-0 w-2 h-2 rounded-full ${cfg.dot}`}
          />
          <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 shrink-0">
            {phenom?.label}
          </span>
          {ticket.hasTrapped && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 font-medium shrink-0">
              被困
            </span>
          )}
        </div>
        <ChevronRight size={13} className="text-slate-300 group-hover:text-brand-500 shrink-0" />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400 pl-4">
        <span className="inline-flex items-center gap-1">
          <Clock size={10} />
          <span title={formatDateTime(ticket.occurredAt)}>{relativeTime(ticket.occurredAt)}</span>
        </span>
        <span>{ticket.reportedBy}</span>
      </div>
    </button>
  );
}
