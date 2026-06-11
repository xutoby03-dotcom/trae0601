import { Link } from 'react-router-dom';
import { Plus, MapPin, Clock, Users, Calendar, Edit2, Trash2, Flag } from 'lucide-react';
import { useEventStore } from '@/store/eventStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import StatusBadge from '@/components/StatusBadge';
import { getWeekday, isToday } from '@/utils/time';

export default function EventList() {
  const { events, deleteEvent, completeEvent } = useEventStore();
  const { getEventStats } = useAppointmentStore();

  const sortedEvents = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const handleDelete = (id: string) => {
    if (window.confirm('确定要删除这个理发日吗？相关的预约记录也会受到影响。')) {
      deleteEvent(id);
    }
  };

  const handleCompleteEvent = (id: string) => {
    if (window.confirm('确定要结束这场理发活动吗？结束后将无法继续叫号服务。')) {
      completeEvent(id);
    }
  };

  const upcomingEvents = sortedEvents.filter(e => 
    e.status !== 'completed' && e.status !== 'cancelled'
  );

  const pastEvents = sortedEvents.filter(e => 
    e.status === 'completed' || e.status === 'cancelled'
  );

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-warm-800">理发日管理</h1>
          <p className="text-warm-500 mt-1">创建和管理公益理发活动</p>
        </div>
        <Link to="/events/new" className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          新建理发日
        </Link>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-warm-700 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary-500" />
          即将开始 ({upcomingEvents.length})
        </h2>
        
        {upcomingEvents.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-warm-400" />
            </div>
            <p className="text-warm-500 mb-4">还没有安排理发日</p>
            <Link to="/events/new" className="btn-primary">
              创建第一个理发日
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingEvents.map(event => {
              const stats = getEventStats(event.id);
              const isTodayEvent = isToday(event.date);
              
              return (
                <div
                  key={event.id}
                  className={`card p-5 hover:shadow-medium transition-all duration-200 ${
                    isTodayEvent ? 'ring-2 ring-primary-500/30' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-lg text-warm-800">
                          {event.date}
                        </h3>
                        {isTodayEvent && (
                          <span className="px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                            今天
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-warm-500">{getWeekday(event.date)}</p>
                    </div>
                    <StatusBadge status={event.status} />
                  </div>

                  <div className="space-y-2 text-sm text-warm-600 mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-warm-400" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-warm-400" />
                      <span>{event.startTime} - {event.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-warm-400" />
                      <span>{event.barberCount} 位理发师 · 每人 {event.durationPerPerson} 分钟</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-warm-500">
                      已预约 <span className="font-semibold text-primary-600">{stats.totalAppointments}</span> / {event.totalCapacity} 人
                    </span>
                    <div className="w-24 h-2 bg-warm-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((stats.totalAppointments / event.totalCapacity) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-warm-100">
                    <Link
                      to={`/events/${event.id}/booking`}
                      className="btn-primary flex-1 text-sm py-2"
                    >
                      预约
                    </Link>
                    <button
                      onClick={() => handleCompleteEvent(event.id)}
                      className="btn-secondary px-3 py-2"
                      title="结束场次"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/events/${event.id}/edit`}
                      className="btn-secondary px-3 py-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="btn-ghost text-danger-600 px-3 py-2 hover:bg-danger-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {pastEvents.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-warm-700 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warm-400" />
            历史记录 ({pastEvents.length})
          </h2>
          
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-warm-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">地点</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-warm-600">时间</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">预约人数</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">完成</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">爽约率</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-warm-600">状态</th>
                </tr>
              </thead>
              <tbody>
                {pastEvents.map(event => {
                  const stats = getEventStats(event.id);
                  return (
                    <tr key={event.id} className="border-t border-warm-100 hover:bg-warm-50">
                      <td className="py-3 px-4 text-sm text-warm-800">
                        {event.date} {getWeekday(event.date)}
                      </td>
                      <td className="py-3 px-4 text-sm text-warm-600">{event.location}</td>
                      <td className="py-3 px-4 text-sm text-warm-600">
                        {event.startTime} - {event.endTime}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-warm-600">
                        {stats.totalAppointments}
                      </td>
                      <td className="py-3 px-4 text-sm text-center text-success-600 font-medium">
                        {stats.completedCount}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className={stats.noShowRate > 10 ? 'text-danger-600' : 'text-warm-600'}>
                          {stats.noShowRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <StatusBadge status={event.status} size="sm" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
