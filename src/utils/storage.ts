type StorageValue = string | number | boolean | object | null

interface StorageOptions {
  expires?: number
}

interface StoredData<T> {
  value: T
  timestamp: number
  expires?: number
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  return window.localStorage
}

export function getItem<T extends StorageValue = StorageValue>(key: string): T | null {
  const storage = getStorage()
  if (!storage) return null

  try {
    const item = storage.getItem(key)
    if (!item) return null

    const data: StoredData<T> = JSON.parse(item)
    
    if (data.expires && Date.now() > data.expires) {
      storage.removeItem(key)
      return null
    }

    return data.value
  } catch {
    return null
  }
}

export function setItem<T extends StorageValue>(
  key: string,
  value: T,
  options: StorageOptions = {}
): boolean {
  const storage = getStorage()
  if (!storage) return false

  try {
    const data: StoredData<T> = {
      value,
      timestamp: Date.now(),
      ...(options.expires && { expires: Date.now() + options.expires })
    }
    storage.setItem(key, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

export function removeItem(key: string): boolean {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function clear(): boolean {
  const storage = getStorage()
  if (!storage) return false

  try {
    storage.clear()
    return true
  } catch {
    return false
  }
}
