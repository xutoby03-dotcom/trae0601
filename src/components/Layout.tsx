import { NavLink, Outlet } from 'react-router-dom';
import { Music, Calendar, Settings, BarChart3, User } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { UserRole } from '@/types';

const roleOptions: { value: UserRole; label: string }[] = [
  { value: 'student', label: '学生' },
  { value: 'teacher', label: '老师' },
  { value: 'admin', label: '管理员' },
];

export default function Layout() {
  const { currentRole, setCurrentRole } = useAppStore();

  const navItems = [
    { path: '/', label: '琴房列表', icon: Music },
    { path: '/booking', label: '预约管理', icon: Calendar },
    { path: '/admin', label: '琴房管理', icon: Settings, roles: ['teacher', 'admin'] },
    { path: '/dashboard', label: '统计看板', icon: BarChart3, roles: ['teacher', 'admin'] },
  ];

  const visibleNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(currentRole)
  );

  return (
    <div className="min-h-screen bg-cream-100">
      <header className="bg-white border-b border-cream-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-wood-700 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-gold-400" />
              </div>
              <div>
                <h1 className="font-serif text-lg font-bold text-wood-900">艺术楼琴房</h1>
                <p className="text-xs text-wood-500">预约管理系统</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {visibleNavItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `nav-link flex items-center gap-2 ${isActive ? 'nav-link-active' : ''}`
                  }
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-wood-500" />
                <select
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value as UserRole)}
                  className="bg-cream-50 border border-wood-200 rounded-lg px-3 py-1.5 text-sm text-wood-700 focus:outline-none focus:ring-2 focus:ring-wood-300"
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <nav className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto scrollbar-hide">
            {visibleNavItems.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link flex items-center gap-2 whitespace-nowrap text-sm px-3 py-1.5 ${isActive ? 'nav-link-active' : ''}`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
