import { create } from "zustand";
import { apiClient } from "@/lib/apiClient";
import type { Pet, VaccineRecord } from "shared/types";

interface PetState {
  pets: Pet[];
  currentPet: Pet | null;
  vaccineRecords: VaccineRecord[];
  isLoading: boolean;
  error: string | null;
  fetchPets: (params?: Record<string, unknown>) => Promise<void>;
  fetchPetById: (id: number) => Promise<void>;
  fetchVaccineRecords: (petId: number) => Promise<void>;
  createPet: (petData: Omit<Pet, "id" | "createdAt" | "updatedAt">) => Promise<{ success: boolean; message: string; data?: Pet }>;
  updatePet: (id: number, petData: Partial<Pet>) => Promise<{ success: boolean; message: string }>;
  deletePet: (id: number) => Promise<{ success: boolean; message: string }>;
  setCurrentPet: (pet: Pet | null) => void;
  clearError: () => void;
}

export const usePetStore = create<PetState>((set) => ({
  pets: [],
  currentPet: null,
  vaccineRecords: [],
  isLoading: false,
  error: null,

  fetchPets: async (params) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Pet[]>("/pets", { params });
      if (response.success && response.data) {
        set({ pets: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "获取宠物列表失败",
        isLoading: false,
      });
    }
  },

  fetchPetById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<Pet>(`/pets/${id}`);
      if (response.success && response.data) {
        set({ currentPet: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "获取宠物详情失败",
        isLoading: false,
      });
    }
  },

  fetchVaccineRecords: async (petId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<VaccineRecord[]>(`/pets/${petId}/vaccines`);
      if (response.success && response.data) {
        set({ vaccineRecords: response.data, isLoading: false });
      } else {
        set({ error: response.message, isLoading: false });
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "获取疫苗记录失败",
        isLoading: false,
      });
    }
  },

  createPet: async (petData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<Pet>("/pets", petData);
      set({ isLoading: false });
      if (response.success && response.data) {
        set((state) => ({
          pets: [...state.pets, response.data!],
        }));
        return { success: true, message: "创建成功", data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error instanceof Error ? error.message : "创建宠物失败",
      };
    }
  },

  updatePet: async (id, petData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<Pet>(`/pets/${id}`, petData);
      set({ isLoading: false });
      if (response.success && response.data) {
        set((state) => ({
          pets: state.pets.map((pet) => (pet.id === id ? response.data! : pet)),
          currentPet: state.currentPet?.id === id ? response.data : state.currentPet,
        }));
        return { success: true, message: "更新成功" };
      }
      return { success: false, message: response.message };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error instanceof Error ? error.message : "更新宠物失败",
      };
    }
  },

  deletePet: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.delete(`/pets/${id}`);
      set({ isLoading: false });
      if (response.success) {
        set((state) => ({
          pets: state.pets.filter((pet) => pet.id !== id),
          currentPet: state.currentPet?.id === id ? null : state.currentPet,
        }));
        return { success: true, message: "删除成功" };
      }
      return { success: false, message: response.message };
    } catch (error) {
      set({ isLoading: false });
      return {
        success: false,
        message: error instanceof Error ? error.message : "删除宠物失败",
      };
    }
  },

  setCurrentPet: (pet) => {
    set({ currentPet: pet });
  },

  clearError: () => {
    set({ error: null });
  },
}));
