import { create } from 'zustand';
import type { GameSession, Assignment, Rating } from '@/types';
import { loadFromStorage, saveToStorage } from '@/utils/storage';
import { mockSessions, mockRatings } from '@/data/mockData';

interface SessionState {
  sessions: GameSession[];
  ratings: Rating[];
  currentSession: GameSession | null;
  setCurrentSession: (session: GameSession | null) => void;
  createSession: (scriptId: string, playerIds: string[]) => GameSession;
  updateAssignments: (sessionId: string, assignments: Assignment[]) => void;
  updateSessionStatus: (sessionId: string, status: GameSession['status']) => void;
  addRating: (rating: Omit<Rating, 'id'>) => void;
  getSession: (id: string) => GameSession | undefined;
  getRatingsBySession: (sessionId: string) => Rating[];
  loadData: () => void;
}

const SESSIONS_KEY = 'script-killer-sessions';
const RATINGS_KEY = 'script-killer-ratings';

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  ratings: [],
  currentSession: null,

  setCurrentSession: (session) => {
    set({ currentSession: session });
  },

  loadData: () => {
    const storedSessions = loadFromStorage<GameSession[]>(SESSIONS_KEY, []);
    const storedRatings = loadFromStorage<Rating[]>(RATINGS_KEY, []);
    
    if (storedSessions.length > 0) {
      set({ sessions: storedSessions });
    } else {
      set({ sessions: mockSessions });
      saveToStorage(SESSIONS_KEY, mockSessions);
    }
    
    if (storedRatings.length > 0) {
      set({ ratings: storedRatings });
    } else {
      set({ ratings: mockRatings });
      saveToStorage(RATINGS_KEY, mockRatings);
    }
  },

  createSession: (scriptId, playerIds) => {
    const newSession: GameSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      scriptId,
      playerIds,
      assignments: [],
      status: 'planning',
      createdAt: Date.now()
    };
    const sessions = [...get().sessions, newSession];
    set({ sessions, currentSession: newSession });
    saveToStorage(SESSIONS_KEY, sessions);
    return newSession;
  },

  updateAssignments: (sessionId, assignments) => {
    const sessions = get().sessions.map(s =>
      s.id === sessionId ? { ...s, assignments } : s
    );
    const currentSession = get().currentSession?.id === sessionId
      ? { ...get().currentSession!, assignments }
      : get().currentSession;
    set({ sessions, currentSession });
    saveToStorage(SESSIONS_KEY, sessions);
  },

  updateSessionStatus: (sessionId, status) => {
    const sessions = get().sessions.map(s =>
      s.id === sessionId ? { ...s, status } : s
    );
    const currentSession = get().currentSession?.id === sessionId
      ? { ...get().currentSession!, status }
      : get().currentSession;
    set({ sessions, currentSession });
    saveToStorage(SESSIONS_KEY, sessions);
  },

  addRating: (rating) => {
    const newRating: Rating = {
      ...rating,
      id: `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    const ratings = [...get().ratings, newRating];
    set({ ratings });
    saveToStorage(RATINGS_KEY, ratings);
  },

  getSession: (id) => {
    return get().sessions.find(s => s.id === id);
  },

  getRatingsBySession: (sessionId) => {
    return get().ratings.filter(r => r.sessionId === sessionId);
  }
}));
