import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Installation } from '@/types';
import { generateId, STORAGE_KEYS } from '@/utils/storage';

interface InstallationState {
  installations: Installation[];
  setInstallations: (installations: Installation[]) => void;
  addInstallation: (installation: Omit<Installation, 'id' | 'createdAt'>) => void;
  updateInstallation: (id: string, data: Partial<Installation>) => void;
  deleteInstallation: (id: string) => void;
  getInstallationById: (id: string) => Installation | undefined;
  getInstallationsByVehicleId: (vehicleId: string) => Installation[];
  getInstallationsBySeatId: (seatId: string) => Installation[];
}

export const useInstallationStore = create<InstallationState>()(
  persist(
    (set, get) => ({
      installations: [],
      
      setInstallations: (installations) => set({ installations }),
      
      addInstallation: (installationData) => {
        const newInstallation: Installation = {
          ...installationData,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set({ installations: [...get().installations, newInstallation] });
      },
      
      updateInstallation: (id, data) => {
        set({
          installations: get().installations.map(i =>
            i.id === id ? { ...i, ...data } : i
          ),
        });
      },
      
      deleteInstallation: (id) => {
        set({ installations: get().installations.filter(i => i.id !== id) });
      },
      
      getInstallationById: (id) => {
        return get().installations.find(i => i.id === id);
      },
      
      getInstallationsByVehicleId: (vehicleId) => {
        return get().installations.filter(i => i.vehicleId === vehicleId);
      },
      
      getInstallationsBySeatId: (seatId) => {
        return get().installations.filter(i => i.seatId === seatId);
      },
    }),
    {
      name: STORAGE_KEYS.INSTALLATIONS,
    }
  )
);
