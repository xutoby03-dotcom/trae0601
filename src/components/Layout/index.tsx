import { NavLink, Outlet } from 'react-router-dom';
import { FileText, ClipboardCheck, BarChart3, UtensilsCrossed } from 'lucide-react';
import { useReimbursementStore } from '@/store/useReimbursementStore';

const navItems = [
  { path: '/', label: '报销提交', icon: FileText },
  { path: '/review', label: '审核管理', icon: ClipboardCheck },
  { path: '/summary', label: '费用汇总', icon: BarChart3 },
];

export function Layout() {
  const pendingCount = useReimbursementStore((state) => state.getPendingCount());

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/30">
              <UtensilsCrossed className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">加班餐报销</h1>
              <p className="text-xs text-gray-400">管理系统</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {item.path === '/review' && pendingCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">管</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">管理员</p>
              <p className="text-xs text-gray-400">admin@company.com</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
