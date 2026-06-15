import { Scale, DollarSign, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AllocationMethod, Order } from '@/types';
import { formatCurrency } from '@/types';
import { calculateAllocation, calculateOrderTotal } from '@/utils/calculator';

interface AllocationSettingsProps {
  order: Order;
  method: AllocationMethod;
  onMethodChange: (method: AllocationMethod) => void;
}

export default function AllocationSettings({
  order,
  method,
  onMethodChange,
}: AllocationSettingsProps) {
  const allocation = calculateAllocation(
    order.items,
    order.participants,
    order.totalShipping,
    order.totalTax,
    method,
    order.exchangeRate
  );

  const { itemsTotal, grandTotal } = calculateOrderTotal(
    order.items,
    order.totalShipping,
    order.totalTax,
    order.adjustments,
    order.exchangeRate
  );

  const validItems = order.items.filter((i) => !i.isReturned);
  const totalWeight = validItems.reduce((sum, i) => sum + i.weight * i.quantity, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-lg font-bold text-neutral-800">费用分摊设置</h2>
        <div className="flex items-center gap-1 text-sm text-neutral-500">
          <Info className="w-4 h-4" />
          <span>实时预览</span>
        </div>
      </div>

      <div className="mb-6">
        <label className="label">分摊方式</label>
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMethodChange('by_amount')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              method === 'by_amount'
                ? 'bg-primary-800 text-white shadow-lg shadow-primary-800/30'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            按金额分摊
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onMethodChange('by_weight')}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all ${
              method === 'by_weight'
                ? 'bg-primary-800 text-white shadow-lg shadow-primary-800/30'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            <Scale className="w-5 h-5" />
            按重量分摊
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-neutral-50 rounded-xl">
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-1">商品总额</p>
          <p className="font-serif text-xl font-bold text-neutral-800">
            {formatCurrency(itemsTotal)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-1">运费+税费</p>
          <p className="font-serif text-xl font-bold text-neutral-800">
            {formatCurrency(order.totalShipping + order.totalTax)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-neutral-500 mb-1">订单总计</p>
          <p className="font-serif text-xl font-bold text-primary-700">
            {formatCurrency(grandTotal)}
          </p>
        </div>
      </div>

      <div className="mb-4 p-3 bg-primary-50 rounded-lg">
        <p className="text-sm text-primary-700">
          {method === 'by_amount'
            ? `按金额比例分摊：运费 ¥${order.totalShipping.toFixed(2)} + 税费 ¥${order.totalTax.toFixed(2)}`
            : `按重量比例分摊：总重量 ${totalWeight.toFixed(2)}kg，运费 ¥${order.totalShipping.toFixed(2)} + 税费 ¥${order.totalTax.toFixed(2)}`}
        </p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-5 gap-4 px-4 py-2 text-sm font-medium text-neutral-500">
          <div className="col-span-2">参与人</div>
          <div className="text-right">运费分摊</div>
          <div className="text-right">税费分摊</div>
          <div className="text-right">合计</div>
        </div>
        {order.participants.map((p, index) => {
          const alloc = allocation.get(p.id) || { shipping: 0, tax: 0 };
          const total = alloc.shipping + alloc.tax;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-5 gap-4 px-4 py-3 rounded-xl bg-white border border-neutral-100 items-center"
            >
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center text-sm font-medium text-primary-700">
                  {p.name.charAt(0)}
                </div>
                <span className="font-medium text-neutral-800">{p.name}</span>
              </div>
              <div className="text-right font-mono text-neutral-700">
                {formatCurrency(alloc.shipping)}
              </div>
              <div className="text-right font-mono text-neutral-700">
                {formatCurrency(alloc.tax)}
              </div>
              <div className="text-right font-semibold text-primary-700">
                {formatCurrency(total)}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
