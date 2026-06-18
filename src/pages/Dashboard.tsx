import { useState } from 'react';
import { Car, Users, MapPin, AlertTriangle, Baby, ChevronRight, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '@/components/StatCard';
import { RouteCard } from '@/components/RouteCard';
import { BookingCard } from '@/components/BookingCard';
import { StatusBadge } from '@/components/StatusBadge';
import { useCarpoolStore } from '@/store/useCarpoolStore';
import { formatTime } from '@/utils/helpers';

export const Dashboard = () => {
  const navigate = useNavigate();
  const store = useCarpoolStore();
  const [activeTab, setActiveTab] = useState<'today' | 'pending' | 'stats'>('today');

  const todayRoutes = store.getTodayRoutes();
  const pendingBookings = store.getPendingBookings();
  const destinationStats = store.getDestinationStats();
  const noShowList = store.getNoShowList();
  const childSeatBookings = store.getChildSeatBookings();
  const activeChildSeatBookings = childSeatBookings.filter(
    (b) => b.status === 'pending' || b.status === 'confirmed'
  );

  const handleConfirmBooking = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'confirmed');
  };

  const handleRejectBooking = (bookingId: string) => {
    store.updateBookingStatus(bookingId, 'rejected');
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="今日路线"
          value={todayRoutes.length}
          icon={<Car className="w-6 h-6" />}
          color="orange"
          subtitle="条路线待出发"
        />
        <StatCard
          title="待确认"
          value={pendingBookings.length}
          icon={<Users className="w-6 h-6" />}
          color="teal"
          subtitle="个申请待处理"
        />
        <StatCard
          title="热门目的地"
          value={destinationStats[0]?.name || '-'}
          icon={<MapPin className="w-6 h-6" />}
          color="blue"
          subtitle={`${destinationStats[0]?.count || 0} 次出行`}
        />
        <StatCard
          title="爽约记录"
          value={noShowList.length}
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
          subtitle="位用户需注意"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'today', label: '今日路线', count: todayRoutes.length },
          { key: 'pending', label: '待确认乘客', count: pendingBookings.length },
          { key: 'stats', label: '数据统计', count: null }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
            {tab.count !== null && tab.count > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-orange-100 text-orange-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'today' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">今日出发路线</h2>
            <button
              onClick={() => navigate('/routes')}
              className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              查看全部 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {todayRoutes.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">今日暂无路线</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todayRoutes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">待确认乘客申请</h2>
          {pendingBookings.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">暂无待确认申请</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  showActions
                  onConfirm={() => handleConfirmBooking(booking.id)}
                  onReject={() => handleRejectBooking(booking.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold text-gray-900">常用目的地</h3>
            </div>
            {destinationStats.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无数据</p>
            ) : (
              <div className="space-y-3">
                {destinationStats.map((stat, index) => {
                  const maxCount = Math.max(...destinationStats.map((s) => s.count));
                  const percentage = (stat.count / maxCount) * 100;
                  return (
                    <div key={stat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-700">{stat.name}</span>
                        </div>
                        <span className="text-sm text-gray-500">{stat.count} 次</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-400 to-teal-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">爽约名单</h3>
            </div>
            {noShowList.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无爽约记录</p>
            ) : (
              <div className="space-y-3">
                {noShowList.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.phone}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.noShowCount >= 3
                        ? 'bg-red-100 text-red-700'
                        : user.noShowCount >= 2
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      爽约 {user.noShowCount} 次
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Baby className="w-5 h-5 text-teal-500" />
              <h3 className="font-semibold text-gray-900">需要儿童座椅的订单</h3>
            </div>
            {activeChildSeatBookings.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无需要儿童座椅的订单</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">乘客</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">路线</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">出发时间</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">人数</th>
                      <th className="text-left py-3 px-4 text-xs font-medium text-gray-500">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeChildSeatBookings.map((booking) => {
                      const route = store.getRouteById(booking.routeId);
                      return (
                        <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <img
                                src={store.users.find((u) => u.id === booking.passengerId)?.avatar}
                                alt={booking.passengerName}
                                className="w-8 h-8 rounded-full"
                              />
                              <span className="text-sm font-medium text-gray-900">{booking.passengerName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {route ? `${route.departure} → ${route.destination}` : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {route ? formatTime(route.departureTime) : '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">{booking.passengerCount} 人</td>
                          <td className="py-3 px-4">
                            <StatusBadge type="booking" status={booking.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
