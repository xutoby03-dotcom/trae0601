import { useEffect } from 'react';
import { useMedicineStore } from '@/store/useMedicineStore';

export const useExpiryCheck = () => {
  const checkExpiry = useMedicineStore(state => state.checkExpiry);
  
  useEffect(() => {
    checkExpiry();
    
    const interval = setInterval(() => {
      checkExpiry();
    }, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkExpiry]);
};
