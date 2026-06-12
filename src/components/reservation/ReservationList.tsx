import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReservationStore } from '@/store/reservationStore';
import { ReservationStatus } from '@/types';
import { isToday } from '@/utils/date';
import ReservationCard from './ReservationCard';
import EmptyState from '@/components/common/EmptyState';
import { CalendarCheck, Clock, CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const statusTabs: { key: ReservationStatus | 'all'; label: string; icon: typeof Clock }[] = [
  { key: 'all', label: '全部', icon: CalendarCheck },
  { key: 'pending', label: '待取花', icon: Clock },
  { key: 'to_confirm', label: '待确认', icon: AlertCircle },
  { key: 'completed', label: '已完成', icon: CheckCircle },
  { key: 'cancelled', label: '已取消', icon: XCircle },
];

export default function ReservationList() {
  const { reservations } = useReservationStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const todayParam = searchParams.get('today');
  const statusParam = searchParams.get('status') as ReservationStatus | 'all' | null;

  const isTodayMode = todayParam === '1';

  const todayReservations = isTodayMode
    ? reservations.filter(r => isToday(r.pickupTime))
    : reservations;

  const [activeTab, setActiveTab] = useState<ReservationStatus | 'all'>(
    isTodayMode
      ? 'all'
      : statusParam && ['all', 'pending', 'to_confirm', 'completed', 'cancelled'].includes(statusParam)
        ? statusParam
        : 'all'
  );

  useEffect(() => {
    const todayParam = searchParams.get('today');
    const statusParam = searchParams.get('status') as ReservationStatus | 'all' | null;
    if (todayParam === '1') {
      setActiveTab('all');
    } else if (statusParam && ['all', 'pending', 'to_confirm', 'completed', 'cancelled'].includes(statusParam)) {
      setActiveTab(statusParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ReservationStatus | 'all') => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams);
    if (tab === 'all') {
      params.delete('status');
    } else {
      params.set('status', tab);
    }
    setSearchParams(params, { replace: true });
  };

  const clearToday = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('today');
    setSearchParams(params, { replace: true });
  };

  const baseList = isTodayMode ? todayReservations : reservations;

  const filteredReservations = activeTab === 'all'
    ? baseList
    : baseList.filter(r => r.status === activeTab);

  const getCount = (status: ReservationStatus | 'all') => {
    if (status === 'all') return baseList.length;
    return baseList.filter(r => r.status === status).length;
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="bg-white rounded-2xl p-2 shadow-soft inline-flex gap-1">
          {statusTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-rose-400 to-rose-500 text-white shadow-md'
                    : 'text-forest-500 hover:bg-cream-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-cream-200 text-forest-500'
                }`}>
                  {getCount(tab.key)}
                </span>
              </button>
            );
          })}
        </div>

        {isTodayMode && (
          <div className="flex items-center gap-2 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm font-medium text-rose-700">
            <CalendarCheck className="w-4 h-4" />
            <span>今日取花</span>
            <button
              onClick={clearToday}
              className="p-0.5 rounded hover:bg-rose-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {filteredReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReservations.map((reservation, index) => (
            <div 
              key={reservation.id}
              style={{ animationDelay: `${index * 0.05}s` }}
              className="animate-fade-in-up"
            >
              <ReservationCard reservation={reservation} />
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="暂无预留订单"
          description="在花束看板中选择花束创建预留订单吧"
        />
      )}
    </div>
  );
}
