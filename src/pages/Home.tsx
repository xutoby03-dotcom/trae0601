import { useEffect } from 'react';
import { Calendar, Settings, Users, ClipboardList, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';
import TimelineBoard from '@/components/TimelineBoard';
import { Link } from 'react-router-dom';

export default function Home() {
  const { tables, reservations, selectedDate, fetchTables, fetchReservations, setSelectedDate } = useStore();

  useEffect(() => {
    fetchTables();
    fetchReservations();
  }, [fetchTables, fetchReservations]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return `${date.getMonth() + 1}月${date.getDate()}日 ${weekdays[date.getDay()]}`;
  };

  const isToday = (dateStr: string) => {
    return dateStr === new Date().toISOString().split('T')[0];
  };

  const changeDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const activeReservations = reservations.filter(r => r.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-warm-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">棋</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">社区棋牌室</h1>
                <p className="text-xs text-gray-500">桌位预约系统</p>
              </div>
            </div>

            <Link
              to="/admin/login"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <Settings size={18} />
              <span className="text-sm font-medium">管理后台</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users className="text-primary-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">可用桌位</p>
                <p className="text-2xl font-bold text-gray-800">{tables.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="text-success-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">今日预约</p>
                <p className="text-2xl font-bold text-gray-800">{activeReservations.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-warm-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-warm-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-500">当前进行中</p>
                <p className="text-2xl font-bold text-gray-800">
                  {reservations.filter(r => r.status === 'checked_in').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="text-primary-500" size={20} />
              <h2 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDate)}
                {isToday(selectedDate) && (
                  <span className="ml-2 text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded-full">今天</span>
                )}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeDate(-1)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                前一天
              </button>
              <button
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="px-3 py-1.5 bg-primary-50 text-primary-600 hover:bg-primary-100 rounded-lg transition-colors text-sm font-medium"
              >
                今天
              </button>
              <button
                onClick={() => changeDate(1)}
                className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                后一天
              </button>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">时间轴看板</h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-primary-100 border border-primary-300"></span>
                <span className="text-gray-600">待签到</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-success-200 border border-success-400"></span>
                <span className="text-gray-600">已签到</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-red-100 border border-red-300"></span>
                <span className="text-gray-600">爽约</span>
              </div>
            </div>
          </div>
          <TimelineBoard tables={tables} reservations={reservations} selectedDate={selectedDate} />
          <p className="text-sm text-gray-400 mt-3 text-center">
            点击空闲时段即可预约 · 支持点击已有的预约查看详情
          </p>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-100 mt-8 py-6">
        <div className="container text-center text-sm text-gray-400">
          <p>社区棋牌室预约系统 · 为您提供舒适的休闲环境</p>
        </div>
      </footer>
    </div>
  );
}
