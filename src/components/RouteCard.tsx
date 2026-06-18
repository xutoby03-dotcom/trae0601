import { MapPin, Clock, Users, Baby, Luggage, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Route } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatDateTime, getLuggageSpaceLabel } from '@/utils/helpers';

interface RouteCardProps {
  route: Route;
  showActions?: boolean;
}

export const RouteCard = ({ route, showActions = true }: RouteCardProps) => {
  const navigate = useNavigate();
  const occupiedSeats = route.totalSeats - route.availableSeats;
  const occupancyRate = (occupiedSeats / route.totalSeats) * 100;

  return (
    <div
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 cursor-pointer"
      onClick={() => navigate(`/routes/${route.id}`)}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
            <Car className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">{route.ownerName}</p>
            <p className="text-xs text-gray-500">尾号 {route.plateNumber.slice(-4)}</p>
          </div>
        </div>
        <StatusBadge type="route" status={route.status} />
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-teal-500" />
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700">{route.departure}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-orange-500" />
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-700 font-medium">{route.destination}</span>
        </div>
        <div className="flex items-center gap-3 ml-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{formatDateTime(route.departureTime)}</span>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center gap-1.5">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">
            {route.availableSeats} / {route.totalSeats} 座
          </span>
        </div>
        {route.hasChildSeat && (
          <div className="flex items-center gap-1.5">
            <Baby className="w-4 h-4 text-teal-500" />
            <span className="text-xs text-teal-600">儿童座椅</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Luggage className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-500">{getLuggageSpaceLabel(route.luggageSpace)}</span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>座位使用</span>
          <span>{Math.round(occupancyRate)}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${occupancyRate}%` }}
          />
        </div>
      </div>

      {showActions && route.status === 'open' && route.availableSeats > 0 && (
        <button
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all duration-200"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/routes/${route.id}`);
          }}
        >
          立即申请
        </button>
      )}

      {showActions && route.status === 'full' && (
        <div className="w-full py-2.5 bg-gray-100 text-gray-500 rounded-lg font-medium text-center">
          已满座
        </div>
      )}
    </div>
  );
};
