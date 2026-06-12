import { useNavigate } from 'react-router-dom';
import { useReservationStore } from '@/store/reservationStore';
import { formatDateShort, formatPrice } from '@/utils/date';
import StatusBadge from '@/components/reservation/StatusBadge';
import EmptyState from '@/components/common/EmptyState';
import { Clock, Calendar, ChevronRight } from 'lucide-react';

export default function TodayPickups() {
  const navigate = useNavigate();
  const { getTodayPickups } = useReservationStore();
  const todayPickups = getTodayPickups();

  const goToPending = () => {
    navigate('/reservations?status=pending');
  };

  return (
    <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
      <div
        onClick={goToPending}
        className="px-5 py-4 border-b border-cream-200 cursor-pointer hover:bg-cream-50 transition-colors"
      >
        <h3 className="font-semibold font-serif text-forest-700 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-rose-400" />
          今日待取花
          <span className="ml-auto flex items-center gap-1 text-sm">
            <span className="font-normal text-forest-400">{todayPickups.length} 笔</span>
            <ChevronRight className="w-4 h-4 text-rose-400" />
          </span>
        </h3>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {todayPickups.length > 0 ? (
          <div className="divide-y divide-cream-100">
            {todayPickups.map((reservation) => (
              <div key={reservation.id} className="px-5 py-4 hover:bg-cream-50 transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={reservation.bouquetPhoto}
                    alt={reservation.bouquetName}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-forest-700 truncate">
                        {reservation.bouquetName}
                      </h4>
                      <StatusBadge status={reservation.status} />
                    </div>
                    <p className="text-sm text-forest-500 mt-0.5">
                      {reservation.customerName} · x{reservation.quantity}束
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-sm text-rose-500 font-medium">
                      <Clock className="w-4 h-4" />
                      {formatDateShort(reservation.pickupTime).split(' ')[1]}
                    </div>
                    <p className="text-xs text-forest-400 mt-1">
                      定金 {formatPrice(reservation.deposit)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            title="今日暂无取花订单"
            description="今天还没有预留今天取花的订单"
          />
        )}
      </div>
    </div>
  );
}
