import { AlertTriangle, Phone } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { isOrderRisk, formatPickupTime, getComplexityStars } from '@/utils/orderUtils';

export default function RiskOrderList() {
  const orders = useOrderStore((s) => s.orders);
  const chefs = useOrderStore((s) => s.chefs);

  const riskOrders = orders
    .filter((o) => isOrderRisk(o))
    .sort((a, b) => new Date(a.pickupTime).getTime() - new Date(b.pickupTime).getTime());

  if (riskOrders.length === 0) {
    return (
      <div className="bg-cream-50 rounded-xl p-3 border border-cream-200 h-full flex flex-col">
        <div className="text-xs font-bold text-coffee-900 mb-2.5 flex items-center gap-1.5">
          <span>⚠️</span>
          <span>需沟通改款订单</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center py-4 text-center">
          <div className="text-2xl mb-1.5">✅</div>
          <p className="text-xs text-coffee-800/50">暂无风险订单</p>
          <p className="text-[10px] text-coffee-800/40 mt-0.5">所有订单进展顺利</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cream-50 rounded-xl p-3 border border-cream-200 h-full flex flex-col">
      <div className="text-xs font-bold text-coffee-900 mb-2.5 flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-warning-500" />
        <span>需沟通改款订单</span>
        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded-full bg-warning-500/10 text-warning-500">
          {riskOrders.length} 单
        </span>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto scrollbar-thin -mr-1 pr-1">
        {riskOrders.map((order) => {
          const chef = chefs.find((c) => c.id === order.chefId);
          return (
            <div
              key={order.id}
              className="p-2 rounded-lg bg-warning-500/5 border border-warning-500/20 hover:bg-warning-500/10 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-coffee-800/60">#{order.orderNo}</span>
                  <span className="text-sm font-bold text-coffee-900">{order.customerName}</span>
                </div>
                <span className="text-xs font-bold text-danger-500">
                  {formatPickupTime(order.pickupTime)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-coffee-800/70">{order.size}</span>
                  <span className="text-amber-500">{getComplexityStars(order.complexity)}</span>
                </div>
                <div className="flex items-center gap-2">
                  {chef ? (
                    <span className="text-[11px] text-coffee-800/70 flex items-center gap-1">
                      <span>{chef.avatar}</span>
                      {chef.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-danger-500">未分配</span>
                  )}
                  <button className="p-1 rounded-md bg-warning-500/10 text-warning-500 hover:bg-warning-500/20 transition-colors">
                    <Phone className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
