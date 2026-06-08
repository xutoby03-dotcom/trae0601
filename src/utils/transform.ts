const toCamel = (s: string): string =>
  s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())

export function transformKeys<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(obj)) {
    result[toCamel(key)] = value
  }
  return result as T
}

export function transformItem(row: Record<string, unknown>) {
  const item = transformKeys(row) as Record<string, unknown>
  try {
    item.photos = JSON.parse(String(item.photos || '[]'))
  } catch {
    item.photos = []
  }
  item.accessoriesComplete = Boolean(item.accessoriesComplete)
  item.freeShipping = Boolean(item.freeShipping)
  return item
}
