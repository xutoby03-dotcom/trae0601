import { useState, useEffect } from 'react';

export function useNow(intervalMs: number = 30000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return now;
}

export function formatCountdown(target: Date, now: Date): { text: string; level: 'safe' | 'urgent' | 'critical' | 'missed' } {
  const diffMs = target.getTime() - now.getTime();
  const diffMins = Math.round(diffMs / 60000);

  if (diffMins < 0) {
    return { text: '已错过', level: 'missed' };
  }
  if (diffMins <= 10) {
    const mins = diffMins;
    return { text: mins === 0 ? '不到1分钟' : `${mins} 分钟`, level: 'critical' };
  }
  if (diffMins <= 30) {
    return { text: `${diffMins} 分钟`, level: 'urgent' };
  }
  if (diffMins < 60) {
    return { text: `${diffMins} 分钟`, level: 'safe' };
  }
  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  if (hours < 24) {
    return {
      text: mins === 0 ? `${hours} 小时` : `${hours}h ${mins}m`,
      level: 'safe',
    };
  }
  const days = Math.floor(hours / 24);
  const remainHours = hours % 24;
  return {
    text: remainHours === 0 ? `${days} 天` : `${days}d ${remainHours}h`,
    level: 'safe',
  };
}
