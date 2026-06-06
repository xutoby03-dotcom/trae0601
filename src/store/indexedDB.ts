import { Skin, GameRecord } from '@/types/game';

const DB_NAME = 'ParkourGameDB';
const DB_VERSION = 1;

let db: IDBDatabase | null = null;

export const initDB = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      db = request.result;
      resolve();
    };

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;

      if (!database.objectStoreNames.contains('skins')) {
        const skinStore = database.createObjectStore('skins', { keyPath: 'id' });
        skinStore.createIndex('owned', 'owned', { unique: false });
      }

      if (!database.objectStoreNames.contains('records')) {
        const recordStore = database.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
        recordStore.createIndex('distance', 'distance', { unique: false });
        recordStore.createIndex('coins', 'coins', { unique: false });
        recordStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!database.objectStoreNames.contains('settings')) {
        database.createObjectStore('settings', { keyPath: 'key' });
      }

      if (!database.objectStoreNames.contains('totalCoins')) {
        database.createObjectStore('totalCoins', { keyPath: 'id' });
      }
    };
  });
};

export const getDB = (): IDBDatabase => {
  if (!db) throw new Error('Database not initialized');
  return db;
};

export const initSkins = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('skins', 'readwrite');
    const store = transaction.objectStore('skins');

    const defaultSkins: Skin[] = [
      {
        id: 'default',
        name: '经典跑者',
        price: 0,
        colors: { body: '#3B82F6', accent: '#60A5FA' },
        owned: true,
        equipped: true,
      },
      {
        id: 'fire',
        name: '烈焰战士',
        price: 500,
        colors: { body: '#EF4444', accent: '#F97316' },
        owned: false,
        equipped: false,
      },
      {
        id: 'ice',
        name: '冰霜侠客',
        price: 500,
        colors: { body: '#06B6D4', accent: '#22D3EE' },
        owned: false,
        equipped: false,
      },
      {
        id: 'gold',
        name: '黄金跑者',
        price: 1000,
        colors: { body: '#EAB308', accent: '#FDE047' },
        owned: false,
        equipped: false,
      },
      {
        id: 'space',
        name: '星际旅人',
        price: 1500,
        colors: { body: '#8B5CF6', accent: '#A78BFA' },
        owned: false,
        equipped: false,
      },
      {
        id: 'ninja',
        name: '暗夜忍者',
        price: 2000,
        colors: { body: '#1F2937', accent: '#4B5563' },
        owned: false,
        equipped: false,
      },
    ];

    let count = 0;
    defaultSkins.forEach((skin) => {
      const req = store.put(skin);
      req.onsuccess = () => {
        count++;
        if (count === defaultSkins.length) resolve();
      };
      req.onerror = () => reject(req.error);
    });
  });
};

export const getSkins = (): Promise<Skin[]> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('skins', 'readonly');
    const store = transaction.objectStore('skins');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const updateSkin = (skin: Skin): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('skins', 'readwrite');
    const store = transaction.objectStore('skins');
    const request = store.put(skin);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getEquippedSkin = (): Promise<Skin | undefined> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('skins', 'readonly');
    const store = transaction.objectStore('skins');
    const request = store.getAll();

    request.onsuccess = () => {
      const skins = request.result;
      resolve(skins.find((s) => s.equipped));
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveRecord = (record: Omit<GameRecord, 'id'>): Promise<number> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('records', 'readwrite');
    const store = transaction.objectStore('records');
    const request = store.add(record);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
};

export const getTopRecords = (by: 'distance' | 'coins', limit = 10): Promise<GameRecord[]> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('records', 'readonly');
    const store = transaction.objectStore('records');
    const index = store.index(by);
    const request = index.openCursor(null, 'prev');

    const records: GameRecord[] = [];

    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor && records.length < limit) {
        records.push(cursor.value);
        cursor.continue();
      } else {
        resolve(records);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

export const getTotalCoins = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('totalCoins', 'readonly');
    const store = transaction.objectStore('totalCoins');
    const request = store.get('total');

    request.onsuccess = () => {
      resolve(request.result?.amount || 0);
    };
    request.onerror = () => reject(request.error);
  });
};

export const updateTotalCoins = (amount: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('totalCoins', 'readwrite');
    const store = transaction.objectStore('totalCoins');
    const request = store.put({ id: 'total', amount });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getSetting = <T>(key: string, defaultValue: T): Promise<T> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('settings', 'readonly');
    const store = transaction.objectStore('settings');
    const request = store.get(key);

    request.onsuccess = () => {
      resolve(request.result?.value ?? defaultValue);
    };
    request.onerror = () => reject(request.error);
  });
};

export const saveSetting = (key: string, value: unknown): Promise<void> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('settings', 'readwrite');
    const store = transaction.objectStore('settings');
    const request = store.put({ key, value });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const getBestDistance = (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const transaction = getDB().transaction('records', 'readonly');
    const store = transaction.objectStore('records');
    const index = store.index('distance');
    const request = index.openCursor(null, 'prev');

    request.onsuccess = () => {
      const cursor = request.result;
      resolve(cursor?.value.distance || 0);
    };
    request.onerror = () => reject(request.error);
  });
};
