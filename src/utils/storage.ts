import type { PetMissing, Clue } from '@/types';

const PET_MISSING_KEY = 'pet-missing-data';
const CLUE_KEY = 'clue-data';

export function getPetMissingData(): PetMissing[] {
  try {
    const data = localStorage.getItem(PET_MISSING_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function savePetMissingData(data: PetMissing[]): void {
  localStorage.setItem(PET_MISSING_KEY, JSON.stringify(data));
}

export function getClueData(): Clue[] {
  try {
    const data = localStorage.getItem(CLUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveClueData(data: Clue[]): void {
  localStorage.setItem(CLUE_KEY, JSON.stringify(data));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
