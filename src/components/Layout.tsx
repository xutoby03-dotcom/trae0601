import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Film,
  Armchair,
  ClipboardList,
  QrCode,
  Star,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '数据看板' },
  { to: '/sessions', icon: Film, label: '场次档案' },
  { to: '/inventory', icon: Armchair, label: '座椅库存' },
  { to: '/register', icon: ClipboardList, label: '居民报名' },
  { to: '/checkin', icon: QrCode, label: '扫码签到' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex">
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:translate-x-0 lg:w-20'
        } fixed lg:static inset-y-0 left-0 z-40 bg-gradient-to-b from-night-teal-800 to-night-teal-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-warm-orange-500 flex items-center justify-center shrink-0 shadow-glow">
            <Film size={22} />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <h1 className="font-display text-xl whitespace-nowrap">星空影院</h1>
              <p className="text-xs text-night-teal-200 whitespace-nowrap">社区露天电影管理</p>
            </div>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `sidebar-link justify-${sidebarOpen ? 'start' : 'center'} ${
                  isActive ? 'sidebar-link-active bg-white/15' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
              title={item.label}
            >
              <item.icon size={20} className="shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          {sidebarOpen ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-warm-orange-400 to-warm-orange-600 flex items-center justify-center font-display">
                管
              </div>
              <div className="text-sm">
                <p className="font-medium">社区管理员</p>
                <p className="text-xs text-night-teal-300">管理员</p>
              </div>
            </div>
          ) : (
            <div className="w-9 h-9 mx-auto rounded-full bg-gradient-to-br from-warm-orange-400 to-warm-orange-600 flex items-center justify-center font-display">
              管
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="glass-nav sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="btn-ghost !p-2.5"
            aria-label="切换菜单"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-night-teal-600">
              <Star size={16} className="text-warm-orange-500 fill-warm-orange-500" />
              <span>今晚观影愉快</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-x-hidden">
          <div className="max-w-7xl mx-auto opacity-0 animate-fade-in-up stagger-1">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
