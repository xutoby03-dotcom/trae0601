import { useMemo } from 'react';
import { useMedicineStore } from '@/store/useMedicineStore';
import { useCabinetStore } from '@/store/useCabinetStore';
import { getMedicineStatus } from '@/utils/statusUtils';
import type { BuildingType } from '@/types';

export const useStockAlert = () => {
  const medicines = useMedicineStore(state => state.medicines);
  const cabinets = useCabinetStore(state => state.cabinets);
  
  const alerts = useMemo(() => {
    return medicines
      .filter(m => {
        const status = getMedicineStatus(m);
        return status === 'insufficient' || status === 'expired';
      })
      .map(m => {
        const cabinet = cabinets.find(c => c.id === m.cabinetId);
        return {
          medicine: m,
          cabinet,
          status: getMedicineStatus(m),
        };
      });
  }, [medicines, cabinets]);
  
  const getAlertsByBuilding = (building: BuildingType) => {
    return alerts.filter(a => a.cabinet?.building === building);
  };
  
  const hasAlerts = alerts.length > 0;
  const expiredCount = alerts.filter(a => a.status === 'expired').length;
  const lowStockCount = alerts.filter(a => a.status === 'insufficient').length;
  
  return {
    alerts,
    hasAlerts,
    expiredCount,
    lowStockCount,
    getAlertsByBuilding,
  };
};
