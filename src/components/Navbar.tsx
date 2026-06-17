import { NavLink, useLocation } from 'react-router-dom';
import { Home, Cpu, FileClock, ClipboardList, HeartHandshake } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: '首页', emoji: '🏠' },
  { to: '/devices', icon: Cpu, label: '设备管理', emoji: '👂' },
  { to: '/records', icon: FileClock, label: '记录', emoji: '📋' },
  { to: '/checklist', icon: ClipboardList, label: '复查清单', emoji: '✅' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-warm-100">
      <div className="container">
        <div className="flex items-center justify-between h-20">
          <NavLink to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-soft group-hover:shadow-hover transition-all">
              <span className="text-2xl">🦻</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-accent-blue">助听器管家</h1>
              <p className="text-xs text-warm-400">家人听力，用心守护</p>
            </div>
          </NavLink>

          <nav className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-brand-500 text-white shadow-soft'
                      : 'text-accent-blue hover:bg-brand-50'
                  }`}
                >
                  <Icon size={18} />
                  <span className="hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-orange" />
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-warm-50 rounded-xl">
              <HeartHandshake size={18} className="text-brand-500" />
              <span className="text-sm text-accent-blue">关爱模式</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
