import { NavLink, useLocation } from 'react-router-dom';
import { Home, Package, BarChart3, CloudRain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCleaningStore } from '@/store/cleaningStore';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const { simulateRainyDay, setSimulateRainyDay } = useCleaningStore();

  const showTabBar = !location.pathname.includes('/items/') && 
                     !location.pathname.includes('/plans/') &&
                     !location.pathname.includes('/new');

  const isHome = location.pathname === '/';
  const isItems = location.pathname === '/items';
  const isStats = location.pathname === '/statistics';

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {simulateRainyDay && isHome && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
          <div className="flex items-center gap-2 text-yellow-800">
            <CloudRain className="w-5 h-5" />
            <span className="text-sm font-medium">阴雨天提醒</span>
          </div>
          <p className="text-sm text-yellow-700 mt-1">
            今天有雨，不适合安排晾晒步骤哦~
          </p>
          <button
            onClick={() => setSimulateRainyDay(false)}
            className="text-xs text-yellow-600 mt-1 hover:text-yellow-800"
          >
            关闭提示
          </button>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {children}
      </div>

      {showTabBar && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="max-w-md mx-auto flex justify-around py-2">
            <NavLink
              to="/"
              className={cn(
                'flex flex-col items-center py-1 px-4 rounded-lg transition-colors',
                isHome ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1">首页</span>
            </NavLink>
            <NavLink
              to="/items"
              className={cn(
                'flex flex-col items-center py-1 px-4 rounded-lg transition-colors',
                isItems ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Package className="w-6 h-6" />
              <span className="text-xs mt-1">物品</span>
            </NavLink>
            <NavLink
              to="/statistics"
              className={cn(
                'flex flex-col items-center py-1 px-4 rounded-lg transition-colors',
                isStats ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs mt-1">统计</span>
            </NavLink>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
