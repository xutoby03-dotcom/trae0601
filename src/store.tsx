import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GroupOrder } from './types';

const STORAGE_KEY = 'lunch_pool_orders';

function loadOrders(): GroupOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: GroupOrder[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

type Action =
  | { type: 'ADD_ORDER'; payload: GroupOrder }
  | { type: 'UPDATE_ORDER'; payload: GroupOrder }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'SET_ORDERS'; payload: GroupOrder[] };

function reducer(state: GroupOrder[], action: Action): GroupOrder[] {
  switch (action.type) {
    case 'ADD_ORDER':
      return [action.payload, ...state];
    case 'UPDATE_ORDER':
      return state.map(o => (o.id === action.payload.id ? action.payload : o));
    case 'DELETE_ORDER':
      return state.filter(o => o.id !== action.payload);
    case 'SET_ORDERS':
      return action.payload;
    default:
      return state;
  }
}

interface StoreContextType {
  orders: GroupOrder[];
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [orders, dispatch] = useReducer(reducer, [], loadOrders);

  useEffect(() => {
    saveOrders(orders);
  }, [orders]);

  return (
    <StoreContext.Provider value={{ orders, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
