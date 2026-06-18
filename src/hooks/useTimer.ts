import { useState, useEffect } from 'react';

export function useTimer(endTime: string) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const [endH, endM] = endTime.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(endH, endM, 0, 0);

  const diffMs = endDate.getTime() - now.getTime();
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const isUrgent = totalSeconds > 0 && totalSeconds <= 600;
  const isExpired = totalSeconds <= 0;

  return {
    hours,
    minutes,
    seconds,
    totalSeconds,
    isUrgent,
    isExpired,
    timeString: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
  };
}
