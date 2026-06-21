const STORAGE_KEYS = {
  FABRICS: 'fabric_touch_library_fabrics',
  BOARDS: 'fabric_touch_library_boards',
  BOARD_ITEMS: 'fabric_touch_library_board_items',
  INITIALIZED: 'fabric_touch_library_initialized',
};

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  getFabrics() {
    return this.get(STORAGE_KEYS.FABRICS, []);
  },

  setFabrics(fabrics: unknown[]) {
    this.set(STORAGE_KEYS.FABRICS, fabrics);
  },

  getBoards() {
    return this.get(STORAGE_KEYS.BOARDS, []);
  },

  setBoards(boards: unknown[]) {
    this.set(STORAGE_KEYS.BOARDS, boards);
  },

  getBoardItems() {
    return this.get(STORAGE_KEYS.BOARD_ITEMS, []);
  },

  setBoardItems(items: unknown[]) {
    this.set(STORAGE_KEYS.BOARD_ITEMS, items);
  },

  isInitialized() {
    return this.get(STORAGE_KEYS.INITIALIZED, false);
  },

  setInitialized(value: boolean) {
    this.set(STORAGE_KEYS.INITIALIZED, value);
  },
};

export const compressImage = (file: File, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
