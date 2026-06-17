import { NavLink } from 'react-router-dom';
import {
  Users,
  Package,
  ClipboardCheck,
  Car,
  RotateCcw,
  MountainSnow,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', label: '成员管理', icon: Users },
  { to: '/equipment', label: '装备清单', icon: Package },
  { to: '/assignment', label: '智能分配', icon: ClipboardCheck },
  { to: '/packing', label: '装箱清单', icon: Car },
  { to: '/return', label: '归还确认', icon: RotateCcw },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-200">
                <MountainSnow className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  滑雪装备管家
                </h1>
                <p className="text-xs text-slate-500">团队出行 · 装备无忧</p>
              </div>
            </div>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-md shadow-blue-200'
                        : 'text-slate-600 hover:bg-blue-50 hover:text-blue-600'
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      <footer className="mt-16 py-6 border-t border-blue-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm text-slate-500">
          滑雪装备管家 · 让每一次出行都安心 🎿
        </div>
      </footer>
    </div>
  );
}
