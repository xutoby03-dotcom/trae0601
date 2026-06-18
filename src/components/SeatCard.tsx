import { useNavigate } from 'react-router-dom';
import { User, UserX, AlertTriangle } from 'lucide-react';
import { useFeedbackStore } from '@/store/useFeedbackStore';
import type { Seat } from '@/types';
import { getStatusColor, isHighFrequency } from '@/utils/seatStatus';

interface SeatCardProps {
  seat: Seat;
}

export function SeatCard({ seat }: SeatCardProps) {
  const navigate = useNavigate();
  const { feedbacks } = useFeedbackStore();
  const highFreq = isHighFrequency(seat.id, feedbacks);

  const handleClick = () => {
    navigate(`/feedback?seatId=${seat.id}`);
  };

  const statusColor = getStatusColor(seat.status);

  return (
    <button
      onClick={handleClick}
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        highFreq ? 'animate-pulse' : ''
      } ${
        seat.isOccupied
          ? `${statusColor} border-transparent text-white`
          : 'bg-white border-slate-200 text-slate-600 hover:border-teal-400'
      }`}
      style={{
        animationDelay: `${Math.random() * 0.5}s`,
      }}
    >
      {highFreq && (
        <div className="absolute -top-1 -right-1">
          <AlertTriangle className="w-4 h-4 text-red-500 fill-red-200" />
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        <div className="text-lg font-bold">
          {seat.zone}-{seat.deskNumber}-{seat.seatNumber}
        </div>

        <div className="flex items-center gap-1 text-sm opacity-80">
          {seat.isOccupied ? (
            <User className="w-4 h-4" />
          ) : (
            <UserX className="w-4 h-4" />
          )}
          <span>{seat.isOccupied ? '有人' : '空闲'}</span>
        </div>

        {seat.feedbackCount24h > 0 && (
          <div
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              seat.isOccupied ? 'bg-white/20' : 'bg-slate-100 text-slate-700'
            }`}
          >
            24h 反馈 {seat.feedbackCount24h} 次
          </div>
        )}
      </div>
    </button>
  );
}
