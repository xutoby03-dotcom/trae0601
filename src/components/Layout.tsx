import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Ticket,
  Settings,
  Gift,
  Store,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '数据概览', icon: LayoutDashboard },
  { path: '/members', label: '会员管理', icon: Users },
  { path: '/coupons', label: '生日券管理', icon: Ticket },
  { path: '/coupons/expired', label: '过期未用券', icon: Gift },
  { path: '/coupon-types', label: '券类型配置', icon: Settings },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-gray-100 flex flex-col fixed h-full">
        <div className="p-6 border-b border-gray-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-glow">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg text-gray-800">生日券管家</h1>
              <p className="text-xs text-gray-400">会员营销助手</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-white text-sm font-medium">
              管
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">运营管理员</p>
              <p className="text-xs text-gray-400">门店总店</p>
            </div>
            <Store className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </aside>

      <main className="flex-1 ml-64">
        <div className="p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
