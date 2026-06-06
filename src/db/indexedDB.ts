import { openDB, IDBPDatabase } from 'idb';
import { GameState } from '../store/types';
import { INITIAL_COINS, INITIAL_TANK_LEVEL } from '../utils/constants';

const DB_NAME = 'aquarium-db';
const DB_VERSION = 1;
const STORE_NAME = 'gameState';

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
  }
  return dbPromise;
}

export async function saveGameState(state: GameState): Promise<void> {
  try {
    const db = await getDB();
    await db.put(STORE_NAME, state, 'main');
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
}

export async function loadGameState(): Promise<GameState | null> {
  try {
    const db = await getDB();
    const state = await db.get(STORE_NAME, 'main');
    return state || null;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
}

export function createInitialState(): GameState {
  const now = Date.now();
  return {
    coins: INITIAL_COINS,
    tankLevel: INITIAL_TANK_LEVEL,
    fish: [],
    decorations: [],
    food: [],
    eggs: [],
    lastLoginTime: now,
    lastSettleTime: now,
    selectedFishId: null,
    shopTab: 'fish',
  };
}

export async function clearGameState(): Promise<void> {
  try {
    const db = await getDB();
    await db.clear(STORE_NAME);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
}
