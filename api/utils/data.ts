import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { Session, Guest, Feedback } from '../../shared/types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '..', 'data');

function readJSONFile<T>(filename: string): T[] {
  const filePath = path.join(dataDir, filename);
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T[];
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

function writeJSONFile<T>(filename: string, data: T[]): void {
  const filePath = path.join(dataDir, filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const sessionsDB = {
  getAll: (): Session[] => readJSONFile<Session>('sessions.json'),
  getById: (id: string): Session | undefined => {
    const sessions = readJSONFile<Session>('sessions.json');
    return sessions.find(s => s.id === id);
  },
  create: (session: Omit<Session, 'id'>): Session => {
    const sessions = readJSONFile<Session>('sessions.json');
    const newSession: Session = {
      ...session,
      id: generateId('sess'),
    };
    sessions.push(newSession);
    writeJSONFile('sessions.json', sessions);
    return newSession;
  },
  update: (id: string, updates: Partial<Session>): Session | undefined => {
    const sessions = readJSONFile<Session>('sessions.json');
    const index = sessions.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    sessions[index] = { ...sessions[index], ...updates };
    writeJSONFile('sessions.json', sessions);
    return sessions[index];
  },
  delete: (id: string): boolean => {
    const sessions = readJSONFile<Session>('sessions.json');
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length === sessions.length) return false;
    writeJSONFile('sessions.json', filtered);
    return true;
  },
};

export const guestsDB = {
  getAll: (): Guest[] => readJSONFile<Guest>('guests.json'),
  getById: (id: string): Guest | undefined => {
    const guests = readJSONFile<Guest>('guests.json');
    return guests.find(g => g.id === id);
  },
  getBySessionId: (sessionId: string): Guest[] => {
    const guests = readJSONFile<Guest>('guests.json');
    return guests.filter(g => g.sessionId === sessionId);
  },
  create: (guest: Omit<Guest, 'id' | 'createdAt'>): Guest => {
    const guests = readJSONFile<Guest>('guests.json');
    const newGuest: Guest = {
      ...guest,
      id: generateId('guest'),
      createdAt: new Date().toISOString(),
    };
    guests.push(newGuest);
    writeJSONFile('guests.json', guests);
    return newGuest;
  },
  update: (id: string, updates: Partial<Guest>): Guest | undefined => {
    const guests = readJSONFile<Guest>('guests.json');
    const index = guests.findIndex(g => g.id === id);
    if (index === -1) return undefined;
    guests[index] = { ...guests[index], ...updates };
    writeJSONFile('guests.json', guests);
    return guests[index];
  },
  delete: (id: string): boolean => {
    const guests = readJSONFile<Guest>('guests.json');
    const filtered = guests.filter(g => g.id !== id);
    if (filtered.length === guests.length) return false;
    writeJSONFile('guests.json', filtered);
    return true;
  },
};

export const feedbackDB = {
  getAll: (): Feedback[] => readJSONFile<Feedback>('feedback.json'),
  getById: (id: string): Feedback | undefined => {
    const feedbackList = readJSONFile<Feedback>('feedback.json');
    return feedbackList.find(f => f.id === id);
  },
  getByGuestId: (guestId: string): Feedback[] => {
    const feedbackList = readJSONFile<Feedback>('feedback.json');
    return feedbackList.filter(f => f.guestId === guestId);
  },
  getBySessionId: (sessionId: string): Feedback[] => {
    const feedbackList = readJSONFile<Feedback>('feedback.json');
    return feedbackList.filter(f => f.sessionId === sessionId);
  },
  create: (feedback: Omit<Feedback, 'id' | 'createdAt'>): Feedback => {
    const feedbackList = readJSONFile<Feedback>('feedback.json');
    const newFeedback: Feedback = {
      ...feedback,
      id: generateId('fb'),
      createdAt: new Date().toISOString(),
    };
    feedbackList.push(newFeedback);
    writeJSONFile('feedback.json', feedbackList);
    return newFeedback;
  },
  update: (id: string, updates: Partial<Feedback>): Feedback | undefined => {
    const feedbackList = readJSONFile<Feedback>('feedback.json');
    const index = feedbackList.findIndex(f => f.id === id);
    if (index === -1) return undefined;
    feedbackList[index] = { ...feedbackList[index], ...updates };
    writeJSONFile('feedback.json', feedbackList);
    return feedbackList[index];
  },
};

export { generateId };
