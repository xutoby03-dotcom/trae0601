import { useEffect } from 'react';
import { useFoodStore } from '../store/useFoodStore';

export function useAutoExpire() {
  const checkAndExpireFoods = useFoodStore((state) => state.checkAndExpireFoods);

  useEffect(() => {
    checkAndExpireFoods();

    const interval = setInterval(() => {
      checkAndExpireFoods();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkAndExpireFoods]);
}
