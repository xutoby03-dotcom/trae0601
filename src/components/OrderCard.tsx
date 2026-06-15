import { useState } from 'react';
import { Clock, MessageSquare, DollarSign, Flame } from 'lucide-react';
import type { Order } from '@/types';
import { useOrderStore } from '@/store/useOrderStore';
import StatusTimeline from './StatusTimeline';
import ChefSelector from './ChefSelector';
import ReferenceImage from './ReferenceImage';
import {
  isOrderEmergency,
  formatPickupTime,
  getCountdownText,
  getComplexityStars,
  getStatusColor,
  ORDER_STATUS_LABELS,
} from '@/utils/orderUtils';

interface OrderCardProps {
  order: Order;
}

export default function OrderCard({ order }: OrderCardProps) {
  const updateOrderStatus = useOrderStore((s) => s.updateOrderStatus);
  const [isHovered, setIsHovered] = useState(false);
  const isEmergency = isOrderEmergency(order);
  const now = new Date();

  const handleStatusAdvance = (status: any) => {
    updateOrderStatus(order.id, status);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative rounded-2xl p-5 paper-texture transition-all duration-300
        animate-fade-in
        ${isEmergency
          ? 'bg-gradient-to-br from-red-50 to-cream-50 border-2 border-danger-500/60 animate-pulse-red shadow-lg shadow-danger-500/20'
          : 'bg-cream-50 border border-cream-200 shadow-md hover:shadow-xl hover:-translate-y-0.5'
        }
      `}
    >
      {isEmergency && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-danger-500 text-white text-xs font-bold shadow-md">
            <Flame className="w-3.5 h-3.5" />
            紧急
          </div>
        </div>
      )}

      <div className={`
        flex items-start justify-between mb-4 pb-3 border-b border-cream-200
      `}>
        <div>
          <div className={`
            flex items-center gap-2 mb-1
          `}>
            <span className="text-xs text-coffee-800/60 font-mono">#{order.orderNo}</span>
            {!order.depositPaid ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-danger-500/10 text-danger-500 font-medium">
                未收尾款
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-matcha-500/10 text-matcha-600 font-medium flex items-center gap-0.5">
                <DollarSign className="w-3 h-3" />
                已收尾款
              </span>
            )}
          </div>
          <span className="text-lg font-bold text-coffee-900">
            {order.customerName}
          </span>
        </div>

        <div className={`
          text-right
          ${isEmergency ? '' : ''}
        `}>
          <div className={`
            text-2xl font-serif font-bold
            ${isEmergency ? 'text-danger-500' : 'text-coffee-900'}
          `}>
            {formatPickupTime(order.pickupTime)}
          </div>
          <div className={`
            text-xs flex items-center justify-end gap-1
            ${isEmergency ? 'text-danger-500 font-medium' : 'text-coffee-800/60'}
          `}>
            <Clock className="w-3 h-3" />
            {getCountdownText(order.pickupTime, now)}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="text-coffee-800/50 text-xs">尺寸</span>
            <span className="font-bold text-coffee-900">{order.size}</span>
          </div>
          <div className="w-px h-4 bg-cream-300" />
          <div className="flex items-center gap-1.5">
            <span className="text-coffee-800/50 text-xs">口味</span>
            <span className="font-bold text-coffee-900">{order.flavor}</span>
          </div>
        </div>

        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="text-xs text-coffee-800/50 mb-0.5">主题</div>
            <div className="text-sm font-medium text-coffee-900 truncate">
              {order.theme}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-xs text-coffee-800/50 mb-0.5">复杂度</div>
            <div className="text-amber-500 text-sm tracking-wider">
              {getComplexityStars(order.complexity)}
            </div>
          </div>
        </div>

        {order.customerNote && (
          <div className={`
            flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 border border-amber-100
          `}>
            <MessageSquare className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 leading-relaxed">{order.customerNote}</p>
          </div>
        )}
      </div>

      <div className="mb-4">
        <div className="text-xs text-coffee-800/50 mb-2">参考图</div>
        <ReferenceImage imageUrl={order.referenceImageUrl} orderNo={order.orderNo} />
      </div>

      <div className="mb-4">
        <div className="text-xs text-coffee-800/50 mb-2">裱花师</div>
        <ChefSelector order={order} />
      </div>

      <div>
        <div className="text-xs text-coffee-800/50 mb-2">当前状态</div>
        <div className="mb-3">
          <span className={`
            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
            border ${getStatusColor(order.status)}
          `}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
        <StatusTimeline currentStatus={order.status} onAdvance={handleStatusAdvance} />
      </div>
    </div>
  );
}
