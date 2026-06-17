import { Link, useLocation } from 'react-router-dom';
import { Cat, ClipboardList, FileText } from 'lucide-react';
import { cn } from '../utils/helpers';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', label: '宠物资料', icon: Cat },
  { path: '/tasks', label: '代喂任务', icon: ClipboardList },
];

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FFFAF5]">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E8E0D5]">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF8A3D] to-[#FFB380] flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                <Cat size={22} />
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#2D2A26]" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                  橘子的代喂日记
                </h1>
                <p className="text-xs text-gray-500">宠物代喂交接助手</p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || 
                  (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300',
                      isActive
                        ? 'bg-[#FF8A3D] text-white shadow-md shadow-orange-200'
                        : 'text-gray-600 hover:bg-orange-50 hover:text-[#FF8A3D]'
                    )}
                  >
                    <Icon size={18} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <div className="animate-fadeIn">
          {children}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E8E0D5] px-4 py-2 z-50">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all',
                  isActive ? 'text-[#FF8A3D]' : 'text-gray-400'
                )}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
          <Link
            to="/report/task-005"
            className={cn(
              'flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all',
              location.pathname.startsWith('/report') ? 'text-[#FF8A3D]' : 'text-gray-400'
            )}
          >
            <FileText size={24} />
            <span className="text-xs font-medium">日报</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
