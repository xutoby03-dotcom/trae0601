import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Vehicle } from '@/types';
import { generateId, STORAGE_KEYS } from '@/utils/storage';

interface VehicleState {
  vehicles: Vehicle[];
  setVehicles: (vehicles: Vehicle[]) => void;
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateVehicle: (id: string, data: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  getVehicleById: (id: string) => Vehicle | undefined;
}

export const useVehicleStore = create<VehicleState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      
      setVehicles: (vehicles) => set({ vehicles }),
      
      addVehicle: (vehicleData) => {
        const now = new Date().toISOString();
        const newVehicle: Vehicle = {
          ...vehicleData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ vehicles: [...get().vehicles, newVehicle] });
      },
      
      updateVehicle: (id, data) => {
        set({
          vehicles: get().vehicles.map(v =>
            v.id === id ? { ...v, ...data, updatedAt: new Date().toISOString() } : v
          ),
        });
      },
      
      deleteVehicle: (id) => {
        set({ vehicles: get().vehicles.filter(v => v.id !== id) });
      },
      
      getVehicleById: (id) => {
        return get().vehicles.find(v => v.id === id);
      },
    }),
    {
      name: STORAGE_KEYS.VEHICLES,
    }
  )
);
