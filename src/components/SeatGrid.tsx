import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeatWithStatus } from '../types';

interface SeatGridProps {
  seats: SeatWithStatus[];
  selectedSeatId?: string | null;
  onSeatClick?: (seat: SeatWithStatus) => void;
  showLegend?: boolean;
}

export function SeatGrid({ seats, selectedSeatId, onSeatClick, showLegend = true }: SeatGridProps) {
  const statusColors: Record<string, string> = {
    available: 'bg-emerald-100 border-emerald-300 text-emerald-700 hover:bg-emerald-200',
    reserved: 'bg-amber-100 border-amber-300 text-amber-700',
    checked_in: 'bg-blue-100 border-blue-300 text-blue-700',
    no_show: 'bg-red-100 border-red-300 text-red-700',
  };

  const seatsPerRow = 10;
  const rows = Math.ceil(seats.length / seatsPerRow);
  const seatRows = Array.from({ length: rows }, (_, i) =>
    seats.slice(i * seatsPerRow, (i + 1) * seatsPerRow)
  );

  return (
    <div className="space-y-4">
      {showLegend && (
        <div className="flex flex-wrap gap-4 justify-center mb-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 border-2 border-emerald-300" />
            <span className="text-slate-600">可预约</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-lg bg-amber-100 border-2 border-amber-300" />
            <span className="text-slate-600">已预约</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-lg bg-blue-100 border-2 border-blue-300" />
            <span className="text-slate-600">已签到</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-6 h-6 rounded-lg bg-red-100 border-2 border-red-300" />
            <span className="text-slate-600">未签到</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-slate-600">带插座</span>
          </div>
        </div>
      )}

      <div className="flex justify-center mb-4">
        <div className="bg-slate-200 text-slate-600 text-sm font-medium px-8 py-2 rounded-lg">
          讲台
        </div>
      </div>

      <div className="space-y-2">
        {seatRows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-2">
            {row.map((seat) => (
              <button
                key={seat.id}
                onClick={() => onSeatClick?.(seat)}
                disabled={seat.status !== 'available'}
                className={cn(
                  'relative w-12 h-12 rounded-xl border-2 flex items-center justify-center text-sm font-medium transition-all duration-200',
                  statusColors[seat.status],
                  seat.status === 'available' && onSeatClick && 'cursor-pointer hover:scale-110',
                  seat.status !== 'available' && 'cursor-not-allowed',
                  selectedSeatId === seat.id && 'ring-2 ring-accent-500 ring-offset-2 scale-110'
                )}
              >
                {seat.seatNumber}
                {seat.hasPowerOutlet && (
                  <Zap className="absolute -top-1 -right-1 w-3.5 h-3.5 text-amber-500" />
                )}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
