import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Clock, Check, Coffee, AlertTriangle, Phone } from 'lucide-react';
import type { Order, OrderStatus } from '@/types';

const COLUMNS: { status: OrderStatus; label: string; icon: typeof Coffee; headerBg: string; headerText: string }[] = [
  { status: 'pending', label: '待备餐', icon: Coffee, headerBg: 'bg-orange-500', headerText: 'text-white' },
  { status: 'ready', label: '已备好', icon: Check, headerBg: 'bg-emerald-500', headerText: 'text-white' },
  { status: 'picked_up', label: '已取走', icon: Clock, headerBg: 'bg-gray-400', headerText: 'text-white' },
  { status: 'overdue', label: '过时未取', icon: AlertTriangle, headerBg: 'bg-red-500', headerText: 'text-white' },
];

export default function Kitchen() {
  const orders = useStore((s) => s.orders);
  const updateOrderStatus = useStore((s) => s.updateOrderStatus);
  const checkOverdueOrders = useStore((s) => s.checkOverdueOrders);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      checkOverdueOrders();
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
            <div className="max-h-[calc(100vh-12rem)] overflow-y-auto space-y-3 p-3 bg-brand-50/50 rounded-b-2xl border border-brand-100/50 border-t-0">
              {filtered.length === 0 && (
                <p className="text-brown-400 text-sm text-center py-6">暂无订单</p>
              )}
              {filtered.map((order) => (
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
                      <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse-warn" />
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
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
