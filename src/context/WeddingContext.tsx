import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Guest, Table, TabKey } from '../types';
import { mockGuests, mockTables } from '../data/mockData';

interface WeddingContextType {
  guests: Guest[];
  tables: Table[];
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, guest: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  addTable: (table: Omit<Table, 'id' | 'guestIds' | 'printed'>) => void;
  updateTable: (id: string, table: Partial<Table>) => void;
  deleteTable: (id: string) => void;
  seatGuest: (guestId: string, tableId: string) => void;
  unseatGuest: (guestId: string) => void;
  moveGuest: (guestId: string, fromTableId: string, toTableId: string) => void;
  togglePrinted: (tableId: string) => void;
  toggleConfirmed: (guestId: string) => void;
}

const WeddingContext = createContext<WeddingContextType | undefined>(undefined);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [guests, setGuests] = useState<Guest[]>(mockGuests);
  const [tables, setTables] = useState<Table[]>(mockTables);
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  const addGuest = useCallback((guestData: Omit<Guest, 'id'>) => {
    const newGuest: Guest = {
      ...guestData,
      id: `g_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    setGuests(prev => [...prev, newGuest]);
  }, []);

  const updateGuest = useCallback((id: string, updates: Partial<Guest>) => {
    setGuests(prev => prev.map(g => (g.id === id ? { ...g, ...updates } : g)));
  }, []);

  const deleteGuest = useCallback((id: string) => {
    const guest = guests.find(g => g.id === id);
    if (guest?.tableId) {
      setTables(prev =>
        prev.map(t =>
          t.id === guest.tableId
            ? { ...t, guestIds: t.guestIds.filter(gid => gid !== id), printed: false }
            : t
        )
      );
    }
    setGuests(prev => prev.filter(g => g.id !== id));
  }, [guests]);

  const addTable = useCallback((tableData: Omit<Table, 'id' | 'guestIds' | 'printed'>) => {
    const newTable: Table = {
      ...tableData,
      id: `t_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      guestIds: [],
      printed: false,
    };
    setTables(prev => [...prev, newTable]);
  }, []);

  const updateTable = useCallback((id: string, updates: Partial<Table>) => {
    setTables(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const deleteTable = useCallback((id: string) => {
    setGuests(prev =>
      prev.map(g => (g.tableId === id ? { ...g, tableId: null } : g))
    );
    setTables(prev => prev.filter(t => t.id !== id));
  }, []);

  const seatGuest = useCallback((guestId: string, tableId: string) => {
    const guest = guests.find(g => g.id === guestId);
    setGuests(prev =>
      prev.map(g => (g.id === guestId ? { ...g, tableId } : g))
    );
    setTables(prev =>
      prev.map(t => {
        if (t.id === tableId && !t.guestIds.includes(guestId)) {
          return { ...t, guestIds: [...t.guestIds, guestId], printed: false };
        }
        if (guest?.tableId && t.id === guest.tableId) {
          return { ...t, printed: false };
        }
        return t;
      })
    );
  }, [guests]);

  const unseatGuest = useCallback((guestId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest?.tableId) {
      setTables(prev =>
        prev.map(t =>
          t.id === guest.tableId
            ? { ...t, guestIds: t.guestIds.filter(gid => gid !== guestId), printed: false }
            : t
        )
      );
    }
    setGuests(prev =>
      prev.map(g => (g.id === guestId ? { ...g, tableId: null } : g))
    );
  }, [guests]);

  const moveGuest = useCallback((guestId: string, fromTableId: string, toTableId: string) => {
    setGuests(prev =>
      prev.map(g => (g.id === guestId ? { ...g, tableId: toTableId } : g))
    );
    setTables(prev =>
      prev.map(t => {
        if (t.id === fromTableId) {
          return { ...t, guestIds: t.guestIds.filter(gid => gid !== guestId), printed: false };
        }
        if (t.id === toTableId) {
          return { ...t, guestIds: [...t.guestIds, guestId], printed: false };
        }
        return t;
      })
    );
  }, []);

  const togglePrinted = useCallback((tableId: string) => {
    setTables(prev =>
      prev.map(t => (t.id === tableId ? { ...t, printed: !t.printed } : t))
    );
  }, []);

  const toggleConfirmed = useCallback((guestId: string) => {
    setGuests(prev =>
      prev.map(g => (g.id === guestId ? { ...g, confirmed: !g.confirmed } : g))
    );
  }, []);

  return (
    <WeddingContext.Provider
      value={{
        guests,
        tables,
        activeTab,
        setActiveTab,
        addGuest,
        updateGuest,
        deleteGuest,
        addTable,
        updateTable,
        deleteTable,
        seatGuest,
        unseatGuest,
        moveGuest,
        togglePrinted,
        toggleConfirmed,
      }}
    >
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const context = useContext(WeddingContext);
  if (context === undefined) {
    throw new Error('useWedding must be used within a WeddingProvider');
  }
  return context;
}
