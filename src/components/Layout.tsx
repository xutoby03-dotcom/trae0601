import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarHeart, 
  ClipboardList, 
  BarChart3,
  Menu,
  X,
  Heart
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '首页概览', icon: LayoutDashboard },
  { path: '/patients', label: '就诊人档案', icon: Users },
  { path: '/visits', label: '复诊排班', icon: CalendarHeart },
  { path: '/records', label: '复诊记录', icon: ClipboardList },
  { path: '/stats', label: '统计分析', icon: BarChart3 },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white/80 backdrop-blur-md border-b border-warm-100 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md shadow-primary-200">
                <Heart className="w-5 h-5 text-white" fill="white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-800">复诊陪伴</h1>
                <p className="text-xs text-gray-500 -mt-0.5">家人健康，共同守护</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-600 hover:bg-warm-100 hover:text-gray-800'
                    )
                  }
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-warm-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-warm-100 bg-white">
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary-100 text-primary-600'
                        : 'text-gray-600 hover:bg-warm-100'
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div key={location.pathname} className="animate-fade-in">
          {children}
        </div>
      </main>

      <footer className="border-t border-warm-100 bg-white/50 py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          用心陪伴每一次复诊 ❤️
        </div>
      </footer>
    </div>
  );
}
