import { NavLink, Outlet } from 'react-router-dom';
import {
  ClipboardList,
  Package,
  FileText,
  BarChart3,
  School,
} from 'lucide-react';

const navItems = [
  { path: '/', label: '待换需求', icon: ClipboardList },
  { path: '/inventory', label: '库存管理', icon: Package },
  { path: '/records', label: '流水记录', icon: FileText },
  { path: '/shortage', label: '尺码缺口表', icon: BarChart3 },
];

export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-gradient-to-r from-blue-800 to-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <School className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-wide">
                  校服调换管理系统
                </h1>
                <p className="text-xs text-blue-200">School Uniform Exchange</p>
              </div>
            </div>
            <div className="text-sm text-blue-100">
              <span className="bg-white/10 px-3 py-1 rounded-full">
                王老师
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav className="mb-6">
          <ul className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <main className="animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
