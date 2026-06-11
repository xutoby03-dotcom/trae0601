import { useState, useEffect } from 'react';
import { MapPin, Users, Clock, PlayCircle, CheckCircle2, XCircle, Clock4, ChevronRight, Calendar } from 'lucide-react';
import { useEventStore } from '@/store/eventStore';
import { useAppointmentStore } from '@/store/appointmentStore';
import AppointmentCard from '@/components/AppointmentCard';
import StatusBadge from '@/components/StatusBadge';
import { getWeekday } from '@/utils/time';
import type { Appointment, AppointmentStatus } from '@/types';

interface GroupSectionProps {
  title: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  appointments: Appointment[];
  onCheckIn?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  onNoShow?: (id: string) => void;
  onPostpone?: (id: string) => void;
  emptyText: string;
}

function GroupSection({
  title,
  icon: Icon,
  color,
  bgColor,
  appointments,
  onCheckIn,
  onStart,
  onComplete,
  onNoShow,
  onPostpone,
  emptyText,
}: GroupSectionProps) {
  return (
    <div className="flex flex-col h-full">
      <div className={`${bgColor} rounded-t-xl p-4 flex items-center gap-3`}>
        <div className={`w-10 h-10 rounded-lg ${color} bg-white/80 flex items-center justify-center`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className={`font-bold text-lg ${color.replace('text-', 'text-').split(' ')[0]}`}>
            {title}
          </h2>
          <p className={`text-sm ${color} opacity-80`}>
            共 {appointments.length} 人
          </p>
        </div>
      </div>
      
      <div className="flex-1 bg-white rounded-b-xl border border-t-0 border-warm-100 p-3 overflow-y-auto max-h-[calc(100vh-320px)]">
        {appointments.length === 0 ? (
          <div className="h-full flex items-center justify-center text-warm-400 text-sm py-8">
            {emptyText}
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                onCheckIn={onCheckIn}
                onStart={onStart}
                onComplete={onComplete}
                onNoShow={onNoShow}
                onPostpone={onPostpone}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { events, currentEventId, setCurrentEvent, getTodayEvents } = useEventStore();
  const {
    getAppointmentsByStatus,
    checkIn,
    startService,
    completeService,
    markNoShow,
    postpone,
    callNext,
    getServingAppointments,
    getNextInQueue,
    getEventStats,
  } = useAppointmentStore();

  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const todayEvents = getTodayEvents();
  const currentEvent = events.find(e => e.id === currentEventId) || todayEvents[0];

  const servingAppointments = currentEvent ? getServingAppointments(currentEvent.id) : [];
  const nextInQueue = currentEvent ? getNextInQueue(currentEvent.id) : null;
  const stats = currentEvent ? getEventStats(currentEvent.id) : null;

  const checkedInAppts = currentEvent ? getAppointmentsByStatus(currentEvent.id, 'checked-in') : [];
  const waitlistAppts = currentEvent ? getAppointmentsByStatus(currentEvent.id, 'waitlist') : [];
  const completedAppts = currentEvent ? getAppointmentsByStatus(currentEvent.id, 'completed') : [];
  const noShowAppts = currentEvent ? getAppointmentsByStatus(currentEvent.id, 'no-show') : [];
  const bookedAppts = currentEvent ? getAppointmentsByStatus(currentEvent.id, 'booked') : [];
  
  const allCheckedIn = [...servingAppointments, ...checkedInAppts].sort(
    (a, b) => (a.queueNumber || 0) - (b.queueNumber || 0)
  );

  const handleCallNext = () => {
    if (currentEvent) {
      callNext(currentEvent.id);
      forceUpdate(n => n + 1);
    }
  };

  if (!currentEvent) {
    return (
      <div className="container mx-auto py-8">
        <div className="card p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-warm-100 flex items-center justify-center">
            <Calendar className="w-10 h-10 text-warm-400" />
          </div>
          <h2 className="text-xl font-bold text-warm-800 mb-2">今日暂无理发活动</h2>
          <p className="text-warm-500 mb-6">请前往理发日页面创建新的理发活动</p>
          <button
            onClick={() => window.location.href = '/events/new'}
            className="btn-primary"
          >
            创建理发日
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="card p-5 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <ScissorsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-warm-800">
                  {currentEvent.date} {getWeekday(currentEvent.date)} 公益理发
                </h1>
                <StatusBadge status={currentEvent.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-warm-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {currentEvent.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {currentEvent.startTime} - {currentEvent.endTime}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {currentEvent.barberCount} 位理发师
                </span>
                <span className="text-primary-600 font-medium">
                  总名额 {currentEvent.totalCapacity} 人
                </span>
              </div>
            </div>
          </div>

          {todayEvents.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-warm-500">切换场次:</span>
              <select
                value={currentEventId || ''}
                onChange={(e) => setCurrentEvent(e.target.value)}
                className="input py-2 text-sm"
              >
                {todayEvents.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.startTime} 场 - {event.location}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-5 pt-5 border-t border-warm-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-warm-800">{stats.totalAppointments}</p>
              <p className="text-sm text-warm-500">总预约</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">{stats.completedCount}</p>
              <p className="text-sm text-warm-500">已完成</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">{stats.servingCount + stats.checkedInCount}</p>
              <p className="text-sm text-warm-500">等待/服务中</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-danger-600">{stats.noShowRate}%</p>
              <p className="text-sm text-warm-500">爽约率</p>
            </div>
          </div>
        )}
      </div>

      <div className="card p-6 mb-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <p className="text-primary-100 text-sm mb-1">当前服务中</p>
              <div className="flex items-end gap-2">
                {servingAppointments.length > 0 ? (
                  servingAppointments.map(appt => (
                    <div key={appt.id} className="text-center">
                      <span className="text-4xl font-bold">
                        {appt.queueNumber ? String(appt.queueNumber).padStart(3, '0') : '---'}
                      </span>
                      <p className="text-sm text-primary-100 mt-1">{appt.elderName}</p>
                    </div>
                  ))
                ) : (
                  <span className="text-4xl font-bold opacity-50">--</span>
                )}
              </div>
            </div>

            <div className="h-16 w-px bg-white/30" />

            <div className="text-center">
              <p className="text-primary-100 text-sm mb-1">下一位</p>
              {nextInQueue ? (
                <>
                  <span className="text-4xl font-bold">
                    {nextInQueue.queueNumber ? String(nextInQueue.queueNumber).padStart(3, '0') : '---'}
                  </span>
                  <p className="text-sm text-primary-100 mt-1">{nextInQueue.elderName}</p>
                </>
              ) : (
                <span className="text-4xl font-bold opacity-50">--</span>
              )}
            </div>
          </div>

          <button
            onClick={handleCallNext}
            disabled={!nextInQueue}
            className="bg-white text-primary-600 px-8 py-3 rounded-xl font-bold text-lg hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
          >
            <PlayCircle className="w-6 h-6" />
            叫下一位
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GroupSection
          title="等待中"
          icon={Clock4}
          color="text-primary-600"
          bgColor="bg-primary-50"
          appointments={allCheckedIn}
          onStart={startService}
          onNoShow={markNoShow}
          emptyText="暂无等待中的老人"
        />

        <GroupSection
          title="已预约"
          icon={Users}
          color="text-info-600"
          bgColor="bg-info-50"
          appointments={bookedAppts}
          onCheckIn={checkIn}
          onNoShow={markNoShow}
          emptyText="暂无已预约未签到"
        />

        <GroupSection
          title="候补"
          icon={ChevronRight}
          color="text-warning-600"
          bgColor="bg-warning-50"
          appointments={waitlistAppts}
          emptyText="暂无候补助阵"
        />

        <GroupSection
          title="已完成"
          icon={CheckCircle2}
          color="text-success-600"
          bgColor="bg-success-50"
          appointments={completedAppts}
          emptyText="暂无完成记录"
        />
      </div>

      {noShowAppts.length > 0 && (
        <div className="mt-4">
          <GroupSection
            title="爽约"
            icon={XCircle}
            color="text-danger-600"
            bgColor="bg-danger-50"
            appointments={noShowAppts}
            emptyText="暂无爽约记录"
          />
        </div>
      )}
    </div>
  );
}

function ScissorsIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 8.12 15.88" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
    </svg>
  );
}
