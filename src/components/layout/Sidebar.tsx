import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Refrigerator, Package, ClipboardCheck, Menu, X, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  path: string;
  label: string;
  icon: LucideIcon;
}

const menuItems: MenuItem[] = [
  { path: '/', label: '监控看板', icon: LayoutDashboard },
  { path: '/equipment', label: '设备档案', icon: Refrigerator },
  { path: '/batches', label: '入箱记录', icon: Package },
  { path: '/inspections', label: '巡检记录', icon: ClipboardCheck },
];

export default function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-md md:hidden"
      >
        {isExpanded ? <X size={20} /> : <Menu size={20} />}
      </button>

      {isExpanded && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-gray-200 bg-white transition-all duration-300',
          isExpanded ? 'w-60' : 'w-16',
          '-translate-x-full md:translate-x-0',
          isExpanded && 'translate-x-0'
        )}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold">
              C
            </div>
            {isExpanded && (
              <span className="font-display text-lg font-semibold text-gray-900">冷链监控</span>
            )}
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsExpanded(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <Icon size={20} className="shrink-0" />
                {isExpanded && <span>{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
