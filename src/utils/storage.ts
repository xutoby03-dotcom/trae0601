import type { Scene } from '@/types';

const STORAGE_KEY = 'sandbox-scene-data';

export const loadSceneFromStorage = (): Scene | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load scene from localStorage:', error);
  }
  return null;
};

export const saveSceneToStorage = (scene: Scene): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scene));
  } catch (error) {
    console.error('Failed to save scene to localStorage:', error);
  }
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
