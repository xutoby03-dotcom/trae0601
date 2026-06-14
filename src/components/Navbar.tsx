import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  CalendarClock,
  QrCode,
  FileText,
  GraduationCap,
  UserCircle,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: '看板首页', icon: LayoutDashboard },
  { path: '/classrooms', label: '教室管理', icon: Building2 },
  { path: '/reservation', label: '座位预约', icon: CalendarClock },
  { path: '/checkin', label: '签到管理', icon: QrCode },
  { path: '/records', label: '异动记录', icon: FileText },
];

export function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentRole, setCurrentRole } = useStore();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <nav className="bg-gradient-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-display">晚自习座位签到系统</h1>
              <p className="text-xs text-white/70 hidden sm:block">
                {currentTime.toLocaleDateString('zh-CN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}{' '}
                {currentTime.toLocaleTimeString('zh-CN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-xl p-1">
              <button
                onClick={() => setCurrentRole('student')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  currentRole === 'student'
                    ? 'bg-white text-primary-700'
                    : 'text-white/70 hover:text-white'
                )}
              >
                学生
              </button>
              <button
                onClick={() => setCurrentRole('teacher')}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  currentRole === 'teacher'
                    ? 'bg-white text-primary-700'
                    : 'text-white/70 hover:text-white'
                )}
              >
                老师
              </button>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-1 animate-fade-in">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                  location.pathname === item.path
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
            <div className="flex items-center gap-2 bg-white/10 rounded-xl p-1 mt-4">
              <button
                onClick={() => setCurrentRole('student')}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                  currentRole === 'student'
                    ? 'bg-white text-primary-700'
                    : 'text-white/70 hover:text-white'
                )}
              >
                <UserCircle className="w-4 h-4" />
                学生
              </button>
              <button
                onClick={() => setCurrentRole('teacher')}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2',
                  currentRole === 'teacher'
                    ? 'bg-white text-primary-700'
                    : 'text-white/70 hover:text-white'
                )}
              >
                <UserCircle className="w-4 h-4" />
                老师
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
