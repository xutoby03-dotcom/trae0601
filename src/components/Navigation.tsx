import { NavLink } from 'react-router-dom';
import { Film, CalendarDays, BarChart3, Users, Ticket } from 'lucide-react';
import { useMovieStore } from '../store/useMovieStore';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', label: '片单', icon: Film },
  { path: '/arrangement', label: '观影安排', icon: CalendarDays },
  { path: '/stats', label: '统计', icon: BarChart3 },
];

export default function Navigation() {
  const { currentEvent, users, currentUserId, setShowConfirmModal, getCurrentUser } =
    useMovieStore();
  const currentUser = getCurrentUser();

  const handleDecideClick = () => {
    if (currentEvent.status !== 'voting') return;
    setShowConfirmModal(true);
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#1A0B2E]/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
              {currentEvent.title}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Users className="w-3 h-3" />
              <span>{users.length}人参与</span>
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/5 border border-white/10">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r from-pink-500/20 to-amber-400/20 text-white shadow-inner border border-white/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                )
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDecideClick}
            className={cn(
              'px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300',
              currentEvent.status === 'voting'
                ? 'bg-gradient-to-r from-pink-500 to-amber-400 text-white shadow-lg shadow-pink-500/40 hover:shadow-pink-500/60 hover:scale-105 active:scale-95'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            )}
            disabled={currentEvent.status !== 'voting'}
          >
            {currentEvent.status === 'voting' ? '🎬 定片' : '✅ 已定'}
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <span className="text-lg">{currentUser?.avatar}</span>
            <span className="text-sm text-white/80 font-medium hidden sm:block">
              {currentUser?.name}
            </span>
            {currentUser?.isHost && (
              <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 text-[10px] font-bold">
                群主
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden flex justify-center gap-1 px-6 pb-3">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex-1 flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium transition-all',
                isActive
                  ? 'bg-gradient-to-br from-pink-500/20 to-amber-400/20 text-white border border-white/10'
                  : 'text-white/50'
              )
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
