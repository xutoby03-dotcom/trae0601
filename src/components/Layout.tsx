import { NavLink, Outlet } from 'react-router-dom';
import { ShoppingCart, Package, FileText, BarChart3, AlertTriangle, Store } from 'lucide-react';
import { useStore } from '../store';

const navItems = [
  { path: '/', icon: ShoppingCart, label: '取货结算' },
  { path: '/products', icon: Package, label: '商品管理' },
  { path: '/bills', icon: FileText, label: '账单管理' },
  { path: '/stats', icon: BarChart3, label: '统计分析' },
  { path: '/alerts', icon: AlertTriangle, label: '预警中心' },
];

export default function Layout() {
  const alerts = useStore(state => state.alerts);
  const alertCount = alerts ? alerts.lowStock.length + alerts.expiring.length + alerts.expired.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="flex">
        <aside className="w-64 min-h-screen bg-white border-r border-orange-100 shadow-sm fixed left-0 top-0 z-30">
          <div className="p-6 border-b border-orange-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-200">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display text-xl text-primary-600">零食柜</h1>
                <p className="text-xs text-gray-400">智能结算系统</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200'
                    : 'text-gray-600 hover:bg-orange-50 hover:text-primary-600'}
                `}
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                    {item.path === '/alerts' && alertCount > 0 && (
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-danger-100 text-danger-600'
                      }`}>
                        {alertCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-100">
            <div className="bg-gradient-to-r from-primary-50 to-amber-50 rounded-xl p-4">
              <p className="text-sm text-gray-600">今日已取货</p>
              <p className="font-display text-2xl text-primary-600">¥ 0.00</p>
            </div>
          </div>
        </aside>

        <main className="ml-64 flex-1 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
