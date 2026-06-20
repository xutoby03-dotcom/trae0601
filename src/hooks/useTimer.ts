import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds: number = 0) {
  const [seconds, setSeconds] = useState<number>(initialSeconds);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimerInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearTimerInterval();
  }, [clearTimerInterval]);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  }, [isRunning]);

  const pause = useCallback(() => {
    setIsRunning(false);
    clearTimerInterval();
  }, [clearTimerInterval]);

  const reset = useCallback(() => {
    setIsRunning(false);
    clearTimerInterval();
    setSeconds(initialSeconds);
  }, [initialSeconds, clearTimerInterval]);

  const setSecondsValue = useCallback((value: number) => {
    setSeconds(Math.max(0, Math.floor(value)));
  }, []);

  return {
    seconds,
    isRunning,
    start,
    pause,
    reset,
    setSeconds: setSecondsValue,
  };
}

export type UseTimerReturn = ReturnType<typeof useTimer>;
