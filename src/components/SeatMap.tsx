import React from 'react';
import type { Seat, Course } from '../types';
import { seatStatusColors, seatTypeLabels } from '../types';
import { getSeatPosition } from '../utils/helpers';
import { Zap } from 'lucide-react';

interface SeatMapProps {
  course: Course;
  onSeatClick?: (seat: Seat) => void;
  interactive?: boolean;
  showLabels?: boolean;
}

export const SeatMap: React.FC<SeatMapProps> = ({
  course,
  onSeatClick,
  interactive = false,
  showLabels = true,
}) => {
  const getSeatColor = (seat: Seat): string => {
    if (seat.type === 'aisle') return 'bg-slate-200';
    if (seat.type === 'fixed') return 'bg-slate-600';
    if (seat.type === 'empty') return 'bg-transparent border border-dashed border-slate-300';
    return seatStatusColors[seat.status] || 'bg-gray-300';
  };

  const handleClick = (seat: Seat) => {
    if (!interactive) return;
    if (seat.type === 'aisle' || seat.type === 'fixed' || seat.type === 'empty') return;
    onSeatClick?.(seat);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
      <div className="mb-6">
        <div className="h-12 bg-gradient-to-r from-slate-700 to-slate-800 rounded-lg flex items-center justify-center text-white font-medium">
          讲 台
        </div>
      </div>

      <div className="flex flex-col items-center gap-2">
        {course.seats.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-2">
            <span className="w-8 text-xs text-slate-500 text-right">
              {rowIndex + 1}排
            </span>
            <div className="flex gap-1">
              {row.map((seat) => (
                <div
                  key={seat.id}
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center text-xs
                    transition-all duration-200 relative
                    ${getSeatColor(seat)}
                    ${interactive && seat.type === 'auditor' && seat.status !== 'blocked'
                      ? 'cursor-pointer hover:scale-110 hover:shadow-md'
                      : ''
                    }
                    ${seat.type === 'aisle' ? 'w-4' : ''}
                  `}
                  onClick={() => handleClick(seat)}
                  title={
                    seat.type === 'aisle'
                      ? '过道'
                      : seat.type === 'fixed'
                      ? '固定学生座位'
                      : `${getSeatPosition(seat)} - ${
                          seat.studentName || (seat.status === 'available' ? '空闲' : seat.status)
                        }${seat.hasOutlet ? ' (有插座)' : ''}`
                  }
                >
                  {seat.hasOutlet && seat.type === 'auditor' && (
                    <Zap className="w-3 h-3 text-yellow-300" />
                  )}
                  {seat.studentName && (
                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 whitespace-nowrap bg-white px-1 rounded">
                      {seat.studentName.slice(0, 3)}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showLabels && (
        <div className="mt-8 flex flex-wrap gap-4 justify-center text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-slate-600">空闲旁听位</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-slate-600">已预订</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-600"></div>
            <span className="text-slate-600">已签到</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-600"></div>
            <span className="text-slate-600">固定座位</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200"></div>
            <span className="text-slate-600">过道</span>
          </div>
        </div>
      )}
    </div>
  );
};
