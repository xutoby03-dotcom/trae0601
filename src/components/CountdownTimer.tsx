import { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';
import { getRemainingTime } from '../utils/time';

interface CountdownTimerProps {
  endTime: string;
  edibleHours: number;
  showIcon?: boolean;
}

export function CountdownTimer({ endTime, edibleHours, showIcon = true }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(() => getRemainingTime(endTime, edibleHours));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getRemainingTime(endTime, edibleHours));
    }, 60000);

    return () => clearInterval(timer);
  }, [endTime, edibleHours]);

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 text-red-600 font-medium">
        {showIcon && <AlertTriangle className="w-4 h-4" />}
        <span className="text-sm">已过期</span>
      </div>
    );
  }

  const isUrgent = timeLeft.totalMinutes < 60;
  const isWarning = timeLeft.totalMinutes < 120;

  return (
    <div
      className={`inline-flex items-center gap-1.5 font-medium ${
        isUrgent
          ? 'text-red-600'
          : isWarning
          ? 'text-amber-600'
          : 'text-emerald-600'
      }`}
    >
      {showIcon && <Clock className="w-4 h-4" />}
      <span className="text-sm">
        {timeLeft.hours > 0 && `${timeLeft.hours}小时`}
        {timeLeft.minutes}分钟
      </span>
    </div>
  );
}
