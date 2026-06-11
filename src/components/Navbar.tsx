import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BarChart3, ShieldPlus, Search, ChevronRight, LogOut, LogIn } from 'lucide-react';
import { useAppStore } from '../store/useStore';
import { cn } from '../lib/utils';

export function Navbar() {
  const navigate = useNavigate();
  const { isAdmin, setAdmin, searchKeyword, setSearchKeyword } = useAppStore();

  const linkCls = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
      isActive
        ? 'bg-white/20 text-white shadow-inner'
        : 'text-teal-100 hover:bg-white/10 hover:text-white',
    );

  const handleLogout = () => {
    setAdmin(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-gradient-to-r from-teal-800 via-teal-700 to-cyan-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg md:text-xl tracking-tight">自习室座位板</h1>
              <p className="text-teal-200 text-xs hidden sm:block">告别占座乱象，高效学习</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur rounded-2xl p-1">
            <NavLink to="/" end className={linkCls}>
              <LayoutDashboard className="w-4 h-4" />
              <span>座位板</span>
            </NavLink>
            <NavLink to="/register" className={linkCls}>
              <ShieldPlus className="w-4 h-4" />
              <span>登记座位</span>
            </NavLink>
            <NavLink to="/stats" className={linkCls}>
              <BarChart3 className="w-4 h-4" />
              <span>统计分析</span>
              <ChevronRight className="w-3 h-3 opacity-70" />
            </NavLink>
          </nav>

          <div className="flex items-center gap-3">
            <div className="relative hidden lg:flex items-center">
              <Search className="w-4 h-4 text-teal-200 absolute left-3" />
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索教学楼/房间/座位..."
                className="bg-white/10 pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-teal-200/60 border border-white/10 focus:outline-none focus:bg-white/15 focus:ring-2 focus:ring-amber-400/50 w-56 transition-all"
              />
            </div>

            {isAdmin ? (
              <NavLink
                to="/admin"
                className={linkCls}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="hidden sm:inline">管理员</span>
              </NavLink>
            ) : (
              <NavLink
                to="/admin/login"
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-teal-100 hover:bg-white/10 transition"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">管理员登录</span>
              </NavLink>
            )}

            {isAdmin && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-teal-100 hover:bg-white/10 transition"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="md:hidden pb-3 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-teal-200 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="搜索..."
                className="w-full bg-white/10 pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder-teal-200/60 border border-white/10 focus:outline-none focus:bg-white/15"
              />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            <NavLink to="/" end className={({ isActive }) => cn(linkCls({ isActive }), 'flex-shrink-0')}>
              <LayoutDashboard className="w-4 h-4" />
              <span>座位板</span>
            </NavLink>
            <NavLink to="/register" className={({ isActive }) => cn(linkCls({ isActive }), 'flex-shrink-0')}>
              <ShieldPlus className="w-4 h-4" />
              <span>登记</span>
            </NavLink>
            <NavLink to="/stats" className={({ isActive }) => cn(linkCls({ isActive }), 'flex-shrink-0')}>
              <BarChart3 className="w-4 h-4" />
              <span>统计</span>
            </NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
