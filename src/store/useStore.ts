import { create } from 'zustand';
import { formatISO } from 'date-fns';
import type { Equipment, Probe, Maintenance, Batch, Inspection, TemperatureRecord, AbnormalLog } from '@/types';
import * as mockData from '@/data/mockData';
import { getTempStatus, getDeviation } from '@/utils/tempUtils';

interface StoreState {
  equipments: Equipment[];
  probes: Probe[];
  maintenances: Maintenance[];
  batches: Batch[];
  inspections: Inspection[];
  temperatureRecords: TemperatureRecord[];
  abnormalLogs: AbnormalLog[];
  initData: () => void;
  addBatch: (batch: Omit<Batch, 'id'>) => void;
  updateBatchStatus: (id: string, status: Batch['status']) => void;
  addInspection: (inspection: Omit<Inspection, 'id'>) => void;
  addMaintenance: (maintenance: Omit<Maintenance, 'id'>) => void;
  updateProbeStatus: (id: string, status: Probe['status']) => void;
  calibrateProbe: (id: string) => void;
  resolveAbnormalLog: (id: string) => void;
  updateEquipmentPhoto: (id: string, photo: string, photoName?: string) => void;
}

const generateId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useStore = create<StoreState>((set) => ({
  equipments: [],
  probes: [],
  maintenances: [],
  batches: [],
  inspections: [],
  temperatureRecords: [],
  abnormalLogs: [],

  initData: () => {
    set((state) => {
      if (
        state.equipments.length === 0 &&
        state.probes.length === 0 &&
        state.maintenances.length === 0 &&
        state.batches.length === 0 &&
        state.inspections.length === 0 &&
        state.temperatureRecords.length === 0 &&
        state.abnormalLogs.length === 0
      ) {
        return {
          equipments: mockData.equipments,
          probes: mockData.probes,
          maintenances: mockData.maintenances,
          batches: mockData.batches,
          inspections: mockData.inspections,
          temperatureRecords: mockData.temperatureRecords,
          abnormalLogs: mockData.abnormalLogs,
        };
      }
      return {};
    });
  },

  addBatch: (batch) => {
    const newBatch: Batch = {
      ...batch,
      id: generateId('bt'),
    };
    set((state) => ({
      batches: [...state.batches, newBatch],
    }));
  },

  updateBatchStatus: (id, status) => {
    set((state) => ({
      batches: state.batches.map((batch) =>
        batch.id === id ? { ...batch, status } : batch
      ),
    }));
  },

  addInspection: (inspection) => {
    const newInspection: Inspection = {
      ...inspection,
      id: generateId('in'),
    };

    const tempStatus = getTempStatus(inspection.actualTemp);
    const isTempAbnormal = tempStatus !== 'normal';

    const newTempRecord: TemperatureRecord = {
      time: inspection.time,
      temperature: inspection.actualTemp,
      isAbnormal: isTempAbnormal,
    };

    set((state) => {
      const newState: Partial<StoreState> = {
        inspections: [...state.inspections, newInspection],
        temperatureRecords: [...state.temperatureRecords, newTempRecord],
      };

      if (isTempAbnormal) {
        const fermentingBatches = state.batches
          .filter(
            (batch) =>
              batch.equipmentId === inspection.equipmentId &&
              batch.status === 'fermenting'
          )
          .map((batch) => batch.id);

        const deviation = getDeviation(inspection.actualTemp);
        const type: AbnormalLog['type'] =
          tempStatus === 'high' ? 'temp_high' : 'temp_low';

        const newAbnormalLog: AbnormalLog = {
          id: generateId('ab'),
          inspectionId: newInspection.id,
          batchIds: fermentingBatches,
          type,
          tempDeviation: Math.abs(deviation),
          status: 'pending',
        };

        newState.abnormalLogs = [...state.abnormalLogs, newAbnormalLog];
      }

      return newState;
    });
  },

  addMaintenance: (maintenance) => {
    const newMaintenance: Maintenance = {
      ...maintenance,
      id: generateId('mt'),
    };
    set((state) => ({
      maintenances: [...state.maintenances, newMaintenance],
    }));
  },

  updateProbeStatus: (id, status) => {
    set((state) => ({
      probes: state.probes.map((probe) =>
        probe.id === id ? { ...probe, status } : probe
      ),
    }));
  },

  calibrateProbe: (id) => {
    set((state) => ({
      probes: state.probes.map((probe) =>
        probe.id === id
          ? { ...probe, status: 'normal' as const, lastCalibration: formatISO(new Date()) }
          : probe
      ),
    }));
  },

  resolveAbnormalLog: (id) => {
    set((state) => ({
      abnormalLogs: state.abnormalLogs.map((log) =>
        log.id === id ? { ...log, status: 'resolved' } : log
      ),
    }));
  },

  updateEquipmentPhoto: (id, photo, photoName) => {
    set((state) => ({
      equipments: state.equipments.map((eq) =>
        eq.id === id ? { ...eq, photo, photoName } : eq
      ),
    }));
  },
}));
