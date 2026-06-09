import { NavLink, Outlet } from 'react-router-dom';
import { Home, Package, PenLine, Lightbulb, BarChart3 } from 'lucide-react';

const navItems = [
  { to: '/', label: '首页', icon: Home },
  { to: '/materials', label: '素材库', icon: Package },
  { to: '/usage', label: '使用记录', icon: PenLine },
  { to: '/inspirations', label: '搭配灵感', icon: Lightbulb },
  { to: '/stats', label: '统计', icon: BarChart3 },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex">
      <aside className="w-56 shrink-0 bg-cream-light/80 border-r border-brown-muted/15 flex flex-col">
        <div className="p-5 border-b border-brown-muted/15">
          <h1 className="font-serif text-xl font-bold text-brown-dark tracking-wide">
            📒 手账库存册
          </h1>
          <p className="text-xs text-brown-muted mt-1">素材管理 · 不再重复囤</p>
        </div>
        <nav className="flex-1 py-3">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brown/10 text-brown-dark'
                    : 'text-brown-muted hover:bg-brown/5 hover:text-brown'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-brown-muted/15">
          <p className="text-[10px] text-brown-muted/50 text-center">数据存储在浏览器本地</p>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
