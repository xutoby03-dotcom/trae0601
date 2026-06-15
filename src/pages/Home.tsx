import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import OrderCard from '@/components/OrderCard';
import BossPanel from '@/components/BossPanel';
import { useOrderStore } from '@/store/useOrderStore';
import { sortOrdersByPickup } from '@/utils/orderUtils';
import { OrderStatus, ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from '@/types';

type FilterType = 'all' | OrderStatus;

export default function Home() {
  const orders = useOrderStore((s) => s.orders);
  const [filter, setFilter] = useState<FilterType>('all');
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const sortedOrders = sortOrdersByPickup(orders);
  const filteredOrders = filter === 'all'
    ? sortedOrders
    : sortedOrders.filter((o) => o.status === filter);

  const statusFilters = ORDER_STATUS_FLOW.map((s) => ({
    key: s,
    label: ORDER_STATUS_LABELS[s],
  }));
  const filters = [{ key: 'all' as FilterType, label: '全部' }, ...statusFilters];

  return (
    <div className="min-h-screen pb-60">
      <Header />

      <main className="max-w-[1600px] mx-auto px-6 pt-6">
        <div className="mb-5">
          <div className="flex items-center gap-2 flex-wrap">
            {filters.map((f) => {
              const isActive = filter === f.key;
              const count = f.key === 'all'
                ? orders.length
                : orders.filter((o) => o.status === f.key).length;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                    ${isActive
                      ? 'bg-coffee-900 text-white shadow-md'
                      : 'bg-cream-50 text-coffee-800 border border-cream-300 hover:bg-cream-200'
                    }
                  `}
                >
                  {f.label}
                  <span
                    className={`
                      ml-1.5 text-xs px-1.5 py-0.5 rounded-full
                      ${isActive ? 'bg-white/20 text-white' : 'bg-cream-200 text-coffee-800/60'}
                    `}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
          {filteredOrders.map((order, index) => (
            <div key={order.id} style={{ animationDelay: `${index * 50}ms` }}>
              <OrderCard order={order} />
            </div>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-20">
            <div className="text-5xl mb-3">🎂</div>
            <p className="text-coffee-800/60">暂无该状态的订单</p>
          </div>
        )}
      </main>

      <BossPanel />
    </div>
  );
}
