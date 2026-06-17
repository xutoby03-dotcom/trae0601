import { create } from 'zustand';
import type { Cylinder, InflationRecord, AbnormalRecord, CylinderStatus } from '@/types';
import { mockCylinders, mockInflationRecords, mockAbnormalRecords } from '@/data/mockData';
import { generateId, calculateRemainingPressure, isLowPressure } from '@/utils/calculator';
import { isExpired } from '@/utils/date';

interface CylinderState {
  cylinders: Cylinder[];
  inflationRecords: InflationRecord[];
  abnormalRecords: AbnormalRecord[];
  addInflation: (data: {
    cylinderId: string;
    orderId: string;
    balloonTypeId: string;
    quantity: number;
    gasUsed: number;
    operator: string;
  }) => void;
  addAbnormalRecord: (data: {
    cylinderId: string;
    type: AbnormalRecord['type'];
    description: string;
    photoUrl?: string;
    reporter: string;
  }) => void;
  getCylinderById: (id: string) => Cylinder | undefined;
  getInflationByCylinder: (cylinderId: string) => InflationRecord[];
  getAbnormalByCylinder: (cylinderId: string) => AbnormalRecord[];
  getAvailableCylinders: () => Cylinder[];
}

const updateCylinderStatus = (cylinder: Cylinder): Cylinder => {
  if (isExpired(cylinder.nextInspectionDate)) {
    return { ...cylinder, status: 'expired' };
  }
  if (isLowPressure(cylinder.pressure, cylinder.ratedPressure)) {
    return { ...cylinder, status: 'low' };
  }
  return { ...cylinder, status: 'normal' };
};

export const useCylinderStore = create<CylinderState>((set, get) => ({
  cylinders: mockCylinders.map(updateCylinderStatus),
  inflationRecords: mockInflationRecords,
  abnormalRecords: mockAbnormalRecords,

  addInflation: (data) => {
    const { cylinders, inflationRecords } = get();
    const cylinder = cylinders.find((c) => c.id === data.cylinderId);
    
    if (!cylinder) return;

    const newPressure = calculateRemainingPressure(
      cylinder.pressure,
      cylinder.ratedPressure,
      cylinder.capacity,
      data.gasUsed
    );

    const newRecord: InflationRecord = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    const updatedCylinders = cylinders.map((c) => {
      if (c.id === data.cylinderId) {
        return updateCylinderStatus({ ...c, pressure: newPressure });
      }
      return c;
    });

    set({
      cylinders: updatedCylinders,
      inflationRecords: [newRecord, ...inflationRecords],
    });
  },

  addAbnormalRecord: (data) => {
    const { abnormalRecords, cylinders } = get();
    
    const newRecord: AbnormalRecord = {
      id: generateId(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    const updatedCylinders = cylinders.map((c) => {
      if (c.id === data.cylinderId) {
        return { ...c, status: 'abnormal' as CylinderStatus };
      }
      return c;
    });

    set({
      abnormalRecords: [newRecord, ...abnormalRecords],
      cylinders: updatedCylinders,
    });
  },

  getCylinderById: (id) => {
    return get().cylinders.find((c) => c.id === id);
  },

  getInflationByCylinder: (cylinderId) => {
    return get().inflationRecords
      .filter((r) => r.cylinderId === cylinderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAbnormalByCylinder: (cylinderId) => {
    return get().abnormalRecords
      .filter((r) => r.cylinderId === cylinderId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getAvailableCylinders: () => {
    return get().cylinders.filter(
      (c) => c.status !== 'expired' && c.status !== 'abnormal'
    );
  },
}));
