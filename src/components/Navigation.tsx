import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Film, CalendarDays, BarChart3, Users, Ticket, ChevronDown, Check, Repeat } from 'lucide-react';
import { useMovieStore } from '../store/useMovieStore';
import { cn } from '../lib/utils';

const navItems = [
  { path: '/', label: '片单', icon: Film },
  { path: '/arrangement', label: '观影安排', icon: CalendarDays },
  { path: '/stats', label: '统计', icon: BarChart3 },
];

export default function Navigation() {
  const {
    currentEvent,
    users,
    currentUserId,
    setShowConfirmModal,
    getCurrentUser,
    showUserSwitcher,
    setShowUserSwitcher,
    setCurrentUserId,
    getMovieVotes,
    movies,
  } = useMovieStore();

  const currentUser = getCurrentUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowUserSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowUserSwitcher]);

  const handleDecideClick = () => {
    if (currentEvent.status !== 'voting') return;
    setShowConfirmModal(true);
  };

  const handleUserSelect = (userId: string) => {
    setCurrentUserId(userId);
  };

  const getUserVoteCount = (userId: string) => {
    let count = 0;
    movies.forEach((m) => {
      const v = getMovieVotes(m.id);
      if (v.userVotes[userId]) count++;
    });
    return { voted: count, total: movies.length };
  };

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-xl bg-[#1A0B2E]/90 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1
              className="text-lg font-bold text-white tracking-wide"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
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

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowUserSwitcher(!showUserSwitcher)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border transition-all',
                showUserSwitcher
                  ? 'border-pink-500/40 bg-white/[0.08]'
                  : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
              )}
            >
              <Repeat className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xl">{currentUser?.avatar}</span>
              <span className="text-sm text-white/80 font-medium hidden sm:block">
                {currentUser?.name}
              </span>
              {currentUser?.isHost && (
                <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 text-[10px] font-bold">
                  群主
                </span>
              )}
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-white/40 transition-transform',
                  showUserSwitcher && 'rotate-180'
                )}
              />
            </button>

            {showUserSwitcher && (
              <div
                className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#1A0B2E] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden"
                style={{ animation: 'scaleIn 0.2s ease-out', transformOrigin: 'top right' }}
              >
                <div className="px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                  <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
                    切换身份投票
                  </p>
                </div>
                <div className="p-2">
                  {users.map((u) => {
                    const isActive = u.id === currentUserId;
                    const voteCount = getUserVoteCount(u.id);
                    const votedPercent =
                      voteCount.total > 0
                        ? Math.round((voteCount.voted / voteCount.total) * 100)
                        : 0;
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleUserSelect(u.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left mb-1 last:mb-0',
                          isActive
                            ? 'bg-gradient-to-r from-pink-500/15 to-amber-400/10 border border-pink-500/30'
                            : 'hover:bg-white/[0.04]'
                        )}
                      >
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 border',
                            isActive
                              ? 'bg-gradient-to-br from-pink-500/30 to-amber-400/30 border-pink-500/30'
                              : 'bg-white/5 border-white/10'
                          )}
                        >
                          {u.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'text-sm font-semibold truncate',
                                isActive ? 'text-white' : 'text-white/80'
                              )}
                            >
                              {u.name}
                            </span>
                            {u.isHost && (
                              <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400 font-bold">
                                群主
                              </span>
                            )}
                            {isActive && (
                              <Check className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  votedPercent >= 80
                                    ? 'bg-emerald-400'
                                    : votedPercent >= 50
                                    ? 'bg-amber-400'
                                    : votedPercent > 0
                                    ? 'bg-rose-400'
                                    : 'bg-white/20'
                                )}
                                style={{ width: `${votedPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-white/40 shrink-0 tabular-nums">
                              {voteCount.voted}/{voteCount.total}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="px-4 py-2 border-t border-white/5 bg-white/[0.02]">
                  <p className="text-[10px] text-white/30 text-center">
                    切换身份后投票和留言将以该用户名义记录
                  </p>
                </div>
              </div>
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
