import { useState } from 'react';
import { Users, Search, Filter, Calendar, ChevronDown } from 'lucide-react';
import { useAppointmentStore } from '@/store/appointmentStore';
import { useEventStore } from '@/store/eventStore';
import AppointmentCard from '@/components/AppointmentCard';
import StatusBadge from '@/components/StatusBadge';
import type { AppointmentStatus } from '@/types';

const statusOptions: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'booked', label: '已预约' },
  { value: 'checked-in', label: '已签到' },
  { value: 'serving', label: '服务中' },
  { value: 'completed', label: '已完成' },
  { value: 'no-show', label: '爽约' },
  { value: 'waitlist', label: '候补' },
];

export default function Appointments() {
  const { appointments, checkIn, startService, completeService, markNoShow, postpone } = useAppointmentStore();
  const { events } = useEventStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const filteredAppointments = appointments.filter(appt => {
    const matchesSearch = appt.elderName.includes(searchQuery) || 
                          appt.phone.includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
    const matchesEvent = eventFilter === 'all' || appt.eventId === eventFilter;
    
    return matchesSearch && matchesStatus && matchesEvent;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getEventInfo = (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    return event ? `${event.date} ${event.location}` : '未知场次';
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">预约记录</h1>
          <p className="text-warm-500 mt-1">查看和管理所有预约记录</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary"
          >
            <Filter className="w-4 h-4 mr-2" />
            筛选
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索姓名或电话..."
              className="input pl-10"
            />
          </div>
          
          {showFilters && (
            <>
              <div className="min-w-[150px]">
                <label className="label">状态</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                  className="input py-2"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="min-w-[200px]">
                <label className="label">场次</label>
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="input py-2"
                >
                  <option value="all">全部场次</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.date} - {event.location}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-warm-100 text-sm text-warm-500">
          <span>共 {filteredAppointments.length} 条记录</span>
          {statusFilter !== 'all' && (
            <span className="text-primary-600">
              筛选: {statusOptions.find(o => o.value === statusFilter)?.label}
            </span>
          )}
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
            <Users className="w-10 h-10 text-warm-400" />
          </div>
          <p className="text-warm-500 mb-4">暂无预约记录</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map(appt => (
            <div key={appt.id} className="space-y-2">
              <AppointmentCard
                appointment={appt}
                onCheckIn={checkIn}
                onStart={startService}
                onComplete={completeService}
                onNoShow={markNoShow}
                onPostpone={postpone}
              />
              <div className="flex items-center gap-2 text-xs text-warm-500 px-1">
                <Calendar className="w-3 h-3" />
                <span>{getEventInfo(appt.eventId)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
