import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useReservationStore } from '@/store/reservationStore';
import { ReservationStatus } from '@/types';
import ReservationCard from './ReservationCard';
import EmptyState from '@/components/common/EmptyState';
import { CalendarCheck, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  const statusParam = searchParams.get('status') as ReservationStatus | 'all' | null;
  
  const [activeTab, setActiveTab] = useState<ReservationStatus | 'all'>(
    statusParam && ['all', 'pending', 'to_confirm', 'completed', 'cancelled'].includes(statusParam)
      ? statusParam
      : 'all'
  );

  useEffect(() => {
    const statusParam = searchParams.get('status') as ReservationStatus | 'all' | null;
    if (statusParam && ['all', 'pending', 'to_confirm', 'completed', 'cancelled'].includes(statusParam)) {
      setActiveTab(statusParam);
    }
  }, [searchParams]);

  const handleTabChange = (tab: ReservationStatus | 'all') => {
    setActiveTab(tab);
    if (tab === 'all') {
      searchParams.delete('status');
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ status: tab }, { replace: true });
    }
  };

  const filteredReservations = activeTab === 'all'
    ? reservations
    : reservations.filter(r => r.status === activeTab);

  const getCount = (status: ReservationStatus | 'all') => {
    if (status === 'all') return reservations.length;
    return reservations.filter(r => r.status === status).length;
  };

  return (
    <div>
      <div className="bg-white rounded-2xl p-2 shadow-soft mb-6 inline-flex gap-1">
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
