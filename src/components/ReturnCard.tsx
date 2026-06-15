import { ReturnOrder } from '@/types/return';
import { hasUrgentReminder, hasWarningReminder, getStatusLabel } from '@/utils/statusUtils';
import { formatDateShort, formatRelativeDate, daysUntil } from '@/utils/dateUtils';
import { AlertTriangle, Clock, Package, Image as ImageIcon } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ReturnCardProps {
  order: ReturnOrder;
  onClick: () => void;
}

const platformColors: Record<string, string> = {
  淘宝: 'bg-orange-100 text-orange-700',
  京东: 'bg-red-100 text-red-700',
  拼多多: 'bg-yellow-100 text-yellow-700',
  天猫: 'bg-pink-100 text-pink-700',
  抖音: 'bg-purple-100 text-purple-700',
  快手: 'bg-blue-100 text-blue-700',
  其他: 'bg-gray-100 text-gray-700',
};

export function ReturnCard({ order, onClick }: ReturnCardProps) {
  const isUrgent = hasUrgentReminder(order);
  const isWarning = hasWarningReminder(order);
  const statusLabel = getStatusLabel(order.status);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: order.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const nearestDeadline = daysUntil(order.applicationDeadline) < daysUntil(order.shipDeadline)
    ? { label: '申请截止', date: order.applicationDeadline }
    : { label: '寄出截止', date: order.shipDeadline };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        relative bg-white rounded-2xl p-4 shadow-sm cursor-grab active:cursor-grabbing
        hover:shadow-lg hover:-translate-y-1 transition-all duration-300
        border-2 ${isUrgent ? 'border-red-400' : isWarning ? 'border-yellow-300' : 'border-transparent'}
      `}
    >
      {isUrgent && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-red-500 text-white rounded-full p-1.5 animate-pulse shadow-lg">
            <AlertTriangle size={16} />
          </div>
        </div>
      )}
      {isWarning && !isUrgent && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-yellow-400 text-yellow-900 rounded-full p-1.5 shadow-md">
            <Clock size={16} />
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-3">
        <span
          className={`
            text-xs font-medium px-2.5 py-1 rounded-full
            ${platformColors[order.platform] || platformColors['其他']}
          `}
        >
          {order.platform}
        </span>
        <span className="text-xs text-gray-400 font-medium">{statusLabel}</span>
      </div>

      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-sm leading-snug">
        {order.productName}
      </h3>

      <div className="text-xs text-gray-500 mb-3">
        <span className="text-gray-400">下单人：</span>
        {order.buyer}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Package size={12} className="text-gray-400" />
        <span>{order.returnReason}</span>
      </div>

      {order.trackingNumber && (
        <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1.5 mb-3 font-mono">
          单号：{order.trackingNumber}
        </div>
      )}

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1">
          <Clock size={12} className="text-gray-400" />
          <span className="text-xs text-gray-500">
            {nearestDeadline.label} {formatDateShort(nearestDeadline.date)}
          </span>
        </div>
        <span
          className={`text-xs font-medium ${
            isUrgent
              ? 'text-red-500'
              : isWarning
              ? 'text-yellow-600'
              : 'text-gray-400'
          }`}
        >
          {formatRelativeDate(nearestDeadline.date)}
        </span>
      </div>

      {order.photos.length > 0 && (
        <div className="flex gap-1 mt-3">
          {order.photos.slice(0, 3).map((photo, index) => (
            <div
              key={index}
              className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden"
            >
              <img
                src={photo}
                alt={`商品图片 ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          {order.photos.length > 3 && (
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
              <ImageIcon size={16} className="text-gray-400" />
              <span className="text-xs text-gray-400 ml-0.5">+{order.photos.length - 3}</span>
            </div>
          )}
        </div>
      )}

      {order.packageId && (
        <div className="mt-2 text-xs text-blue-500 bg-blue-50 rounded-lg px-2 py-1 text-center">
          📦 同包裹商品
        </div>
      )}
    </div>
  );
}
