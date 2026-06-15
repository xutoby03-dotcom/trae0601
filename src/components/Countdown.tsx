import { useState, useEffect } from 'react';
import { formatCountdown } from '@/utils/time';

interface CountdownProps {
  targetTime: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Countdown({ targetTime, size = 'md' }: CountdownProps) {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const target = new Date(targetTime).getTime();
  const remaining = target - now;
  const { hours, minutes, seconds, isNegative } = formatCountdown(remaining);
  
  const sizeClasses = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  };
  
  return (
    <div className={`font-mono font-bold tabular-nums ${sizeClasses[size]} ${isNegative ? 'text-coral-500' : 'text-matcha-600'}`}>
      {isNegative && <span className="mr-1">-</span>}
      <span className="inline-block min-w-[2ch]">{hours}</span>
      <span className="mx-0.5 opacity-60">:</span>
      <span className="inline-block min-w-[2ch]">{minutes}</span>
      <span className="mx-0.5 opacity-60">:</span>
      <span className="inline-block min-w-[2ch]">{seconds}</span>
    </div>
  );
}
