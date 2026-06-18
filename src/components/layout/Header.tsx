import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateTime } from '@/utils/dateUtils';

const routeNames: Record<string, string> = {
  '/': '监控看板',
  '/devices': '设备档案',
  '/records': '入箱记录',
  '/inspections': '巡检记录',
};

export default function Header() {
  const location = useLocation();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getBreadcrumbs = () => {
    const pathname = location.pathname;
    if (pathname === '/') {
      return [{ label: routeNames['/'], path: '/' }];
    }
    return [
      { label: routeNames['/'], path: '/' },
      { label: routeNames[pathname] || pathname, path: pathname },
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-2 pl-12 md:pl-0">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center">
            {index > 0 && <ChevronRight size={16} className="mx-1 text-gray-400" />}
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-gray-900">{crumb.label}</span>
            ) : (
              <Link
                to={crumb.path}
                className={cn(
                  'text-sm font-medium transition-colors',
                  index === 0 ? 'text-gray-500 hover:text-gray-700' : 'text-gray-900'
                )}
              >
                {crumb.label}
              </Link>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <span className="hidden text-sm text-gray-600 md:block">
          {formatDateTime(currentTime)}
        </span>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
          <Bell size={20} />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-primary-700">
          <User size={18} />
        </div>
      </div>
    </header>
  );
}
