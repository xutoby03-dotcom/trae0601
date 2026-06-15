import { useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, ChevronRight, Package } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Order } from '@/types';
import { formatDate, formatCurrency } from '@/types';
import { calculateOrderTotal } from '@/utils/calculator';

interface OrderCardProps {
  order: Order;
}

const statusConfig = {
  draft: { label: '草稿', className: 'badge-warning' },
  active: { label: '进行中', className: 'badge-info' },
  completed: { label: '已完成', className: 'badge-success' },
};

export default function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();
  const { grandTotal } = calculateOrderTotal(
    order.items,
    order.totalShipping,
    order.totalTax,
    order.adjustments,
    order.exchangeRate
  );

  const status = statusConfig[order.status];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="card cursor-pointer group"
      onClick={() => navigate(`/order/${order.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-700" />
          </div>
          <div>
            <h3 className="font-serif text-lg font-semibold text-neutral-800">
              {order.platform}
            </h3>
            <p className="text-sm text-neutral-500">单号: {order.trackingNumber}</p>
          </div>
        </div>
        <span className={`badge ${status.className}`}>{status.label}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-600">{formatDate(order.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-600">{order.participants.length}人</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="w-4 h-4 text-neutral-400" />
          <span className="text-neutral-600">汇率 {order.exchangeRate}</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
        <div>
          <p className="text-xs text-neutral-500 mb-1">订单总金额</p>
          <p className="font-serif text-xl font-bold text-primary-800">
            {formatCurrency(grandTotal)}
          </p>
        </div>
        <ChevronRight className="w-5 h-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
      </div>
    </motion.div>
  );
}
