import { Link, useNavigate } from 'react-router-dom';
import { CalendarCheck, User, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '../../store';

export default function Header() {
  const navigate = useNavigate();
  const { isAdminLoggedIn, adminUsername, logoutAdmin } = useAppStore();

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      navigate('/admin/dashboard');
    } else {
      navigate('/admin');
    }
  };

  return (
    <header className="bg-gradient-to-r from-primary-500 to-table-500 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-4xl animate-bounce-gentle">🏓</span>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide group-hover:scale-105 transition-transform">
                乒乓球桌预约
              </h1>
              <p className="text-xs text-white/80">社区活动室</p>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/booking"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-sm font-medium"
            >
              <CalendarCheck size={18} />
              <span className="hidden sm:inline">立即预约</span>
            </Link>
            
            <Link
              to="/my-bookings"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-sm font-medium"
            >
              <User size={18} />
              <span className="hidden sm:inline">我的预约</span>
            </Link>

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAdminClick}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-sm font-medium"
                >
                  <Settings size={18} />
                  <span className="hidden sm:inline">{adminUsername}</span>
                </button>
                <button
                  onClick={() => {
                    logoutAdmin();
                    navigate('/');
                  }}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-red-500/80 hover:bg-red-600 transition-all text-sm font-medium"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 transition-all text-sm font-medium"
              >
                <Settings size={18} />
                <span className="hidden sm:inline">管理</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
