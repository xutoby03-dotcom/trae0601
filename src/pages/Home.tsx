import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarPlus, User, QrCode, Undo2 } from 'lucide-react';
import { useAppStore } from '../store';
import Header from '../components/layout/Header';
import TableCard from '../components/common/TableCard';
import TimelineView from '../components/booking/TimelineView';
import { getTodayString } from '../utils/timeUtils';
import { formatDateChinese } from '../utils/timeUtils';

export default function Home() {
  const navigate = useNavigate();
  const { tables, bookings, refreshData } = useAppStore();
  const today = getTodayString();

  useEffect(() => {
    refreshData();
  }, []);

  const quickActions = [
    { icon: CalendarPlus, label: '立即预约', color: 'bg-primary-500', onClick: () => navigate('/booking') },
    { icon: User, label: '我的预约', color: 'bg-table-500', onClick: () => navigate('/my-bookings') },
    { icon: QrCode, label: '签到', color: 'bg-floor-500', onClick: () => navigate('/checkin/quick') },
    { icon: Undo2, label: '归还', color: 'bg-purple-500', onClick: () => navigate('/return/quick') },
  ];

  const availableTables = tables.filter((t) => t.status === 'available').length;
  const todayBookings = bookings.filter((b) => b.date === today && b.status !== 'cancelled').length;

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-500 via-primary-400 to-table-500 p-8 mb-8 text-white">
          <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -right-20 bottom-0 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-end gap-2 mb-2">
              <span className="text-6xl animate-bounce-gentle">🏓</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
              欢迎使用乒乓球桌预约系统
            </h2>
            <p className="text-white/90 mb-6 max-w-xl">
              在线预约，告别排队。有序使用球桌，享受运动乐趣！
            </p>
            
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-4">
                <div className="text-3xl font-bold">{availableTables}</div>
                <div className="text-sm text-white/80">张球桌可用</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-4">
                <div className="text-3xl font-bold">{todayBookings}</div>
                <div className="text-sm text-white/80">今日预约</div>
              </div>
              <div className="bg-white/20 backdrop-blur rounded-2xl px-6 py-4">
                <div className="text-2xl font-bold">{formatDateChinese(today)}</div>
                <div className="text-sm text-white/80">今日日期</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={action.onClick}
                className="card p-6 flex flex-col items-center gap-3 group hover:scale-105 transition-transform"
              >
                <div className={`${action.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg`}>
                  <Icon size={28} />
                </div>
                <span className="font-medium text-gray-700">{action.label}</span>
              </button>
            );
          })}
        </div>

        <h3 className="font-display text-2xl font-bold text-gray-800 mb-4">球桌状态</h3>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onClick={() => navigate(`/booking?table=${table.id}`)}
            />
          ))}
        </div>

        <TimelineView tables={tables} bookings={bookings} date={today} />
      </main>
    </div>
  );
}
