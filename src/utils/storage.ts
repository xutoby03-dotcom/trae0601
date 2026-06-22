const STORAGE_KEYS = {
  CELLS: 'insect_hotel_cells',
  OBSERVATIONS: 'insect_hotel_observations',
  INITIALIZED: 'insect_hotel_initialized',
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save to storage:', e)
  }
}

export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (e) {
    console.error('Failed to load from storage:', e)
    return defaultValue
  }
}

export function saveCells(cells: unknown[]): void {
  saveToStorage(STORAGE_KEYS.CELLS, cells)
}

export function loadCells<T>(defaultValue: T): T {
  return loadFromStorage(STORAGE_KEYS.CELLS, defaultValue)
}

export function saveObservations(observations: unknown[]): void {
  saveToStorage(STORAGE_KEYS.OBSERVATIONS, observations)
}

export function loadObservations<T>(defaultValue: T): T {
  return loadFromStorage(STORAGE_KEYS.OBSERVATIONS, defaultValue)
}

export function isInitialized(): boolean {
  return localStorage.getItem(STORAGE_KEYS.INITIALIZED) === 'true'
}

export function markInitialized(): void {
  localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true')
}
