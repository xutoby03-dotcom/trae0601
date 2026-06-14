import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, User, Users, Car } from 'lucide-react';
import { useTripStore } from '@/store/useTripStore';
import { formatDate, formatCurrency, calculateSettlement } from '@/utils/calculation';
import PageLayout from '@/components/PageLayout';

export default function TripList() {
  const navigate = useNavigate();
  const { trips, isLoaded, loadTrips } = useTripStore();

  useEffect(() => {
    if (!isLoaded) {
      loadTrips();
    }
  }, [isLoaded, loadTrips]);

  return (
    <PageLayout>
      <div className="px-4 pt-6 pb-4">
        <div className="mb-2">
          <span className="text-teal-600 text-sm font-medium">🚗 拼车费用结算</span>
        </div>
        <h1 className="text-3xl font-bold text-stone-800 font-serif mb-1">
          出行账本
        </h1>
        <p className="text-stone-500 text-sm">记录每一段旅程的美好与费用</p>
      </div>

      <div className="px-4 space-y-4">
        {trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-teal-50 rounded-full flex items-center justify-center">
              <Car size={36} className="text-teal-400" />
            </div>
            <p className="text-stone-500 mb-4">还没有行程记录</p>
            <p className="text-stone-400 text-sm">点击下方按钮创建你的第一次拼车</p>
          </div>
        ) : (
          trips.map(trip => {
            const settlement = calculateSettlement(trip);
            return (
              <div
                key={trip.id}
                onClick={() => navigate(`/trip/${trip.id}`)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-amber-100 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-stone-800 font-serif flex items-center gap-2">
                      <MapPin size={18} className="text-orange-500" />
                      {trip.destination}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-sm text-stone-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(trip.departureTime)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-500">
                      {formatCurrency(settlement.totalCost)}
                    </p>
                    <p className="text-xs text-stone-400">总费用</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-amber-50">
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <User size={14} className="text-teal-500" />
                    <span>司机：{trip.driverName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-600">
                    <Users size={14} className="text-teal-500" />
                    <span>{trip.passengers.length}人</span>
                    <span className="text-stone-300">|</span>
                    <span>{trip.kilometers}km</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => navigate('/trip/new')}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-200 flex items-center justify-center hover:shadow-xl hover:scale-105 transition-all active:scale-95"
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      </div>
    </PageLayout>
  );
}
