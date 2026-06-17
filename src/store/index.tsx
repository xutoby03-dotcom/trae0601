import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode,
} from 'react';
import type { Chair, RepairOrder, RepairRecord } from '@/types';
import { api } from '@/services/api';
import { message } from 'antd';

interface StoreContextValue {
  chairs: Chair[];
  orders: RepairOrder[];
  loading: boolean;
  error: string | null;
  refreshAll: () => Promise<void>;
  addChair: (chair: Omit<Chair, 'id'>) => Promise<Chair>;
  updateChair: (id: string, patch: Partial<Chair>) => Promise<Chair>;
  deleteChair: (id: string) => Promise<void>;
  setChairDisabled: (id: string, disabled: boolean) => Promise<Chair>;
  addOrder: (order: Omit<RepairOrder, 'id' | 'status' | 'createdAt'>) => Promise<RepairOrder>;
  updateOrder: (id: string, patch: Partial<RepairOrder>) => Promise<RepairOrder>;
  assignOrder: (id: string, assignee: string) => Promise<RepairOrder>;
  changeOrderStatus: (id: string, status: string) => Promise<RepairOrder>;
  addRepair: (orderId: string, repair: Omit<RepairRecord, 'id' | 'orderId'>) => Promise<RepairRecord>;
  updateRepair: (id: string, patch: Partial<RepairRecord>) => Promise<RepairRecord>;
  getChairById: (id: string) => Chair | undefined;
  getOrderById: (id: string) => RepairOrder | undefined;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [chairs, setChairs] = useState<Chair[]>([]);
  const [orders, setOrders] = useState<RepairOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [chairData, orderData] = await Promise.all([
        api.chairs.list(),
        api.orders.list(),
      ]);
      setChairs(Array.isArray(chairData) ? chairData : []);
      setOrders(Array.isArray(orderData) ? orderData : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '加载数据失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const refreshAll = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const addChair = useCallback(async (chair: Omit<Chair, 'id'>) => {
    const newChair = await api.chairs.create(chair);
    setChairs((prev) => [...prev, newChair]);
    message.success('椅子已添加');
    return newChair;
  }, []);

  const updateChair = useCallback(async (id: string, patch: Partial<Chair>) => {
    const updated = await api.chairs.update(id, patch);
    setChairs((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const setChairDisabled = useCallback(async (id: string, disabled: boolean) => {
    const updated = await api.chairs.setDisabled(id, disabled);
    setChairs((prev) => prev.map((c) => (c.id === id ? updated : c)));
    return updated;
  }, []);

  const deleteChair = useCallback(async (id: string) => {
    await api.chairs.remove(id);
    setChairs((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const addOrder = useCallback(async (order: Omit<RepairOrder, 'id' | 'status' | 'createdAt'>) => {
    const newOrder = await api.orders.create(order);
    setOrders((prev) => [newOrder, ...prev]);
    message.success('工单已提交');
    return newOrder;
  }, []);

  const updateOrder = useCallback(async (id: string, patch: Partial<RepairOrder>) => {
    const updated = await api.orders.update(id, patch);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    return updated;
  }, []);

  const assignOrder = useCallback(async (id: string, assignee: string) => {
    const updated = await api.orders.assign(id, assignee);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    message.success('已分配处理人');
    return updated;
  }, []);

  const changeOrderStatus = useCallback(async (id: string, status: string) => {
    const updated = await api.orders.changeStatus(id, status);
    setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    return updated;
  }, []);

  const addRepair = useCallback(
    async (orderId: string, repair: Omit<RepairRecord, 'id' | 'orderId'>) => {
      const result = await api.repairs.create({ ...repair, orderId });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? result.order : o))
      );
      // 同时刷新椅子列表以更新 disabled 状态
      await loadAll();
      message.success('维修记录已保存');
      return result.record;
    },
    [loadAll]
  );

  const updateRepair = useCallback(async (id: string, patch: Partial<RepairRecord>) => {
    const result = await api.repairs.update(id, patch);
    setOrders((prev) =>
      prev.map((o) => (o.id === result.order.id ? result.order : o))
    );
    return result.record;
  }, []);

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
        loading,
        error,
        refreshAll,
        addChair,
        updateChair,
        setChairDisabled,
        deleteChair,
        addOrder,
        updateOrder,
        assignOrder,
        changeOrderStatus,
        addRepair,
        updateRepair,
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
