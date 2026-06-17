import type { Umbrella, ClaimApplication, ShareRecord, ScrapRecord } from '@/types';
import { generateMockUmbrellas, generateMockClaims, generateMockShareRecords, generateMockScrapRecords } from '@/utils/mockData';

const STORAGE_KEYS = {
  UMBRELLAS: 'umbrella_wall_umbrellas',
  CLAIMS: 'umbrella_wall_claims',
  SHARE_RECORDS: 'umbrella_wall_share_records',
  SCRAP_RECORDS: 'umbrella_wall_scrap_records',
  INITIALIZED: 'umbrella_wall_initialized',
} as const;

const getFromStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setToStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

export const initializeMockData = (): void => {
  const isInitialized = getFromStorage(STORAGE_KEYS.INITIALIZED, false);
  if (isInitialized) return;

  const mockUmbrellas = generateMockUmbrellas(25);
  const mockClaims = generateMockClaims(mockUmbrellas);
  const mockShareRecords = generateMockShareRecords(mockUmbrellas);
  const mockScrapRecords = generateMockScrapRecords(mockUmbrellas);

  setToStorage(STORAGE_KEYS.UMBRELLAS, mockUmbrellas);
  setToStorage(STORAGE_KEYS.CLAIMS, mockClaims);
  setToStorage(STORAGE_KEYS.SHARE_RECORDS, mockShareRecords);
  setToStorage(STORAGE_KEYS.SCRAP_RECORDS, mockScrapRecords);
  setToStorage(STORAGE_KEYS.INITIALIZED, true);
};

export const storage = {
  umbrellas: {
    getAll: (): Umbrella[] => getFromStorage<Umbrella[]>(STORAGE_KEYS.UMBRELLAS, []),
    setAll: (data: Umbrella[]): void => setToStorage(STORAGE_KEYS.UMBRELLAS, data),
  },
  claims: {
    getAll: (): ClaimApplication[] => getFromStorage<ClaimApplication[]>(STORAGE_KEYS.CLAIMS, []),
    setAll: (data: ClaimApplication[]): void => setToStorage(STORAGE_KEYS.CLAIMS, data),
  },
  shareRecords: {
    getAll: (): ShareRecord[] => getFromStorage<ShareRecord[]>(STORAGE_KEYS.SHARE_RECORDS, []),
    setAll: (data: ShareRecord[]): void => setToStorage(STORAGE_KEYS.SHARE_RECORDS, data),
  },
  scrapRecords: {
    getAll: (): ScrapRecord[] => getFromStorage<ScrapRecord[]>(STORAGE_KEYS.SCRAP_RECORDS, []),
    setAll: (data: ScrapRecord[]): void => setToStorage(STORAGE_KEYS.SCRAP_RECORDS, data),
  },
  reset: (): void => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  },
};
