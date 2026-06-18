import { useState, useMemo } from 'react';
import { Search, Filter, MapPin, Clock } from 'lucide-react';
import { RouteCard } from '@/components/RouteCard';
import { useCarpoolStore } from '@/store/useCarpoolStore';
import { isTimeWithin30Minutes } from '@/utils/helpers';
import type { Route } from '@/types';

export const RouteList = () => {
  const store = useCarpoolStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDestination, setFilterDestination] = useState('all');
  const [filterTime, setFilterTime] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const allRoutes = store.routes;

  const destinations = useMemo(() => {
    const uniqueDestinations = [...new Set(allRoutes.map((r) => r.destination))];
    return uniqueDestinations;
  }, [allRoutes]);

  const filteredRoutes = useMemo(() => {
    return allRoutes.filter((route) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          route.departure.toLowerCase().includes(query) ||
          route.destination.toLowerCase().includes(query) ||
          route.ownerName.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filterDestination !== 'all' && route.destination !== filterDestination) {
        return false;
      }

      if (filterTime && !isTimeWithin30Minutes(route.departureTime, filterTime)) {
        return false;
      }

      return true;
    });
  }, [allRoutes, searchQuery, filterDestination, filterTime]);

  const sortedRoutes = [...filteredRoutes].sort(
    (a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
  );

  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'open' | 'full' | 'other'>('all');

  const displayRoutes = sortedRoutes.filter((route) => {
    if (activeStatusFilter === 'all') return true;
    if (activeStatusFilter === 'open') return route.status === 'open';
    if (activeStatusFilter === 'full') return route.status === 'full';
    return route.status === 'closed' || route.status === 'completed' || route.status === 'cancelled';
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">路线列表</h1>
          <p className="text-sm text-gray-500 mt-1">共 {allRoutes.length} 条路线</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索出发地、目的地或车主..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
              showFilters
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            筛选
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                目的地
              </label>
              <select
                value={filterDestination}
                onChange={(e) => setFilterDestination(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">全部目的地</option>
                {destinations.map((dest) => (
                  <option key={dest} value={dest}>
                    {dest}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                出发时间（前后30分钟）
              </label>
              <input
                type="time"
                value={filterTime}
                onChange={(e) => setFilterTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: '全部', count: sortedRoutes.length },
          { key: 'open', label: '招募中', count: sortedRoutes.filter((r) => r.status === 'open').length },
          { key: 'full', label: '已满座', count: sortedRoutes.filter((r) => r.status === 'full').length },
          { key: 'other', label: '其他', count: sortedRoutes.filter((r) => !['open', 'full'].includes(r.status)).length }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveStatusFilter(tab.key as typeof activeStatusFilter)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeStatusFilter === tab.key
                ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {tab.label}
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              activeStatusFilter === tab.key ? 'bg-white/20' : 'bg-orange-100 text-orange-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {displayRoutes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无符合条件的路线</h3>
          <p className="text-gray-500">请尝试调整筛选条件或稍后再查看</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayRoutes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      )}
    </div>
  );
};
