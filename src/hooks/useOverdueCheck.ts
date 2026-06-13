import { useEffect } from 'react';
import { useComplaintStore } from '@/store/useComplaintStore';

export const useOverdueCheck = (): void => {
  const checkOverdue = useComplaintStore((state) => state.checkOverdue);
  const isLoading = useComplaintStore((state) => state.isLoading);

  useEffect(() => {
    if (isLoading) return;

    checkOverdue();
    const interval = setInterval(() => {
      checkOverdue();
    }, 10000);

    return () => clearInterval(interval);
  }, [checkOverdue, isLoading]);
};
