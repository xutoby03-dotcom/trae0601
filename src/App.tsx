import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Home, CalendarPlus, BarChart3, Settings, Bell, ShieldCheck, ShieldAlert } from 'lucide-react';
import HomePage from './pages/Home';
import BookingPage from './pages/Booking';
import BookingDetail from './pages/BookingDetail';
import StatisticsPage from './pages/Statistics';
import AdminPage from './pages/Admin';
import FeedbackModal from './components/FeedbackModal';
import NotificationPanel from './components/NotificationPanel';
import { useStore } from './store';

export default function App() {
  const location = useLocation();
  const checkOverdueBookings = useStore(s => s.checkOverdueBookings);
  const { notifications, markNotificationRead, setAdminMode, isAdmin } = useStore(s => ({
    notifications: s.notifications,
    markNotificationRead: s.markNotificationRead,
    setAdminMode: s.setAdminMode,
    isAdmin: s.isAdmin,
  }));
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackBookingId, setFeedbackBookingId] = useState<string | null>(null);

  useEffect(() => {
    checkOverdueBookings();
    const interval = setInterval(checkOverdueBookings, 60000);
    return () => clearInterval(interval);
  }, [checkOverdueBookings]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { path: '/', label: '首页', icon: Home },
    { path: '/booking', label: '预约', icon: CalendarPlus },
    { path: '/statistics', label: '统计', icon: BarChart3 },
    { path: '/admin', label: '管理', icon: Settings },
  ];

  const openFeedback = (bookingId: string) => {
    setFeedbackBookingId(bookingId);
    setShowFeedback(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
              🎹
            </div>
            <span className="font-bold text-xl text-gray-800">练琴房预约</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setAdminMode(!isAdmin)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors ${isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {isAdmin ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
              {isAdmin ? '管理员模式' : '用户模式'}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className="p-2 rounded-lg hover:bg-gray-100 relative"
              >
                <Bell size={20} className="text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifPanel && (
                <NotificationPanel onClose={() => setShowNotifPanel(false)} />
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
        <Routes>
          <Route path="/" element={<HomePage onOpenFeedback={openFeedback} />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/admin" element={<AdminPage onOpenFeedback={openFeedback} />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-around py-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                    active ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {showFeedback && feedbackBookingId && (
        <FeedbackModal
          bookingId={feedbackBookingId}
          onClose={() => { setShowFeedback(false); setFeedbackBookingId(null); }}
        />
      )}

      <div className="h-20"></div>
    </div>
  );
}
