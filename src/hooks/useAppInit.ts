import { useEffect } from 'react';
import { useCabinetStore } from '@/store/useCabinetStore';
import { useMedicineStore } from '@/store/useMedicineStore';
import { useRecordStore } from '@/store/useRecordStore';

export const useAppInit = () => {
  const initCabinets = useCabinetStore(state => state.initData);
  const initMedicines = useMedicineStore(state => state.initData);
  const initRecords = useRecordStore(state => state.initData);
  
  useEffect(() => {
    initCabinets();
    initMedicines();
    initRecords();
  }, [initCabinets, initMedicines, initRecords]);
};
