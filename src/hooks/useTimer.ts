import { useState, useEffect, useMemo } from 'react';

export function useTimer(dateStr?: string, endTimeStr?: string) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    if (!dateStr || !endTimeStr) return;

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, [dateStr, endTimeStr]);

  const result = useMemo(() => {
    if (!dateStr || !endTimeStr) {
      return {
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0,
        isUrgent: false,
        isExpired: true,
        timeString: '00:00:00',
      };
    }

    const [endH, endM] = endTimeStr.split(':').map(Number);
    const [year, month, day] = dateStr.split('-').map(Number);
    const endDate = new Date(year, month - 1, day, endH, endM, 0, 0);

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
  }, [dateStr, endTimeStr, now]);

  return result;
}
