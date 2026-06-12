import type { AppState } from '@/types';

const STORAGE_KEY = 'pantry_supply_state';

export function loadState(): AppState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as AppState;
    }
  } catch (e) {
    console.error('Failed to load state:', e);
  }
  return null;
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}
