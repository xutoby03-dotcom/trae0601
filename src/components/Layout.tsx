import { useState } from 'react';
import {
  Link,
  Outlet,
  useLocation,
} from 'react-router-dom';
import {
  LayoutDashboard,
  Blocks,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Menu,
  X,
  ChevronRight,
  Bell,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: '首页', path: '/', icon: LayoutDashboard },
  { label: '玩具档案', path: '/toys', icon: Blocks },
  { label: '清洁记录', path: '/cleaning', icon: Sparkles },
  { label: '消毒任务', path: '/tasks', icon: ClipboardList },
  { label: '异常预警', path: '/alerts', icon: AlertTriangle },
];

const breadcrumbMap: Record<string, string> = {
  '/': '首页',
  '/toys': '玩具档案',
  '/toys/new': '新增玩具',
  '/cleaning': '清洁记录',
  '/cleaning/new': '新增记录',
  '/tasks': '消毒任务',
  '/alerts': '异常预警',
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return '早上好';
  if (hour >= 12 && hour < 18) return '下午好';
  return '晚上好';
}

function isPathActive(currentPath: string, navPath: string): boolean {
  if (navPath === '/') return currentPath === '/';
  return currentPath === navPath || currentPath.startsWith(`${navPath}/`);
}

function buildBreadcrumbs(pathname: string): { label: string; path: string }[] {
  const crumbs: { label: string; path: string }[] = [];
  const segments = pathname.split('/').filter(Boolean);

  crumbs.push({ label: '首页', path: '/' });

  let path = '';
  segments.forEach((segment, idx) => {
    path = `${path}/${segment}`;
    const isLast = idx === segments.length - 1;
    const nextSegment = segments[idx + 1];
    const label = breadcrumbMap[path];

    if (label) {
      crumbs.push({ label, path });
    } else if (segment === 'new') {
      crumbs.push({ label: '新增', path });
    } else if (segment === 'edit') {
      crumbs.push({ label: '编辑', path });
    } else if (!isLast && nextSegment === 'edit') {
      crumbs.push({ label: '详情', path });
    } else if (isLast) {
      crumbs.push({ label: '详情', path });
    }
  });

  return crumbs;
}

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const greeting = getGreeting();
  const breadcrumbs = buildBreadcrumbs(location.pathname);

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-[240px] bg-white/80 backdrop-blur-xl border-r border-gray-100/70 flex flex-col transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-20 px-5 flex items-center gap-3 bg-gradient-to-br from-baby-200 via-mint-100 to-clean-100 border-b border-white/50">
          <div className="w-11 h-11 rounded-2xl bg-white/70 shadow-soft flex items-center justify-center text-2xl shrink-0">
            🧸
          </div>
          <div className="min-w-0">
            <div className="font-display font-extrabold text-base text-gray-800 truncate leading-tight">
              玩具消毒管家
            </div>
            <div className="text-[11px] text-gray-500 font-medium mt-0.5">Toy Disinfection</div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ label, path, icon: Icon }) => {
            const active = isPathActive(location.pathname, path);
            return (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className={`nav-item ${active ? 'active' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-baby-400' : 'text-gray-400'}`} />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100/70">
          <div className="text-[11px] text-gray-400 text-center leading-relaxed">
            本地存储，数据安全 🔒
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 md:h-20 px-4 md:px-8 flex items-center justify-between gap-4 bg-white/60 backdrop-blur-xl border-b border-gray-100/70 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
              aria-label="打开菜单"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-xs text-gray-500 truncate mb-0.5">
                {breadcrumbs.map((crumb, idx) => (
                  <span key={crumb.path} className="flex items-center gap-1.5 min-w-0">
                    {idx > 0 && <ChevronRight className="w-3 h-3 text-gray-300 shrink-0" />}
                    {idx === breadcrumbs.length - 1 ? (
                      <span className="text-gray-700 font-medium truncate">{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="hover:text-baby-400 transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </span>
                ))}
              </div>
              <div className="font-display font-bold text-lg md:text-xl text-gray-800 truncate">
                {greeting}，欢迎回来 👋
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors relative"
              aria-label="通知"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-alert-400" />
            </button>
            <div className="hidden sm:flex w-10 h-10 rounded-xl bg-gradient-to-br from-baby-300 to-mint-300 items-center justify-center text-white font-bold shadow-soft">
              爸
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 left-[252px] z-50 md:hidden w-10 h-10 rounded-xl bg-white shadow-card flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
          aria-label="关闭菜单"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
