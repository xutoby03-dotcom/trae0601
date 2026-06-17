import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Umbrella, Plus, LayoutDashboard, Share2, Trash2, LogIn, LogOut, CloudRain } from 'lucide-react';
import { useAuthStore } from '@/context/authStore';
import { Button } from '@/components/ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, userRole, logout } = useAuthStore();

  const isAdminPage = location.pathname.startsWith('/admin');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F5F8FC]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="rain-animation" />
      </div>

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <Umbrella className="w-8 h-8 text-[#4A90D9] transition-transform group-hover:-rotate-12" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#FF8C42] rounded-full animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800" style={{ fontFamily: 'ZCOOL XiaoWei, serif' }}>
                  雨伞招领墙
                </h1>
                <p className="text-xs text-gray-400">雨天不再怕，寻伞更轻松</p>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                icon={<Umbrella className="w-4 h-4" />}
                label="雨伞列表"
                active={location.pathname === '/'}
              />
              <NavLink
                to="/register"
                icon={<Plus className="w-4 h-4" />}
                label="登记雨伞"
                active={location.pathname === '/register'}
              />
              {isLoggedIn && (
                <>
                  <NavLink
                    to="/admin"
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    label="管理后台"
                    active={location.pathname.startsWith('/admin') && !location.pathname.includes('/share') && !location.pathname.includes('/scrap')}
                  />
                  <NavLink
                    to="/admin/share"
                    icon={<Share2 className="w-4 h-4" />}
                    label="共享伞"
                    active={location.pathname === '/admin/share'}
                  />
                  <NavLink
                    to="/admin/scrap"
                    icon={<Trash2 className="w-4 h-4" />}
                    label="报废清单"
                    active={location.pathname === '/admin/scrap'}
                  />
                </>
              )}
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                <CloudRain className="w-4 h-4 text-[#4A90D9]" />
                <span>今日有雨</span>
              </div>
              {isLoggedIn ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  退出
                </Button>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => navigate('/admin/login')}>
                  <LogIn className="w-4 h-4 mr-1" />
                  管理登录
                </Button>
              )}
            </div>
          </div>
        </div>

        {isAdminPage && isLoggedIn && (
          <div className="bg-[#4A90D9]/10 border-t border-[#4A90D9]/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
              <div className="flex items-center gap-2 text-sm text-[#4A90D9]">
                <span className="w-2 h-2 bg-[#4A90D9] rounded-full animate-pulse" />
                <span>
                  {userRole === 'admin' ? '管理员' : '登记员'}模式 · 欢迎使用管理功能
                </span>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {children}
      </main>

      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 py-6 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 text-sm">
            <Umbrella className="w-4 h-4 inline mr-1 text-[#4A90D9]" />
            雨伞招领墙 · 让每一把伞都能找到主人
          </p>
          <p className="text-gray-400 text-xs mt-1">
            保管期15天 · 超期自动转为共享备用伞
          </p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap');
        
        .rain-animation {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(circle at 20% 30%, rgba(74, 144, 217, 0.03) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(74, 144, 217, 0.03) 0%, transparent 50%);
        }
        
        .rain-animation::before {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='20' viewBox='0 0 4 20'%3E%3Cline x1='2' y1='0' x2='2' y2='15' stroke='%234A90D9' stroke-width='1' stroke-opacity='0.1'/%3E%3C/svg%3E");
          background-size: 60px 80px;
          animation: rain 15s linear infinite;
        }
        
        @keyframes rain {
          0% { transform: translateY(-100px); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon, label, active }) => (
  <Link
    to={to}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
      ${active
        ? 'bg-[#4A90D9] text-white shadow-md'
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }
    `}
  >
    {icon}
    {label}
  </Link>
);
