import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChildProfile } from '@/types';
import { generateId, STORAGE_KEYS } from '@/utils/storage';

interface ChildProfileState {
  childProfile: ChildProfile | null;
  setChildProfile: (profile: Omit<ChildProfile, 'id' | 'createdAt' | 'updatedAt'>) => void;
  setChildProfileDirect: (profile: ChildProfile) => void;
  updateChildProfile: (data: Partial<ChildProfile>) => void;
  clearChildProfile: () => void;
}

export const useChildProfileStore = create<ChildProfileState>()(
  persist(
    (set, get) => ({
      childProfile: null,
      
      setChildProfile: (profileData) => {
        const now = new Date().toISOString();
        const profile: ChildProfile = {
          ...profileData,
          id: generateId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ childProfile: profile });
      },
      
      setChildProfileDirect: (profile) => {
        set({ childProfile: profile });
      },
      
      updateChildProfile: (data) => {
        const current = get().childProfile;
        if (!current) return;
        
        const updated: ChildProfile = {
          ...current,
          ...data,
          updatedAt: new Date().toISOString(),
        };
        set({ childProfile: updated });
      },
      
      clearChildProfile: () => {
        set({ childProfile: null });
      },
    }),
    {
      name: STORAGE_KEYS.CHILD_PROFILE,
    }
  )
);
