export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const generateCableCode = (prefix: string = 'CBL', index: number = 1): string => {
  const paddedIndex = String(index).padStart(4, '0');
  return `${prefix}-${paddedIndex}`;
};
