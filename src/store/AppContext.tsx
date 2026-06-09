import { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import type { DryingItem, CommunityRules } from '../types';
import { DEFAULT_RULES } from '../types';

interface AppState {
  items: DryingItem[];
  rules: CommunityRules;
  rainyDays: string[];
}

type Action =
  | { type: 'ADD_ITEM'; payload: DryingItem }
  | { type: 'RETRIEVE_ITEM'; payload: { id: string; wasWet: boolean; wasMoved: boolean } }
  | { type: 'ADD_MESSAGE'; payload: { itemId: string; author: string; content: string } }
  | { type: 'UPDATE_RULES'; payload: CommunityRules }
  | { type: 'LOAD_STATE'; payload: AppState };

const STORAGE_KEY = 'drying-reminder-state';

function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return {
    items: [],
    rules: DEFAULT_RULES,
    rainyDays: [],
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'RETRIEVE_ITEM':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.id
            ? {
                ...item,
                status: 'retrieved' as const,
                retrievedAt: new Date().toISOString(),
                wasWet: action.payload.wasWet,
                wasMoved: action.payload.wasMoved,
              }
            : item
        ),
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === action.payload.itemId
            ? {
                ...item,
                messages: [
                  ...item.messages,
                  {
                    id: crypto.randomUUID(),
                    author: action.payload.author,
                    content: action.payload.content,
                    createdAt: new Date().toISOString(),
                  },
                ],
              }
            : item
        ),
      };
    case 'UPDATE_RULES':
      return { ...state, rules: action.payload };
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, null, getInitialState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppState must be used within AppProvider');
  return context;
}
