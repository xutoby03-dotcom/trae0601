import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import type { Chair, RepairOrder, RepairRecord } from '@/types';
import { MOCK_CHAIRS, MOCK_ORDERS } from '@/data/mock';

interface StoreContextValue {
  chairs: Chair[];
  orders: RepairOrder[];
  addChair: (chair: Omit<Chair, 'id'>) => void;
  updateChair: (id: string, patch: Partial<Chair>) => void;
  deleteChair: (id: string) => void;
  addOrder: (order: Omit<RepairOrder, 'id' | 'status' | 'createdAt'>) => void;
  updateOrder: (id: string, patch: Partial<RepairOrder>) => void;
  addRepair: (orderId: string, repair: Omit<RepairRecord, 'id' | 'orderId'>) => void;
  getChairById: (id: string) => Chair | undefined;
  getOrderById: (id: string) => RepairOrder | undefined;
}

const StoreContext = createContext<StoreContextValue | null>(null);

const LS_CHAIRS = 'trae_chairs_v1';
const LS_ORDERS = 'trae_orders_v1';

export function StoreProvider({ children }: { children: ReactNode }) {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [orders, setOrders] = useState<RepairOrder[]>([]);

  useEffect(() => {
    try {
      const savedChairs = localStorage.getItem(LS_CHAIRS);
      const savedOrders = localStorage.getItem(LS_ORDERS);
      setChairs(savedChairs ? JSON.parse(savedChairs) : MOCK_CHAIRS);
      setOrders(savedOrders ? JSON.parse(savedOrders) : MOCK_ORDERS);
    } catch {
      setChairs(MOCK_CHAIRS);
      setOrders(MOCK_ORDERS);
    }
  }, []);

  useEffect(() => {
    if (chairs.length) localStorage.setItem(LS_CHAIRS, JSON.stringify(chairs));
  }, [chairs]);

  useEffect(() => {
    if (orders.length) localStorage.setItem(LS_ORDERS, JSON.stringify(orders));
  }, [orders]);

  const addChair = useCallback((chair: Omit<Chair, 'id'>) => {
    const id = `chair-${Date.now()}`;
    setChairs((prev) => [...prev, { ...chair, id }]);
  }, []);

  const updateChair = useCallback((id: string, patch: Partial<Chair>) => {
    setChairs((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const deleteChair = useCallback((id: string) => {
    setChairs((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addOrder = useCallback(
    (order: Omit<RepairOrder, 'id' | 'status' | 'createdAt'>) => {
      const id = `order-${Date.now()}`;
      const newOrder: RepairOrder = {
        ...order,
        id,
        status: 'pending',
        createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      };
      setOrders((prev) => [newOrder, ...prev]);
    },
    []
  );

  const updateOrder = useCallback((id: string, patch: Partial<RepairOrder>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const addRepair = useCallback(
    (orderId: string, repair: Omit<RepairRecord, 'id' | 'orderId'>) => {
      const id = `repair-${Date.now()}`;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: 'done', repair: { ...repair, id, orderId } }
            : o
        )
      );
    },
    []
  );

  const getChairById = useCallback(
    (id: string) => chairs.find((c) => c.id === id),
    [chairs]
  );

  const getOrderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  return (
    <StoreContext.Provider
      value={{
        chairs,
        orders,
        addChair,
        updateChair,
        deleteChair,
        addOrder,
        updateOrder,
        addRepair,
        getChairById,
        getOrderById,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
