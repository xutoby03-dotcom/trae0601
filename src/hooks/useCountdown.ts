import { useState, useEffect } from 'react';
import { calcRemainingSeconds, getCountdownStatus } from '@/utils/time';
import type { CountdownStatus } from '@/types';

export function useCountdown(startTime: string, targetSeconds: number) {
  const [remaining, setRemaining] = useState(() => calcRemainingSeconds(startTime, targetSeconds));
  const [status, setStatus] = useState<CountdownStatus>(() =>
    getCountdownStatus(remaining, targetSeconds)
  );

  useEffect(() => {
    const tick = () => {
      const r = calcRemainingSeconds(startTime, targetSeconds);
      setRemaining(r);
      setStatus(getCountdownStatus(r, targetSeconds));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [startTime, targetSeconds]);

  return { remaining, status };
}
