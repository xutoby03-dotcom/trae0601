import { AlertTriangle } from 'lucide-react';
import { useTimer } from '../../hooks/useTimer';

interface BookingTimerProps {
  date: string;
  endTime: string;
  showWarning?: boolean;
}

export default function BookingTimer({ date, endTime, showWarning = true }: BookingTimerProps) {
  const timer = useTimer(date, endTime);

  return (
    <div className={`rounded-xl p-3 ${timer.isUrgent ? 'bg-red-50 border border-red-200' : 'bg-table-50'}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500">剩余时间</div>
        <div className={`font-mono font-bold text-lg ${timer.isUrgent ? 'text-red-500 animate-pulse-soft' : 'text-table-600'}`}>
          {timer.timeString}
        </div>
      </div>
      {showWarning && timer.isUrgent && (
        <div className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertTriangle size={12} />
          即将结束
        </div>
      )}
    </div>
  );
}
