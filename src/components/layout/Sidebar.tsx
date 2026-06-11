import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  FileText,
  RotateCcw,
  AlertTriangle,
  BarChart3,
  Package,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { path: '/dashboard', label: '仪表盘', icon: LayoutDashboard },
  { path: '/devices', label: '样机管理', icon: Cpu },
  { path: '/loans', label: '借出管理', icon: FileText },
  { path: '/renewals', label: '续借管理', icon: RotateCcw },
  { path: '/exceptions', label: '异常管理', icon: AlertTriangle },
  { path: '/statistics', label: '统计分析', icon: BarChart3 },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-primary-900 min-h-screen flex flex-col">
      <div className="p-6 border-b border-primary-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-900" />
          </div>
          <div>
            <h1 className="text-white font-serif font-bold text-lg">样机管理系统</h1>
            <p className="text-primary-300 text-xs">Device Management</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-primary-200 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        className={`w-5 h-5 ${
                          isActive ? 'text-white' : 'text-primary-400 group-hover:text-white'
                        }`}
                      />
                      <span className="font-medium">{item.label}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-primary-800">
        <div className="bg-primary-800/50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium text-sm">
              管
            </div>
            <div>
              <p className="text-white text-sm font-medium">管理员</p>
              <p className="text-primary-400 text-xs">设备管理部</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
