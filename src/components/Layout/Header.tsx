import { Bell, Search, Settings } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles: Record<string, string> = {
  '/dashboard': '数据看板',
  '/devices': '设备档案',
  '/inspections': '巡检记录',
  '/rectifications': '整改管理'
};

export function Header() {
  const location = useLocation();
  
  const getPageTitle = () => {
    const path = location.pathname;
    for (const [key, value] of Object.entries(pageTitles)) {
      if (path.startsWith(key)) {
        return value;
      }
    }
    return '灭火器点检系统';
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">{getPageTitle()}</h2>
        <p className="text-xs text-gray-500">
          {new Date().toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
          })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索设备编号..."
            className="w-64 rounded-lg border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>

        <button className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <button className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700">
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
