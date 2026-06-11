import React from 'react';
import { Package, Phone, MapPin, Calendar, Clock, User, AlertTriangle } from 'lucide-react';
import type { ShipmentOrder } from '@/store/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, formatRelative, isOverdue, getDaysRemaining } from '@/utils/date';
import { getExpressCompanyName } from '@/utils/express';
import { cn } from '@/lib/utils';

interface ShipmentCardProps {
  order: ShipmentOrder;
  onViewDetail: (id: string) => void;
  onMarkShipped?: (id: string) => void;
  onMarkDelivered?: (id: string) => void;
  onRecordFeedback?: (id: string) => void;
}

export const ShipmentCard: React.FC<ShipmentCardProps> = ({
  order,
  onViewDetail,
  onMarkShipped,
  onMarkDelivered,
  onRecordFeedback,
}) => {
  const overdue = isOverdue(order.expectedArrivalDate, order.status);
  const daysRemaining = getDaysRemaining(order.expectedArrivalDate);

  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
      onClick={() => onViewDetail(order.id)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">{order.customerName}</h3>
            <p className="text-sm text-gray-500">{order.sampleName} × {order.quantity}</p>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4 text-gray-400" />
          <span>{order.contactPerson}</span>
          <Phone className="w-4 h-4 text-gray-400 ml-2" />
          <span>{order.contactPhone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="truncate max-w-[200px]">{order.customerAddress}</span>
        </div>
        {order.trackingNumber && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">{getExpressCompanyName(order.expressCompany)}：</span>
            <span className="text-blue-600 font-mono">{order.trackingNumber}</span>
          </div>
        )}
        {order.expectedArrivalDate && order.status === 'shipping' && (
          <div className={cn(
            'flex items-center gap-2 text-sm',
            overdue ? 'text-red-600' : 'text-gray-600'
          )}>
            {overdue ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4 text-gray-400" />
            )}
            <span>
              预计到达：{formatDate(order.expectedArrivalDate)}
              {overdue ? ' (已超时)' : ` (还剩${Math.max(0, daysRemaining)}天)`}
            </span>
          </div>
        )}
        {order.actualArrivalDate && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>签收日期：{formatDate(order.actualArrivalDate)}</span>
          </div>
        )}
      </div>

      {order.feedback && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">客户反馈：</span>
            {order.feedback}
          </p>
          {order.convertedToOrder && (
            <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
              已转正式订单
            </span>
          )}
          {order.needReissue && (
            <span className="inline-block mt-2 ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
              需要补寄
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-400">
          创建于 {formatRelative(order.createdAt)}
        </span>
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {order.status === 'pending' && onMarkShipped && (
            <button
              onClick={() => onMarkShipped(order.id)}
              className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              标记寄出
            </button>
          )}
          {order.status === 'shipping' && onMarkDelivered && (
            <button
              onClick={() => onMarkDelivered(order.id)}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              标记签收
            </button>
          )}
          {order.status === 'delivered' && !order.feedback && onRecordFeedback && (
            <button
              onClick={() => onRecordFeedback(order.id)}
              className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              录入反馈
            </button>
          )}
          <button
            onClick={() => onViewDetail(order.id)}
            className="px-3 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
};
