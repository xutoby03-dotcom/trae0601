import { useMemo } from 'react';
import { useComplaintStore } from '@/store/useComplaintStore';
import { calculateStatistics } from '@/utils/statistics';
import { Statistics } from '@/types';

export const useStatistics = (): Statistics => {
  const complaints = useComplaintStore((state) => state.complaints);

  return useMemo(() => calculateStatistics(complaints), [complaints]);
};
