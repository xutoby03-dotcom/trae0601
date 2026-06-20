import { useEffect } from 'react';
import { useModelStore } from '@/store/useModelStore';

export const useStaleCheck = () => {
  const { checkStaleModels } = useModelStore();

  useEffect(() => {
    checkStaleModels();

    const interval = setInterval(() => {
      checkStaleModels();
    }, 60000);

    return () => clearInterval(interval);
  }, [checkStaleModels]);
};
