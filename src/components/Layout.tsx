import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardList, 
  RotateCcw, 
  AlertTriangle, 
  BarChart3,
  ShoppingBag
} from 'lucide-react';

const navItems = [
  { path: '/', label: '总览', icon: LayoutDashboard },
  { path: '/bags', label: '袋子档案', icon: Package },
  { path: '/borrow', label: '借出记录', icon: ClipboardList },
  { path: '/return', label: '归还管理', icon: RotateCcw },
  { path: '/overdue', label: '催还区', icon: AlertTriangle },
  { path: '/statistics', label: '数据统计', icon: BarChart3 },
];

export function Layout() {
  return (
    <div className="min-h-screen bg-warm-50 flex">
      <aside className="w-60 bg-white border-r border-orange-100 flex flex-col shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-orange-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-warm-sm">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg">保温袋管家</h1>
              <p className="text-xs text-gray-400">周转管理系统</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 py-4 px-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-primary-500 text-white shadow-warm-md'
                          : 'text-gray-600 hover:bg-orange-50 hover:text-primary-600'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
        
        <div className="p-4 border-t border-orange-50">
          <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-xl p-4">
            <p className="text-xs text-primary-700 font-medium mb-1">温馨提示</p>
            <p className="text-xs text-gray-500">记得及时归还保温袋哦~</p>
          </div>
        </div>
      </aside>
      
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-orange-100 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800">
            外卖保温袋周转管理
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
            </span>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
