import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  ClipboardList,
  QrCode,
  Wrench,
  BarChart3,
  ChevronDown,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { useStore } from '@/store/useStore';

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: '仪表板', path: '/' },
  { icon: Building2, label: '练习房', path: '/rooms' },
  { icon: Calendar, label: '日历视图', path: '/calendar' },
  { icon: ClipboardList, label: '审批管理', path: '/approvals' },
  { icon: QrCode, label: '签到', path: '/checkin' },
  { icon: Wrench, label: '报修中心', path: '/repairs' },
  { icon: BarChart3, label: '统计分析', path: '/statistics' },
];

const roleLabels: Record<UserRole, string> = {
  student: '学生',
  teacher: '教师',
  admin: '管理员',
};

const pageTitles: Record<string, string> = {
  '/': '仪表板',
  '/rooms': '练习房',
  '/calendar': '日历视图',
  '/approvals': '审批管理',
  '/checkin': '签到',
  '/repairs': '报修中心',
  '/statistics': '统计分析',
};

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const users = useStore((s) => s.users);
  const currentUser = useStore((s) => s.currentUser);
  const setCurrentUser = useStore((s) => s.setCurrentUser);
  const processBookingStatusUpdates = useStore(
    (s) => s.processBookingStatusUpdates,
  );

  useEffect(() => {
    processBookingStatusUpdates();
    const timer = setInterval(() => {
      processBookingStatusUpdates();
    }, 30000);
    return () => clearInterval(timer);
  }, [processBookingStatusUpdates]);

  const currentTitle = pageTitles[location.pathname] || '和声练习房';

  return (
    <div className="flex h-screen bg-bg-primary text-text-primary font-body">
      <aside className="w-60 bg-bg-secondary flex flex-col border-r border-border-subtle">
        <div className="h-16 flex items-center px-6 border-b border-border-subtle">
          <h1 className="font-display text-2xl text-accent-copper font-semibold">
            和声练习房
          </h1>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200',
                  isActive
                    ? 'bg-accent-copper/15 text-accent-copper font-medium'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-border-subtle">
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-bg-tertiary hover:bg-bg-elevated transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-accent-copper/20 flex items-center justify-center">
                <User className="w-5 h-5 text-accent-copper" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{currentUser.name}</div>
                <div className="text-xs text-text-muted">
                  {roleLabels[currentUser.role]}
                </div>
              </div>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-text-muted transition-transform',
                  showRoleMenu && 'rotate-180'
                )}
              />
            </button>

            {showRoleMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-bg-tertiary border border-border-subtle rounded-lg shadow-card overflow-hidden">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      setCurrentUser(user);
                      setShowRoleMenu(false);
                    }}
                    className={cn(
                      'w-full px-4 py-3 text-left text-sm hover:bg-bg-elevated transition-colors flex items-center gap-3',
                      currentUser.id === user.id && 'bg-accent-copper/10'
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-copper/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-accent-copper" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-text-muted">
                        {roleLabels[user.role]}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center px-6 border-b border-border-subtle bg-bg-primary/80 backdrop-blur-sm">
          <nav className="flex items-center gap-2 text-sm text-text-muted">
            <span className="text-text-secondary">和声练习房</span>
            <span>/</span>
            <span className="text-text-primary font-medium">{currentTitle}</span>
          </nav>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
