import { MapPin, Phone, Users, Baby, AlertCircle } from 'lucide-react';
import type { Booking, Route } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, getBookingStatusLabel } from '@/utils/helpers';
import { useCarpoolStore } from '@/store/useCarpoolStore';

interface BookingCardProps {
  booking: Booking;
  showActions?: boolean;
  onConfirm?: () => void;
  onReject?: () => void;
  onMarkNoShow?: () => void;
}

export const BookingCard = ({
  booking,
  showActions = false,
  onConfirm,
  onReject,
  onMarkNoShow
}: BookingCardProps) => {
  const route = useCarpoolStore((state) => state.getRouteById(booking.routeId));
  const users = useCarpoolStore((state) => state.users);
  const passenger = users.find((u) => u.id === booking.passengerId);

  const getNoShowWarning = () => {
    if (!passenger || passenger.noShowCount === 0) return null;
    if (passenger.noShowCount >= 3) {
      return { text: '高危爽约用户', color: 'text-red-600 bg-red-50' };
    }
    if (passenger.noShowCount >= 2) {
      return { text: '多次爽约记录', color: 'text-orange-600 bg-orange-50' };
    }
    return { text: '有爽约记录', color: 'text-amber-600 bg-amber-50' };
  };

  const warning = getNoShowWarning();

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={passenger?.avatar}
            alt={booking.passengerName}
            className="w-10 h-10 rounded-full bg-gray-100"
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{booking.passengerName}</p>
              {warning && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${warning.color}`}>
                  <AlertCircle className="w-3 h-3" />
                  {warning.text}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              {formatDateTime(booking.createdAt)} 申请
            </p>
          </div>
        </div>
        <StatusBadge type="booking" status={booking.status} />
      </div>

      {route && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
            <MapPin className="w-4 h-4 text-teal-500" />
            <span>{route.departure} → {route.destination}</span>
          </div>
          <p className="text-xs text-gray-500">
            出发时间: {formatDateTime(route.departureTime)}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{booking.passengerCount} 人</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{booking.pickupPoint}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{booking.contactPhone}</span>
        </div>
        {booking.hasElderlyOrChild && (
          <div className="flex items-center gap-2">
            <Baby className="w-4 h-4 text-teal-500" />
            <span className="text-sm text-teal-600">有老人/小孩</span>
          </div>
        )}
      </div>

      {booking.remarks && (
        <div className="bg-amber-50 rounded-lg p-3 mb-3">
          <p className="text-sm text-amber-700">
            <span className="font-medium">备注: </span>
            {booking.remarks}
          </p>
        </div>
      )}

      {showActions && booking.status === 'pending' && (
        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-colors"
          >
            确认
          </button>
          <button
            onClick={onReject}
            className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            拒绝
          </button>
        </div>
      )}

      {showActions && booking.status === 'confirmed' && (
        <button
          onClick={onMarkNoShow}
          className="w-full py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
        >
          标记爽约
        </button>
      )}

      {!showActions && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">
            状态: {getBookingStatusLabel(booking.status)}
          </span>
        </div>
      )}
    </div>
  );
};
