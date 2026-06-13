import { useState, useEffect, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Clock, Check, Coffee, AlertTriangle, Phone, ChefHat } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const COLUMNS: { status: OrderStatus; label: string; icon: typeof Coffee; headerBg: string; headerText: string }[] = [
  { status: 'pending', label: '待备餐', icon: Coffee, headerBg: 'bg-orange-500', headerText: 'text-white' },
  { status: 'ready', label: '已备好', icon: Check, headerBg: 'bg-emerald-500', headerText: 'text-white' },
  { status: 'picked_up', label: '已取走', icon: Clock, headerBg: 'bg-gray-400', headerText: 'text-white' },
  { status: 'overdue', label: '过时未取', icon: AlertTriangle, headerBg: 'bg-red-500', headerText: 'text-white' },
];

function getOverdueMinutes(pickupTime: string): number {
  const now = new Date();
  const [h, m] = pickupTime.split(':').map(Number);
  const pickupDate = new Date();
  pickupDate.setHours(h, m, 0, 0);
  return Math.max(0, Math.floor((now.getTime() - pickupDate.getTime()) / 60000));
}

interface PrepSummaryKey {
  productId: string;
  productName: string;
  flavor: string;
  addOnsKey: string;
  addOnsDisplay: string;
}

interface PrepSummaryEntry extends PrepSummaryKey {
  quantity: number;
}

function buildPrepSummary(pendingOrders: Order[]): PrepSummaryEntry[] {
  const map = new Map<string, PrepSummaryEntry>();
  for (const order of pendingOrders) {
    for (const item of order.items) {
      const addOnsKey = [...item.selectedAddOns].sort().join(',');
      const addOnsDisplay = item.selectedAddOns.length > 0 ? item.selectedAddOns.join('/') : '';
      const key = `${item.productId}|${item.flavor}|${addOnsKey}`;
      const existing = map.get(key);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        map.set(key, {
          productId: item.productId,
          productName: item.productName,
          flavor: item.flavor,
          addOnsKey,
          addOnsDisplay,
          quantity: item.quantity,
        });
      }
    }
  }
  return Array.from(map.values()).sort((a, b) => b.quantity - a.quantity);
}

export default function Kitchen() {
  const orders = useStore((s) => s.orders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const checkOverdueOrders = useStore((s) => s.checkOverdueOrders);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      checkOverdueOrders();
      setNow(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [checkOverdueOrders]);

  useEffect(() => {
    const currentIds = new Set(orders.map((o) => o.id));
    const fresh = new Set<string>();
    orders.forEach((o) => {
      if (!newIds.has(o.id)) {
        fresh.add(o.id);
      }
    });
    if (fresh.size > 0) {
      setNewIds(currentIds);
    }
  }, [orders]);

  const getFiltered = (status: OrderStatus): Order[] => {
    const filtered = orders.filter((o) => o.orderStatus === status);
    if (status === 'pending' || status === 'ready') {
      return [...filtered].sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
    }
    return filtered;
  };

  const pendingOrders = useMemo(() => getFiltered('pending'), [orders]);
  const prepSummary = useMemo(() => buildPrepSummary(pendingOrders), [pendingOrders]);

  const handleAction = (id: string, status: OrderStatus) => {
    if (status === 'pending') {
      updateOrderStatus(id, 'ready');
    } else if (status === 'ready') {
      updateOrderStatus(id, 'picked_up');
    } else if (status === 'overdue') {
      updateOrderStatus(id, 'pending');
    }
  };

  const actionLabel = (status: OrderStatus) => {
    if (status === 'pending') return '备好';
    if (status === 'ready') return '已取走';
    if (status === 'overdue') return '重新备餐';
    return '';
  };

  return (
    <div className="grid grid-cols-4 gap-4 h-full p-4">
      {COLUMNS.map((col) => {
        const Icon = col.icon;
        const filtered = getFiltered(col.status);
        return (
          <div key={col.status} className="flex flex-col">
            <div className={`${col.headerBg} ${col.headerText} rounded-t-2xl px-4 py-3 flex items-center gap-2`}>
              <Icon className="w-5 h-5" />
              <span className="font-semibold">{col.label}</span>
              <span className="ml-auto bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {filtered.length}
              </span>
            </div>

            {col.status === 'pending' && prepSummary.length > 0 && (
              <div className="bg-white border-b border-brand-100 p-3 rounded-none">
                <div className="flex items-center gap-1.5 mb-2">
                  <ChefHat className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-semibold text-brown-800">备餐汇总</span>
                </div>
                <div className="space-y-1.5">
                  {prepSummary.map((entry) => (
                    <div
                      key={`${entry.productId}-${entry.flavor}-${entry.addOnsKey}`}
                      className="flex items-center gap-1.5 text-sm"
                    >
                      <span className="inline-flex items-center justify-center min-w-[1.75rem] h-7 rounded-lg bg-brand-500 text-white text-xs font-bold">
                        {entry.quantity}
                      </span>
                      <span className="font-medium text-brown-800">{entry.productName}</span>
                      {entry.flavor && (
                        <span className="text-brown-500">({entry.flavor})</span>
                      )}
                      {entry.addOnsDisplay && (
                        <span className="text-brown-400">+{entry.addOnsDisplay}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto space-y-3 p-3 bg-brand-50/50 rounded-b-2xl border border-brand-100/50 border-t-0">
              {filtered.length === 0 && (
                <p className="text-brown-400 text-sm text-center py-6">暂无订单</p>
              )}
              {filtered.map((order) => {
                const overdueMin = col.status === 'overdue' ? getOverdueMinutes(order.pickupTime) : 0;
                return (
                  <div
                    key={order.id}
                    className={`card p-4 space-y-2 ${newIds.has(order.id) ? 'animate-slide-in' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-brown-600">{order.id}</span>
                      <span
                        className={`tag ${
                          order.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {order.paymentStatus === 'paid' ? '已付' : '未付'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1.5 ${
                        col.status === 'pending' || col.status === 'overdue' ? 'text-lg font-bold' : 'text-sm'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                      <span>{order.pickupTime}</span>
                      {col.status === 'overdue' && (
                        <>
                          <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse-warn" />
                          <span className="text-red-600 text-sm font-bold ml-1">
                            超{overdueMin}分钟
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-brown-600">
                      <Phone className="w-3.5 h-3.5" />
                      <span>尾号 {order.phoneLastFour}</span>
                    </div>

                    <div className="space-y-1">
                      {order.items.map((item) => (
                        <div key={item.id} className="text-sm">
                          <span className="font-medium text-brown-800">{item.productName}</span>
                          {item.flavor && <span className="text-brown-500 ml-1">({item.flavor})</span>}
                          {item.selectedAddOns.length > 0 && (
                            <span className="text-brown-400 ml-1">+ {item.selectedAddOns.join('/')}</span>
                          )}
                          <span className="text-brown-400 ml-1">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="bg-yellow-50 rounded-lg px-3 py-1.5 text-sm italic text-brown-600">
                        {order.notes}
                      </div>
                    )}

                    {col.status !== 'picked_up' && (
                      <button
                        className={`w-full flex items-center justify-center gap-1.5 text-sm font-medium transition-all duration-200 active:scale-95 ${
                          col.status === 'pending'
                            ? 'btn-primary'
                            : col.status === 'ready'
                              ? 'bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl'
                              : 'btn-secondary'
                        }`}
                        onClick={() => handleAction(order.id, col.status)}
                      >
                        {col.status === 'ready' && <Check className="w-4 h-4" />}
                        {actionLabel(col.status)}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
