import { useEffect, useRef } from 'react';
import { useModelStore } from '@/store/useModelStore';

export const useTimer = (modelId: string) => {
  const { timers, tickTimer, checkStaleModels } = useModelStore();
  const timer = timers.find((t) => t.modelId === modelId);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (timer?.isRunning && timer.remaining > 0) {
      intervalRef.current = setInterval(() => {
        tickTimer(modelId);
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer?.isRunning, modelId, tickTimer]);

  useEffect(() => {
    checkStaleModels();
  }, [checkStaleModels]);

  return timer;
};
