import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cake, ClipboardList, ArrowLeftRight, AlertTriangle, Users, Settings } from 'lucide-react';
import { useAppStore } from '../store/index.js';

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: '数据看板' },
  { path: '/molds', icon: Cake, label: '模具档案' },
  { path: '/borrow', icon: ClipboardList, label: '借用管理' },
  { path: '/return', icon: ArrowLeftRight, label: '归还管理' },
  { path: '/exception', icon: AlertTriangle, label: '异常处理' },
  { path: '/masters', icon: Users, label: '师傅管理' },
  { path: '/settings', icon: Settings, label: '系统设置' },
];

export function Sidebar() {
  const { dashboardStats } = useAppStore();

  return (
    <aside className="w-64 bg-gradient-to-b from-caramel-800 to-caramel-900 min-h-screen flex flex-col shadow-xl">
      <div className="p-6 border-b border-caramel-700">
        <h1 className="text-xl font-serif font-bold text-white flex items-center gap-3">
          <span className="text-3xl">🍰</span>
          <div>
            <div>烘焙模具</div>
            <div className="text-sm font-normal text-caramel-300">借还管理系统</div>
          </div>
        </h1>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? 'bg-caramel-600 text-white shadow-lg'
                      : 'text-caramel-200 hover:bg-caramel-700 hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                {item.path === '/' && dashboardStats && (dashboardStats.overdueCount > 0 || dashboardStats.conflictCount > 0) && (
                  <span className="ml-auto bg-tomato-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {dashboardStats.overdueCount + dashboardStats.conflictCount}
                  </span>
                )}
                {item.path === '/exception' && dashboardStats && dashboardStats.exceptionMolds > 0 && (
                  <span className="ml-auto bg-yellow-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {dashboardStats.exceptionMolds}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-caramel-700">
        <div className="bg-caramel-700/50 rounded-lg p-4">
          <div className="text-caramel-300 text-sm mb-2">当前用户</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-caramel-500 flex items-center justify-center text-white font-bold">
              店
            </div>
            <div>
              <div className="text-white font-medium">管理员</div>
              <div className="text-caramel-400 text-xs">店长权限</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
