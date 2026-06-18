import { useState, useMemo } from 'react';
import { ClipboardList, Filter } from 'lucide-react';
import { BookingCard } from '@/components/BookingCard';
import { useCarpoolStore } from '@/store/useCarpoolStore';
import type { BookingStatus } from '@/types';

export const OrderList = () => {
  const store = useCarpoolStore();
  const [activeTab, setActiveTab] = useState<'all' | BookingStatus>('all');

  const myBookings = store.getMyBookings();
  const myRoutes = store.getMyRoutes();
  const myRouteBookings = useMemo(() => {
    return store.bookings.filter((b) =>
      myRoutes.some((r) => r.id === b.routeId)
    );
  }, [store.bookings, myRoutes]);

  const allBookings = useMemo(() => {
    const all = [...myBookings, ...myRouteBookings];
    const unique = all.filter((booking, index, self) =>
      index === self.findIndex((b) => b.id === booking.id)
    );
    return unique.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [myBookings, myRouteBookings]);

  const filteredBookings = useMemo(() => {
    if (activeTab === 'all') return allBookings;
    return allBookings.filter((b) => b.status === activeTab);
  }, [allBookings, activeTab]);

  const tabs = [
    { key: 'all', label: '全部', count: allBookings.length },
    { key: 'pending', label: '待确认', count: allBookings.filter((b) => b.status === 'pending').length },
    { key: 'confirmed', label: '已确认', count: allBookings.filter((b) => b.status === 'confirmed').length },
    { key: 'completed', label: '已完成', count: allBookings.filter((b) => b.status === 'completed').length },
    { key: 'cancelled', label: '已取消', count: allBookings.filter((b) => b.status === 'cancelled').length },
    { key: 'no_show', label: '已爽约', count: allBookings.filter((b) => b.status === 'no_show').length }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-sm text-gray-500 mt-1">共 {allBookings.length} 条订单记录</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">筛选状态</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.key ? 'bg-white/20' : 'bg-white text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无订单记录</h3>
          <p className="text-gray-500">您还没有相关的订单记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};
