import { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  startTime?: Date;
  running?: boolean;
}

function formatTime(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return {
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
  };
}

export default function Timer({ startTime, running = false }: TimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running || !startTime) {
      setElapsed(0);
      return;
    }

    const initial = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
    setElapsed(initial);

    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, running]);

  const { hours, minutes, seconds } = formatTime(elapsed);

  return (
    <div className="flex flex-col items-center">
      <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 px-4 py-2 mb-4">
        <TimerIcon className="h-4 w-4 text-orange-600 animate-pulse" />
        <span className="text-sm font-medium text-orange-700">使用时间</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
            <span className="relative text-5xl font-bold tabular-nums text-white tracking-wider">{hours}</span>
          </div>
          <span className="mt-2 text-xs font-medium text-slate-500">时</span>
        </div>
        <div className="pb-5">
          <span className="text-4xl font-bold text-slate-400 animate-pulse">:</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
            <span className="relative text-5xl font-bold tabular-nums text-white tracking-wider">{minutes}</span>
          </div>
          <span className="mt-2 text-xs font-medium text-slate-500">分</span>
        </div>
        <div className="pb-5">
          <span className="text-4xl font-bold text-slate-400 animate-pulse">:</span>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 px-5 py-4 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent" />
            <span className="relative text-5xl font-bold tabular-nums text-white tracking-wider">{seconds}</span>
          </div>
          <span className="mt-2 text-xs font-medium text-slate-500">秒</span>
        </div>
      </div>
    </div>
  );
}
